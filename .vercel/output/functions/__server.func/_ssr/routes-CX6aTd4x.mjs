import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as buildFallbackStory, i as SUB_STYLES, n as STYLE_LIST, r as STYLE_META, t as IMAGE_SAFETY } from "./types-X1sadVLn.mjs";
import { a as RefreshCw, c as Library, i as Sun, l as Images, o as PenLine, r as Trash2, s as Moon, t as X, u as FileDown } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as removeComic, i as loadHistory, n as useTheme, o as upsertComic, r as clearHistory } from "./router-BkaLy3KL.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CX6aTd4x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-[opacity,transform,background-color,border-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-fg text-bg hover:opacity-90",
			accent: "bg-accent text-accent-fg hover:opacity-90",
			outline: "border border-border-strong bg-transparent text-fg hover:bg-surface-2",
			ghost: "text-fg hover:bg-surface-2",
			paper: "bg-paper text-ink border border-ink/20 hover:bg-balloon"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5 text-base",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* Roteiro via Grok (xAI), no servidor — a chave nunca vai ao browser.
* Se a API falhar, devolve um roteiro local com a mesma estrutura.
*/
function isSubStyle(v) {
	return SUB_STYLES.includes(v);
}
function normalizeInput(raw) {
	const data = raw ?? {};
	const prompt = String(data.prompt ?? "").trim();
	const panelCount = Number(data.panelCount);
	const style = String(data.style ?? "fantasy");
	if (prompt.length < 8) throw new Error("Escreva um prompt um pouco mais longo.");
	if (prompt.length > 1600) throw new Error("O prompt passou do limite.");
	if (!Number.isFinite(panelCount) || panelCount < 4 || panelCount > 12) throw new Error("Escolha entre 4 e 12 páginas.");
	if (!isSubStyle(style)) throw new Error("Estilo inválido.");
	return {
		prompt,
		panelCount: Math.round(panelCount),
		style
	};
}
var generateStory = createServerFn({ method: "POST" }).validator((raw) => normalizeInput(raw)).handler(createSsrRpc("e47a5bfa3fafacec5b779b330efeeb9d83b91ea2cfde9cd1cbb39fa130e9e626"));
var rewritePanel = createServerFn({ method: "POST" }).validator((raw) => {
	const data = raw ?? {};
	const prompt = String(data.prompt ?? "").slice(0, 1600);
	const visual = String(data.visual ?? "").slice(0, 500);
	const title = String(data.title ?? "").slice(0, 80);
	const style = String(data.style ?? "fantasy");
	if (!isSubStyle(style)) throw new Error("Estilo inválido.");
	return {
		prompt,
		visual,
		title,
		style
	};
}).handler(createSsrRpc("8ddc5162ee4b478a4088afc98eb9da951a3b028c800277d760c61a5b57821e94"));
var POLLINATIONS = "https://image.pollinations.ai/prompt";
function randomSeed() {
	return Math.floor(Math.random() * 1e9);
}
function uid(prefix) {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
/** Monta o prompt visual de um painel, com personagens estáveis e estilo escolhido. */
function composeImagePrompt(visual, style, characters) {
	const meta = STYLE_META[style];
	const cast = characters.slice(0, 4).map((c) => `${c.name} (${c.appearance})`).join("; ");
	return [
		meta.image,
		cast ? `consistent characters: ${cast}` : "",
		visual,
		meta.colors,
		IMAGE_SAFETY
	].filter(Boolean).join(", ").slice(0, 420);
}
function buildImageUrl(prompt, seed) {
	return `${POLLINATIONS}/${encodeURIComponent(prompt)}?seed=${seed}`;
}
function panelImageUrl(panelVisual, style, characters, seed) {
	return buildImageUrl(composeImagePrompt(panelVisual, style, characters), seed);
}
function withNewSeed(url, seed) {
	try {
		const u = new URL(url);
		u.searchParams.set("seed", String(seed));
		return u.toString();
	} catch {
		return url;
	}
}
/** Transforma o roteiro cru num quadrinho pronto para desenhar. */
function buildComic(draft, input, source) {
	const characters = draft.characters.slice(0, 6);
	const coverSeed = randomSeed();
	const coverVisual = draft.coverVisual || `cinematic manga cover, the main characters of the story, dramatic sky, ${STYLE_META[input.style].image}`;
	const panels = draft.panels.slice(0, input.panelCount).map((p, i) => {
		const seed = randomSeed();
		return {
			id: uid("p"),
			number: i + 1,
			visual: p.visual,
			narration: p.narration || "",
			dialogues: (p.dialogues || []).slice(0, 3),
			seed,
			imageUrl: panelImageUrl(p.visual, input.style, characters, seed)
		};
	});
	return {
		id: uid("koma"),
		createdAt: Date.now(),
		prompt: input.prompt,
		style: input.style,
		panelCount: panels.length,
		title: draft.title || "Sem título",
		titleJP: draft.titleJP || "",
		synopsis: draft.synopsis || "",
		characters,
		coverVisual,
		coverSeed,
		coverUrl: panelImageUrl(coverVisual, input.style, characters, coverSeed),
		panels,
		source
	};
}
function regeneratePanelImage(comic, panelId) {
	const seed = randomSeed();
	return {
		...comic,
		panels: comic.panels.map((p) => p.id === panelId ? {
			...p,
			seed,
			imageUrl: panelImageUrl(p.visual, comic.style, comic.characters, seed)
		} : p)
	};
}
function regenerateCover(comic) {
	const seed = randomSeed();
	return {
		...comic,
		coverSeed: seed,
		coverUrl: panelImageUrl(comic.coverVisual, comic.style, comic.characters, seed)
	};
}
function PanelImage({ src, alt, className, delayMs = 0, caption }) {
	const [url, setUrl] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [tries, setTries] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setStatus("idle");
		setUrl(null);
		setTries(0);
		const t = window.setTimeout(() => {
			setUrl(src);
			setStatus("loading");
		}, delayMs);
		return () => window.clearTimeout(t);
	}, [src, delayMs]);
	function retry() {
		const seed = Math.floor(Math.random() * 1e9);
		setTries((n) => n + 1);
		setStatus("loading");
		setUrl(withNewSeed(src, seed));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative h-full w-full overflow-hidden bg-surface-2", className),
		children: [status !== "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-0 flex flex-col justify-end ink-panel-fallback p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "koma-stamp mb-auto self-start text-[0.65rem]",
					children: "原稿"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg leading-snug text-ink",
					children: status === "loading" || status === "idle" ? "O pincel ainda está no ar." : "Cena em nanquim."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 line-clamp-4 text-sm leading-relaxed text-ink/70",
					children: caption || alt
				}),
				status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: retry,
					className: "mt-4 inline-flex h-11 items-center gap-2 self-start rounded-[var(--radius-md)] border border-ink/30 bg-paper px-3 text-sm text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Tentar de novo"]
				}) : null
			]
		}) : null, url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: url,
			alt,
			className: cn("relative z-10 h-full w-full object-cover transition-opacity duration-500", status === "ready" ? "opacity-100" : "opacity-0"),
			onLoad: () => setStatus("ready"),
			onError: () => {
				if (tries >= 1) {
					setStatus("error");
					return;
				}
				const seed = Math.floor(Math.random() * 1e9);
				setTries(1);
				setStatus("loading");
				setUrl(withNewSeed(src, seed));
			}
		}) : null]
	});
}
function Bubbles({ panel }) {
	if (!panel.dialogues.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-x-3 bottom-3 z-20 flex flex-col items-start gap-2",
		children: panel.dialogues.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("koma-bubble pointer-events-auto max-w-[92%]", d.emotion, i % 2 === 1 ? "self-end" : "self-start"),
			children: [d.speaker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "speaker",
				children: d.speaker
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.text })]
		}, `${d.speaker}-${i}`))
	});
}
function Cover({ comic, onRegen, busy }) {
	const meta = STYLE_META[comic.style];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "koma-page relative overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[2/3] w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelImage, {
					src: comic.coverUrl,
					alt: `Capa de ${comic.title}`,
					caption: comic.synopsis
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 z-20 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute left-4 top-4 z-20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "koma-stamp text-[0.65rem]",
						children: meta.jp
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 z-20 space-y-2 p-5",
					children: [
						comic.titleJP ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-sm tracking-[0.2em] text-paper/80",
							children: comic.titleJP
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl leading-tight text-paper",
							children: comic.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-paper/85",
							children: comic.synopsis
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-t-2 border-ink bg-paper px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs uppercase tracking-[0.16em] text-ink/60",
				children: [
					meta.label,
					" · ",
					comic.panelCount,
					" páginas"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				size: "sm",
				variant: "ghost",
				className: "text-ink",
				disabled: busy,
				onClick: onRegen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {}), "Regenerar capa"]
			})]
		})]
	});
}
function PanelPage({ panel, onRegen, busy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "koma-page overflow-hidden",
		children: [
			panel.narration ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "koma-narration",
				children: panel.narration
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "koma-panel relative aspect-[2/3] w-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelImage, {
					src: panel.imageUrl,
					alt: panel.visual,
					caption: panel.visual,
					delayMs: panel.number * 700
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bubbles, { panel })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 border-t-2 border-ink bg-paper px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-display text-sm text-ink/70",
					children: ["Página ", panel.number]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					variant: "ghost",
					className: "text-ink",
					disabled: busy,
					onClick: onRegen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {}), "Regenerar este painel"]
				})]
			})
		]
	});
}
function ComicReader({ comic, busyId, exporting, onRegenPanel, onRegenCover, onPdf, onZip }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-lg flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-print flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "default",
					onClick: onPdf,
					disabled: exporting,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, {}), "Exportar como PDF"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					onClick: onZip,
					disabled: exporting,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, {}), "Baixar todas as imagens"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, {
				comic,
				onRegen: onRegenCover,
				busy: busyId === "cover"
			}),
			comic.panels.map((panel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelPage, {
				panel,
				busy: busyId === panel.id,
				onRegen: () => onRegenPanel(panel.id)
			}, panel.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "pb-10 text-center text-xs tracking-[0.18em] text-subtle",
				children: ["FIM · ", comic.titleJP || comic.title]
			})
		]
	});
}
function HistoryPanel({ open, items, currentId, onClose, onSelect, onDelete, onClear }) {
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-40 flex justify-end",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Fechar histórico",
			className: "absolute inset-0 bg-ink/40",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "relative flex h-full w-full max-w-md flex-col border-l border-border bg-bg-elevated shadow-[var(--shadow-soft)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between gap-3 border-b border-border px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Library, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg",
							children: "Histórico"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "icon",
						variant: "ghost",
						onClick: onClose,
						"aria-label": "Fechar",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 overflow-y-auto p-4",
					children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 py-10 text-sm text-muted",
						children: "Nenhum capítulo salvo neste aparelho."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: items.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `flex gap-3 rounded-[var(--radius-lg)] border p-2 ${currentId === c.id ? "border-accent bg-surface-2" : "border-border bg-surface"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onSelect(c),
								className: "flex min-w-0 flex-1 items-center gap-3 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: c.coverUrl,
									alt: "",
									className: "size-14 shrink-0 rounded-[var(--radius-sm)] object-cover"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate font-display text-sm text-fg",
										children: c.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block truncate text-xs text-muted",
										children: [
											STYLE_META[c.style].label,
											" · ",
											c.panelCount,
											" pág."
										]
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "icon",
								variant: "ghost",
								"aria-label": `Apagar ${c.title}`,
								onClick: () => onDelete(c.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
							})]
						}) }, c.id))
					})
				}),
				items.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
					className: "border-t border-border p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: "w-full",
						onClick: onClear,
						children: "Limpar histórico"
					})
				}) : null
			]
		})]
	});
}
function KomaMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: cn("size-8", className),
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "1",
				y: "1",
				width: "30",
				height: "30",
				fill: "currentColor",
				className: "text-fg"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "3.2",
				y: "3.2",
				width: "11.4",
				height: "11.4",
				fill: "var(--koma-paper)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "17.4",
				y: "3.2",
				width: "11.4",
				height: "11.4",
				fill: "var(--koma-paper)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "3.2",
				y: "17.4",
				width: "11.4",
				height: "11.4",
				fill: "var(--koma-accent)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "17.4",
				y: "17.4",
				width: "11.4",
				height: "11.4",
				fill: "var(--koma-paper)"
			})
		]
	});
}
function Logo({ compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KomaMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "leading-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xl tracking-tight text-fg",
				children: "Koma"
			}), !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-muted",
				children: "estúdio de mangá"
			}) : null]
		})]
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		suppressHydrationWarning: true,
		className: cn("flex min-h-32 w-full rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3 text-base text-fg shadow-none transition-[border-color,box-shadow] duration-150 placeholder:text-subtle focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
var EXAMPLES = [
	"uma jovem maga e um espadachim viajam por um reino amaldiçoado em busca de uma relíquia perdida",
	"dois colegas descobrem que a biblioteca da escola esconde um portal para um mundo de estações invertidas",
	"uma espiã desastrada tenta viver uma vida comum com a família que ela mesma inventou"
];
var COUNTS = [
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12
];
function PromptForm({ prompt, style, panelCount, generating, onPrompt, onStyle, onCount, onGenerate, onExample }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[0.7rem] font-medium uppercase tracking-[0.22em] text-accent",
						children: "第1話 · novo capítulo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "font-display text-3xl leading-tight tracking-tight text-fg sm:text-4xl",
						children: ["Escreva o mundo.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-muted",
							children: "Nós desenhamos as páginas."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-prose text-sm leading-relaxed text-muted",
						children: "Um prompt, um estilo, e um mangá vertical — roteiro, balões e arte em nanquim digital. Sem conta. Sem créditos."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-medium uppercase tracking-[0.16em] text-muted",
						children: "Prompt da história"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: prompt,
						onChange: (e) => onPrompt(e.target.value),
						placeholder: "uma jovem maga e um espadachim viajam por um reino amaldiçoado…",
						maxLength: 1600,
						className: "min-h-36 font-sans"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block text-right text-xs tabular-nums text-subtle",
						children: [prompt.length, "/1600"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: EXAMPLES.map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onPrompt(ex),
					className: "max-w-full rounded-full border border-border bg-surface px-3 py-2 text-left text-xs leading-snug text-muted transition-colors hover:border-border-strong hover:text-fg",
					children: ex
				}, ex))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "text-xs font-medium uppercase tracking-[0.16em] text-muted",
					children: "Estilo"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
					children: STYLE_LIST.map((item) => {
						const active = item.id === style;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onStyle(item.id),
							className: cn("flex min-h-16 flex-col items-start rounded-[var(--radius-lg)] border px-3 py-3 text-left transition-colors", active ? "border-accent bg-surface-2" : "border-border bg-surface hover:border-border-strong"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-sm text-fg",
									children: item.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[0.65rem] tracking-[0.18em] text-accent",
									children: item.jp
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 text-xs text-muted",
									children: item.blurb
								})
							]
						}, item.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("legend", {
					className: "text-xs font-medium uppercase tracking-[0.16em] text-muted",
					children: ["Páginas · ", panelCount]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: COUNTS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onCount(n),
						className: cn("size-11 rounded-[var(--radius-sm)] border text-sm tabular-nums transition-colors", n === panelCount ? "border-fg bg-fg text-bg" : "border-border bg-surface text-fg hover:border-border-strong"),
						children: n
					}, n))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "accent",
					size: "lg",
					className: "flex-1",
					disabled: generating || prompt.trim().length < 8,
					onClick: onGenerate,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, {}), generating ? "Compondo o capítulo…" : "Gerar história completa"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					size: "lg",
					disabled: generating,
					onClick: onExample,
					children: "Ver exemplo"
				})]
			})
		]
	});
}
var SAMPLE_PROMPT = "uma jovem maga e um espadachim viajam por um reino amaldiçoado em busca de uma relíquia perdida";
function StudioApp() {
	const { theme, toggle } = useTheme();
	const [prompt, setPrompt] = (0, import_react.useState)(SAMPLE_PROMPT);
	const [style, setStyle] = (0, import_react.useState)("fantasy");
	const [panelCount, setPanelCount] = (0, import_react.useState)(6);
	const [comic, setComic] = (0, import_react.useState)(null);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [generating, setGenerating] = (0, import_react.useState)(false);
	const [step, setStep] = (0, import_react.useState)("");
	const [historyOpen, setHistoryOpen] = (0, import_react.useState)(false);
	const [busyId, setBusyId] = (0, import_react.useState)(null);
	const [exporting, setExporting] = (0, import_react.useState)(false);
	const readerRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const items = loadHistory();
		setHistory(items);
		if (items[0]) setComic(items[0]);
	}, []);
	function persist(next) {
		setComic(next);
		setHistory(upsertComic(next));
	}
	async function runGenerate() {
		const input = {
			prompt: prompt.trim(),
			style,
			panelCount
		};
		if (input.prompt.length < 8) {
			toast.error("Escreva um pouco mais sobre a história.");
			return;
		}
		setGenerating(true);
		setStep("Compondo o roteiro…");
		try {
			const result = await generateStory({ data: input });
			setStep("Preparando os pincéis…");
			persist(buildComic(result.draft, input, result.source));
			if (result.source === "local") toast.message("Roteiro local — a arte segue o mesmo estilo.");
			else toast.success("Capítulo composto.");
			requestAnimationFrame(() => {
				readerRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start"
				});
			});
		} catch {
			persist(buildComic(buildFallbackStory(input.prompt, input.style, input.panelCount), input, "local"));
			toast.message("Usamos um roteiro reserva. A arte continua no estilo escolhido.");
		} finally {
			setGenerating(false);
			setStep("");
		}
	}
	function loadExample() {
		const input = {
			prompt: SAMPLE_PROMPT,
			style: "fantasy",
			panelCount: 8
		};
		setPrompt(input.prompt);
		setStyle(input.style);
		setPanelCount(input.panelCount);
		persist(buildComic(buildFallbackStory(input.prompt, input.style, input.panelCount), input, "local"));
		toast.success("Exemplo carregado — as páginas estão sendo desenhadas.");
		requestAnimationFrame(() => {
			readerRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
		});
	}
	async function onRegenPanel(panelId) {
		if (!comic) return;
		setBusyId(panelId);
		const panel = comic.panels.find((p) => p.id === panelId);
		try {
			if (panel) {
				const rewritten = await rewritePanel({ data: {
					prompt: comic.prompt,
					visual: panel.visual,
					title: comic.title,
					style: comic.style
				} });
				const seed = Math.floor(Math.random() * 1e9);
				persist({
					...comic,
					panels: comic.panels.map((p) => p.id === panelId ? {
						...p,
						visual: rewritten.visual || p.visual,
						narration: rewritten.narration || p.narration,
						dialogues: rewritten.dialogues.length ? rewritten.dialogues : p.dialogues,
						seed,
						imageUrl: panelImageUrl(rewritten.visual || p.visual, comic.style, comic.characters, seed)
					} : p)
				});
			} else persist(regeneratePanelImage(comic, panelId));
		} catch {
			persist(regeneratePanelImage(comic, panelId));
		} finally {
			setBusyId(null);
		}
	}
	function onRegenCover() {
		if (!comic) return;
		setBusyId("cover");
		persist(regenerateCover(comic));
		setTimeout(() => setBusyId(null), 400);
	}
	async function onPdf() {
		if (!comic) return;
		setExporting(true);
		try {
			const { exportComicPdf } = await import("./export-CDUQXkxO.mjs");
			await exportComicPdf(comic);
			toast.success("PDF pronto.");
		} catch {
			window.print();
		} finally {
			setExporting(false);
		}
	}
	async function onZip() {
		if (!comic) return;
		setExporting(true);
		try {
			const { downloadAllImages } = await import("./export-CDUQXkxO.mjs");
			await downloadAllImages(comic);
			toast.success("Arquivo de imagens pronto.");
		} catch {
			toast.error("Não foi possível empacotar as imagens. Tente de novo em instantes.");
		} finally {
			setExporting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "ink-wash min-h-dvh",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "no-print sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { compact: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							onClick: () => setHistoryOpen(true),
							"aria-label": "Histórico",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Library, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							onClick: toggle,
							"aria-label": "Alternar tema",
							children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {})
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-12 lg:py-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "no-print lg:sticky lg:top-24",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptForm, {
						prompt,
						style,
						panelCount,
						generating,
						onPrompt: setPrompt,
						onStyle: setStyle,
						onCount: setPanelCount,
						onGenerate: () => void runGenerate(),
						onExample: loadExample
					}), generating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						"aria-live": "polite",
						children: step
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: readerRef,
					className: "min-w-0",
					children: comic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComicReader, {
						comic,
						busyId,
						exporting,
						onRegenPanel: (id) => void onRegenPanel(id),
						onRegenCover,
						onPdf: () => void onPdf(),
						onZip: () => void onZip()
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyReader, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryPanel, {
				open: historyOpen,
				items: history,
				currentId: comic?.id,
				onClose: () => setHistoryOpen(false),
				onSelect: (c) => {
					setComic(c);
					setPrompt(c.prompt);
					setStyle(c.style);
					setPanelCount(c.panelCount);
					setHistoryOpen(false);
				},
				onDelete: (id) => {
					const next = removeComic(id);
					setHistory(next);
					if (comic?.id === id) setComic(next[0] ?? null);
				},
				onClear: () => {
					clearHistory();
					setHistory([]);
				}
			})
		]
	});
}
function EmptyReader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "koma-page mx-auto flex min-h-[28rem] max-w-lg flex-col items-start justify-end gap-4 p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "koma-stamp text-xs",
				children: "空白"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl leading-tight text-ink",
				children: "A página ainda está em branco."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-prose text-sm leading-relaxed text-ink/70",
				children: "Escolha um estilo, descreva o mundo e gere o capítulo. As páginas sobem como um manhwa — capa, narração, balões e arte."
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioApp, {});
}
//#endregion
export { Home as component };
