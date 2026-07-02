import { api } from "@/api/client"
import type {
	CreateObjectPayload,
	ListObjectsParams,
	ListObjectsResponse,
	Obj,
	UpdateObjectPayload,
} from "@/pages/objects/types"

export const objectsApi = {
	list: (params?: ListObjectsParams): Promise<ListObjectsResponse> => {
		const page = params?.page ?? 1
		const pageSize = params?.pageSize ?? 10
		const query: Record<string, unknown> = {
			limit: pageSize,
			offset: (page - 1) * pageSize,
			q: params?.q,
			sort: params?.sort,
		}
		if (params?.is_active !== undefined) query.is_active = params.is_active
		return api.get<ListObjectsResponse>("/objects", { params: query }).then((r) => r.data)
	},

	create: (payload: CreateObjectPayload): Promise<Obj> =>
		api.post<Obj>("/objects", payload).then((r) => r.data),

	update: (objectId: string, payload: UpdateObjectPayload): Promise<Obj> =>
		api.patch<Obj>(`/objects/${objectId}`, payload).then((r) => r.data),

	delete: (objectId: string): Promise<void> =>
		api.delete(`/objects/${objectId}`).then(() => undefined),
}
