// @flow
export const drawAcrossLine = (context: Object, to: Object, from: Object, shapeDrawer: Function) => {
  let x0 = to.x
  let y0 = to.y
  const x1 = from.x
  const y1 = from.y
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = (x0 < x1) ? 1 : -1
  const sy = (y0 < y1) ? 1 : -1
  let err = dx - dy

  while (true) {
    shapeDrawer.call(this, context, x0, y0)

    if ((x0 === x1) && (y0 === y1)) { break }

    let e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x0 += sx
    }
    if (e2 < dx) {
      err += dx
      y0 += sy
    }
  }
}
