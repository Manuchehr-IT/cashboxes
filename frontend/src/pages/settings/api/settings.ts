import { api } from "@/api/client"
import type { OneCSettings, UpdateOneCSettingsPayload } from "@/pages/settings/types"

export const settingsApi = {
  getOneC: (): Promise<OneCSettings> =>
    api.get<OneCSettings>("/settings/onec").then((r) => r.data),

  updateOneC: (payload: UpdateOneCSettingsPayload): Promise<OneCSettings> =>
    api.patch<OneCSettings>("/settings/onec", payload).then((r) => r.data),
}
