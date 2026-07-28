// Interactive bottom-up merge sort.
//
// A normal sort calls a comparison function whenever it needs to know the order
// of two items. Here the "comparison function" is the user, so the sort can't
// run straight through — it has to pause and wait for a click.
//
// So instead of a recursive function, the sort is a plain data structure that
// records exactly where it is. `choose()` takes a state plus an answer and
// returns the next state. Because the state is plain data, undo is just keeping
// the previous one, and the whole thing is easy to inspect and test.

export type Choice = 'left' | 'right'

/** One merge in progress: walking two sorted runs, building a combined one. */
export type Merge = {
  left: string[]
  right: string[]
  li: number
  ri: number
  out: string[]
}

export type SortState = {
  /** Sorted runs waiting to be merged. Starts as 30 runs of one team each. */
  queue: string[][]
  /** The merge currently needing user input, or null between merges. */
  current: Merge | null
  comparisons: number
}

/**
 * Advance through every step that doesn't need the user: starting the next
 * merge, and draining the leftovers when one side runs out. Returns as soon as
 * a real comparison is required, or when sorting is finished.
 */
function settle(state: SortState): SortState {
  for (;;) {
    if (state.current === null) {
      // Fewer than two runs left means there is nothing to merge: we're done.
      if (state.queue.length < 2) return state
      const [left, right, ...rest] = state.queue
      state = {
        ...state,
        queue: rest,
        current: { left, right, li: 0, ri: 0, out: [] },
      }
      continue
    }

    const m = state.current
    // When one side is exhausted the rest of the other side is already sorted
    // and already outranks nothing left to compare against — append it as-is.
    if (m.li >= m.left.length || m.ri >= m.right.length) {
      const merged = [...m.out, ...m.left.slice(m.li), ...m.right.slice(m.ri)]
      state = { ...state, queue: [...state.queue, merged], current: null }
      continue
    }

    return state // needs a click
  }
}

export function createSortState(ids: string[]): SortState {
  return settle({ queue: ids.map((id) => [id]), current: null, comparisons: 0 })
}

export function isDone(state: SortState): boolean {
  return state.current === null && state.queue.length <= 1
}

/** The two team ids to show, or null if sorting is finished. */
export function currentPair(state: SortState): [string, string] | null {
  const m = state.current
  if (!m) return null
  return [m.left[m.li], m.right[m.ri]]
}

/** Record the user's pick and advance to the next question. */
export function choose(state: SortState, choice: Choice): SortState {
  const m = state.current
  if (!m) return state

  const next: Merge =
    choice === 'left'
      ? { ...m, li: m.li + 1, out: [...m.out, m.left[m.li]] }
      : { ...m, ri: m.ri + 1, out: [...m.out, m.right[m.ri]] }

  return settle({ ...state, current: next, comparisons: state.comparisons + 1 })
}

/** The finished 1..30 ranking. Empty until isDone() is true. */
export function result(state: SortState): string[] {
  return isDone(state) ? (state.queue[0] ?? []) : []
}

/**
 * Rough upper bound on comparisons, used only to drive the progress bar.
 * Bottom-up merge sort needs at most n*ceil(log2 n) - 2^ceil(log2 n) + 1.
 */
export function estimateTotal(n: number): number {
  if (n < 2) return 0
  const levels = Math.ceil(Math.log2(n))
  return n * levels - 2 ** levels + 1
}
