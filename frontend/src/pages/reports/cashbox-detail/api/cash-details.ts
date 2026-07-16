import { api } from "@/api/client"
import type { GetCashDetailsParams, ListCashDetailsResponse } from "@/pages/reports/cashbox-detail/types"

export const cashDetailsApi = {
  list: (objectId: string, cashId: string, params?: GetCashDetailsParams): Promise<ListCashDetailsResponse> =>
    api.get<ListCashDetailsResponse>(`/reports/cashboxes/${objectId}/${cashId}`, { params }).then((r) => r.data),
}
