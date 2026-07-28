import { useEffect, useState } from 'react'
import { TEAMS_BY_ID } from './teams.ts'
import { fetchRankings } from './community.ts'
import { aggregate, type CommunityRow } from './aggregate.ts'

type Load =
  | { status: 'loading' }
  | { status: 'ready'; rows: CommunityRow[]; submissions: number }
  | { status: 'error'; message: string }

export default function Community() {
  const [load, setLoad] = useState<Load>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    fetchRankings()
      .then((rankings) => {
        if (cancelled) return
        setLoad({ status: 'ready', rows: aggregate(rankings), submissions: rankings.length })
      })
      .catch((err) => {
        if (!cancelled) setLoad({ status: 'error', message: String(err.message ?? err) })
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (load.status === 'loading') {
    return <p className="text-neutral-400 text-sm">Loading community rankings…</p>
  }

  if (load.status === 'error') {
    return <p className="text-neutral-400 text-sm">Couldn't load community rankings right now.</p>
  }

  if (load.submissions === 0) {
    return (
      <p className="text-neutral-400 text-sm">
        No rankings submitted yet. Finish one and it'll show up here.
      </p>
    )
  }

  return (
    <>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xl font-bold">Community ranking</h2>
        <span className="text-sm text-neutral-400">
          {load.submissions} {load.submissions === 1 ? 'submission' : 'submissions'}
        </span>
      </div>

      <ol className="space-y-1">
        {load.rows.map((row, i) => {
          const team = TEAMS_BY_ID.get(row.id)!
          return (
            <li
              key={row.id}
              className="flex items-center gap-3 bg-neutral-900 rounded-lg px-3 py-2"
            >
              <span className="w-6 text-right text-neutral-500 tabular-nums">{i + 1}</span>
              <span className="w-1.5 h-6 rounded" style={{ backgroundColor: team.color }} />
              <span className="text-neutral-400">{team.city}</span>
              <span className="font-semibold">{team.name}</span>
              <span className="ml-auto text-sm text-neutral-500 tabular-nums">
                avg {row.average.toFixed(1)}
              </span>
            </li>
          )
        })}
      </ol>

      <p className="mt-4 text-xs text-neutral-500">
        Ranked by average position across every submission. Lower is better.
      </p>
    </>
  )
}
