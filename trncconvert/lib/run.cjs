"use strict";
// Dış komut çalıştırıcı: argüman dizisi alır, kabuk kullanmaz.
// Zaman aşımında süreç grubunu öldürür, çıktıyı sınırlar, isteğe bağlı stdin yazar.
// Sıfır olmayan çıkış kodunda reddetmez; yorumlamak çağırana kalır.
const { spawn } = require("child_process");

const MAX_CAPTURE = 1024 * 1024; // stdout/stderr başına 1 MB

function run(cmd, args, opts = {}) {
  const { timeoutMs = 120000, input, cwd, env } = opts;
  return new Promise((resolve) => {
    const detached = process.platform !== "win32";
    let child;
    try {
      child = spawn(cmd, args, {
        cwd,
        env: env || process.env,
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
        detached,
      });
    } catch (err) {
      resolve({ code: null, stdout: "", stderr: String(err.message), spawnError: true });
      return;
    }

    const out = [];
    const err = [];
    let outLen = 0;
    let errLen = 0;
    let timedOut = false;
    let settled = false;

    const collect = (chunks, chunk, len) => {
      if (len < MAX_CAPTURE) chunks.push(chunk.subarray(0, MAX_CAPTURE - len));
      return len + chunk.length;
    };
    child.stdout.on("data", (c) => { outLen = collect(out, c, outLen); });
    child.stderr.on("data", (c) => { errLen = collect(err, c, errLen); });

    const kill = () => {
      try {
        if (detached) process.kill(-child.pid, "SIGKILL");
        else child.kill("SIGKILL");
      } catch (_) { /* süreç zaten bitmiş */ }
    };

    const timer = setTimeout(() => { timedOut = true; kill(); }, timeoutMs);

    const finish = (code, spawnError) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        code: timedOut ? null : code,
        timedOut,
        spawnError: Boolean(spawnError),
        stdout: Buffer.concat(out).toString("utf8"),
        stderr: Buffer.concat(err).toString("utf8"),
      });
    };

    child.on("error", (e) => { err.push(Buffer.from(String(e.message))); finish(null, true); });
    child.on("close", (code) => finish(code, false));

    child.stdin.on("error", () => { /* süreç stdin'i okumadan kapanabilir */ });
    if (input !== undefined) child.stdin.end(input);
    else child.stdin.end();
  });
}

module.exports = run;
