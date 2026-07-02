import { z } from "zod"

export const objectSchema = z.object({
	title: z.string().min(1, "Введите название"),
	url: z.string().min(1, "Введите URL"),
	is_active: z.boolean(),
})

export type ObjectFormValues = z.infer<typeof objectSchema>
