import { api } from "@/api/client"
import type { ListCashboxesParams, ListCashboxesResponse } from "@/pages/reports/cashboxes/types"

export const cashboxesApi = {
  list: (params?: ListCashboxesParams): Promise<ListCashboxesResponse> =>
    api.get<ListCashboxesResponse>("/reports/cashboxes", { params }).then((r) => r.data),
}
