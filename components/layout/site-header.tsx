"use client"

import Link from "next/link"
import { useEffect, useState, useSyncExternalStore } from "react"
import { MenuIcon } from "lucide-react"

import { Logo } from "@/components/layout/logo"
import { ThemeToggle } from "@/components/layout/theme"
import { CurrencyToggle } from "@/components/shared/money"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { camper } from "@/content/camper"
import { navItems } from "@/lib/site"
import { cn } from "@/lib/utils"

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true })
  return () => window.removeEventListener("scroll", onChange)
}

function useScrolledPast(px: number) {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > px,
    () => false,
  )
}

/** Melyik szekció látszik éppen (a navigációban kiemeljük). */
function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids])
  return active
}

const sectionIds = navItems.map((n) => n.id)

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const scrolled = useScrolledPast(24)
  const active = useActiveSection(sectionIds)
  const [menuOpen, setMenuOpen] = useState(false)
  const transparent = overlay && !scrolled

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-300",
        transparent
          ? "bg-gradient-to-b from-black/45 to-transparent text-white"
          : "border-b border-border/70 bg-background/85 text-foreground shadow-sm backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label={`${camper.name} – főoldal`}>
          <Logo />
        </Link>

        <nav aria-label="Fő navigáció" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={active === item.id ? "location" : undefined}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    transparent ? "hover:bg-white/15" : "hover:bg-muted",
                    active === item.id && (transparent ? "bg-white/15" : "bg-muted text-primary"),
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <CurrencyToggle className="hidden sm:block" />
          <ThemeToggle className={transparent ? "text-white hover:bg-white/15 hover:text-white" : undefined} />
          <Button asChild variant="sunset" size="lg" className="hidden sm:inline-flex">
            <Link href="/#foglalas">Foglalás</Link>
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                className={cn("rounded-full lg:hidden", transparent && "text-white hover:bg-white/15 hover:text-white")}
                aria-label="Menü megnyitása"
              >
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
                <SheetDescription className="sr-only">Navigáció az oldal szekciói között</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobil navigáció" className="px-4">
                <ul className="flex flex-col gap-1">
                  {[...navItems, { href: "/#foglalas", id: "foglalas", label: "Foglalás" }].map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-xl px-3 py-3 text-lg font-medium hover:bg-muted"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto flex items-center justify-between gap-3 border-t p-4">
                <CurrencyToggle />
                <Button asChild variant="sunset" size="lg">
                  <Link href="/#foglalas" onClick={() => setMenuOpen(false)}>
                    Foglalj most
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
