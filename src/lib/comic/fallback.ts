import { STYLE_META } from "./styles";
import type { StoryDraft, SubStyle } from "./types";

type Cast = {
  a: { name: string; appearance: string; role: string };
  b: { name: string; appearance: string; role: string };
};

const CASTS: Record<SubStyle, Cast> = {
  shonen: {
    a: {
      name: "Ren",
      appearance:
        "lean teenage swordsman, messy black hair with a red wrap, sharp amber eyes, dark travel haori, wooden practice scars none visible, determined look",
      role: "espadachim teimoso",
    },
    b: {
      name: "Aoi",
      appearance:
        "young mage girl, long midnight-blue hair in a high tail, bright teal eyes, cream and indigo robes, small fox-ear hood, satchel of charms",
      role: "maga itinerante",
    },
  },
  seinen: {
    a: {
      name: "Haru",
      appearance:
        "calm adult man, tired kind eyes, short ash hair, charcoal coat, faint stubble, composed posture",
      role: "investigador",
    },
    b: {
      name: "Sora",
      appearance:
        "quiet woman in her twenties, bobbed brown hair, grey-green eyes, simple knit sweater and long skirt, notebook in hand",
      role: "arquivista",
    },
  },
  shojo: {
    a: {
      name: "Hana",
      appearance:
        "soft-featured schoolgirl, wavy chestnut hair with a ribbon, large hazel eyes, cream cardigan, skirt, gentle blush",
      role: "protagonista",
    },
    b: {
      name: "Yuki",
      appearance:
        "tall boy, silver-tipped black hair, cool grey eyes that soften, school uniform slightly undone, kind mouth",
      role: "interesse e aliado",
    },
  },
  fantasy: {
    a: {
      name: "Lyra",
      appearance:
        "young female mage, long pale-gold hair, violet eyes, layered travel cloak over ornate teal robes, staff of living wood, luminous runes",
      role: "maga",
    },
    b: {
      name: "Takeshi",
      appearance:
        "young male swordsman, dark wind-swept hair, steel-blue eyes, weathered leather armor with a white cloak, slender katana sheathed",
      role: "espadachim",
    },
  },
  slice: {
    a: {
      name: "Mei",
      appearance:
        "gentle girl, short black hair with a clip, warm brown eyes, oversized beige sweater, backpack, shy smile",
      role: "estudante",
    },
    b: {
      name: "Jiro",
      appearance:
        "boy next door, tousled brown hair, round glasses, green parka, kind crooked smile, sketchbook",
      role: "amigo de infância",
    },
  },
  adventure: {
    a: {
      name: "Niko",
      appearance:
        "sun-kissed traveler girl, braided auburn hair, bright green eyes, scarf, practical tunic, boots dusty from the road, map case",
      role: "exploradora",
    },
    b: {
      name: "Aya",
      appearance:
        "reserved guide, short ink-black hair, calm dark eyes, layered traveler's coat, compass at the belt, quiet confidence",
      role: "guia",
    },
  },
};

function pickCast(prompt: string, style: SubStyle): Cast {
  const base = CASTS[style];
  const lower = prompt.toLowerCase();
  // Se o usuário descreveu papéis, mantém os nomes mas ajusta a leitura.
  if (lower.includes("maga") || lower.includes("feiticeira")) {
    return { ...base, a: { ...base.a, role: "maga" } };
  }
  return base;
}

type Beat = (cast: Cast, prompt: string) => StoryDraft["panels"][number];

