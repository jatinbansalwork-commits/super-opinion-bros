import type { FinalResult } from "@/lib/types";

const W = 640;
const H = 880;

export async function renderShareCardPng(
  result: FinalResult
): Promise<Blob | null> {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#5C94FC";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#43B047";
  ctx.fillRect(0, H - 120, W, 120);

  ctx.strokeStyle = "#3D2817";
  ctx.lineWidth = 8;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  ctx.fillStyle = "#FBD000";
  ctx.font = "bold 28px monospace";
  ctx.textAlign = "center";
  ctx.fillText("SUPER OPINION BROS", W / 2, 80);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "16px monospace";
  ctx.fillText("YOU BECAME", W / 2, 130);

  ctx.fillStyle = "#E52521";
  ctx.font = "bold 36px monospace";
  const titleLines = wrapText(ctx, result.title, W - 80);
  titleLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, 180 + i * 42);
  });

  ctx.fillStyle = "#3D2817";
  ctx.fillRect(48, 320, W - 96, 200);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "14px monospace";
  ctx.fillText(`MATCH ${result.matchPercent}%`, W / 2, 360);
  ctx.fillText(`CHAOS ${result.chaosScore}`, W / 2, 395);
  ctx.fillText(`RANK: ${result.rank}`, W / 2, 430);
  ctx.fillText(`SCORE ${result.runScore}`, W / 2, 465);

  ctx.fillStyle = "#FBD000";
  ctx.font = "12px monospace";
  ctx.fillText(result.alignment, W / 2, 560);

  drawConfetti(ctx);

  ctx.fillStyle = "#3D2817";
  ctx.font="11px monospace";
  ctx.fillText("SCAN TO PLAY", W / 2, H - 72);
  drawSimpleQr(ctx, W / 2 - 40, H - 160, 80);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function drawConfetti(ctx: CanvasRenderingContext2D): void {
  const colors = ["#FBD000", "#E52521", "#43B047", "#FFFFFF"];
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = colors[i % colors.length];
    const x = 40 + ((i * 97) % (W - 80));
    const y = 280 + ((i * 53) % 200);
    ctx.fillRect(x, y, 6, 6);
  }
}

function drawSimpleQr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = "#3D2817";
  const cells = 8;
  const cell = size / cells;
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if ((r + c + (r * c)) % 3 === 0) {
        ctx.fillRect(x + c * cell, y + r * cell, cell - 1, cell - 1);
      }
    }
  }
}

export function downloadShareCard(blob: Blob, filename = "super-opinion-bros.png"): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
