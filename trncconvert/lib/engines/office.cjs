"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");
const run = require("../run.cjs");
const { fail } = require("../errors.cjs");
const { displayBase } = require("../filename.cjs");
const { MIME } = require("../formats.cjs");

const SOFFICE = process.env.SOFFICE || "soffice";
const TIMEOUT_MS = 180000;

const FILTERS = {
  pdf: "pdf",
  docx: "docx:MS Word 2007 XML",
  odt: "odt",
  rtf: "rtf:Rich Text Format",
  txt: "txt:Text (encoded):UTF8",
  xlsx: "xlsx:Calc MS Excel 2007 XML",
  ods: "ods",
  csv: "csv:Text - txt - csv (StarCalc):44,34,76,1",
  pptx: "pptx:Impress MS PowerPoint 2007 XML",
  odp: "odp",
};

const CSV_INFILTER = "--infilter=Text - txt - csv (StarCalc):44,34,76,1";

async function convert(job) {
  const { path: input, ext, originalName } = job.input;
  const target = job.target;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "lo-"));
  const outDir = path.join(job.workDir, "lo");
  fs.mkdirSync(outDir, { recursive: true });

  const args = [
    "--headless", "--norestore", "--nologo", "--nolockcheck", "--nodefault",
    `-env:UserInstallation=${pathToFileURL(profile).href}`,
  ];
  if (ext === "csv") args.push(CSV_INFILTER);
  args.push("--convert-to", FILTERS[target], "--outdir", outDir, input);

  let r;
  try {
    r = await run(SOFFICE, args, { timeoutMs: TIMEOUT_MS });
  } finally {
    fs.rm(profile, { recursive: true, force: true }, () => {});
  }
  if (r.timedOut) throw fail("timeout");

  const produced = path.join(outDir, path.basename(input, path.extname(input)) + "." + target);
  if (r.code !== 0 || !fs.existsSync(produced) || fs.statSync(produced).size === 0) {
    const err = new Error(`soffice exit ${r.code}: ${(r.stderr || r.stdout).slice(0, 300)}`);
    if (/could not be loaded|source file could not/i.test(r.stderr + r.stdout)) throw fail("corrupt");
    throw err;
  }

  const name = displayBase(originalName) + "." + target;
  const finalPath = path.join(job.workDir, "out." + target);
  fs.renameSync(produced, finalPath);
  fs.rm(outDir, { recursive: true, force: true }, () => {});
  return { path: finalPath, name, mime: MIME[target] };
}

module.exports = { convert, FILTERS };
