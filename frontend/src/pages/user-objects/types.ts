export type ObjectAccess = {
	id: string
	title: string
	url: string
	is_assigned: boolean
}

export type ListUserObjectsParams = {
	page?: number
	pageSize?: number
	sort?: string
	is_assigned?: boolean
}

export type ListUserObjectsResponse = {
	items: ObjectAccess[]
	count: number
}
