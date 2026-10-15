"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const formats = require("../../lib/formats.cjs");
const run = require("../../lib/run.cjs");
const { sniffBuffer, sniffMatches } = require("../../lib/sniff.cjs");
const { contentDisposition, displayBase, fixLatin1 } = require("../../lib/filename.cjs");

test("formats: PDF hedefleri", () => {
  assert.deepEqual(formats.targetsFor("pdf"), ["docx", "txt", "jpg", "png"]);
});

test("formats: aynı formata dönüşüm listelenmez (jpeg ve jpg eşdeğer)", () => {
  assert.ok(!formats.targetsFor("jpeg").includes("jpg"));
  assert.ok(!formats.targetsFor("tif").includes("tiff"));
  assert.ok(formats.targetsFor("heic").includes("pdf"));
});

test("formats: bilinmeyen uzantı boş döner ve motor yoktur", () => {
  assert.deepEqual(formats.targetsFor("exe"), []);
  assert.equal(formats.engineFor("exe", "pdf"), null);
  assert.equal(formats.engineFor("docx", "mp3"), null);
  assert.equal(formats.engineFor("mov", "mp4"), "media");
});

test("formats: istemci kataloğu her girdi için hedef içerir", () => {
  const c = formats.clientCatalog();
  for (const ext of formats.allInputs()) assert.ok(c.targets[ext].length > 0, ext);
  assert.equal(c.maxBytes, 95 * 1024 * 1024);
});

test("run: stdin'i Türkçe karakterlerle geçirir ve kabuk kullanmaz", async () => {
  const r = await run(process.execPath, ["-e", "process.stdin.pipe(process.stdout)"], { input: "şifre; echo hacked" });
  assert.equal(r.code, 0);
  assert.equal(r.stdout, "şifre; echo hacked");
});

test("run: zaman aşımında süreci öldürür", async () => {
  const r = await run(process.execPath, ["-e", "setTimeout(()=>{}, 60000)"], { timeoutMs: 300 });
  assert.equal(r.timedOut, true);
  assert.equal(r.code, null);
});

test("run: olmayan komut reddetmez, spawnError döner", async () => {
  const r = await run("bu-komut-yok-123", []);
  assert.equal(r.spawnError, true);
});

test("sniff: temel imzalar", () => {
  assert.equal(sniffBuffer(Buffer.from("%PDF-1.7\n")), "pdf");
  assert.equal(sniffBuffer(Buffer.from("504b030414000000", "hex")), "zip");
  assert.equal(sniffBuffer(Buffer.from("d0cf11e0a1b11ae1", "hex")), "cfb");
  assert.equal(sniffBuffer(Buffer.from("89504e470d0a1a0a0000", "hex")), "png");
  assert.equal(sniffBuffer(Buffer.from("ffd8ffe000104a46", "hex")), "jpeg");
  const ftyp = (brand) => Buffer.concat([Buffer.from("00000018", "hex"), Buffer.from("ftyp" + brand + "\0\0\0\0mif1" + brand)]);
  assert.equal(sniffBuffer(ftyp("heic")), "heic");
  assert.equal(sniffBuffer(ftyp("avif")), "avif");
  assert.equal(sniffBuffer(ftyp("isom")), "mp4");
  assert.equal(sniffBuffer(Buffer.from('<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg"></svg>')), "svg");
  assert.equal(sniffBuffer(Buffer.from("ad;soyad\nAyşe;Yılmaz\n")), "text");
});

test("sniff: .pdf uzantılı PNG reddedilir, şifreli DOCX (CFB) kabul edilir", () => {
  assert.equal(sniffMatches("pdf", "png"), false);
  assert.equal(sniffMatches("docx", "cfb"), true);
  assert.equal(sniffMatches("png", "unknown"), false);
  assert.equal(sniffMatches("mp3", "unknown"), true);
});

test("filename: Türkçe ad indirme başlığında korunur", () => {
  const name = displayBase("Özgeçmiş şubat.png") + ".webp";
  assert.equal(name, "Özgeçmiş şubat.webp");
  const cd = contentDisposition(name);
  assert.match(cd, /filename\*=UTF-8''%C3%96zge%C3%A7mi%C5%9F%20%C5%9Fubat\.webp/);
  assert.match(cd, /filename="Ozgecmis_subat\.webp"/);
});

test("filename: yol ayırıcıları ve kontrol karakterleri atılır", () => {
  assert.equal(displayBase("../../etc/passwd.txt"), ".. .. etc passwd");
  assert.equal(displayBase(""), "dosya");
});

test("filename: latin1 olarak çözülmüş UTF-8 ad onarılır", () => {
  const broken = Buffer.from("Şubat raporu.docx", "utf8").toString("latin1");
  assert.equal(fixLatin1(broken), "Şubat raporu.docx");
  assert.equal(fixLatin1("plain.docx"), "plain.docx");
});
