import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/api-error"
import { ObjectFormFields } from "@/pages/objects/object-form"
import { objectSchema, type ObjectFormValues } from "@/pages/objects/schema"
import { useCreate } from "@/pages/objects/hooks/use-create"

const DEFAULT_VALUES: ObjectFormValues = { title: "", url: "", is_active: true }
const CONFLICT_MESSAGE = "Объект с таким названием уже существует"

interface AddObjectModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function AddObjectModal({ open, onOpenChange }: AddObjectModalProps) {
	const create = useCreate()
	const [error, setError] = useState<string | null>(null)

	const form = useForm<ObjectFormValues>({
		resolver: zodResolver(objectSchema),
		mode: "onTouched",
		defaultValues: DEFAULT_VALUES,
	})

	useEffect(() => {
		if (open) {
			form.reset(DEFAULT_VALUES)
			setError(null)
		}
	}, [open, form])

	const handleSubmit = async (values: ObjectFormValues) => {
		setError(null)
		try {
			await create.mutateAsync(values)
			onOpenChange(false)
			toast.success(`Объект «${values.title}» создан`)
		} catch (err) {
			setError(getErrorMessage(err, { conflict: CONFLICT_MESSAGE }))
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[calc(100%-2rem)] max-w-md flex flex-col p-0 gap-0">
				<DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b">
					<DialogTitle>Добавить объект</DialogTitle>
					<DialogDescription>Укажите название и URL эндпоинта 1C</DialogDescription>
				</DialogHeader>

				<FormProvider {...form}>
					<form id="add-object-form" onSubmit={form.handleSubmit(handleSubmit)}>
						<div className="px-6 py-5">
							<ObjectFormFields />
							{error && <p className="text-sm text-destructive text-center mt-4">{error}</p>}
						</div>

						<div className="shrink-0 px-6 py-4 border-t">
							<Button type="submit" size="lg" className="w-full" disabled={create.isPending}>
								{create.isPending ? "Создание..." : "Добавить объект"}
							</Button>
						</div>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	)
}
