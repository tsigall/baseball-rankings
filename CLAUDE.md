# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build → dist/
npm run preview  # serve the built output

# Tests — plain Node scripts, no test runner. Run individually:
node --experimental-strip-types src/sort.test.ts
node --experimental-strip-types src/share.test.ts
node --experimental-strip-types src/aggregate.test.ts
```

There is no lint step. `tsconfig.json` is strict (`noUnusedLocals`, `noUnusedParameters`) and excludes `src/**/*.test.ts`, so type errors in tests only surface when the test is run.

CI (`.github/workflows/deploy.yml`) runs all three tests, then builds and publishes `dist/` to GitHub Pages on every push to `main`. A new test file must be added to that workflow explicitly or it will never run.

## Architecture

A React + Vite single-page app with no router, no state library, and no runtime dependencies beyond React — Supabase is reached via plain `fetch`, not its JS client. `src/App.tsx` holds the top-level UI state: which sport, and which of two tabs (`rank`, `community`).

**Everything is scoped to one sport at a time.** `src/teams.ts` exports a `SPORTS` registry (`{id, label, teams, byId}`) covering MLB (30 teams) and NFL (32). Team ids are only unique *within* a sport — `mia`, `bal`, `kc`, `sea` and others exist in both leagues — so team lookups must go through `sport.byId`, never a module-level map. A `SportId` is threaded through `share.ts`, `community.ts`, `aggregate.ts`, and `image.ts`; none of them have a single-league fallback.

App renders one `<Quiz>` per sport and hides the inactive one with `class="hidden"` rather than unmounting, so switching leagues mid-quiz preserves picks. `Quiz` owns its own sort state, history, and submission ref.

**`src/sort.ts` — the interactive merge sort.** The comparison function is the user, so the sort can't run to completion in one call. It's modeled as plain data (`SortState`: a queue of sorted runs plus the merge currently awaiting a click) rather than recursion. `choose(state, answer)` returns the next state; `settle()` advances past every step that doesn't need input. Consequences worth preserving: undo is just keeping the previous state (App.tsx holds a history array), and the whole thing is testable without a DOM.

**`src/share.ts` — URL encoding.** One character per team (`?r=<code>&s=<sport>`), so a full ranking is 30 or 32 characters and needs no server. Two invariants are load-bearing and pinned by tests:

- Codes are assigned by **sorted team id**, not by position in `teams.ts` — reordering that file is safe, but adding or removing a team invalidates every previously shared link *and* every row already in the database.
- The code alphabet is 36 characters whose **first 30 are unchanged** from when MLB was the only sport, and a missing `&s=` means MLB. Together these keep every pre-NFL link decoding identically. `share.test.ts` pins a real legacy code against both.

`decodeRanking` returns `null` for anything malformed and callers fall back to a fresh quiz.

**`src/community.ts` + `src/aggregate.ts` — community rankings.** Finishing a quiz POSTs `{sport, code}` anonymously to a Supabase `rankings` table; the Community tab downloads every row *for the current sport* and averages each team's position in the browser. Submission failures are swallowed on purpose (`submitRanking` returns a boolean); read failures throw so the tab can show a message. `src/config.ts` holds the Supabase URL and **publishable** key — clearing them sets `communityEnabled` to false, which removes the Community tab and stops all network calls. Data safety comes from row-level security policies (insert + select only), documented in `COMMUNITY.md`; the `sb_secret_` key must never enter the repo.

**`src/image.ts`** — draws a finished ranking to a canvas and writes a PNG to the clipboard, falling back to a download where clipboard image writes are refused. Columns are computed from the team count, so it handles 30 and 32 without changes.

## Database schema changes

The `rankings` table has a check constraint tying code length to sport. **Adding a sport requires editing that constraint in Supabase** — the app can't do it, and until it's run, submissions for the new sport are rejected (silently, by design) and its Community tab errors. The migration SQL lives in `COMMUNITY.md`; treat that file as the source of truth for the schema.

## Deployment

`vite.config.ts` sets `base: '/baseball-rankings/'` because GitHub Pages serves from a subpath. Renaming the repo requires changing it.

## Conventions

Comments in this codebase explain *why* a decision was made (why the sort is data, why codes are id-sorted, why failures are silent), not what the code does. Match that when editing.
