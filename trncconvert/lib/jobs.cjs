"use strict";
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { UserError, MESSAGES } = require("./errors.cjs");

const OUTPUT_DIR = path.join(__dirname, "..", "output");
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const MAX_ACTIVE = Math.max(1, Number(process.env.MAX_CONCURRENT_JOBS) || 3);
const MAX_QUEUE = 60;
const MAX_PER_IP = 12;
const TTL_MS = 10 * 60 * 1000;

const jobs = new Map();
const queue = [];
let active = 0;

const rid = () => crypto.randomBytes(16).toString("hex");

function rmQuiet(p) {
  if (p) fs.rm(p, { recursive: true, force: true }, () => {});
}

function createJob({ type, inputPath, ext, originalName, target, quality, ip }) {
  const id = rid();
  const workDir = path.join(OUTPUT_DIR, id);
  fs.mkdirSync(workDir, { recursive: true });
  const job = {
    id,
    token: rid(),
    type,
    status: "queued",
    createdAt: Date.now(),
    ip,
    input: { path: inputPath, ext, originalName },
    target,
    quality,
    workDir,
    progress: null,
    output: null,
    error: null,
    attempts: 0,
  };
  jobs.set(id, job);
  return job;
}

function getJob(id) {
  if (typeof id !== "string" || !/^[0-9a-f]{32}$/.test(id)) return null;
  return jobs.get(id) || null;
}

function tokenMatches(job, token) {
  if (!job || typeof token !== "string" || token.length !== job.token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(job.token));
}

function activeCountForIp(ip) {
  let n = 0;
  for (const j of jobs.values()) if (j.ip === ip && (j.status === "queued" || j.status === "running")) n++;
  return n;
}

function canAccept(ip) {
  if (queue.length >= MAX_QUEUE) return false;
  return activeCountForIp(ip) < MAX_PER_IP;
}

function publicView(job) {
  const view = { id: job.id, status: job.status };
  if (job.status === "queued") view.position = queue.indexOf(job) + 1;
  if (job.status === "running" && job.progress !== null) view.progress = Math.round(job.progress * 100);
  if (job.status === "error") view.error = job.error;
  if (job.status === "done") {
    view.download = { url: `/dl/${job.id}/${job.token}`, name: job.output.name, size: job.output.size };
  }
  return view;
}

function toPublicError(err) {
  if (err instanceof UserError) return { code: err.code, message: err.message };
  return { code: "generic", message: MESSAGES.generic };
}

function finish(job, result) {
  const stat = fs.statSync(result.path);
  job.output = { path: result.path, name: result.name, size: stat.size, mime: result.mime };
  job.status = "done";
  job.progress = null;
}

function pump() {
  while (active < MAX_ACTIVE && queue.length > 0) {
    const job = queue.shift();
    active++;
    job.status = "running";
    const started = Date.now();
    Promise.resolve()
      .then(() => job.worker(job))
      .then((result) => finish(job, result))
      .catch((err) => {
        job.status = "error";
        job.error = toPublicError(err);
        if (!(err instanceof UserError)) {
          console.error(`[job ${job.id.slice(0, 8)}] ${job.input.ext}->${job.target} başarısız:`, err && err.message ? err.message.slice(0, 500) : err);
        }
      })
      .finally(() => {
        active--;
        job.worker = null;
        rmQuiet(job.input.path);
        console.log(`[job ${job.id.slice(0, 8)}] ${job.input.ext}->${job.target} ${job.status} ${Date.now() - started}ms`);
        if (!jobs.has(job.id)) rmQuiet(job.workDir);
        pump();
      });
  }
}

function enqueue(job, worker) {
  job.worker = worker;
  job.status = "queued";
  queue.push(job);
  pump();
}

function removeJob(id) {
  const job = jobs.get(id);
  if (!job) return;
  jobs.delete(id);
  const qi = queue.indexOf(job);
  if (qi >= 0) queue.splice(qi, 1);
  rmQuiet(job.input.path);
  if (job.status !== "running") rmQuiet(job.workDir);
}

function sweep(now = Date.now()) {
  for (const job of jobs.values()) {
    if (job.status !== "running" && now - job.createdAt > TTL_MS) removeJob(job.id);
  }
}

function cleanStale(dir, maxAgeMs) {
  if (!fs.existsSync(dir)) return;
  const now = Date.now();
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    try {
      if (now - fs.statSync(p).mtimeMs > maxAgeMs) rmQuiet(p);
    } catch (_) {}
  }
}

function stats() {
  return { jobs: jobs.size, queued: queue.length, active, maxActive: MAX_ACTIVE };
}

module.exports = {
  OUTPUT_DIR, TTL_MS, MAX_ACTIVE,
  createJob, getJob, tokenMatches, canAccept, publicView, enqueue, removeJob, sweep, cleanStale, stats,
  _jobs: jobs,
};
