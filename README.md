# baseball-rankings

A small website for ranking all 30 MLB teams from most to least favorite.
Meant to be usable by anyone, not just one person.

You're shown two teams and pick your favorite. Repeat until a complete 1–30
ranking exists. Takes ~112 picks on average.

## Running it

```
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
```

## How the ranking works

`src/sort.ts` is a merge sort where the comparison function is you. Because it
has to pause for a click, the sort is stored as plain data rather than run as a
recursive function — `choose(state, answer)` returns the next state. That makes
undo trivial and the whole thing easy to test.

Merge sort never asks a redundant question, so the pick count is close to the
theoretical minimum (107 for 30 items).

Test it with:

```
node --experimental-strip-types src/sort.test.ts
```

It plays the part of a user with a fixed secret ranking, answers every
comparison consistently, and checks the sort reproduces that ranking exactly.

## Sharing

`src/share.ts` packs the finished ranking into the URL — one character per
team, so a full ranking is 30 characters and needs no server or database.
Malformed codes (truncated by a chat app, hand-edited) are rejected and fall
back to a fresh quiz.

Codes are assigned by sorted team id rather than by position in `teams.ts`, so
rearranging that file won't break links people have already shared. Adding or
removing a team still would.

`src/image.ts` draws the ranking to a canvas and copies it as a PNG, for
pasting somewhere a link won't do. Browsers that refuse clipboard image writes
get a download instead.

## Community rankings

Live. Finishing a quiz submits the ranking anonymously (just the 30-character
code, no name or account), and the Community tab averages each team's position
across every submission. `src/aggregate.ts` holds that math.

Backed by Supabase; see [COMMUNITY.md](COMMUNITY.md) for the schema, the
security rules, and how to remove a bad submission. Clearing the keys in
`src/config.ts` turns the whole thing off again — no Community tab, nothing
sent anywhere.

## Editing teams

`src/teams.ts` — names, cities, colors. Nothing else depends on the contents.

## Status

Live at https://tsigall.github.io/baseball-rankings/ — quiz, progress bar, undo,
start-over with confirmation, results list, shareable links, copy-as-image, and
community rankings. Not yet built: team logos, visual polish.
