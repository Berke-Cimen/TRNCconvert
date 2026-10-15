"use strict";
const fs = require("fs");
const path = require("path");
const { pyhelper, EXIT } = require("../python.cjs");
const { fail } = require("../errors.cjs");
const { displayBase } = require("../filename.cjs");
const { MIME } = require("../formats.cjs");
const { zipFiles } = require("../zip.cjs");

function check(r, what) {
  if (r.timedOut) throw fail("timeout");
  if (r.code === EXIT.OK) return;
  if (r.code === EXIT.ENCRYPTED_INPUT) throw fail("encrypted_pdf");
  if (r.code === EXIT.LIMIT) throw fail("too_many_pages");
  if (r.code === EXIT.UNSUPPORTED) throw fail("corrupt");
  throw new Error(`${what} exit ${r.code}: ${r.stderr.slice(0, 300)}`);
}

async function convert(job) {
  const { path: input, originalName } = job.input;
  const target = job.target;
  const base = displayBase(originalName);

  if (target === "docx" || target === "txt") {
    const out = path.join(job.workDir, "out." + target);
    const r = await pyhelper([target === "docx" ? "pdf2docx" : "pdf2txt", input, out], { timeoutMs: 300000 });
    check(r, target);
    if (!fs.existsSync(out)) throw new Error("pdf output missing");
    return { path: out, name: `${base}.${target}`, mime: MIME[target] };
  }

  const pagesDir = path.join(job.workDir, "pages");
  fs.mkdirSync(pagesDir, { recursive: true });
  const r = await pyhelper(["pdf2img", input, pagesDir, target, "sayfa"], { timeoutMs: 300000 });
  check(r, "pdf2img");
  const files = JSON.parse(r.stdout.trim().split("\n").pop());
  if (!Array.isArray(files) || files.length === 0) throw new Error("pdf2img produced nothing");

  if (files.length === 1) {
    const out = path.join(job.workDir, "out." + target);
    fs.renameSync(files[0], out);
    return { path: out, name: `${base}.${target}`, mime: MIME[target] };
  }
  const out = path.join(job.workDir, "out.zip");
  await zipFiles(out, files.map((f) => ({ path: f, name: `${base}-${path.basename(f)}` })));
  fs.rm(pagesDir, { recursive: true, force: true }, () => {});
  return { path: out, name: `${base}-${target}.zip`, mime: MIME.zip };
}

module.exports = { convert };
