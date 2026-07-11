import assert from "node:assert/strict";
import test from "node:test";
import { parsePowerlineConfig } from "../src/powerline-config.ts";
import { renderStatusLayout } from "../src/status-layout.ts";
import type { SegmentContext } from "../src/types.ts";

const context: SegmentContext = {
  model: { id: "model" },
  thinkingLevel: "off",
  sessionId: "abcdefgh-1234",
  cwd: "/work/project",
  usageStats: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0 },
  contextPercent: 0,
  contextWindow: 0,
  autoCompactEnabled: true,
  customCompactionEnabled: false,
  usingSubscription: false,
  timerActive: false,
  sessionStartTime: 0,
  git: { branch: null, staged: 0, unstaged: 0, untracked: 0 },
  extensionStatuses: new Map(),
  hiddenExtensionStatusKeys: new Set(),
  customItemsById: new Map(),
  options: {},
  theme: { fg: (_color, text) => text },
};

test("top-row overflow is prepended to the bottom row", () => {
  const config = parsePowerlineConfig({ top: ["session", "model"], bottom: ["path"] });

  const layout = renderStatusLayout(config, context, 18);

  assert.equal(layout.top, "session:abcdefgh");
  assert.match(layout.bottom, /model/);
});
