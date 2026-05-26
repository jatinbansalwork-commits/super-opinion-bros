import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "audio");

const tracks = [
  { name: "start", freq: 523, dur: 0.18 },
  { name: "select", freq: 784, dur: 0.08 },
  { name: "reveal", freq: 392, dur: 0.35 },
  { name: "next", freq: 659, dur: 0.12 },
  { name: "win", freq: 880, dur: 0.55 },
  { name: "lose", freq: 220, dur: 0.4 },
  { name: "bgm", freq: 196, dur: 8, loop: true },
];

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

for (const t of tracks) {
  const out = join(outDir, `${t.name}.mp3`);
  const vol = t.name === "bgm" ? 0.15 : 0.35;
  execFileSync(
    ffmpegPath,
    [
      "-y",
      "-f",
      "lavfi",
      "-i",
      `sine=frequency=${t.freq}:duration=${t.dur}`,
      "-af",
      `volume=${vol}`,
      "-codec:a",
      "libmp3lame",
      "-q:a",
      "6",
      out,
    ],
    { stdio: "inherit" }
  );
  console.log(`wrote ${t.name}.mp3`);
}

console.log("Audio generation complete.");
