import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type AppHeaderProps = {
  scrolled: boolean
}

export function AppHeader({ scrolled }: AppHeaderProps) {
  const headerClass = cn(
    "absolute inset-x-0 top-0 z-30 h-16",
    scrolled
      ? "bg-background/70 backdrop-blur-lg shadow-sm"
      : "bg-background"
  )

  return (
    <header className={headerClass}>
      <div className="relative flex h-full items-center gap-3 p-4 sm:gap-4">
        <SidebarTrigger variant="outline" />
        <Separator orientation="vertical" className="h-6" />
      </div>
    </header>
  )
}
