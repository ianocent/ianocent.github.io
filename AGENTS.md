# Global Agent Stack — Caveman + RTK + 9Router

**Always active in every project.** Master config lives at `~/.cursor/AGENTS.md`.

| Tool | Repo | Role |
|------|------|------|
| **Caveman** | https://github.com/juliusbrussee/caveman | Terse output — ~65% fewer output tokens |
| **RTK** | https://github.com/rtk-ai/rtk | Compress shell/tool output — ~60–90% fewer input tokens |
| **9Router** | https://github.com/decolua/9router | AI router + RTK saver + Caveman mode — free/cheap model fallback |

---

## 1. Caveman — Always On (default: full)

Respond terse like smart caveman. All technical substance stay. Only fluff die.

**Rules:**
- Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
- Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
- Pattern: `[thing] [action] [reason]. [next step].`
- Switch level: `/caveman lite|full|ultra|wenyan`
- Stop: `stop caveman` or `normal mode`

**Auto-Clarity:** drop caveman for security warnings, irreversible actions, user confused. Resume after.

**Boundaries:** code/commits/PRs written normal.

**Skills:** `~/.cursor/skills/caveman/SKILL.md` (+ caveman-commit, caveman-review, cavecrew when relevant)

---

## 2. RTK — Always Prefix Shell Commands

**Golden rule:** always prefix shell commands with `rtk`. Safe even when no dedicated filter exists.

```bash
# Wrong
git status && npm test

# Correct
rtk git status && rtk npm test
```

**High-value commands:**
- `rtk git status|log|diff|add|commit|push`
- `rtk grep|rg|find|ls|read|diff`
- `rtk jest|vitest|pytest|cargo test`
- `rtk tsc|lint|next build`
- `rtk gh pr view|gh run list`
- `rtk err <cmd>` — errors only
- `rtk gain` — token savings stats

**Hook:** `~/.cursor/hooks.json` runs `rtk hook cursor` on every Shell tool call.

**Per-project:** run `rtk init` in project root to add RTK block to `CLAUDE.md`.

---

## 3. 9Router — AI Router (when using external models)

**Endpoint:** `http://localhost:20128/v1`  
**Dashboard:** `http://localhost:20128`

**Start server:**
```bash
9router          # foreground
9router -t       # system tray (background)
```

**Cursor / CLI settings:**
- Base URL: `http://localhost:20128/v1`
- API Key: copy from dashboard
- Model: e.g. `kr/claude-sonnet-4.5`

**Built-in savers (dashboard toggles):**
- RTK Token Saver — compress tool_result before LLM (~20–40% input tokens)
- Caveman Mode — inject terse prompt (~65% output tokens)

**When to use:** model routing, quota fallback, multi-provider, token compression at proxy layer.

---

## 4. Project Bootstrap

When agent opens/creates project **without** `AGENTS.md` at project root:

1. Copy `~/.cursor/AGENTS.md` → `<project>/AGENTS.md`
2. Run `rtk init` if `CLAUDE.md` lacks RTK block
3. Ensure 9Router running if user routes models through it

Do **not** overwrite existing project `AGENTS.md` — merge only if user asks.

---

## 5. Subagent Delegation (Cavecrew)

For token-heavy exploration/review, prefer cavecrew subagents over vanilla Explore:

| Task | Subagent |
|------|----------|
| Locate code / map directory | `cavecrew-investigator` |
| Surgical edit ≤2 files | `cavecrew-builder` |
| Diff/branch review | `cavecrew-reviewer` |

---

## 6. Priority Order

1. **Safety** — no caveman on destructive/irreversible ops
2. **RTK** — every shell command via `rtk`
3. **Caveman** — every user-facing response (full default)
4. **9Router** — when model/API routing involved
5. **Project AGENTS.md** — project-specific rules override generic sections only
