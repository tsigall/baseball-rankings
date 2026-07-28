// Encodes a finished ranking into a URL so it can be shared without a server.
//
// Each team gets one character, so a full ranking is 30 characters — short
// enough to survive being pasted into a text message.

import { TEAMS } from './teams.ts'

// Exactly 30 characters, one per team.
const ALPHABET = '0123456789abcdefghijklmnopqrst'

// Codes are assigned by sorted team id, NOT by the order teams appear in
// teams.ts. That way rearranging that file doesn't invalidate links people
// have already shared. (Adding or removing a team still would.)
const CODE_ORDER = [...TEAMS].map((t) => t.id).sort()

const CODE_FOR_ID = new Map(CODE_ORDER.map((id, i) => [id, ALPHABET[i]]))
const ID_FOR_CODE = new Map(CODE_ORDER.map((id, i) => [ALPHABET[i], id]))

export function encodeRanking(order: string[]): string {
  return order.map((id) => CODE_FOR_ID.get(id) ?? '').join('')
}

/**
 * Returns the ranking, or null if the code is malformed — truncated by a chat
 * app, hand-edited, or left over from an older version with different teams.
 * Callers should fall back to starting a fresh quiz.
 */
export function decodeRanking(code: string): string[] | null {
  if (code.length !== CODE_ORDER.length) return null

  const order: string[] = []
  const seen = new Set<string>()
  for (const ch of code) {
    const id = ID_FOR_CODE.get(ch)
    if (!id || seen.has(id)) return null // unknown team, or listed twice
    seen.add(id)
    order.push(id)
  }
  return order
}

/** Full URL for a finished ranking, preserving wherever the site is hosted. */
export function shareUrl(order: string[]): string {
  const url = new URL(window.location.href)
  url.search = `?r=${encodeRanking(order)}`
  url.hash = ''
  return url.toString()
}

/** The shared ranking in the current URL, if there's a valid one. */
export function rankingFromUrl(): string[] | null {
  const code = new URLSearchParams(window.location.search).get('r')
  return code ? decodeRanking(code) : null
}
