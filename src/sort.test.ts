// Correctness check for the interactive merge sort.
//
// Stands in for a human: picks a secret ranking, answers every comparison
// consistently with it, then checks the sort reproduces that exact ranking.
// Run with: node --experimental-strip-types src/sort.test.ts

import { createSortState, choose, currentPair, isDone, result, estimateTotal } from './sort.ts'
import { TEAMS } from './teams.ts'

function runSort(truth: string[]): { order: string[]; comparisons: number } {
  const rank = new Map(truth.map((id, i) => [id, i]))
  let state = createSortState(truth.map((id) => id).sort()) // start from arbitrary order

  let guard = 0
  while (!isDone(state)) {
    const pair = currentPair(state)
    if (!pair) throw new Error('not done but no pair to compare')
    const [a, b] = pair
    state = choose(state, rank.get(a)! < rank.get(b)! ? 'left' : 'right')
    if (++guard > 10000) throw new Error('sort did not terminate')
  }
  return { order: result(state), comparisons: state.comparisons }
}

let failures = 0
function check(label: string, ok: boolean, detail = '') {
  if (ok) {
    console.log(`  ok   ${label}`)
  } else {
    console.log(`  FAIL ${label} ${detail}`)
    failures++
  }
}

// A deterministic shuffle so runs are reproducible.
function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr]
  let s = seed
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648
    const j = s % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const ids = TEAMS.map((t) => t.id)

console.log(`teams: ${ids.length}, unique ids: ${new Set(ids).size}`)
check('all team ids are unique', new Set(ids).size === ids.length)

console.log('\n30 teams, 200 random ground-truth rankings:')
let worst = 0
let total = 0
let allExact = true
for (let seed = 1; seed <= 200; seed++) {
  const truth = shuffle(ids, seed)
  const { order, comparisons } = runSort(truth)
  if (order.join(',') !== truth.join(',')) allExact = false
  worst = Math.max(worst, comparisons)
  total += comparisons
}
check('every run reproduced the ground-truth ranking exactly', allExact)
console.log(`  comparisons: avg ${(total / 200).toFixed(1)}, worst ${worst}`)
check(
  `worst case (${worst}) within estimate (${estimateTotal(30)})`,
  worst <= estimateTotal(30),
)

console.log('\nedge cases:')
for (const n of [0, 1, 2, 3, 5, 17]) {
  const truth = ids.slice(0, n)
  const { order } = runSort(truth)
  check(`n=${n} sorts correctly`, order.join(',') === truth.join(','))
}

console.log('\nundo safety (states must be immutable):')
{
  const truth = shuffle(ids, 42)
  const rank = new Map(truth.map((id, i) => [id, i]))
  const start = createSortState([...ids])
  const snapshot = JSON.stringify(start)
  const pair = currentPair(start)!
  choose(start, rank.get(pair[0])! < rank.get(pair[1])! ? 'left' : 'right')
  check('choose() does not mutate the state passed in', JSON.stringify(start) === snapshot)
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
