import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ObjectFormValues } from "@/pages/objects/schema"

export function ObjectFormFields() {
  const form = useFormContext<ObjectFormValues>()
  const errors = form.formState.errors

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="obj-title">Название</Label>
        <Input id="obj-title" autoFocus {...form.register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="obj-url">URL (1C)</Label>
        <Input id="obj-url" placeholder="http://1c.example.com/api/cashbox" {...form.register("url")} />
        {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Статус</Label>
        <Select
          value={String(form.watch("is_active"))}
          onValueChange={(v) => form.setValue("is_active", v === "true", { shouldDirty: true })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Активный</SelectItem>
            <SelectItem value="false">Неактивный</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
