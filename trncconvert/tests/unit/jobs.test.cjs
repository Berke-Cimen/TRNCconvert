"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const jobs = require("../../lib/jobs.cjs");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MIN = 60 * 1000;

function makeJob(type = "convert") {
  const input = path.join(os.tmpdir(), `jobtest-${Math.random().toString(16).slice(2)}.png`);
  fs.writeFileSync(input, "x");
  return jobs.createJob({ type, inputPath: input, ext: "png", originalName: "a.png", target: "jpg", quality: "normal", ip: "t-" + type });
}

async function runToDone(job) {
  jobs.enqueue(job, async (j) => {
    const out = path.join(j.workDir, "out.jpg");
    fs.writeFileSync(out, "y");
    return { path: out, name: "a.jpg", mime: "image/jpeg" };
  });
  while (job.status !== "done") await sleep(5);
  await sleep(20);
}

test("silme: yüklenen dosya iş bitince hemen silinir", async () => {
  const job = makeJob();
  await runToDone(job);
  assert.equal(fs.existsSync(job.input.path), false);
  assert.equal(fs.existsSync(job.output.path), true);
});

test("silme: çıktı, iş bittikten 10 dakika sonra silinir", async () => {
  const job = makeJob();
  await runToDone(job);
  const finishedAt = job.expiresAt - jobs.TTL_MS;
  jobs.sweep(finishedAt + 9 * MIN);
  assert.ok(jobs.getJob(job.id), "9. dakikada hâlâ duruyor olmalı");
  jobs.sweep(finishedAt + 10 * MIN + 1000);
  assert.equal(jobs.getJob(job.id), null);
  await sleep(50);
  assert.equal(fs.existsSync(job.workDir), false);
});

test("silme: şifre bekleyen dosya 15 dakika sonra silinir", async () => {
  const job = makeJob("unlock");
  job.status = "awaiting_password";
  jobs.sweep(job.createdAt + 14 * MIN);
  assert.ok(jobs.getJob(job.id));
  jobs.sweep(job.createdAt + 15 * MIN + 1000);
  assert.equal(jobs.getJob(job.id), null);
  await sleep(50);
  assert.equal(fs.existsSync(job.input.path), false);
  assert.equal(fs.existsSync(job.workDir), false);
});

test("silme: çalışan iş süresi dolsa da silinmez", () => {
  const job = makeJob();
  job.status = "running";
  jobs.sweep(job.createdAt + 120 * MIN);
  assert.ok(jobs.getJob(job.id));
  job.status = "error";
  jobs.removeJob(job.id);
});

test("silme: başarısız şifre işinde klasör çalışırken bile silinir", async () => {
  const job = makeJob("unlock");
  job.status = "running";
  fs.writeFileSync(path.join(job.workDir, "out.pdf"), "partial");
  jobs.removeJob(job.id);
  await sleep(50);
  assert.equal(fs.existsSync(job.workDir), false);
});
