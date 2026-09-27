import type { ReactNode } from "react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { cn } from "@/lib/utils"

/** Aloldalak kerete: fix fejléc, tartalom, lábléc. */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <>
      <SiteHeader />
      <main id="tartalom" className={cn("min-h-dvh bg-surface pt-28 pb-20 sm:pt-32", className)}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>
      </main>
      <SiteFooter />
    </>
  )
}

export function StatusCard({
  icon,
  tone = "neutral",
  title,
  children,
}: {
  icon: ReactNode
  tone?: "success" | "warning" | "neutral"
  title: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-border/80 bg-card p-6 text-center shadow-xl shadow-black/5 sm:p-10">
      <span
        className={cn(
          "mx-auto mb-6 flex size-16 items-center justify-center rounded-full [&_svg]:size-8",
          tone === "success" && "bg-primary text-primary-foreground",
          tone === "warning" && "bg-sunset text-sunset-foreground",
          tone === "neutral" && "bg-muted text-foreground",
        )}
      >
        {icon}
      </span>
      <h1 className="text-3xl font-semibold text-balance sm:text-4xl">{title}</h1>
      <div className="mt-4 space-y-4 text-muted-foreground">{children}</div>
    </div>
  )
}
