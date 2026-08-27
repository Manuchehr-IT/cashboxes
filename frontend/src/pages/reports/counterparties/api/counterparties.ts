import { api } from "@/api/client"
import type { ListCounterpartiesResponse } from "@/pages/reports/counterparties/types"

export const counterpartiesApi = {
  list: (): Promise<ListCounterpartiesResponse> =>
    api.get<ListCounterpartiesResponse>("/reports/counterparties").then((r) => r.data),
}
