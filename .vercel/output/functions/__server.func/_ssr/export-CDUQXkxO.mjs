import { o as __toESM } from "../_runtime.mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
import { t as require_lib } from "../_libs/jszip+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/export-CDUQXkxO.js
var import_jspdf_node_min = require_jspdf_node_min();
var import_lib = /* @__PURE__ */ __toESM(require_lib());
function filenameBase(title) {
	return title.normalize("NFD").replace(/\p{M}/gu, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "koma";
}
function downloadBlob(blob, name) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 4e3);
}
async function fetchImageBlob(url) {
	const res = await fetch(url, { mode: "cors" });
	if (!res.ok) throw new Error("Falha ao baixar uma imagem.");
	return res.blob();
}
async function blobToJpegDataUrl(blob) {
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
	return canvas.toDataURL("image/jpeg", .86);
}
function wrapText(ctx, text, maxWidth) {
	const words = text.split(/\s+/);
	const lines = [];
	let line = "";
	for (const word of words) {
		const test = line ? `${line} ${word}` : word;
		if (ctx.measureText(test).width > maxWidth && line) {
			lines.push(line);
			line = word;
		} else line = test;
	}
	if (line) lines.push(line);
	return lines;
}
/** Composição de uma página A4 em canvas — texto em unicode nativo, depois vira JPEG no PDF. */
function composePage(opts) {
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
		for (const line of wrapText(ctx, opts.title, 1096)) {
			ctx.fillText(line, margin, y);
			y += 64;
		}
		y += 12;
	}
	const imgTop = y;
	const imgH = opts.body ? 1100 : 1280;
	const imgW = 1096;
	ctx.fillStyle = "#1a1512";
	ctx.fillRect(68, imgTop - 4, 1104, imgH + 8);
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
		for (const line of wrapText(ctx, opts.body, 1096)) {
			if (y > 1674) break;
			ctx.fillText(line, margin, y);
			y += 38;
		}
	}
	if (opts.footer) {
		ctx.fillStyle = "#8a7e72";
		ctx.font = "500 20px 'Zen Kaku Gothic New', sans-serif";
		ctx.fillText(opts.footer, margin, 1714);
	}
	return canvas;
}
async function loadBitmap(url) {
	try {
		const blob = await fetchImageBlob(url);
		return await createImageBitmap(blob);
	} catch {
		return;
	}
}
async function exportComicPdf(comic) {
	const pdf = new import_jspdf_node_min.jsPDF({
		unit: "mm",
		format: "a4",
		orientation: "portrait"
	});
	const pages = [];
	const coverBmp = await loadBitmap(comic.coverUrl);
	pages.push({
		image: coverBmp,
		kicker: comic.titleJP || "第1話",
		title: comic.title,
		body: comic.synopsis,
		footer: "Koma · estúdio de mangá"
	});
	for (const panel of comic.panels) {
		const bmp = await loadBitmap(panel.imageUrl);
		const lines = [panel.narration, ...panel.dialogues.map((d) => `${d.speaker}: “${d.text}”`)].filter(Boolean).join("  ·  ");
		pages.push({
			image: bmp,
			kicker: `Página ${panel.number}`,
			title: void 0,
			body: lines,
			footer: comic.title
		});
	}
	pages.forEach((page, i) => {
		const data = composePage(page).toDataURL("image/jpeg", .84);
		if (i > 0) pdf.addPage();
		pdf.addImage(data, "JPEG", 0, 0, 210, 297);
		page.image?.close();
	});
	pdf.save(`${filenameBase(comic.title)}.pdf`);
}
async function downloadAllImages(comic) {
	const zip = new import_lib.default();
	const folder = zip.folder(filenameBase(comic.title)) ?? zip;
	const items = [{
		name: "00-capa.jpg",
		url: comic.coverUrl
	}, ...comic.panels.map((p) => ({
		name: `${String(p.number).padStart(2, "0")}-painel.jpg`,
		url: p.imageUrl
	}))];
	for (const item of items) try {
		const dataUrl = await blobToJpegDataUrl(await fetchImageBlob(item.url));
		const jpeg = await (await fetch(dataUrl)).blob();
		folder.file(item.name, jpeg);
	} catch {}
	downloadBlob(await zip.generateAsync({ type: "blob" }), `${filenameBase(comic.title)}-imagens.zip`);
}
//#endregion
export { downloadAllImages, exportComicPdf };
