import { api } from "@/api/client"
import type { ListLogsParams, ListLogsResponse } from "@/pages/logs/types"

export const logsApi = {
  list: (params?: ListLogsParams): Promise<ListLogsResponse> =>
    api.get<ListLogsResponse>("/logs", { params }).then((r) => r.data),
}