const BEATS: Beat[] = [
  (c) => ({
    visual: `wide establishing shot of the story world at dawn, atmospheric, ${c.a.name} seen small in the landscape, cinematic depth, no violence`,
    narration: "Toda jornada começa num silêncio que ainda não sabe que é o primeiro capítulo.",
    dialogues: [],
  }),
  (c) => ({
    visual: `medium shot of ${c.a.name}, ${c.a.appearance}, standing in a doorway or trailhead, wind in hair, expressive eyes, hopeful and nervous`,
    narration: "",
    dialogues: [
      {
        speaker: c.a.name,
        text: "Se eu não for agora, esse mapa vai amarelar na gaveta.",
        emotion: "normal",
      },
    ],
  }),
  (c) => ({
    visual: `two-shot of ${c.a.name} meeting ${c.b.name}, ${c.b.appearance}, facing each other on a stone path, soft backlight, first-meeting tension`,
    narration: "Alguém já estava no caminho. Como se o destino tivesse combinado o horário.",
    dialogues: [
      {
        speaker: c.b.name,
        text: "Você também veio por causa do rumor?",
        emotion: "normal",
      },
      {
        speaker: c.a.name,
        text: "Vim porque não consegui dormir.",
        emotion: "normal",
      },
    ],
  }),
  (c, prompt) => ({
    visual: `the inciting image of the story: a relic, a sealed gate, a letter, or a strange light connected to "${prompt.slice(0, 80)}", characters reacting in awe, no gore`,
    narration: "O mundo, de repente, deixa de ser só cenário.",
    dialogues: [
      {
        speaker: c.a.name,
        text: "Então era verdade.",
        emotion: "whisper",
      },
    ],
  }),
  (c) => ({
    visual: `traveling shot, ${c.a.name} and ${c.b.name} walking a long road or corridor, bags and cloaks, golden hour, landscape storytelling`,
    narration: "Passos repetidos viram uma linguagem. O silêncio entre eles também.",
    dialogues: [
      {
        speaker: c.b.name,
        text: "Se cansar, avisa. Eu não leio mentes — só mapas.",
        emotion: "normal",
      },
    ],
  }),
  (c) => ({
    visual: `obstacle scene: collapsed bridge, sealed door, thick mist or a guardian statue, ${c.a.name} thinking, ${c.b.name} watching the path, tense but not bloody`,
    narration: "",
    dialogues: [
      {
        speaker: c.a.name,
        text: "Não é o fim. É só o mundo pedindo jeito.",
        emotion: "normal",
      },
      {
        speaker: c.b.name,
        text: "Então vamos dar jeito.",
        emotion: "normal",
      },
    ],
  }),
  (c) => ({
    visual: `intimate quiet moment, campfire or lantern light, ${c.a.name} and ${c.b.name} sitting close, sharing food or a story, warm colors, gentle expressions`,
    narration: "Às vezes o tesouro é um prato quente e alguém que não vai embora.",
    dialogues: [
      {
        speaker: c.a.name,
        text: "Quando isso acabar… você volta para casa?",
        emotion: "whisper",
      },
      {
        speaker: c.b.name,
        text: "Casa, para mim, tem sido o próximo passo.",
        emotion: "thought",
      },
    ],
  }),
  (c) => ({
    visual: `rising threat as weather, shadow, or a sealed curse-mark in the sky, characters standing together, dramatic clouds, no gore, no monsters eating anyone`,
    narration: "O reino inteiro parece prender o fôlego.",
    dialogues: [
      {
        speaker: c.a.name,
        text: "Se corrermos agora, a gente se perde de nós.",
        emotion: "shout",
      },
    ],
  }),
  (c) => ({
    visual: `confrontation without gore: ${c.a.name} raising a staff or charm of light, ${c.b.name} holding a blade in a defensive stance, glowing barrier, sparks, cinematic, no blood`,
    narration: "",
    dialogues: [
      {
        speaker: c.b.name,
        text: "Eu cubro. Você abre o caminho.",
        emotion: "shout",
      },
      {
        speaker: c.a.name,
        text: "Juntos. Eu não vim até aqui para brilhar sozinha.",
        emotion: "normal",
      },
    ],
  }),
  (c) => ({
    visual: `turning point: a relic awakening with gentle light, the curse mark cracking like ice, characters reaching toward it, awe, tears of relief, no horror`,
    narration: "O que estava perdido não era um objeto. Era uma promessa.",
    dialogues: [
      {
        speaker: c.a.name,
        text: "Eu te escuto. Pode descansar.",
        emotion: "whisper",
      },
    ],
  }),
  (c) => ({
    visual: `aftermath, soft morning light returning to the kingdom, ${c.a.name} and ${c.b.name} standing on a high place, wind, small smiles, hopeful sky`,
    narration: "Nem todo final é um portão se fechando. Alguns são uma estrada que continua.",
    dialogues: [
      {
        speaker: c.b.name,
        text: "O mapa ainda tem verso em branco.",
        emotion: "normal",
      },
      {
        speaker: c.a.name,
        text: "Ótimo. Eu ainda tenho pernas.",
        emotion: "normal",
      },
    ],
  }),
  (c) => ({
    visual: `epilogue close-up of the two leads walking away into a painted horizon, backs to camera, relic now a simple charm on a necklace, peaceful, cinematic`,
    narration: "E se alguém perguntar o nome dessa história, eles vão rir e dizer: a gente ainda está escrevendo.",
    dialogues: [],
  }),
];

const INDEX_FOR_COUNT: Record<number, number[]> = {
  4: [0, 3, 8, 10],
  5: [0, 2, 3, 8, 10],
  6: [0, 1, 3, 6, 8, 10],
  7: [0, 1, 3, 5, 6, 8, 10],
  8: [0, 1, 2, 3, 5, 7, 8, 10],
  9: [0, 1, 2, 3, 5, 6, 8, 10, 11],
  10: [0, 1, 2, 3, 4, 5, 6, 8, 10, 11],
  11: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11],
  12: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

function titleFromPrompt(prompt: string, style: SubStyle): { title: string; titleJP: string } {
  const titles: Record<SubStyle, { title: string; titleJP: string }> = {
    shonen: { title: "O Pacto do Horizonte", titleJP: "地平の契" },
    seinen: { title: "Arquivo das Horas Quietas", titleJP: "静時の記録" },
    shojo: { title: "A Carta que o Vento Trouxe", titleJP: "風の手紙" },
    fantasy: { title: "A Relíquia do Crepúsculo", titleJP: "黄昏の遺物" },
    slice: { title: "Onde o Chá Esfria Devagar", titleJP: "緩茶の午後" },
    adventure: { title: "O Mapa do Verso em Branco", titleJP: "白紙の地図" },
  };
  const snippet = prompt.trim().slice(0, 42);
  if (snippet.length > 24) {
    return titles[style];
  }
  return titles[style];
}

export function buildFallbackStory(prompt: string, style: SubStyle, panelCount: number): StoryDraft {
  const count = Math.min(12, Math.max(4, panelCount));
  const cast = pickCast(prompt, style);
  const { title, titleJP } = titleFromPrompt(prompt, style);
  const indices = INDEX_FOR_COUNT[count] ?? INDEX_FOR_COUNT[8];
  const panels = indices.map((i) => BEATS[i]!(cast, prompt));
  const meta = STYLE_META[style];

  return {
    title,
    titleJP,
    synopsis: `A partir de “${prompt.trim().slice(0, 120)}”, ${cast.a.name} e ${cast.b.name} cruzam um mundo ${meta.blurb.toLowerCase()} em busca do que foi esquecido — e descobrem que o que procuram também os procura.`,
    characters: [cast.a, cast.b],
    coverVisual: `cinematic manga cover of ${cast.a.name} and ${cast.b.name} standing back to back in a dramatic landscape related to "${prompt.slice(0, 70)}", wind in flowing hair, expressive eyes, ${meta.image}, no text`,
    panels,
  };
}
