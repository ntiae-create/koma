/** Sub-estilos visuais do estúdio — cada um muda tom, paleta e enquadramento. */
export const SUB_STYLES = [
  "shonen",
  "seinen",
  "shojo",
  "fantasy",
  "slice",
  "adventure",
] as const;

export type SubStyle = (typeof SUB_STYLES)[number];

export type BubbleEmotion = "normal" | "shout" | "whisper" | "thought";

export type Character = {
  name: string;
  appearance: string;
  role: string;
};

export type Dialogue = {
  speaker: string;
  text: string;
  emotion: BubbleEmotion;
};

export type PanelDraft = {
  visual: string;
  narration: string;
  dialogues: Dialogue[];
};

export type StoryDraft = {
  title: string;
  titleJP: string;
  synopsis: string;
  characters: Character[];
  coverVisual: string;
  panels: PanelDraft[];
};

export type Panel = PanelDraft & {
  id: string;
  number: number;
  seed: number;
  imageUrl: string;
};

export type Comic = {
  id: string;
  createdAt: number;
  prompt: string;
  style: SubStyle;
  panelCount: number;
  title: string;
  titleJP: string;
  synopsis: string;
  characters: Character[];
  coverVisual: string;
  coverSeed: number;
  coverUrl: string;
  panels: Panel[];
  source: "ai" | "local";
};

export type GenerateInput = {
  prompt: string;
  panelCount: number;
  style: SubStyle;
};
