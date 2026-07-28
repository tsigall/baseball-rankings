import { useState } from 'react'
import { TEAMS, TEAMS_BY_ID } from './teams.ts'
import {
  createSortState,
  choose,
  currentPair,
  isDone,
  result,
  estimateTotal,
  type Choice,
  type SortState,
} from './sort.ts'
import { rankingFromUrl, shareUrl } from './share.ts'
import { copyRankingImage } from './image.ts'

const TOTAL = estimateTotal(TEAMS.length)

/** Fisher-Yates, on a copy. */
function shuffled<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Merge sort compares teams based on where they sit in the starting list, so
// shuffling first makes every matchup different from run to run. The final
// ranking is unaffected — only the order the questions arrive in changes.
function newRun(): SortState {
  return createSortState(shuffled(TEAMS.map((t) => t.id)))
}

export default function App() {
  const [state, setState] = useState<SortState>(newRun)
  // Previous states, newest last. Undo pops one off.
  const [history, setHistory] = useState<SortState[]>([])
  // Someone else's ranking, if they arrived via a shared link.
  const [shared, setShared] = useState<string[] | null>(rankingFromUrl)

  function pick(choice: Choice) {
    setHistory((h) => [...h, state])
    setState(choose(state, choice))
  }

  function undo() {
    const prev = history[history.length - 1]
    if (!prev) return
    setHistory((h) => h.slice(0, -1))
    setState(prev)
  }

  function restart() {
    setHistory([])
    setState(newRun())
    // Drop the ?r= code so a reload doesn't drag the shared ranking back.
    setShared(null)
    window.history.replaceState(null, '', window.location.pathname)
  }

  const pair = currentPair(state)
  const done = isDone(state)
  const pct = done ? 100 : Math.min(99, Math.round((state.comparisons / TOTAL) * 100))

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center px-4 py-8">
      <header className="w-full max-w-2xl mb-8">
        <h1 className="text-2xl font-bold">Rank all 30 MLB teams</h1>
        <p className="text-neutral-400 text-sm mt-1">
          {shared
            ? "You're looking at someone else's ranking."
            : 'Pick your favorite of the two. Keep going until the list is complete.'}
        </p>
      </header>

      {shared ? (
        <Results order={shared} onRestart={restart} shared />
      ) : done ? (
        <Results order={result(state)} comparisons={state.comparisons} onRestart={restart} />
      ) : (
        pair && (
          <main className="w-full max-w-2xl">
            <div className="mb-6">
              <div className="flex justify-between text-sm text-neutral-400 mb-2">
                <span>
                  {state.comparisons} of ~{TOTAL} picks
                </span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-200"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <TeamButton id={pair[0]} onClick={() => pick('left')} />
              <TeamButton id={pair[1]} onClick={() => pick('right')} />
            </div>

            <div className="mt-6 flex items-center gap-6">
              <button
                onClick={undo}
                disabled={history.length === 0}
                className="text-sm text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:hover:text-neutral-400 cursor-pointer disabled:cursor-default"
              >
                ← Undo last pick
              </button>
              <ConfirmButton
                label="Start over"
                confirmLabel="Discard your picks?"
                onConfirm={restart}
              />
            </div>
          </main>
        )
      )}
    </div>
  )
}

function TeamButton({ id, onClick }: { id: string; onClick: () => void }) {
  const team = TEAMS_BY_ID.get(id)
  if (!team) return null
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: team.color }}
      className="rounded-xl p-8 text-left text-white shadow-lg ring-1 ring-white/10 transition hover:scale-[1.02] hover:ring-white/40 active:scale-100 cursor-pointer"
    >
      <div className="text-sm/5 opacity-80">{team.city}</div>
      <div className="text-2xl font-bold">{team.name}</div>
    </button>
  )
}

function Results({
  order,
  comparisons,
  onRestart,
  shared = false,
}: {
  order: string[]
  comparisons?: number
  onRestart: () => void
  /** True when viewing a ranking someone else shared, rather than your own. */
  shared?: boolean
}) {
  return (
    <main className="w-full max-w-2xl">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xl font-bold">{shared ? 'Their ranking' : 'Your ranking'}</h2>
        {comparisons !== undefined && (
          <span className="text-sm text-neutral-400">{comparisons} picks</span>
        )}
      </div>
      <ol className="space-y-1">
        {order.map((id, i) => {
          const team = TEAMS_BY_ID.get(id)!
          return (
            <li key={id} className="flex items-center gap-3 bg-neutral-900 rounded-lg px-3 py-2">
              <span className="w-6 text-right text-neutral-500 tabular-nums">{i + 1}</span>
              <span className="w-1.5 h-6 rounded" style={{ backgroundColor: team.color }} />
              <span className="text-neutral-400">{team.city}</span>
              <span className="font-semibold">{team.name}</span>
            </li>
          )
        })}
      </ol>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        {shared ? (
          <button
            onClick={onRestart}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 cursor-pointer"
          >
            Make your own ranking
          </button>
        ) : (
          <>
            <ShareButton order={order} />
            <CopyImageButton order={order} />
            <ConfirmButton
              label="Start over"
              confirmLabel="Discard this ranking?"
              onConfirm={onRestart}
              solid
            />
          </>
        )}
      </div>
    </main>
  )
}

/**
 * Copies a link containing the whole ranking. Falls back to showing the URL
 * for manual copying, since the clipboard API needs permission it may not get.
 */
function ShareButton({ order }: { order: string[] }) {
  const [copied, setCopied] = useState(false)
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null)

  async function share() {
    const url = shareUrl(order)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setFallbackUrl(url)
    }
  }

  if (fallbackUrl) {
    return (
      <input
        readOnly
        value={fallbackUrl}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-200"
      />
    )
  }

  return (
    <button
      onClick={share}
      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 cursor-pointer"
    >
      {copied ? 'Link copied!' : 'Share your ranking'}
    </button>
  )
}

/** Copies the ranking as a picture, for pasting somewhere that isn't a link. */
function CopyImageButton({ order }: { order: string[] }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'downloaded' | 'failed'>('idle')

  async function run() {
    try {
      setStatus(await copyRankingImage(order))
    } catch {
      setStatus('failed')
    }
    setTimeout(() => setStatus('idle'), 2500)
  }

  const label = {
    idle: 'Copy as image',
    copied: 'Image copied!',
    downloaded: 'Image downloaded',
    failed: "Couldn't make image",
  }[status]

  return (
    <button
      onClick={run}
      className="rounded-lg bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700 cursor-pointer"
    >
      {label}
    </button>
  )
}

/**
 * Two-step button: the first click swaps in an inline confirmation rather than
 * opening a browser dialog. Cancel returns it to normal.
 */
function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  solid = false,
}: {
  label: string
  confirmLabel: string
  onConfirm: () => void
  solid?: boolean
}) {
  const [asking, setAsking] = useState(false)

  if (asking) {
    return (
      <span className="flex items-center gap-3 text-sm">
        <span className="text-neutral-300">{confirmLabel}</span>
        <button
          onClick={() => {
            setAsking(false)
            onConfirm()
          }}
          className="rounded-lg bg-red-600 px-3 py-1 font-medium text-white hover:bg-red-500 cursor-pointer"
        >
          Yes, start over
        </button>
        <button
          onClick={() => setAsking(false)}
          className="text-neutral-400 hover:text-neutral-100 cursor-pointer"
        >
          Cancel
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setAsking(true)}
      className={
        solid
          ? 'rounded-lg bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700 cursor-pointer'
          : 'text-sm text-neutral-400 hover:text-neutral-100 cursor-pointer'
      }
    >
      {label}
    </button>
  )
}
