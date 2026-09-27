"use client"

import { useEffect, useRef, useState } from "react"
import { DayPicker, type DayButtonProps } from "react-day-picker"
import { hu } from "react-day-picker/locale"
import { ChevronLeftIcon, ChevronRightIcon, Loader2Icon, RotateCcwIcon, TriangleAlertIcon } from "lucide-react"

import { useBooking } from "@/components/booking/booking-provider"
import { useHydrated } from "@/hooks/use-hydrated"
import { useMoney } from "@/components/shared/money"
import { Button, buttonVariants } from "@/components/ui/button"
import { bookingWindow, canCheckIn, canCheckOut } from "@/lib/availability"
import { formatDate, parseISODate, toISODate } from "@/lib/dates"
import { camper } from "@/content/camper"
import { highestNightlyRate, minNightsFor, nightlyRate } from "@/lib/pricing"
import { cn } from "@/lib/utils"

/** Egy nap a naptárban: dátum, alatta az adott éjszaka ára. */
function PriceDayButton({ day, modifiers, className, children, ...props }: DayButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const { compact, format } = useMoney()

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const iso = toISODate(day.date)
  const rate = nightlyRate(iso)
  const seasonal = rate !== camper.pricing.baseNightlyPrice
  const booked = modifiers.booked && modifiers.disabled
  const edge = modifiers.range_start || modifiers.range_end
  const showPrice = !modifiers.disabled && !modifiers.outside

  let label = props["aria-label"] ?? formatDate(iso)
  if (booked) label += ", foglalt"
  else if (showPrice) label += `, ${format(rate)} / éj`

  return (
    <button
      ref={ref}
      {...props}
      aria-label={label}
      className={cn(
        "relative flex size-full flex-col items-center justify-center gap-0.5 rounded-(--cell-radius) text-sm leading-none tabular-nums transition-colors outline-none",
        "hover:bg-accent focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring",
        modifiers.range_middle && "rounded-none hover:bg-primary/20",
        edge && "bg-primary font-semibold text-primary-foreground hover:bg-primary",
        modifiers.disabled && "cursor-not-allowed text-muted-foreground/45 hover:bg-transparent",
        booked && "bg-muted text-muted-foreground/70 line-through decoration-1",
        modifiers.today && !edge && "font-bold text-sunset-ink",
        className,
      )}
    >
      <span>{children}</span>
      {showPrice && (
        <span
          aria-hidden="true"
          className={cn(
            "text-[10px] font-medium tracking-tight sm:text-[11px]",
            edge ? "text-primary-foreground/85" : seasonal ? "text-sunset-ink" : "text-muted-foreground",
          )}
        >
          {compact(rate)}
        </span>
      )}
    </button>
  )
}

export function AvailabilityCalendar({ className }: { className?: string }) {
  const hydrated = useHydrated()
  if (!hydrated) {
    return (
      <div className={className} aria-busy="true">
        <div className="flex h-[40rem] items-center justify-center rounded-2xl bg-muted/60 md:h-[22rem]">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            Naptár betöltése…
          </span>
        </div>
      </div>
    )
  }
  return <CalendarInner className={className} />
}

