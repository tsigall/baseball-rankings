// Checks that ranking codes survive a round trip and that malformed ones are
// rejected instead of producing a half-broken list.
// Run with: node --experimental-strip-types src/share.test.ts

import { encodeRanking, decodeRanking, codeLength } from './share.ts'
import { SPORTS } from './teams.ts'

let failures = 0
function check(label: string, ok: boolean) {
  console.log(ok ? `  ok   ${label}` : `  FAIL ${label}`)
  if (!ok) failures++
}

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

for (const sport of SPORTS) {
  const ids = sport.teams.map((t) => t.id)
  const len = ids.length

  console.log(`\n=== ${sport.label} ===`)

  console.log('round trip:')
  let allRoundTrip = true
  let allRightLength = true
  for (let seed = 1; seed <= 500; seed++) {
    const order = shuffle(ids, seed)
    const code = encodeRanking(sport.id, order)
    if (code.length !== len) allRightLength = false
    if (decodeRanking(sport.id, code)?.join(',') !== order.join(',')) allRoundTrip = false
  }
  check('500 random rankings survive encode -> decode', allRoundTrip)
  check(`every code is exactly ${len} characters`, allRightLength)
  check('codeLength() agrees with the team count', codeLength(sport.id) === len)

  console.log('\nmalformed codes are rejected:')
  const valid = encodeRanking(sport.id, ids)
  check('empty string', decodeRanking(sport.id, '') === null)
  check('truncated code', decodeRanking(sport.id, valid.slice(0, len - 10)) === null)
  check('code with extra characters', decodeRanking(sport.id, valid + 'a') === null)
  check('character outside the alphabet', decodeRanking(sport.id, '!' + valid.slice(1)) === null)
  check('uppercase (alphabet is lowercase)', decodeRanking(sport.id, valid.toUpperCase()) === null)
  check('a team listed twice', decodeRanking(sport.id, valid[0] + valid.slice(0, len - 1)) === null)

  console.log('\ncode assignment is stable:')
  // Codes come from ids sorted alphabetically, so shuffling teams.ts must not
  // change what an existing shared link decodes to.
  check(
    'first team by sorted id gets the first code character',
    encodeRanking(sport.id, [[...ids].sort()[0]])[0] === '0',
  )
}

console.log('\n=== codes are scoped to their sport ===')
{
  // The leagues have different sizes today, so a code from one is the wrong
  // length for the other. This is what stops an MLB link from being read as a
  // nonsense NFL ranking.
  const mlb = SPORTS.find((s) => s.id === 'mlb')!
  const nfl = SPORTS.find((s) => s.id === 'nfl')!
  const mlbCode = encodeRanking('mlb', mlb.teams.map((t) => t.id))
  const nflCode = encodeRanking('nfl', nfl.teams.map((t) => t.id))
  check('an MLB code does not decode as NFL', decodeRanking('nfl', mlbCode) === null)
  check('an NFL code does not decode as MLB', decodeRanking('mlb', nflCode) === null)
}

console.log('\n=== links shared before NFL existed still work ===')
{
  // A real code from the community table, made when MLB was the only sport and
  // the alphabet was exactly 30 characters long. Extending the alphabet must
  // not shift any of the first 30 characters, or every link and every stored
  // row would silently decode to a different ranking.
  const legacy = 'n61e9kl8mf0cga37hqi24p5todrjsb'
  const order = decodeRanking('mlb', legacy)
  check('a pre-NFL MLB code still decodes', order !== null)
  check('it re-encodes to exactly the same code', order !== null && encodeRanking('mlb', order) === legacy)
  check('it puts the Mariners first', order?.[0] === 'sea')
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
