import assert from "node:assert/strict";
import test from "node:test";
import { parsePowerlineConfig } from "../src/powerline-config.ts";

test("powerline defaults to the single built-in layout", () => {
  const config = parsePowerlineConfig(undefined);
  assert.deepEqual(config.top, ["git", "context_pct", "token_in", "token_out", "cost", "time_spent"]);
  assert.deepEqual(config.bottom, ["model", "thinking", "path", "extension_statuses"]);
  assert.equal(config.fixedEditor, true);
  assert.equal(config.mouseScroll, true);
  assert.equal(config.vibe.theme, null);
});

test("custom items are placed directly in the configured line order", () => {
  const config = parsePowerlineConfig({
    top: ["model", "custom:ci", "git", "custom:missing"],
    bottom: ["git", "context_pct", "custom:ci"],
    customItems: [{ id: "ci", statusKey: "ci-status" }],
  });
  assert.deepEqual(config.top, ["model", "custom:ci", "git"]);
  assert.deepEqual(config.bottom, ["context_pct"]);
});

test("vibe settings are nested under powerline and validated", () => {
  const config = parsePowerlineConfig({
    vibe: { theme: "pirate", mode: "file", rainbow: true, model: "openai/gpt-test", refreshInterval: 5 },
  });
  assert.equal(config.vibe.theme, "pirate");
  assert.equal(config.vibe.mode, "file");
  assert.equal(config.vibe.rainbow, true);
  assert.equal(config.vibe.model, "openai/gpt-test");
  assert.equal(config.vibe.refreshInterval, 5);
});
