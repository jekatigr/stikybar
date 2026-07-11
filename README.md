# pi-powerline-footer

A configurable two-line status bar for [pi](https://github.com/badlogic/pi-mono), with a fixed editor and themed working messages.

## Features

- Configurable top and bottom status rows.
- Deterministic overflow: items that do not fit on the top row move to the front of the bottom row; items that do not fit there are hidden from the end.
- Fixed editor with a scrollable chat viewport, mouse-wheel scrolling, text selection, and terminal context-menu support.
- `Home` jumps the fixed chat viewport to the top; `End` returns it to the bottom. PageUp/PageDown scroll by a page.
- Optional AI-generated or file-backed themed working messages, including rainbow animation.
- Live model, thinking, Git, context, token, cost, and elapsed-time status.

It does **not** provide bash mode, editor stash/history/clipboard tools, a welcome screen, presets, per-user themes, or Nerd Font detection.

## Installation

```bash
pi install npm:pi-powerline-footer
```

Restart pi to activate.

## Configuration

All extension settings live under one `powerline` object. Pi loads global settings first and project-local settings second, so `.pi/settings.json` overrides `~/.pi/agent/settings.json`.

```json
{
  "powerline": {
    "fixedEditor": true,
    "mouseScroll": true,
    "showLastPrompt": true,

    "top": [
      "git",
      "context_pct",
      "token_in",
      "token_out",
      "cost",
      "time_spent"
    ],

    "bottom": [
      "model",
      "thinking",
      "path",
      "extension_statuses"
    ],

    "options": {
      "path": { "mode": "basename", "maxLength": 32 },
      "git": {
        "polling": "full",
        "showBranch": true,
        "showStaged": true,
        "showUnstaged": true,
        "showUntracked": true
      },
      "time": { "format": "24h", "showSeconds": false }
    },

    "vibe": {
      "theme": "star trek",
      "mode": "generate",
      "model": "openai-codex/gpt-5.4-mini",
      "rainbow": true,
      "fallback": "Working",
      "refreshInterval": 30,
      "prompt": "Generate a {theme} loading message for: {task}. {exclude}",
      "maxLength": 65
    }
  }
}
```

### Status items

`top` and `bottom` are ordered arrays. Each visible item appears at most once. Unknown item IDs are ignored.

Available built-in items:

```text
model · thinking · path · git · context_pct · context_total
 token_in · token_out · token_total · cost · time_spent · time
 session · hostname · cache_read · cache_write · extension_statuses
```

Use `custom:<id>` for a configured extension status item:

```json
{
  "powerline": {
    "top": ["model", "path", "custom:ci", "git"],
    "bottom": ["context_pct", "extension_statuses"],
    "customItems": [
      {
        "id": "ci",
        "statusKey": "ci-status",
        "prefix": "CI",
        "hideWhenMissing": true,
        "excludeFromExtensionStatuses": true
      }
    ]
  }
}
```

Extensions publish these values through `ctx.ui.setStatus("ci-status", "passing")`.

### Fixed editor

`fixedEditor` and `mouseScroll` are settings-only options. The fixed editor is enabled by default. Mouse selection, drag selection, double-click selection, and the chat viewport are all part of the fixed editor.

- `Home` — scroll chat to the top
- `End` — scroll chat to the bottom
- `PageUp` / `PageDown` — scroll chat by a page
- Mouse wheel — scroll chat when `mouseScroll` is enabled

### Working vibes

Vibes are configured under `powerline.vibe` and managed through `/powerline vibe`:

```text
/powerline                    Show current status
/powerline vibe               Show vibe status
/powerline vibe pirate        Enable a theme
/powerline vibe off           Disable vibes
/powerline vibe rainbow on    Enable rainbow animation
/powerline vibe mode file     Use ~/.pi/agent/vibes/<theme>.txt
/powerline vibe model provider/model
/powerline vibe generate pirate 100
```

`generate` mode makes a short model request while Pi is working. `file` mode selects messages from a generated text file and makes no request.
