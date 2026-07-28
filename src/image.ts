// Draws a finished ranking to a canvas so it can be copied as a picture.
//
// Done by hand rather than with a screenshot library — it's only text and
// rectangles, and it keeps the site dependency-free. Laid out in two columns
// of 15 so the result is a reasonable shape to paste into a chat.

import { getSport, type SportId } from './teams.ts'

const SCALE = 2 // draw at 2x so it stays sharp on high-density screens
const W = 900
const PAD = 40
const HEADER = 96
const ROW_H = 44
const ROW_GAP = 4
const COL_W = (W - PAD * 2 - 30) / 2

const BG = '#0a0a0a'
const ROW_BG = '#171717'
const DIM = '#a3a3a3'
const FG = '#fafafa'

export function drawRanking(sportId: SportId, order: string[]): HTMLCanvasElement {
  const sport = getSport(sportId)
  // Split into two even columns, so 30 teams give 15 each and 32 give 16.
  const perCol = Math.ceil(order.length / 2)
  const height = HEADER + perCol * (ROW_H + ROW_GAP) + PAD

  const canvas = document.createElement('canvas')
  canvas.width = W * SCALE
  canvas.height = height * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)

  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, height)

  ctx.fillStyle = FG
  ctx.font = 'bold 30px ui-sans-serif, system-ui, -apple-system, sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(`My ${sport.label} team rankings`, PAD, PAD + 24)

  ctx.fillStyle = DIM
  ctx.font = '16px ui-sans-serif, system-ui, -apple-system, sans-serif'
  ctx.fillText(
    `All ${sport.teams.length} teams, ranked one pick at a time`,
    PAD,
    PAD + 50,
  )

  order.forEach((id, i) => {
    const team = sport.byId.get(id)
    if (!team) return

    const col = Math.floor(i / perCol)
    const row = i % perCol
    const x = PAD + col * (COL_W + 30)
    const y = HEADER + row * (ROW_H + ROW_GAP)

    ctx.fillStyle = ROW_BG
    ctx.beginPath()
    ctx.roundRect(x, y, COL_W, ROW_H, 8)
    ctx.fill()

    ctx.fillStyle = DIM
    ctx.font = '15px ui-sans-serif, system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(String(i + 1), x + 34, y + 28)
    ctx.textAlign = 'left'

    ctx.fillStyle = team.color
    ctx.beginPath()
    ctx.roundRect(x + 46, y + 12, 5, ROW_H - 24, 3)
    ctx.fill()

    let tx = x + 62
    if (team.city) {
      ctx.fillStyle = DIM
      ctx.font = '15px ui-sans-serif, system-ui, -apple-system, sans-serif'
      ctx.fillText(team.city, tx, y + 28)
      tx += ctx.measureText(team.city).width + 8
    }
    ctx.fillStyle = FG
    ctx.font = 'bold 16px ui-sans-serif, system-ui, -apple-system, sans-serif'
    ctx.fillText(team.name, tx, y + 28)
  })

  return canvas
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('could not render image'))), 'image/png'),
  )
}

export type ImageResult = 'copied' | 'downloaded'

/**
 * Copies the ranking to the clipboard as a PNG. Not every browser allows
 * writing images to the clipboard (Firefox notably), so this falls back to
 * downloading the file rather than failing.
 */
export async function copyRankingImage(
  sport: SportId,
  order: string[],
): Promise<ImageResult> {
  const canvas = drawRanking(sport, order)
  const blob = await toBlob(canvas)

  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      return 'copied'
    } catch {
      // fall through to download
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sport}-rankings.png`
  a.click()
  URL.revokeObjectURL(url)
  return 'downloaded'
}
