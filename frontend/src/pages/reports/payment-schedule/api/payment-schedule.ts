import { api } from "@/api/client"
import type { ListPaymentScheduleParams, ListPaymentScheduleResponse } from "@/pages/reports/payment-schedule/types"

export const paymentScheduleApi = {
  list: (params?: ListPaymentScheduleParams): Promise<ListPaymentScheduleResponse> =>
    api.get<ListPaymentScheduleResponse>("/reports/payment-schedule", { params }).then((r) => r.data),
}
