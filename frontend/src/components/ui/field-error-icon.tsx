import { CircleHelp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface FieldErrorIconProps {
  message?: string
}

export function FieldErrorIcon({ message }: FieldErrorIconProps) {
  if (!message) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleHelp className="h-3.5 w-3.5 shrink-0 text-destructive cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top">
        {message}
      </TooltipContent>
    </Tooltip>
  )
}
