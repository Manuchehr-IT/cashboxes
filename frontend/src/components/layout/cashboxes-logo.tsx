import { useTheme } from "@/hooks/use-theme"

export function CashboxesLogo({ className }: { className?: string }) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const bg = isDark ? "#FAFAFA" : "#18181B"
  const bars = isDark
    ? ["#D4D4D8", "#A1A1AA", "#71717A", "#18181B"]
    : ["#71717A", "#A1A1AA", "#D4D4D8", "#FAFAFA"]
  const trend = isDark ? "#18181B" : "#FAFAFA"

  return (
    <svg viewBox="0 0 88 88" fill="none" className={className}>
      <rect x="2" y="2" width="84" height="84" rx="20" fill={bg} />
      <rect x="20" y="60" width="8" height="10" rx="1.5" fill={bars[0]} />
      <rect x="32" y="52" width="8" height="18" rx="1.5" fill={bars[1]} />
      <rect x="44" y="44" width="8" height="26" rx="1.5" fill={bars[2]} />
      <rect x="56" y="34" width="8" height="36" rx="1.5" fill={bars[3]} />
      <path
        d="M20 40L34 27L46 35L67 18"
        stroke={trend}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
    </svg>
  )
}
