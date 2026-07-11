# StickyBar

Input bar extension for [pi](https://github.com/badlogic/pi-mono) coding agent.

This project is a rework of [pi-powerline-footer](https://github.com/nicobailon/pi-powerline-footer) with simplified approach to customization and limited feature list.

## Preview



## Features

- **Two configurable status rows** with live model, thinking level, Git state, context usage, token usage, cost, elapsed time, clock, session, hostname, cache, and extension-status segments.
- **Predictable narrow-terminal behavior:** overflowing top-row items move to the beginning of the bottom row; remaining overflow is hidden from the end.
- **Custom extension-status items** with labels and visibility controls.
- **Fixed editor and chat viewport** with mouse-wheel scrolling, text selection, drag/double-click selection, and terminal context-menu support.
- **Keyboard navigation** for the fixed chat viewport: `Home`, `End`, `PageUp`, and `PageDown`.
- **Last-prompt preview** beneath the editor.
- **Themed working vibes:** generated on demand or loaded from a local file, with optional rainbow animation.

### Status layout

Configure the order and contents of both status rows. The layout adapts when the terminal is narrow without reordering the items that remain visible.

> **Screenshot placeholder:** `docs/screenshots/status-layout.png`
>
> _Wide and narrow terminal views showing both status rows and overflow behavior._

### Fixed editor and chat navigation

Keep the editor fixed while the chat viewport scrolls. Use the mouse wheel or `Home`, `End`, `PageUp`, and `PageDown` to navigate; standard mouse selection and terminal context-menu actions remain available.

> **Screenshot placeholder:** `docs/screenshots/fixed-editor.png`
>
> _Scrolled chat viewport with the editor and status rows held in place._

### Last prompt

Optionally display the most recently submitted prompt beneath the editor for quick context while working.

> **Screenshot placeholder:** `docs/screenshots/last-prompt.png`
>
> _Last-prompt preview below the fixed editor._

### Extension statuses

Show all extension statuses in one segment or promote individual values to named custom items.

> **Screenshot placeholder:** `docs/screenshots/extension-statuses.png`
>
> _Built-in extension-status segment alongside a custom status item._

### Working vibes

Replace Pi's working message with short messages in any theme. Messages can be generated while Pi works or read locally from a previously generated vibe file. Rainbow animation is optional.

> **Screenshot placeholder:** `docs/screenshots/working-vibes.png`
>
> _Themed working message, including a rainbow-animation example._

## Installation

```bash
pi install npm:stickybar
```

Restart pi after installation.

## Configuration

The extension has opiniated defaults, but it also configurable via `settings.json`

Put settings under a single `stickybar` object. Pi reads global settings first, then project settings, so `.pi/settings.json` overrides `~/.pi/agent/settings.json`.

Full configuration example:

```json
{
  "stickybar": {
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
      "theme": "evil corporation",
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

`top` and `bottom` are ordered arrays. An item can appear only once, and unknown IDs are ignored.

```text
model · thinking · path · git · context_pct · context_total
 token_in · token_out · token_total · cost · time_spent · time
 session · hostname · cache_read · cache_write · extension_statuses
```

| Item | Description | Example |
| --- | --- | --- |
| `model` | Current model in use | `gpt-5.4-mini` |
| `thinking` | Reasoning/thinking level | `medium` |
| `path` | Current file path (see options) | `src/index.ts` |
| `git` | Git branch + working-tree state | `main ⇡3 ✗2 ?1` |
| `context_pct` | Context window usage percentage | `45%` |
| `context_total` | Total context tokens used | `12,450 tok` |
| `token_in` | Input tokens for current turn | `3,200` |
| `token_out` | Output tokens for current turn | `840` |
| `token_total` | Total tokens (in + out) | `4,040` |
| `cost` | Estimated cost of current session | `$0.012` |
| `time_spent` | Elapsed time for current turn | `3s` |
| `time` | Current clock time | `14:35` |
| `session` | Session identifier or name | `sess-abc123` |
| `hostname` | Machine hostname | `my-laptop` |
| `cache_read` | Cache read hits | `128` |
| `cache_write` | Cache write hits | `35` |
| `extension_statuses` | All published extension statuses | `ci: passing · deploy: ready` |

### Path options

Configure how file paths are displayed via `options.path`:

| Option | Values | Description |
| --- | --- | --- |
| `mode` | `basename`, `abbreviated`, `full` | How the path is rendered. `basename` shows only the filename (`index.ts`). `abbreviated` keeps the full path but truncates from the start with `…` when it exceeds `maxLength`. `full` always shows the complete absolute path. |
| `maxLength` | number (default: 32) | Maximum length for `abbreviated` mode. Longer paths are truncated from the beginning and prefixed with `…`. |

### Git polling options

Configure git status detail via `options.git`:

| Option | Values | Description |
| --- | --- | --- |
| `polling` | `full`, `branch`, `off` | How much git info to gather. `full` polls for branch name plus staged, unstaged, and untracked counts. `branch` shows only the current branch name without scanning working-tree changes. `off` skips local polling entirely and relies on whatever branch info pi provides. |
| `showBranch` | boolean (default: true) | Include the branch name in the segment. |
| `showStaged` | boolean (default: true) | Show the count of staged changes (`⇡`). |
| `showUnstaged` | boolean (default: true) | Show the count of unstaged changes (`✗`). |
| `showUntracked` | boolean (default: true) | Show the count of untracked files (`?`). |

### Custom status items

Use `custom:<id>` in a row and declare the matching item in `customItems`:

```json
{
  "stickybar": {
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

Extensions publish a value with:

```ts
ctx.ui.setStatus("ci-status", "passing");
```

### Fixed editor

The fixed editor is enabled by default. Set `fixedEditor` to `false` to use the normal editor layout. `mouseScroll` and `showLastPrompt` can be toggled independently.

| Input | Action |
| --- | --- |
| `Home` | Scroll chat to the top |
| `End` | Scroll chat to the bottom |
| `PageUp` / `PageDown` | Scroll chat by one page |
| Mouse wheel | Scroll chat when `mouseScroll` is enabled |

### Working vibes

Manage vibes from pi with `/stickybar vibe`:

```text
/stickybar                    Show current status
/stickybar vibe               Show vibe status
/stickybar vibe pirate        Enable a theme
/stickybar vibe off           Disable vibes
/stickybar vibe rainbow on    Enable rainbow animation
/stickybar vibe mode file     Use ~/.pi/agent/vibes/<theme>.txt
/stickybar vibe model provider/model
/stickybar vibe generate evil cat corporation 100
```

`generate` mode requests a short message from the configured model while Pi is working. `file` mode rotates through messages in `~/.pi/agent/vibes/<theme>.txt` and does not make a model request.
