"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const run = require("../../lib/run.cjs");

const PY = process.env.PYTHON || "python3";
const HELPER = path.join(__dirname, "..", "..", "scripts", "pyhelper.py");
const FX = process.env.FIXTURES || path.join(__dirname, "..", ".fixtures");
const OFFICE = path.join(__dirname, "..", "fixtures", "office");
const OFFICE_PW = "Gizli-şğİ-2026";
const MARKER = "TRNCConvert test ÇĞİÖŞÜ";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pyh-"));
const env = { ...process.env, PYTHONIOENCODING: "utf-8" };
const helper = (args, input) => run(PY, ["-I", "-X", "utf8", HELPER, ...args], { input, env, timeoutMs: 120000 });
const pw = (password) => JSON.stringify({ password });
const fx = (name) => path.join(FX, name);
const out = (name) => path.join(tmp, name);

async function pyEval(code, ...args) {
  const r = await run(PY, ["-I", "-X", "utf8", "-c", code, ...args], { env });
  assert.equal(r.code, 0, r.stderr);
  return r.stdout.trim();
}
const pdfInfo = (p) => pyEval(
  "import sys,pikepdf,pymupdf;p=pikepdf.open(sys.argv[1]);d=pymupdf.open(sys.argv[1]);" +
  "print(p.is_encrypted, len(p.pages), d[0].get_text().strip().splitlines()[0])", p);
const zipHasMarker = (p, marker) => pyEval(
  "import sys,zipfile;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;" +
  "print(any(sys.argv[2] in z.read(n).decode('utf-8','ignore') for n in z.namelist() if n.endswith('.xml')))", p, marker);

test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

test("inspect: PDF durumları", async () => {
  const cases = {
    "plain.pdf": "not_encrypted",
    "pdf-r6-user.pdf": "needs_password",
    "pdf-r4-user.pdf": "needs_password",
    "pdf-r6-owner-only.pdf": "restrictions_only",
  };
  for (const [file, state] of Object.entries(cases)) {
    const r = await helper(["inspect", fx(file)]);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(JSON.parse(r.stdout).state, state, file);
  }
});

test("inspect: gerçek Office dosyaları", async () => {
  for (const ext of ["docx", "xlsx", "pptx"]) {
    const enc = JSON.parse((await helper(["inspect", path.join(OFFICE, "enc." + ext)])).stdout);
    assert.deepEqual([enc.kind, enc.state], ["ooxml", "needs_password"], ext);
    const plain = JSON.parse((await helper(["inspect", path.join(OFFICE, "plain." + ext)])).stdout);
    assert.equal(plain.state, "not_encrypted", ext);
  }
  const png = JSON.parse((await helper(["inspect", fx("sample.png")])).stdout);
  assert.equal(png.state, "unsupported");
});

test("unlock: R6 AES-256 PDF, Türkçe şifre", async () => {
  const r = await helper(["unlock", fx("pdf-r6-user.pdf"), out("r6.pdf")], pw("Şifre123!"));
  assert.equal(r.code, 0, r.stderr);
  assert.equal(await pdfInfo(out("r6.pdf")), `False 3 ${MARKER} sayfa 1`);
});

test("unlock: R6 PDF, sahip şifresiyle de açılır", async () => {
  const r = await helper(["unlock", fx("pdf-r6-user.pdf"), out("r6-owner.pdf")], pw("Sahip-Anahtar-99"));
  assert.equal(r.code, 0, r.stderr);
});

test("unlock: R4 AES-128 PDF, Türkçe harfli şifre", async () => {
  const r = await helper(["unlock", fx("pdf-r4-user.pdf"), out("r4.pdf")], pw("çözüm-ı"));
  assert.equal(r.code, 0, r.stderr);
  assert.match(await pdfInfo(out("r4.pdf")), /^False 3 /);
});

test("unlock: NFD biçiminde yazılmış şifre de kabul edilir", async () => {
  const r = await helper(["unlock", fx("pdf-r6-user.pdf"), out("nfd.pdf")], pw("Şifre123!".normalize("NFD")));
  assert.equal(r.code, 0, r.stderr);
});

test("unlock: yalnızca kısıtlamalı PDF boş şifreyle açılır ve kısıtlamalar kalkar", async () => {
  const r = await helper(["unlock", fx("pdf-r6-owner-only.pdf"), out("owner.pdf")], pw(""));
  assert.equal(r.code, 0, r.stderr);
  const perms = await pyEval("import sys,pikepdf;p=pikepdf.open(sys.argv[1]);print(p.is_encrypted,p.allow.print_highres,p.allow.extract)", out("owner.pdf"));
  assert.equal(perms, "False True True");
});

