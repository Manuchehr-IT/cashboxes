import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/api-error"
import { ObjectFormFields } from "@/pages/objects/object-form"
import { objectSchema, type ObjectFormValues } from "@/pages/objects/schema"
import { useUpdate } from "@/pages/objects/hooks/use-update"
import type { Obj } from "@/pages/objects/types"

const CONFLICT_MESSAGE = "Объект с таким названием уже существует"

interface EditObjectSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	object: Obj | null
}

export function EditObjectSheet({ open, onOpenChange, object }: EditObjectSheetProps) {
	const update = useUpdate()
	const [error, setError] = useState<string | null>(null)

	const form = useForm<ObjectFormValues>({
		resolver: zodResolver(objectSchema),
		defaultValues: { title: "", url: "", is_active: true },
	})

	useEffect(() => {
		if (open && object) {
			form.reset({ title: object.title, url: object.url, is_active: object.is_active })
			setError(null)
		}
	}, [open, object, form])

	const handleSubmit = async (values: ObjectFormValues) => {
		if (!object) return
		setError(null)
		try {
			await update.mutateAsync({ id: object.id, payload: values })
			onOpenChange(false)
			toast.success(`Объект «${values.title}» обновлён`)
		} catch (err) {
			setError(getErrorMessage(err, { conflict: CONFLICT_MESSAGE }))
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full sm:!max-w-md flex flex-col gap-0 p-0">
				<SheetHeader className="shrink-0 border-b px-6 py-4">
					<SheetTitle>Редактировать объект</SheetTitle>
					<SheetDescription>Изменения применятся к объекту</SheetDescription>
				</SheetHeader>

				<FormProvider {...form}>
					<div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
						<form id="edit-object-form" onSubmit={form.handleSubmit(handleSubmit)}>
							<ObjectFormFields />
						</form>
						{error && <p className="text-sm text-destructive text-center pt-4">{error}</p>}
					</div>
				</FormProvider>

				<SheetFooter className="shrink-0 border-t px-6 py-4">
					<Button
						type="submit"
						form="edit-object-form"
						size="lg"
						className="w-full"
						disabled={update.isPending}
					>
						{update.isPending ? "Сохранение..." : "Сохранить"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
