// Combines everyone's rankings into one community ranking.
//
// Uses average position: for each team, average where it landed across all
// submissions, then sort by that. It's the standard way to merge ranked lists,
// and it's simple enough to check by hand — which matters when the community
// page shows a result nobody expected.

import { getSport, type SportId } from './teams.ts'

export type CommunityRow = {
  id: string
  /** Average position across all submissions, 1-based. */
  average: number
  /** How many submissions included this team. */
  count: number
}

export function aggregate(sport: SportId, rankings: string[][]): CommunityRow[] {
  const totals = new Map<string, { sum: number; count: number }>()

  for (const ranking of rankings) {
    ranking.forEach((id, i) => {
      const t = totals.get(id) ?? { sum: 0, count: 0 }
      t.sum += i + 1 // 1-based, so the average reads like a rank
      t.count += 1
      totals.set(id, t)
    })
  }

  return getSport(sport)
    .teams.filter((team) => totals.has(team.id))
    .map((team) => {
      const { sum, count } = totals.get(team.id)!
      return { id: team.id, average: sum / count, count }
    })
    .sort((a, b) => a.average - b.average || a.id.localeCompare(b.id)) // id keeps ties stable
}
