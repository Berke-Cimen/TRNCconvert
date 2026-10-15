"use strict";
const path = require("path");
const run = require("../run.cjs");
const { fail } = require("../errors.cjs");
const { displayBase } = require("../filename.cjs");
const { MIME } = require("../formats.cjs");

const FFMPEG = process.env.FFMPEG || "ffmpeg";
const AUDIO_TARGETS = new Set(["mp3", "wav", "m4a", "ogg", "opus", "flac"]);
const VIDEO_INPUTS = new Set(["mp4", "mov", "mkv", "webm", "avi", "wmv", "m4v", "3gp"]);
const pick = (table, quality) => table[quality] || table.normal;

const AUDIO = {
  mp3: (q) => ["-c:a", "libmp3lame", "-b:a", pick({ low: "128k", normal: "192k", high: "320k" }, q)],
  wav: () => ["-c:a", "pcm_s16le"],
  m4a: (q) => ["-c:a", "aac", "-b:a", pick({ low: "128k", normal: "192k", high: "256k" }, q), "-movflags", "+faststart"],
  ogg: (q) => ["-c:a", "libvorbis", "-q:a", pick({ low: "3", normal: "5", high: "7" }, q)],
  opus: (q) => ["-c:a", "libopus", "-b:a", pick({ low: "64k", normal: "96k", high: "160k" }, q)],
  flac: () => ["-c:a", "flac", "-compression_level", "5"],
};

const EVEN = "scale=trunc(iw/2)*2:trunc(ih/2)*2";
const X264 = (q) => ["-c:v", "libx264", "-preset", "veryfast", "-crf", pick({ low: "28", normal: "23", high: "20" }, q),
  "-pix_fmt", "yuv420p", "-vf", EVEN];

const VIDEO = {
  mp4: (q) => [...X264(q), "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart"],
  mov: (q) => [...X264(q), "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart"],
  mkv: (q) => [...X264(q), "-c:a", "aac", "-b:a", "128k"],
  webm: (q) => ["-c:v", "libvpx-vp9", "-crf", pick({ low: "38", normal: "33", high: "28" }, q), "-b:v", "0",
    "-deadline", "good", "-cpu-used", "5", "-row-mt", "1", "-pix_fmt", "yuv420p", "-vf", EVEN,
    "-c:a", "libopus", "-b:a", "96k"],
  avi: (q) => ["-c:v", "mpeg4", "-vtag", "xvid", "-q:v", pick({ low: "6", normal: "4", high: "2" }, q),
    "-pix_fmt", "yuv420p", "-vf", EVEN, "-c:a", "libmp3lame", "-b:a", "192k"],
};

const GIF_FILTER = "fps=12,scale=w='min(480,iw)':h=-2:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a";

function buildArgs(input, output, ext, target, quality) {
  const head = ["-hide_banner", "-nostdin", "-y", "-i", input];
  const tail = ["-progress", "pipe:1", "-nostats", output];
  if (AUDIO_TARGETS.has(target)) {
    return [...head, "-vn", "-sn", "-dn", "-map", "0:a:0", "-map_metadata", "0", ...AUDIO[target](quality), ...tail];
  }
  if (target === "gif") {
    return [...head, "-map", "0:v:0", "-t", "30", "-an", "-vf", GIF_FILTER, "-loop", "0", ...tail];
  }
  return [...head, "-map", "0:v:0", "-map", "0:a:0?", "-sn", "-dn", "-map_metadata", "0", ...VIDEO[target](quality), ...tail];
}

function parseDuration(text) {
  const m = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(text);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null;
}

async function convert(job) {
  const { path: input, ext, originalName } = job.input;
  const target = job.target;
  const output = path.join(job.workDir, "out." + target);
  const args = buildArgs(input, output, ext, target, job.quality);
  const isVideoJob = VIDEO_INPUTS.has(ext) && !AUDIO_TARGETS.has(target);

  let duration = null;
  let errText = "";
  const r = await run(FFMPEG, args, {
    timeoutMs: isVideoJob ? 25 * 60 * 1000 : 10 * 60 * 1000,
    onStderr: (c) => {
      if (duration === null && errText.length < 20000) {
        errText += c.toString("utf8");
        duration = parseDuration(errText);
      }
    },
    onStdout: (c) => {
      const m = /out_time_us=(\d+)/g;
      let last = null;
      let x;
      const s = c.toString("utf8");
      while ((x = m.exec(s))) last = Number(x[1]);
      if (last !== null && duration) {
        const limit = target === "gif" ? Math.min(duration, 30) : duration;
        job.progress = Math.max(0, Math.min(0.99, last / 1e6 / limit));
      }
    },
  });

  if (r.timedOut) throw fail("timeout");
  if (r.code !== 0) {
    if (/matches no streams|does not contain any stream|Output file .* does not contain/i.test(r.stderr)) {
      throw fail(AUDIO_TARGETS.has(target) ? "no_audio" : "corrupt");
    }
    if (/Invalid data found when processing input|could not find codec parameters|moov atom not found/i.test(r.stderr)) {
      throw fail("corrupt");
    }
    throw new Error(`ffmpeg exit ${r.code}: ${r.stderr.slice(-400)}`);
  }
  return { path: output, name: `${displayBase(originalName)}.${target}`, mime: MIME[target] };
}

module.exports = { convert, buildArgs, parseDuration };
