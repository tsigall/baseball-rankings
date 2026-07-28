// Run with: node --experimental-strip-types src/aggregate.test.ts

import { aggregate } from './aggregate.ts'
import { SPORTS, getSport } from './teams.ts'

let failures = 0
function check(label: string, ok: boolean) {
  console.log(ok ? `  ok   ${label}` : `  FAIL ${label}`)
  if (!ok) failures++
}

const ids = getSport('mlb').teams.map((t) => t.id)

console.log('basics:')
check('no submissions produces an empty ranking', aggregate('mlb', []).length === 0)

const one = aggregate('mlb', [ids])
check(
  'a single submission is returned unchanged',
  one.map((r) => r.id).join(',') === ids.join(','),
)
check('averages are 1-based', one[0].average === 1)
check('count reflects one submission', one.every((r) => r.count === 1))

console.log('\ncombining disagreeing submissions:')
{
  // Two people rank three teams in opposite orders; a third breaks the tie.
  const a = ['nyy', 'bos', 'tb']
  const b = ['tb', 'bos', 'nyy']
  const c = ['nyy', 'bos', 'tb']
  const rows = aggregate('mlb', [a, b, c])
  check('the majority favorite comes first', rows[0].id === 'nyy')
  check('the consistently-middle team stays middle', rows[1].id === 'bos')
  check('averages are computed correctly', rows[0].average === (1 + 3 + 1) / 3)
  check('every team counted once per submission', rows.every((r) => r.count === 3))
}

console.log('\nexact ties:')
{
  // Perfectly opposed submissions: both teams average 1.5.
  const rows = aggregate('mlb', [
    ['nyy', 'bos'],
    ['bos', 'nyy'],
  ])
  check('tied teams both averaged 1.5', rows.every((r) => r.average === 1.5))
  check('ties are broken deterministically', rows.map((r) => r.id).join(',') === 'bos,nyy')
  check(
    'repeated runs give identical output',
    JSON.stringify(
      aggregate('mlb', [
        ['nyy', 'bos'],
        ['bos', 'nyy'],
      ]),
    ) === JSON.stringify(rows),
  )
}

console.log('\npartial submissions:')
{
  // A submission missing teams shouldn't drag absent teams into the result.
  const rows = aggregate('mlb', [['nyy', 'bos'], ['nyy']])
  check('only submitted teams appear', rows.length === 2)
  check('the team in both submissions counts twice', rows.find((r) => r.id === 'nyy')!.count === 2)
  check('the team in one submission counts once', rows.find((r) => r.id === 'bos')!.count === 1)
}

console.log('\nfull-size sanity, per sport:')
for (const sport of SPORTS) {
  const all = sport.teams.map((t) => t.id)
  const reversed = [...all].reverse()
  const rows = aggregate(sport.id, [all, reversed])
  const mid = (all.length + 1) / 2
  check(`all ${all.length} ${sport.label} teams present`, rows.length === all.length)
  check(`opposed full rankings all average ${mid}`, rows.every((r) => r.average === mid))
}

console.log('\nsports do not bleed into each other:')
{
  // 'sea' is a real id in both leagues. Aggregating NFL submissions must never
  // return MLB teams, and vice versa.
  const nflOnly = ['sea', 'gb', 'buf']
  const rows = aggregate('nfl', [nflOnly])
  check('an NFL-only id list stays NFL', rows.length === 3)
  check('a team unique to the NFL appears', rows.some((r) => r.id === 'gb'))
  check(
    'the same list aggregated as MLB drops ids the MLB has never heard of',
    aggregate('mlb', [nflOnly]).map((r) => r.id).join(',') === 'sea',
  )
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