test("unlock: yanlış şifre 2 döner, çıktı oluşmaz, şifre stderr'e yazılmaz", async () => {
  const secret = "YanlisSifre-ÖZEL-777";
  const r = await helper(["unlock", fx("pdf-r6-user.pdf"), out("wrong.pdf")], pw(secret));
  assert.equal(r.code, 2);
  assert.equal(fs.existsSync(out("wrong.pdf")), false);
  assert.ok(!r.stderr.includes(secret) && !r.stdout.includes(secret));
  const big = "şifre".repeat(51);
  const r2 = await helper(["unlock", fx("pdf-r4-user.pdf"), out("wrong4.pdf")], pw(big));
  assert.equal(r2.code, 2);
});

test("unlock: şifresiz PDF 3 döner", async () => {
  const r = await helper(["unlock", fx("plain.pdf"), out("plain-out.pdf")], pw("x"));
  assert.equal(r.code, 3);
});

for (const ext of ["docx", "xlsx", "pptx"]) {
  test(`unlock: Microsoft Office ${ext.toUpperCase()} (Türkçe şifre) içerik korunur`, async () => {
    const dst = out("unlocked." + ext);
    const r = await helper(["unlock", path.join(OFFICE, "enc." + ext), dst], pw(OFFICE_PW));
    assert.equal(r.code, 0, r.stderr);
    assert.equal(fs.readFileSync(dst).subarray(0, 2).toString(), "PK");
    assert.equal(await zipHasMarker(dst, MARKER), "True");
  });

  test(`unlock: Microsoft Office ${ext.toUpperCase()} yanlış şifre ve büyük/küçük harf`, async () => {
    const dst = out("bad." + ext);
    const r = await helper(["unlock", path.join(OFFICE, "enc." + ext), dst], pw(OFFICE_PW.toLowerCase()));
    assert.equal(r.code, 2);
    assert.equal(fs.existsSync(dst), false);
  });
}

test("unlock: şifresiz Office dosyası 3 döner", async () => {
  const r = await helper(["unlock", path.join(OFFICE, "plain.docx"), out("p.docx")], pw("x"));
  assert.equal(r.code, 3);
});

test("pdf2txt: Türkçe metin çıkar", async () => {
  const r = await helper(["pdf2txt", fx("plain.pdf"), out("plain.txt")]);
  assert.equal(r.code, 0, r.stderr);
  assert.ok(fs.readFileSync(out("plain.txt"), "utf8").includes(MARKER));
});

test("pdf2img: her sayfa için bir JPG", async () => {
  const dir = out("pages");
  fs.mkdirSync(dir);
  const r = await helper(["pdf2img", fx("plain.pdf"), dir, "jpg", "belge"]);
  assert.equal(r.code, 0, r.stderr);
  const files = JSON.parse(r.stdout);
  assert.equal(files.length, 3);
  assert.equal(path.basename(files[0]), "belge-1.jpg");
  assert.equal(fs.readFileSync(files[0]).subarray(0, 3).toString("hex"), "ffd8ff");
});

test("pdf işlemleri: şifreli PDF 8 döner", async () => {
  const r = await helper(["pdf2txt", fx("pdf-r6-user.pdf"), out("enc.txt")]);
  assert.equal(r.code, 8);
});

test("pdf2docx: Word belgesi üretir", async () => {
  const r = await helper(["pdf2docx", fx("plain.pdf"), out("plain.docx")]);
  assert.equal(r.code, 0, r.stderr);
  assert.equal(await zipHasMarker(out("plain.docx"), "TRNCConvert"), "True");
});

test("normalize: HEIC ve BMP PNG'ye çevrilir", async () => {
  for (const name of ["sample.heic", "sample.bmp"]) {
    const dst = out(name + ".png");
    const r = await helper(["normalize", fx(name), dst]);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(fs.readFileSync(dst).subarray(0, 4).toString("hex"), "89504e47");
  }
});

test("img2pdf: tek sayfalık PDF", async () => {
  const r = await helper(["img2pdf", fx("sample.jpg"), out("img.pdf")]);
  assert.equal(r.code, 0, r.stderr);
  assert.match(await pyEval("import sys,pikepdf;print(len(pikepdf.open(sys.argv[1]).pages))", out("img.pdf")), /^1$/);
});
