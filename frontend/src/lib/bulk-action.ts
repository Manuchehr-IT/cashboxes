export interface BulkActionResult {
  successCount: number
  failCount: number
}

/** Запускает действие параллельно для каждого id (вместо последовательных round-trip'ов) и считает исход. */
export async function runBulkAction<T>(
  ids: T[],
  action: (id: T) => Promise<unknown>,
): Promise<BulkActionResult> {
  const results = await Promise.allSettled(ids.map(action))
  const failCount = results.filter((r) => r.status === "rejected").length
  return { successCount: ids.length - failCount, failCount }
}
