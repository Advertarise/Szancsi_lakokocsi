import { camper } from "@/content/camper"
import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" fill="#2F4F3A" />
      <circle cx="21" cy="12" r="4.5" fill="#E07A3F" />
      <path d="M4 24 L11.5 14 L16 19.5 L19.5 16 L28 24 Z" fill="#E9DCC9" />
      <path d="M4 24 L11.5 14 L14 17.2 L9.5 24 Z" fill="#fff" opacity="0.35" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-heading text-xl font-semibold tracking-tight">{camper.name}</span>
    </span>
  )
}
