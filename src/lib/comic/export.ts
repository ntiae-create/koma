import { jsPDF } from "jspdf";
import JSZip from "jszip";
import type { Comic } from "./types";

function filenameBase(title: string) {
  const clean = title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return clean || "koma";
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function fetchImageBlob(url: string): Promise<Blob> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error("Falha ao baixar uma imagem.");
  return res.blob();
}

async function blobToJpegDataUrl(blob: Blob): Promise<string> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível.");
  ctx.fillStyle = "#f4ecd9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.86);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
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
  return lines;
}

/** Composição de uma página A4 em canvas — texto em unicode nativo, depois vira JPEG no PDF. */
function composePage(opts: {
  image?: ImageBitmap;
  kicker?: string;
  title?: string;
  body?: string;
  footer?: string;
}): HTMLCanvasElement {
  const w = 1240;
  const h = 1754;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível.");

  ctx.fillStyle = "#f4ecd9";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#c24a32";
  ctx.fillRect(0, 0, 18, h);

  const margin = 72;
  let y = 88;
  if (opts.kicker) {
    ctx.fillStyle = "#c24a32";
    ctx.font = "600 28px 'Zen Kaku Gothic New', sans-serif";
    ctx.fillText(opts.kicker, margin, y);
    y += 48;
  }
  if (opts.title) {
    ctx.fillStyle = "#1a1512";
    ctx.font = "600 56px 'Shippori Mincho', serif";
    for (const line of wrapText(ctx, opts.title, w - margin * 2)) {
      ctx.fillText(line, margin, y);
      y += 64;
    }
    y += 12;
  }

  const imgTop = y;
  const imgH = opts.body ? 1100 : 1280;
  const imgW = w - margin * 2;
  ctx.fillStyle = "#1a1512";
  ctx.fillRect(margin - 4, imgTop - 4, imgW + 8, imgH + 8);
  ctx.fillStyle = "#d7cbb3";
  ctx.fillRect(margin, imgTop, imgW, imgH);
  if (opts.image) {
    const srcW = opts.image.width || 1;
    const srcH = opts.image.height || 1;
    const scale = Math.max(imgW / srcW, imgH / srcH);
    const dw = srcW * scale;
    const dh = srcH * scale;
    const dx = margin + (imgW - dw) / 2;
    const dy = imgTop + (imgH - dh) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(margin, imgTop, imgW, imgH);
    ctx.clip();
    ctx.drawImage(opts.image, dx, dy, dw, dh);
    ctx.restore();
  }

  y = imgTop + imgH + 48;
  if (opts.body) {
    ctx.fillStyle = "#1a1512";
    ctx.font = "400 28px 'Zen Kaku Gothic New', sans-serif";
    for (const line of wrapText(ctx, opts.body, w - margin * 2)) {
      if (y > h - 80) break;
      ctx.fillText(line, margin, y);
      y += 38;
    }
  }
  if (opts.footer) {
    ctx.fillStyle = "#8a7e72";
    ctx.font = "500 20px 'Zen Kaku Gothic New', sans-serif";
    ctx.fillText(opts.footer, margin, h - 40);
  }
  return canvas;
}

async function loadBitmap(url: string): Promise<ImageBitmap | undefined> {
  try {
    const blob = await fetchImageBlob(url);
    return await createImageBitmap(blob);
  } catch {
    return undefined;
  }
}

export async function exportComicPdf(comic: Comic) {
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pages: Array<{ image?: ImageBitmap; kicker?: string; title?: string; body?: string; footer?: string }> = [];

  const coverBmp = await loadBitmap(comic.coverUrl);
  pages.push({
    image: coverBmp,
    kicker: comic.titleJP || "第1話",
    title: comic.title,
    body: comic.synopsis,
    footer: "Koma · estúdio de mangá",
  });

  for (const panel of comic.panels) {
    const bmp = await loadBitmap(panel.imageUrl);
    const lines = [
      panel.narration,
      ...panel.dialogues.map((d) => `${d.speaker}: “${d.text}”`),
    ]
      .filter(Boolean)
      .join("  ·  ");
    pages.push({
      image: bmp,
      kicker: `Página ${panel.number}`,
      title: undefined,
      body: lines,
      footer: comic.title,
    });
  }

  pages.forEach((page, i) => {
    const canvas = composePage(page);
    const data = canvas.toDataURL("image/jpeg", 0.84);
    if (i > 0) pdf.addPage();
    pdf.addImage(data, "JPEG", 0, 0, 210, 297);
    page.image?.close();
  });

  pdf.save(`${filenameBase(comic.title)}.pdf`);
}

export async function downloadAllImages(comic: Comic) {
  const zip = new JSZip();
  const folder = zip.folder(filenameBase(comic.title)) ?? zip;
  const items: Array<{ name: string; url: string }> = [
    { name: "00-capa.jpg", url: comic.coverUrl },
    ...comic.panels.map((p) => ({
      name: `${String(p.number).padStart(2, "0")}-painel.jpg`,
      url: p.imageUrl,
    })),
  ];

  for (const item of items) {
    try {
      const blob = await fetchImageBlob(item.url);
      const dataUrl = await blobToJpegDataUrl(blob);
      const jpeg = await (await fetch(dataUrl)).blob();
      folder.file(item.name, jpeg);
    } catch {
      /* pula imagens que o navegador não deixou copiar */
    }
  }

  const out = await zip.generateAsync({ type: "blob" });
  downloadBlob(out, `${filenameBase(comic.title)}-imagens.zip`);
}
