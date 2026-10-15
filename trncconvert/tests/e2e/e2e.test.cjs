"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { sniffBuffer } = require("../../lib/sniff.cjs");

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const FX = process.env.FIXTURES || path.join(__dirname, "..", ".fixtures");
const OFFICE = path.join(__dirname, "..", "fixtures", "office");
const SKIP = new Set((process.env.SKIP_ENGINES || "").split(",").filter(Boolean));
const OFFICE_PW = "Gizli-şğİ-2026";
const MARKER = "TRNCConvert test ÇĞİÖŞÜ";
const UA = { "User-Agent": "Mozilla/5.0 (e2e)" };

const fx = (name) => (fs.existsSync(path.join(FX, name)) ? path.join(FX, name) : path.join(OFFICE, name));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function postFile(url, filePath, fields = {}, name = path.basename(filePath)) {
  const fd = new FormData();
  fd.append("name", name);
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  fd.append("file", new Blob([fs.readFileSync(filePath)]), name);
  const res = await fetch(BASE + url, { method: "POST", body: fd, headers: UA });
  return { status: res.status, body: await res.json() };
}

async function postJson(url, body) {
  const res = await fetch(BASE + url, { method: "POST", headers: { ...UA, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
}

async function waitJob(id, timeoutMs = 600000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const res = await fetch(`${BASE}/api/jobs/${id}`, { headers: UA });
    const body = await res.json();
    if (body.status === "done" || body.status === "error") return body;
    await sleep(500);
  }
  throw new Error("job timeout " + id);
}

async function download(url) {
  const res = await fetch(BASE + url, { headers: UA });
  assert.equal(res.status, 200, "download " + url);
  return { buf: Buffer.from(await res.arrayBuffer()), headers: res.headers };
}

async function convert(file, target, quality = "normal", name) {
  const r = await postFile("/api/convert", fx(file), { target, quality }, name);
  assert.equal(r.status, 202, `${file}->${target}: ${JSON.stringify(r.body)}`);
  const job = await waitJob(r.body.id);
  assert.equal(job.status, "done", `${file}->${target}: ${JSON.stringify(job.error)}`);
  return { job, ...(await download(job.download.url)) };
}

const EXPECT = {
  pdf: "pdf", docx: "zip", xlsx: "zip", pptx: "zip", odt: "zip", ods: "zip", odp: "zip", rtf: "rtf",
  txt: "text", csv: "text", jpg: "jpeg", png: "png", webp: "webp", avif: "avif", gif: "gif", tiff: "tiff",
  mp3: "mp3", wav: "wav", m4a: "mp4", ogg: "ogg", opus: "ogg", flac: "flac", mp4: "mp4", mov: "mp4",
  mkv: "matroska", webm: "matroska", avi: "avi", zip: "zip",
};

const CASES = [
  ["office", "sample.txt", "docx"], ["office", "sample.txt", "pdf"], ["office", "sample.rtf", "odt"],
  ["office", "sample.csv", "xlsx"], ["office", "plain.docx", "pdf"], ["office", "plain.docx", "odt"],
  ["office", "plain.xlsx", "pdf"], ["office", "plain.xlsx", "csv"], ["office", "plain.xlsx", "ods"],
  ["office", "plain.pptx", "pdf"], ["office", "plain.pptx", "odp"],
  ["pdf", "plain.pdf", "docx"], ["pdf", "plain.pdf", "txt"], ["pdf", "plain.pdf", "jpg", "zip"],
  ["image", "sample.png", "jpg"], ["image", "sample.png", "webp"], ["image", "sample.png", "avif"],
  ["image", "sample.png", "gif"], ["image", "sample.png", "tiff"], ["image", "sample.png", "pdf"],
  ["image", "sample.jpg", "png"], ["image", "sample.webp", "jpg"], ["image", "sample.gif", "webp"],
  ["image", "sample.tiff", "jpg"], ["image", "sample.bmp", "png"], ["image", "sample.heic", "jpg"],
  ["image", "sample.heic", "pdf"], ["image", "sample.svg", "png"], ["image", "sample.avif", "jpg"],
  ["media", "sample.wav", "mp3"], ["media", "sample.mp3", "wav"], ["media", "sample.m4a", "mp3"],
  ["media", "sample.ogg", "flac"], ["media", "sample.flac", "opus"], ["media", "sample.wav", "m4a"],
  ["media", "sample.wav", "ogg"], ["media", "sample.mp4", "mov"], ["media", "sample.mp4", "mkv"],
  ["media", "sample.mp4", "webm"], ["media", "sample.mp4", "avi"], ["media", "sample.mp4", "gif"],
  ["media", "sample.mp4", "mp3"], ["media", "sample.mp4", "m4a"], ["media", "sample.mov", "mp4"],
  ["media", "sample.mkv", "mp4"], ["media", "sample.webm", "mp4"], ["media", "sample.avi", "mp4"],
];

for (const [engine, file, target, expectKind] of CASES) {
  const skip = SKIP.has(engine) || !fs.existsSync(fx(file));
  test(`dönüşüm ${file} -> ${target}`, { skip }, async () => {
    const { buf, job } = await convert(file, target);
    assert.ok(buf.length > 0);
    assert.equal(sniffBuffer(buf.subarray(0, 4096)), expectKind || EXPECT[target], `${file}->${target} çıktı türü`);
    assert.ok(job.download.name.endsWith("." + (expectKind === "zip" ? "zip" : target)));
  });
}

test("dönüşüm içeriği: Excel -> CSV Türkçe metni korur", { skip: SKIP.has("office") }, async () => {
  const { buf } = await convert("plain.xlsx", "csv");
  assert.ok(buf.toString("utf8").includes(MARKER));
});

test("dönüşüm: Türkçe dosya adı indirme başlığında korunur", { skip: SKIP.has("image") }, async () => {
  const { headers, job } = await convert("sample.png", "jpg", "high", "Özgeçmiş şubat.png");
  assert.equal(job.download.name, "Özgeçmiş şubat.jpg");
  assert.match(headers.get("content-disposition"), /filename\*=UTF-8''%C3%96zge%C3%A7mi%C5%9F%20%C5%9Fubat\.jpg/);
});

test("dönüşüm: sessiz videodan MP3 anlaşılır hata verir", { skip: SKIP.has("media") || !fs.existsSync(fx("sample-silent.mp4")) }, async () => {
  const r = await postFile("/api/convert", fx("sample-silent.mp4"), { target: "mp3" });
  const job = await waitJob(r.body.id);
  assert.equal(job.status, "error");
  assert.equal(job.error.code, "no_audio");
});

test("dönüşüm: şifreli Word dosyası reddedilir ve şifre aracına yönlendirilir", async () => {
  const r = await postFile("/api/convert", path.join(OFFICE, "enc.docx"), { target: "pdf" });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, "encrypted_office");
});

test("dönüşüm: uzantısı .pdf olan PNG reddedilir", async () => {
  const r = await postFile("/api/convert", fx("sample.png"), { target: "docx" }, "sahte.pdf");
  assert.equal(r.status, 400);
  assert.equal(r.body.error, "mismatch");
});

test("dönüşüm: desteklenmeyen hedef ve tür reddedilir", async () => {
  const bad = await postFile("/api/convert", fx("sample.png"), { target: "mp3" });
  assert.equal(bad.status, 400);
  const exe = await postFile("/api/convert", fx("sample.png"), { target: "jpg" }, "program.exe");
  assert.equal(exe.status, 415);
});

test("kuyruk: aynı anda 6 iş sırayla tamamlanır", { skip: SKIP.has("image") }, async () => {
  const started = await Promise.all(Array.from({ length: 6 }, () => postFile("/api/convert", fx("sample.png"), { target: "webp" })));
  for (const s of started) assert.equal(s.status, 202);
  const done = await Promise.all(started.map((s) => waitJob(s.body.id)));
  for (const d of done) assert.equal(d.status, "done");
});

test("ZIP: birden fazla sonuç tek ZIP olarak iner", { skip: SKIP.has("image") }, async () => {
  const a = await convert("sample.png", "jpg");
  const b = await convert("sample.png", "jpg");
  const items = [a.job, b.job].map((j) => { const p = j.download.url.split("/"); return { id: p[2], token: p[3] }; });
  const res = await fetch(BASE + "/api/zip", { method: "POST", headers: { ...UA, "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
  assert.equal(res.status, 200);
  const buf = Buffer.from(await res.arrayBuffer());
  assert.equal(sniffBuffer(buf), "zip");
});

test("indirme: yanlış anahtar 404 döner", { skip: SKIP.has("image") }, async () => {
  const { job } = await convert("sample.png", "jpg");
  const p = job.download.url.split("/");
  const res = await fetch(`${BASE}/dl/${p[2]}/${"0".repeat(32)}`, { headers: UA });
  assert.equal(res.status, 404);
});

async function unlock(file, password, name) {
  const insp = await postFile("/api/unlock/inspect", fx(file), {}, name);
  assert.equal(insp.status, 200, JSON.stringify(insp.body));
  return insp;
}

const UNLOCK_CASES = [
  ["pdf-r6-user.pdf", "needs_password", "Şifre123!", "pdf"],
  ["pdf-r4-user.pdf", "needs_password", "çözüm-ı", "pdf"],
  ["pdf-r6-owner-only.pdf", "restrictions_only", "", "pdf"],
  ["enc.docx", "needs_password", OFFICE_PW, "zip"],
  ["enc.xlsx", "needs_password", OFFICE_PW, "zip"],
  ["enc.pptx", "needs_password", OFFICE_PW, "zip"],
];

for (const [file, state, password, kind] of UNLOCK_CASES) {
  test(`şifre kaldırma: ${file}`, async () => {
    const insp = await unlock(file);
    assert.equal(insp.body.state, state);
    const r = await postJson(`/api/unlock/${insp.body.id}`, { password });
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(r.body.status, "done");
    const { buf } = await download(r.body.download.url);
    assert.equal(sniffBuffer(buf.subarray(0, 4096)), kind);
    if (kind === "pdf") assert.ok(!buf.toString("latin1").includes("/Encrypt"), "çıktıda şifreleme sözlüğü kalmamalı");
  });
}

test("şifre kaldırma: Türkçe dosya adıyla şifresiz Word dosyası aynı adla iner", async () => {
  const insp = await unlock("enc.docx", null, "Gizli rapor şubat.docx");
  const r = await postJson(`/api/unlock/${insp.body.id}`, { password: OFFICE_PW });
  assert.equal(r.body.download.name, "Gizli rapor şubat.docx");
});

test("şifre kaldırma: üç yanlış denemeden sonra dosya silinir", async () => {
  const insp = await unlock("pdf-r6-user.pdf");
  for (let left = 2; left >= 1; left--) {
    const r = await postJson(`/api/unlock/${insp.body.id}`, { password: "yanlış" });
    assert.equal(r.status, 401);
    assert.equal(r.body.attemptsLeft, left);
  }
  const third = await postJson(`/api/unlock/${insp.body.id}`, { password: "yanlış" });
  assert.equal(third.status, 403);
  const fourth = await postJson(`/api/unlock/${insp.body.id}`, { password: "Şifre123!" });
  assert.equal(fourth.status, 404);
});

test("şifre kaldırma: büyük/küçük harf farkı yanlış şifre sayılır", async () => {
  const insp = await unlock("enc.docx");
  const r = await postJson(`/api/unlock/${insp.body.id}`, { password: OFFICE_PW.toLowerCase() });
  assert.equal(r.status, 401);
});

test("şifre kaldırma: şifresiz dosyalar için bilgi verir, iş oluşturmaz", async () => {
  for (const f of ["plain.docx", "plain.pdf"]) {
    const insp = await unlock(f);
    assert.equal(insp.body.state, "not_encrypted");
    assert.equal(insp.body.id, undefined);
  }
});

test("şifre kaldırma: desteklenmeyen tür reddedilir", async () => {
  const r = await postFile("/api/unlock/inspect", fx("sample.png"), {}, "resim.png");
  assert.equal(r.status, 415);
});

test("sayfalar: sitemap'teki her adres 200 döner, başlıklar benzersizdir", async () => {
  const res = await fetch(BASE + "/sitemap.xml", { headers: UA });
  assert.equal(res.status, 200);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  assert.ok(locs.length >= 35, "sayfa sayısı " + locs.length);
  const titles = new Set();
  for (const p of locs) {
    const r = await fetch(BASE + p, { headers: UA });
    assert.equal(r.status, 200, p);
    const html = await r.text();
    const title = /<title>([^<]+)<\/title>/.exec(html)[1];
    assert.ok(!titles.has(title), "tekrarlanan başlık " + title);
    titles.add(title);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, "tek H1 " + p);
    assert.match(html, /<meta name="description" content="[^"]{50,}">/, "açıklama " + p);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://trncconvert\\.com${p === "/" ? "/" : p}">`), "canonical " + p);
  }
});

test("sayfalar: robots.txt, 404 ve güvenlik başlıkları", async () => {
  const robots = await (await fetch(BASE + "/robots.txt", { headers: UA })).text();
  assert.match(robots, /Sitemap: https:\/\/trncconvert\.com\/sitemap\.xml/);
  assert.match(robots, /Disallow: \/api\//);
  const nf = await fetch(BASE + "/olmayan-sayfa", { headers: UA });
  assert.equal(nf.status, 404);
  assert.match(await nf.text(), /<meta name="robots" content="noindex">/);
  const home = await fetch(BASE + "/", { headers: UA });
  assert.match(home.headers.get("content-security-policy"), /default-src 'self'/);
  assert.equal(home.headers.get("x-content-type-options"), "nosniff");
  assert.equal(home.headers.get("x-powered-by"), null);
  const slash = await fetch(BASE + "/pdf-word-cevirme/", { headers: UA, redirect: "manual" });
  assert.equal(slash.status, 301);
});

test("sağlık kontrolü", async () => {
  const r = await fetch(BASE + "/health");
  assert.equal(await r.text(), "OK");
});
