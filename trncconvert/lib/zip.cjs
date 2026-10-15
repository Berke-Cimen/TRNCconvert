"use strict";
const fs = require("fs");
const archiver = require("archiver");

function uniqueNames(items) {
  const seen = new Map();
  return items.map((it) => {
    const n = seen.get(it.name) || 0;
    seen.set(it.name, n + 1);
    if (n === 0) return it;
    const dot = it.name.lastIndexOf(".");
    const name = dot > 0 ? `${it.name.slice(0, dot)} (${n + 1})${it.name.slice(dot)}` : `${it.name} (${n + 1})`;
    return { ...it, name };
  });
}

function zipFiles(outPath, items) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 6 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    for (const it of uniqueNames(items)) archive.file(it.path, { name: it.name });
    archive.finalize();
  });
}

function streamZip(res, items, onError) {
  const archive = archiver("zip", { zlib: { level: 6 } });
  archive.on("error", onError);
  archive.pipe(res);
  for (const it of uniqueNames(items)) archive.file(it.path, { name: it.name });
  archive.finalize();
}

module.exports = { zipFiles, streamZip, uniqueNames };
