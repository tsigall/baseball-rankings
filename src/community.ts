// Sends finished rankings to Supabase and reads them back for the community
// page. Uses Supabase's REST API over plain fetch rather than its JavaScript
// client, so the site stays dependency-free.
//
// A ranking is stored as the same 30-character code used for share links, so
// there's one encoding to reason about.

import { SUPABASE_URL, SUPABASE_ANON_KEY, communityEnabled } from './config.ts'
import { encodeRanking, decodeRanking } from './share.ts'

const TABLE = 'rankings'

function headers() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Records a finished ranking. Failures are deliberately swallowed — a visitor
 * who just spent five minutes ranking teams shouldn't see an error because a
 * database was unreachable, and there's nothing for them to do about it.
 * Returns whether it was actually stored.
 */
export async function submitRanking(order: string[]): Promise<boolean> {
  if (!communityEnabled) return false
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: { ...headers(), Prefer: 'return=minimal' },
      body: JSON.stringify({ code: encodeRanking(order) }),
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Every submitted ranking, oldest first. Codes that don't decode are skipped
 * rather than breaking the page — a bad row shouldn't take down the tab.
 */
export async function fetchRankings(): Promise<string[][]> {
  if (!communityEnabled) return []

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${TABLE}?select=code&order=created_at.asc&limit=10000`,
    { headers: headers() },
  )
  if (!res.ok) throw new Error(`could not load community rankings (${res.status})`)

  const rows: { code: string }[] = await res.json()
  return rows.map((r) => decodeRanking(r.code)).filter((r): r is string[] => r !== null)
}
