"use client"

import { useSyncExternalStore } from "react"
import { MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "theme"

/**
 * Első rajzolás előtt lefutó szkript: a mentett vagy a rendszer szerinti
 * témát állítja be, így nincs „villanás”. (Next.js ajánlás: szerveren
 * text/javascript, kliensen text/plain típussal renderelve.)
 */
const script = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light"}catch(_){}})()`

export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}

const isDark = () => document.documentElement.classList.contains("dark")

export function useIsDark() {
  return useSyncExternalStore(subscribe, isDark, () => false)
}

export function setTheme(theme: "light" | "dark") {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.style.colorScheme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // privát módban a tárhely nem elérhető – a téma ettől még átvált
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const dark = useIsDark()
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      className={cn("rounded-full", className)}
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Világos mód bekapcsolása" : "Sötét mód bekapcsolása"}
      title={dark ? "Világos mód" : "Sötét mód"}
    >
      {dark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
    </Button>
  )
}
