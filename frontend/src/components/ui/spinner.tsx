import { LineSpinner } from "ldrs/react"
import "ldrs/react/LineSpinner.css"
import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: number
  className?: string
}

export function Spinner({ size = 20, className }: SpinnerProps) {
  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <LineSpinner size={size} stroke={2} speed="1" color="currentColor" />
    </span>
  )
}
