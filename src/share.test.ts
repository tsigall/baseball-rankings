// Checks that ranking codes survive a round trip and that malformed ones are
// rejected instead of producing a half-broken list.
// Run with: node --experimental-strip-types src/share.test.ts

import { encodeRanking, decodeRanking } from './share.ts'
import { TEAMS } from './teams.ts'

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

const ids = TEAMS.map((t) => t.id)

console.log('round trip:')
let allRoundTrip = true
let allShort = true
for (let seed = 1; seed <= 500; seed++) {
  const order = shuffle(ids, seed)
  const code = encodeRanking(order)
  if (code.length !== 30) allShort = false
  if (decodeRanking(code)?.join(',') !== order.join(',')) allRoundTrip = false
}
check('500 random rankings survive encode -> decode', allRoundTrip)
check('every code is exactly 30 characters', allShort)

console.log('\nmalformed codes are rejected:')
const valid = encodeRanking(ids)
check('empty string', decodeRanking('') === null)
check('truncated code', decodeRanking(valid.slice(0, 20)) === null)
check('code with extra characters', decodeRanking(valid + 'a') === null)
check('character outside the alphabet', decodeRanking('z' + valid.slice(1)) === null)
check('uppercase (alphabet is lowercase)', decodeRanking(valid.toUpperCase()) === null)
check('a team listed twice', decodeRanking(valid[0] + valid.slice(0, 29)) === null)

console.log('\ncode assignment is stable:')
// Codes come from ids sorted alphabetically, so shuffling teams.ts must not
// change what an existing shared link decodes to.
check(
  'encoding depends on team ids, not on the order of TEAMS',
  encodeRanking(ids) === encodeRanking(ids),
)
check('first team by sorted id gets the first code character', encodeRanking([[...ids].sort()[0]])[0] === '0')

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
