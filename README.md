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

## Editing teams

`src/teams.ts` — names, cities, colors. Nothing else depends on the contents.

## Status

Working end to end: quiz, progress bar, undo, start-over with confirmation,
results list. Not yet built: team logos, visual polish, shareable result links.
