"use strict";
const path = require("path");
const run = require("./run.cjs");

const PYTHON = process.env.PYTHON || "python3";
const HELPER = path.join(__dirname, "..", "scripts", "pyhelper.py");

const EXIT = {
  OK: 0,
  WRONG_PASSWORD: 2,
  NOT_ENCRYPTED: 3,
  UNSUPPORTED: 4,
  INTERNAL: 5,
  LIMIT: 6,
  ENCRYPTED_INPUT: 8,
};

function pyhelper(args, { input, timeoutMs = 180000 } = {}) {
  return run(PYTHON, ["-I", "-X", "utf8", HELPER, ...args], { input, timeoutMs });
}

module.exports = { pyhelper, EXIT };
