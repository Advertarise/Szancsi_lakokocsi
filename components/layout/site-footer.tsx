import Link from "next/link"
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { Logo } from "@/components/layout/logo"
import { camper } from "@/content/camper"
import { navItems } from "@/lib/site"
import { cn } from "@/lib/utils"

const legalLinks = [
  { href: "/aszf", label: "Általános Szerződési Feltételek" },
  { href: "/adatvedelem", label: "Adatvédelmi tájékoztató" },
  { href: "/lemondasi-feltetelek", label: "Lemondási feltételek" },
]

export function SiteFooter({ mobileBarSpace = false }: { mobileBarSpace?: boolean }) {
  const { contact, legal } = camper
  return (
    <footer className={cn("bg-[#1f3527] text-[#efe7da] dark:bg-[#0c130e]", mobileBarSpace && "pb-24 lg:pb-0")}>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#efe7da]/80">{camper.shortDescription}</p>
        </div>

        <nav aria-label="Oldaltérkép">
          <h2 className="font-sans text-sm font-semibold tracking-widest text-[#f2a36b] uppercase">Az oldalon</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[...navItems, { href: "/#foglalas", id: "foglalas", label: "Foglalás" }].map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="text-[#efe7da]/85 hover:text-white hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Jogi információk">
          <h2 className="font-sans text-sm font-semibold tracking-widest text-[#f2a36b] uppercase">Tudnivalók</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[#efe7da]/85 hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-sans text-sm font-semibold tracking-widest text-[#f2a36b] uppercase">Kapcsolat</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:underline">
                <PhoneIcon className="size-4 text-[#f2a36b]" aria-hidden="true" />
                {contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 hover:underline">
                <MailIcon className="size-4 text-[#f2a36b]" aria-hidden="true" />
                {contact.email}
              </a>
            </li>
            <li className="inline-flex items-start gap-2">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-[#f2a36b]" aria-hidden="true" />
              {camper.pickup.address}
            </li>
          </ul>
          {(contact.instagram || contact.facebook) && (
            <ul className="mt-4 flex gap-4 text-sm">
              {contact.instagram && (
                <li>
                  <a href={contact.instagram} className="hover:underline" rel="noopener" target="_blank">
                    Instagram
                  </a>
                </li>
              )}
              {contact.facebook && (
                <li>
                  <a href={contact.facebook} className="hover:underline" rel="noopener" target="_blank">
                    Facebook
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-[#efe7da]/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {camper.name} · {legal.operator.name}
          </p>
          <p>Online foglalási kérés · visszaigazolás e-mailben · fizetés átutalással</p>
        </div>
      </div>
    </footer>
  )
}
