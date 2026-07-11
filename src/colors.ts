import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import type { SemanticColor, ThemeLike } from "./types.ts";

type Color = ThemeColor | `#${string}`;

// Fixed palette matching the original footer; this is not user-theme configuration.
const COLORS: Record<SemanticColor, Color> = {
  model: "#d787af",
  path: "#00afaf",
  gitDirty: "#e4ff00",
  gitClean: "success",
  thinking: "muted",
  context: "dim",
  contextWarn: "warning",
  contextError: "error",
  cost: "text",
  tokens: "muted",
};

export function color(theme: ThemeLike, name: SemanticColor, text: string): string {
  const value = COLORS[name];
  if (!value.startsWith("#")) return theme.fg(value as ThemeColor, text);
  const hex = value.slice(1);
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
}

export function separator(text: string): string {
  return `\x1b[38;5;244m${text}\x1b[0m`;
}

export function rainbow(text: string, time = Date.now()): string {
  let output = "";
  let index = 0;
  const offset = (time / 20) % 360;
  for (const char of text) {
    if (char === " " || char === ":") {
      output += char;
      continue;
    }
    const hue = (offset - index * 12 + 360) % 360;
    const [r, g, b] = hslToRgb(hue, 0.75, 0.55);
    output += `\x1b[38;2;${r};${g};${b}m${char}`;
    index++;
  }
  return output + "\x1b[0m";
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r, g, b].map((value) => Math.round((value + m) * 255)) as [number, number, number];
}
