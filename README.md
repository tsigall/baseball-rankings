# baseball-rankings

A small website for ranking every team in a league from most to least favorite.
Currently MLB (30 teams) and NFL (32 teams). Meant to be usable by anyone, not
just one person.

You're shown two teams and pick your favorite. Repeat until a complete ranking
exists — about 112 picks for MLB, 122 for NFL.

> The repo is still named `baseball-rankings` even though it covers two sports.
> That name is where the live URL and the `base` path in `vite.config.ts` come
> from, so renaming it would break every link anyone has already shared.

## Running it

```
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
```

## Sports

`src/teams.ts` holds both leagues and the `SPORTS` registry that ties a label
to a team list. Everything downstream — the quiz, share links, the community
page — is scoped to one sport at a time, and a switcher at the top of the page
picks which.

Team ids only have to be unique *within* a league. Several are reused across
them (`mia`, `bal`, `kc`, `sea`…), so teams are always looked up through a
sport, never through a global map.

Both quizzes stay mounted at once, so switching leagues part-way through one
doesn't throw away your picks.

Adding a third sport is a team list, a `SPORTS` entry, and one line in the
database constraint (see [COMMUNITY.md](COMMUNITY.md)).

## How the ranking works

`src/sort.ts` is a merge sort where the comparison function is you. Because it
has to pause for a click, the sort is stored as plain data rather than run as a
recursive function — `choose(state, answer)` returns the next state. That makes
undo trivial and the whole thing easy to test.

Merge sort never asks a redundant question, so the pick count is close to the
theoretical minimum (107 for 30 items, 116 for 32).

Test it with:

```
node --experimental-strip-types src/sort.test.ts
```

It plays the part of a user with a fixed secret ranking, answers every
comparison consistently, and checks the sort reproduces that ranking exactly —
for both leagues.

## Sharing

`src/share.ts` packs the finished ranking into the URL — one character per
team, so a full ranking is 30 or 32 characters and needs no server or database.
The sport rides along as `&s=`. Malformed codes (truncated by a chat app,
hand-edited) are rejected and fall back to a fresh quiz.

Codes are assigned by sorted team id rather than by position in `teams.ts`, so
rearranging that file won't break links people have already shared. Adding or
removing a team still would.

Links shared before NFL existed carry no `&s=`, which is read as MLB, and the
first 30 characters of the code alphabet are deliberately unchanged, so those
codes still decode to exactly the ranking they always did. There's a test
pinning a real one.

`src/image.ts` draws the ranking to a canvas and copies it as a PNG, for
pasting somewhere a link won't do. Browsers that refuse clipboard image writes
get a download instead.

## Community rankings

Live. Finishing a quiz submits the ranking anonymously (just the short code and
which sport — no name, no account), and the Community tab averages each team's
position across every submission for the league you're looking at.
`src/aggregate.ts` holds that math. MLB and NFL are tallied separately.

Backed by Supabase; see [COMMUNITY.md](COMMUNITY.md) for the schema, the
security rules, **the one-time migration that must run before deploying NFL
support**, and how to remove a bad submission. Clearing the keys in `src/config.ts` turns the whole thing off
again — no Community tab, nothing sent anywhere.

## Editing teams

`src/teams.ts` — names, cities, colors. Nothing else depends on the contents.

## Status

Live at https://tsigall.github.io/baseball-rankings/ — quiz, progress bar, undo,
start-over with confirmation, results list, shareable links, copy-as-image, and
community rankings, for MLB and NFL. Not yet built: team logos, visual polish.