function CalendarInner({ className }: { className?: string }) {
  const { checkIn, checkOut, setDates, clear, unavailable, today, availabilityStatus, refreshAvailability, stayError } =
    useBooking()
  const [hint, setHint] = useState<string | null>(null)
  const { compact } = useMoney()
  const { earliestCheckIn, latestCheckOut } = bookingWindow(today)
  const choosingCheckOut = !!checkIn && !checkOut
  const [month, setMonth] = useState(() => parseISODate(checkIn ?? earliestCheckIn))

  function isDisabled(date: Date) {
    const iso = toISODate(date)
    if (choosingCheckOut && checkIn && iso > checkIn) return !canCheckOut(checkIn, iso, unavailable, today)
    return !canCheckIn(iso, unavailable, today)
  }

  function selectDay(iso: string) {
    if (!checkIn || checkOut || iso < checkIn) {
      setDates(iso, null)
      setHint(`Most válaszd ki a távozás napját – ebben az időszakban legalább ${minNightsFor(iso)} éjszakára foglalhatsz.`)
      return
    }
    if (iso === checkIn) {
      clear()
      setHint(null)
      return
    }
    setDates(checkIn, iso)
    setHint(null)
  }

  const status = stayError ?? hint

  return (
    <div className={className}>
      <div className="relative">
        <DayPicker
          mode="range"
          locale={hu}
          numberOfMonths={2}
          month={month}
          onMonthChange={setMonth}
          startMonth={parseISODate(today)}
          endMonth={parseISODate(latestCheckOut)}
          selected={checkIn ? { from: parseISODate(checkIn), to: checkOut ? parseISODate(checkOut) : undefined } : undefined}
          onSelect={(_range, day) => selectDay(toISODate(day))}
          disabled={isDisabled}
          modifiers={{ booked: (date: Date) => unavailable.has(toISODate(date)) }}
          showOutsideDays={false}
          className="w-full [--cell-radius:0.75rem] [--cell-size:2.6rem] sm:[--cell-size:3rem]"
          classNames={{
            root: "w-full",
            months: "relative flex flex-col gap-8 md:flex-row md:gap-10",
            month: "flex w-full flex-col gap-3",
            nav: "absolute inset-x-0 top-0 z-10 flex items-center justify-between",
            button_previous: cn(buttonVariants({ variant: "outline", size: "icon-lg" }), "rounded-full disabled:opacity-40"),
            button_next: cn(buttonVariants({ variant: "outline", size: "icon-lg" }), "rounded-full disabled:opacity-40"),
            month_caption: "flex h-9 items-center justify-center",
            caption_label: "font-heading text-lg font-semibold",
            month_grid: "w-full border-collapse",
            weekdays: "flex",
            weekday: "flex-1 pb-2 text-xs font-medium text-muted-foreground uppercase",
            week: "mt-1 flex w-full",
            day: "relative flex-1 p-0 text-center [height:var(--cell-size)]",
            range_start: "rounded-l-(--cell-radius) bg-primary/12",
            range_middle: "bg-primary/12",
            range_end: "rounded-r-(--cell-radius) bg-primary/12",
            selected: "",
            today: "",
            outside: "",
            disabled: "",
            hidden: "invisible",
          }}
          components={{
            DayButton: PriceDayButton,
            Chevron: ({ orientation, className: chevronClass }) =>
              orientation === "left" ? (
                <ChevronLeftIcon className={cn("size-5", chevronClass)} />
              ) : (
                <ChevronRightIcon className={cn("size-5", chevronClass)} />
              ),
          }}
        />
        {availabilityStatus === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-[1px]">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm shadow">
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
              Szabad időpontok betöltése…
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="size-4 rounded-md bg-primary" aria-hidden="true" /> Kiválasztott
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-4 rounded-md bg-muted ring-1 ring-border" aria-hidden="true" /> Foglalt / nem elérhető
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="font-semibold text-sunset-ink">{compact(highestNightlyRate)}</span> Szezonális ár / éj
        </span>
      </div>

      <div aria-live="polite" className="mt-4 min-h-6">
        {availabilityStatus === "error" ? (
          <p className="inline-flex flex-wrap items-center gap-2 text-sm text-destructive">
            <TriangleAlertIcon className="size-4" aria-hidden="true" />
            Nem sikerült betölteni a foglaltságot.
            <Button variant="link" size="sm" className="h-auto p-0" onClick={refreshAvailability}>
              Újrapróbálom
            </Button>
          </p>
        ) : status ? (
          <p className={cn("text-sm", stayError ? "font-medium text-destructive" : "text-muted-foreground")}>{status}</p>
        ) : checkIn && checkOut ? (
          <p className="text-sm text-muted-foreground">
            Érkezés: <strong className="text-foreground">{formatDate(checkIn)}</strong> · Távozás:{" "}
            <strong className="text-foreground">{formatDate(checkOut)}</strong>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Kattints az érkezés napjára. Legkorábban {formatDate(earliestCheckIn)} napra foglalhatsz.
          </p>
        )}
        {(checkIn || checkOut) && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 -ml-2 text-muted-foreground"
            onClick={() => {
              clear()
              setHint(null)
            }}
          >
            <RotateCcwIcon data-icon="inline-start" />
            Dátumok törlése
          </Button>
        )}
      </div>
    </div>
  )
}
