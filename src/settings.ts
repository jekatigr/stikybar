import { CONFIG_DIR_NAME, getAgentDir } from "@earendil-works/pi-coding-agent";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { PowerlineConfig } from "./types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function globalSettingsPath(): string {
  return join(getAgentDir(), "settings.json");
}

function projectSettingsPath(cwd: string): string {
  return join(cwd, CONFIG_DIR_NAME, "settings.json");
}

function readSettingsFile(path: string): Record<string, unknown> {
  try {
    const parsed = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
    return isRecord(parsed) ? parsed : {};
  } catch (error) {
    console.debug(`[powerline-footer] Failed to read ${path}:`, error);
    return {};
  }
}

function mergeSettings(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const merged = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = isRecord(merged[key]) && isRecord(value)
      ? mergeSettings(merged[key] as Record<string, unknown>, value)
      : value;
  }
  return merged;
}

/** Loads Pi's normal global settings followed by project-local overrides. */
export function readPowerlineSettings(cwd: string): Record<string, unknown> {
  return mergeSettings(readSettingsFile(globalSettingsPath()), readSettingsFile(projectSettingsPath(cwd)));
}

/** Persists to the layer that already owns the `powerline` configuration. */
export function writePowerlineConfig(cwd: string, config: PowerlineConfig): boolean {
  const projectPath = projectSettingsPath(cwd);
  const project = readSettingsFile(projectPath);
  const globalPath = globalSettingsPath();
  const global = readSettingsFile(globalPath);
  const targetPath = Object.hasOwn(project, "powerline") ? projectPath : globalPath;
  const target = targetPath === projectPath ? project : global;
  target.powerline = config;

  try {
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, JSON.stringify(target, null, 2) + "\n");
    return true;
  } catch (error) {
    console.debug(`[powerline-footer] Failed to write ${targetPath}:`, error);
    return false;
  }
}
