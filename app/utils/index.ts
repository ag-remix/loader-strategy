export function range(start: number, end: number, step: number = 1) {
  return Array.from(
    { length: (end - start + 1) / step },
    (_, i) => start + i * step,
  )
}
