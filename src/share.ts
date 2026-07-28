// Encodes a finished ranking into a URL so it can be shared without a server.
//
// Each team gets one character, so a full ranking is 30 characters for MLB and
// 32 for NFL — short enough to survive being pasted into a text message.

import { getSport, isSportId, DEFAULT_SPORT, type SportId } from './teams.ts'

// One character per team, big enough for the largest league. The first 30
// characters are unchanged from when MLB was the only sport, so codes shared
// before then still decode to exactly the same ranking.
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

/**
 * Codes are assigned by sorted team id, NOT by the order teams appear in
 * teams.ts. That way rearranging that file doesn't invalidate links people
 * have already shared. (Adding or removing a team still would.)
 */
function buildTable(sport: SportId) {
  const order = getSport(sport)
    .teams.map((t) => t.id)
    .sort()
  return {
    length: order.length,
    codeForId: new Map(order.map((id, i) => [id, ALPHABET[i]])),
    idForCode: new Map(order.map((id, i) => [ALPHABET[i], id])),
  }
}

const TABLES = new Map<SportId, ReturnType<typeof buildTable>>()

function tableFor(sport: SportId) {
  let table = TABLES.get(sport)
  if (!table) TABLES.set(sport, (table = buildTable(sport)))
  return table
}

export function encodeRanking(sport: SportId, order: string[]): string {
  const { codeForId } = tableFor(sport)
  return order.map((id) => codeForId.get(id) ?? '').join('')
}

/**
 * Returns the ranking, or null if the code is malformed — truncated by a chat
 * app, hand-edited, or left over from an older version with different teams.
 * Callers should fall back to starting a fresh quiz.
 */
export function decodeRanking(sport: SportId, code: string): string[] | null {
  const { length, idForCode } = tableFor(sport)
  if (code.length !== length) return null

  const order: string[] = []
  const seen = new Set<string>()
  for (const ch of code) {
    const id = idForCode.get(ch)
    if (!id || seen.has(id)) return null // unknown team, or listed twice
    seen.add(id)
    order.push(id)
  }
  return order
}

/** How many characters a full ranking for this sport takes. */
export function codeLength(sport: SportId): number {
  return tableFor(sport).length
}

export type SharedRanking = { sport: SportId; order: string[] }

/** Full URL for a finished ranking, preserving wherever the site is hosted. */
export function shareUrl(sport: SportId, order: string[]): string {
  const url = new URL(window.location.href)
  url.search = `?r=${encodeRanking(sport, order)}&s=${sport}`
  url.hash = ''
  return url.toString()
}

/**
 * The shared ranking in the current URL, if there's a valid one. Links made
 * before the site had more than one sport carry no `s=`, so a missing one
 * means MLB rather than a broken link.
 */
export function rankingFromUrl(): SharedRanking | null {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('r')
  if (!code) return null

  const sport = params.get('s') ?? DEFAULT_SPORT
  if (!isSportId(sport)) return null

  const order = decodeRanking(sport, code)
  return order ? { sport, order } : null
}
