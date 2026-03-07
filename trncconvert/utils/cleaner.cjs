const fs = require("fs");
const path = require("path");

function scheduleDelete(files) {
  setTimeout(() => {
    files.forEach(p => {
      if (p && fs.existsSync(p)) fs.unlink(p, () => {});
    });
  }, 10 * 60 * 1000);
}

function cleanOldFiles(dir, maxAgeMs) {
  if (!fs.existsSync(dir)) return;
  const now = Date.now();
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile() && (now - stat.mtimeMs) > maxAgeMs) {
        fs.unlink(filePath, () => {});
      }
    } catch (_) {}
  });
}

module.exports = scheduleDelete;
module.exports.cleanOldFiles = cleanOldFiles;
