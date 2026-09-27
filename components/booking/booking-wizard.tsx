"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react"
import { useForm, useWatch, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, Loader2Icon, LockIcon, PencilIcon } from "lucide-react"

import { AvailabilityCalendar } from "@/components/booking/availability-calendar"
import { useBooking } from "@/components/booking/booking-provider"
import { ExtrasPicker } from "@/components/booking/extras-picker"
import { describedBy, errorOf, fieldId, FieldMessage, TextField, type BookingForm } from "@/components/booking/form-fields"
import { PriceSummary } from "@/components/booking/price-summary"
import { useMoney } from "@/components/shared/money"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { camper } from "@/content/camper"
import { HOLD_MINUTES } from "@/lib/availability"
import { formatDate, formatRange } from "@/lib/dates"
import { paymentPlan } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import { guestFields, makeBookingFormSchema, type BookingFormData, type BookingFormValues } from "@/lib/validation"

const DRAFT_KEY = "roadnest-foglalas-vazlat"

const steps = [
  { title: "Időpont és extrák", short: "Időpont" },
  { title: "Személyes és vezetői adatok", short: "Adatok" },
  { title: "Összegzés és feltételek", short: "Feltételek" },
  { title: "Fizetés", short: "Fizetés" },
] as const

const defaults: BookingFormValues = {
  fullName: "",
  email: "",
  phone: "",
  birthDate: "",
  postalCode: "",
  city: "",
  street: "",
  country: "Magyarország",
  guestCount: 2,
  licenceNumber: "",
  licenceCountry: "Magyarország",
  licenceIssuedAt: "",
  licenceExpiresAt: "",
  notes: "",
  paymentOption: "full",
  acceptTerms: false,
  acceptPrivacy: false,
}

export function BookingWizard({ extraIcons }: { extraIcons: Record<string, ReactNode> }) {
  const booking = useBooking()
  const { checkIn, checkOut, extras, quote, today } = booking
  const [step, setStep] = useState(0)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)

  // A vezetői feltételek az érkezés/távozás napjához igazodnak, ezért a séma a dátumokból készül.
  const schema = useMemo(
    () => makeBookingFormSchema({ checkIn: checkIn ?? "", checkOut: checkOut ?? "", today }),
    [checkIn, checkOut, today],
  )
  const form = useForm<BookingFormValues, unknown, BookingFormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: defaults,
  })
  const paymentOption = useWatch({ control: form.control, name: "paymentOption" })
  const depositAvailable = !!quote?.depositAvailable

  // Piszkozat mentése a böngészőfülre, hogy a Stripe-ról visszalépve se vesszenek el az adatok.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY)
      if (saved) form.reset({ ...defaults, ...JSON.parse(saved), acceptTerms: false, acceptPrivacy: false })
    } catch {
      // sérült vagy nem elérhető tárhely – üres űrlappal indulunk
    }
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        try {
          // A hozzájárulásokat szándékosan nem mentjük – azokat minden alkalommal újra el kell fogadni.
          const draft: Partial<BookingFormValues> = { ...values }
          delete draft.acceptTerms
          delete draft.acceptPrivacy
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
        } catch {
          // nem baj, ha nem menthető
        }
      },
    })
  }, [form])

  useEffect(() => {
    if (!depositAvailable && form.getValues("paymentOption") === "deposit") form.setValue("paymentOption", "full")
  }, [depositAvailable, form])

  // Lépésváltáskor a lépés címére ugrunk (képernyőolvasóknak és billentyűzetes használatnak).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    headingRef.current?.focus({ preventScroll: true })
  }, [step])

  async function next() {
    if (step === 0) {
      if (!quote) {
        toast.error(booking.stayError ?? "Válaszd ki az érkezés és a távozás napját a naptárban.")
        return
      }
      setStep(1)
    } else if (step === 1) {
      if (await form.trigger([...guestFields], { shouldFocus: true })) setStep(2)
    }
  }

  async function submit(values: BookingFormData) {
    if (!quote || !checkIn || !checkOut) {
      setStep(0)
      return
    }
    setStep(3)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkIn, checkOut, extras, form: values }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        url?: string
        error?: string
        code?: string
        fields?: Record<string, string>
      }
      if (res.ok && data.url) {
        window.location.assign(data.url)
        return
      }
      toast.error(data.error ?? "Nem sikerült elindítani a fizetést. Kérjük, próbáld újra.")
      if (data.code === "unavailable") {
        booking.refreshAvailability()
        booking.clear()
        setStep(0)
        return
      }
      let target = 2
      for (const [name, message] of Object.entries(data.fields ?? {})) {
        form.setError(name as keyof BookingFormValues, { message })
        if ((guestFields as readonly string[]).includes(name)) target = 1
      }
      setStep(target)
    } catch {
      toast.error("Hálózati hiba történt. Ellenőrizd az internetkapcsolatot, és próbáld újra.")
      setStep(2)
    }
  }

  function onInvalid(errors: FieldErrors<BookingFormValues>) {
    if (guestFields.some((f) => errors[f])) {
      setStep(1)
      toast.error("Kérjük, ellenőrizd a személyes adatokat.")
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (step < 2) void next()
    else if (step === 2) void form.handleSubmit(submit, onInvalid)(e)
  }

  return (
    <div ref={topRef} className="grid scroll-mt-24 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div>
        <Stepper current={step} onSelect={(i) => i < step && step < 3 && setStep(i)} />

        <form noValidate onSubmit={onSubmit} className="mt-6">
          <section aria-labelledby="lepes-cim" className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-8">
            <p className="text-sm font-medium text-muted-foreground">
              {step + 1}. lépés a {steps.length}-ből
            </p>
            <h2 id="lepes-cim" ref={headingRef} tabIndex={-1} className="mt-1 mb-6 text-2xl font-semibold outline-none sm:text-3xl">
              {steps[step].title}
            </h2>

            {step === 0 && (
              <div className="space-y-10">
                <AvailabilityCalendar />
                <ExtrasPicker icons={extraIcons} />
              </div>
            )}
            {step === 1 && <GuestStep form={form} />}
            {step === 2 && <ReviewStep form={form} onEdit={() => setStep(1)} depositAvailable={depositAvailable} />}
            {step === 3 && <RedirectStep />}

            {step < 3 && (
              <div className="mt-10 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                {step > 0 ? (
                  <Button type="button" variant="ghost" size="lg" onClick={() => setStep(step - 1)}>
                    <ArrowLeftIcon data-icon="inline-start" />
                    Vissza
                  </Button>
                ) : (
                  <Button asChild variant="ghost" size="lg">
                    <Link href="/">
                      <ArrowLeftIcon data-icon="inline-start" />
                      Vissza a főoldalra
                    </Link>
                  </Button>
                )}
                {step < 2 ? (
                  <Button type="submit" size="xl" variant={step === 0 && !quote ? "outline" : "default"}>
                    Tovább
                    <ArrowRightIcon data-icon="inline-end" />
                  </Button>
                ) : (
                  <Button type="submit" size="xl" variant="sunset" disabled={form.formState.isSubmitting}>
                    <LockIcon data-icon="inline-start" />
                    Tovább a biztonságos fizetéshez
                  </Button>
                )}
              </div>
            )}
          </section>
        </form>
      </div>

      <aside aria-label="Foglalás összesítése" className="lg:sticky lg:top-24">
        <PriceSummary paymentOption={step >= 2 ? paymentOption : undefined} />
      </aside>
    </div>
  )
}

function Stepper({ current, onSelect }: { current: number; onSelect: (i: number) => void }) {
  return (
    <nav aria-label="Foglalás lépései">
      <ol className="grid grid-cols-4 gap-2">
        {steps.map((s, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={s.short}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                disabled={!done || current === 3}
                aria-current={active ? "step" : undefined}
                className="group flex w-full flex-col gap-2 text-left disabled:cursor-default"
              >
                <span
                  className={cn(
                    "h-1.5 rounded-full transition-colors",
                    done ? "bg-primary" : active ? "bg-sunset" : "bg-border",
                  )}
                />
                <span className="flex items-center gap-1.5 text-xs font-medium sm:text-sm">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      done ? "bg-primary text-primary-foreground" : active ? "bg-sunset text-sunset-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <CheckIcon className="size-3" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className={cn("truncate", !active && !done && "text-muted-foreground", done && "group-hover:underline")}>
                    {s.short}
                  </span>
                  {done && <span className="sr-only">(kész, visszaléphetsz)</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function Group({ legend, children, description }: { legend: string; children: ReactNode; description?: string }) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-heading text-lg font-semibold">{legend}</legend>
      {description && <p className="-mt-2 text-sm text-muted-foreground">{description}</p>}
      {children}
    </fieldset>
  )
}

function GuestStep({ form }: { form: BookingForm }) {
  const { minDriverAge, minLicenceYears } = camper.booking
  const guestError = errorOf(form, "guestCount")
  const guestCount = useWatch({ control: form.control, name: "guestCount" })
  const notesId = fieldId("notes")
  const notesError = errorOf(form, "notes")

  return (
    <div className="space-y-10">
      <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
        Az adatokra a bérleti szerződéshez van szükségünk. Minden mező kötelező, kivéve ahol jelöljük. Az adatokat
        bizalmasan kezeljük – részletek az{" "}
        <Link href="/adatvedelem" target="_blank" className="font-medium text-primary underline underline-offset-4">
          adatvédelmi tájékoztatóban
        </Link>
        .
      </p>

      <Group legend="Kapcsolattartó">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField form={form} name="fullName" label="Teljes név" autoComplete="name" className="sm:col-span-2" />
          <TextField form={form} name="email" label="E-mail-cím" type="email" autoComplete="email" inputMode="email" hint="Ide küldjük a visszaigazolást." />
          <TextField form={form} name="phone" label="Telefonszám" type="tel" autoComplete="tel" inputMode="tel" placeholder="+36 30 123 4567" />
        </div>
      </Group>

      <Group legend="Lakcím">
        <div className="grid gap-4 sm:grid-cols-6">
          <TextField form={form} name="postalCode" label="Irányítószám" autoComplete="postal-code" className="sm:col-span-2" />
          <TextField form={form} name="city" label="Település" autoComplete="address-level2" className="sm:col-span-4" />
          <TextField form={form} name="street" label="Utca, házszám" autoComplete="street-address" className="sm:col-span-4" />
          <TextField form={form} name="country" label="Ország" autoComplete="country-name" className="sm:col-span-2" />
        </div>
      </Group>

      <Group legend="Hányan utaztok?">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: camper.specs.seats }, (_, i) => i + 1).map((n) => (
            <label key={n} className="cursor-pointer">
              <input
                type="radio"
                name="guestCount"
                value={n}
                checked={guestCount === n}
                onChange={() => form.setValue("guestCount", n, { shouldValidate: true, shouldDirty: true })}
                className="peer sr-only"
                aria-describedby={guestError ? `${fieldId("guestCount")}-hiba` : undefined}
              />
              <span className="flex h-11 min-w-16 items-center justify-center rounded-xl border px-4 font-medium transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background hover:border-primary/60">
                {n} fő
              </span>
            </label>
          ))}
        </div>
        <FieldMessage id={fieldId("guestCount")} error={guestError} />
      </Group>

      <Group
        legend="Vezető és jogosítvány"
        description={`A vezetőnek legalább ${minDriverAge} évesnek kell lennie, és legalább ${minLicenceYears} éve B kategóriás jogosítvánnyal kell rendelkeznie.`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField form={form} name="birthDate" label="Születési dátum" type="date" autoComplete="bday" />
          <TextField form={form} name="licenceNumber" label="Jogosítvány száma" autoComplete="off" className="sm:col-start-1" />
          <TextField form={form} name="licenceCountry" label="Kiállító ország" autoComplete="off" />
          <TextField form={form} name="licenceIssuedAt" label="Kiállítás (első megszerzés) dátuma" type="date" />
          <TextField form={form} name="licenceExpiresAt" label="Érvényesség vége" type="date" />
        </div>
      </Group>

      <div className="space-y-1.5">
        <label htmlFor={notesId} className="font-heading text-lg font-semibold">
          Megjegyzés <span className="font-sans text-sm font-normal text-muted-foreground">(nem kötelező)</span>
        </label>
        <Textarea
          id={notesId}
          rows={4}
          placeholder="Pl. érkezési időpont, kisállat, útvonalterv, kérdések…"
          className="rounded-xl bg-background text-base"
          aria-invalid={!!notesError}
          aria-describedby={describedBy(notesId, notesError)}
          {...form.register("notes")}
        />
        <FieldMessage id={notesId} error={notesError} />
      </div>
    </div>
  )
}

function ReviewStep({ form, onEdit, depositAvailable }: { form: BookingForm; onEdit: () => void; depositAvailable: boolean }) {
  const { quote } = useBooking()
  const { format } = useMoney()
  const values = form.getValues()
  const termsError = errorOf(form, "acceptTerms")
  const privacyError = errorOf(form, "acceptPrivacy")
  if (!quote) return null

  const full = paymentPlan(quote, "full")
  const deposit = paymentPlan(quote, "deposit")
  const options = [
    {
      value: "full" as const,
      title: "Teljes összeg most",
      amount: full.payNow,
      text: "Egy lépésben rendezed a bérleti díjat.",
      disabled: false,
    },
    {
      value: "deposit" as const,
      title: `${camper.pricing.depositPercent}% előleg most`,
      amount: deposit.payNow,
      text: depositAvailable
        ? `A fennmaradó ${format(deposit.payLater)} összeget ${formatDate(deposit.payLaterDate as string)} napon automatikusan levonjuk ugyanarról a kártyáról.`
        : `Közeli indulásnál nem választható – ${camper.pricing.balanceDueDaysBefore + 2} napon belüli érkezéskor a teljes összeget kell kifizetni.`,
      disabled: !depositAvailable,
    },
  ]

  return (
    <div className="space-y-10">
      <section aria-labelledby="osszegzes-cim" className="rounded-2xl bg-muted p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 id="osszegzes-cim" className="font-sans text-base font-semibold">
            {formatRange(quote.checkIn, quote.checkOut)} · {quote.nights} éj
          </h3>
          <Button type="button" variant="ghost" size="sm" onClick={onEdit} className="-mt-1 -mr-2 shrink-0">
            <PencilIcon data-icon="inline-start" />
            Adatok módosítása
          </Button>
        </div>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {[
            ["Név", values.fullName],
            ["E-mail", values.email],
            ["Telefon", values.phone],
            ["Utazók", `${values.guestCount} fő`],
            ["Lakcím", `${values.postalCode} ${values.city}, ${values.street}`],
            ["Jogosítvány", `${values.licenceNumber} (${values.licenceCountry})`],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="truncate font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <fieldset>
        <legend className="mb-4 font-heading text-lg font-semibold">Hogyan szeretnél fizetni?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((o) => (
            <label
              key={o.value}
              className={cn(
                "group relative flex cursor-pointer flex-col rounded-2xl border p-5 transition-all",
                "has-checked:border-primary has-checked:bg-primary/5 has-checked:shadow-sm",
                "has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
                o.disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                value={o.value}
                disabled={o.disabled}
                className="sr-only"
                aria-describedby={`fizetes-${o.value}-leiras`}
                {...form.register("paymentOption")}
              />
              <span className="flex items-center justify-between gap-3">
                <span className="font-semibold">{o.title}</span>
                <span
                  aria-hidden="true"
                  className="size-5 shrink-0 rounded-full border-2 border-input transition-all group-has-checked:border-[6px] group-has-checked:border-primary"
                />
              </span>
              <span className="mt-2 font-heading text-2xl font-semibold">{format(o.amount)}</span>
              <span id={`fizetes-${o.value}-leiras`} className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {o.text}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 font-heading text-lg font-semibold">Feltételek</legend>
        <Consent
          form={form}
          name="acceptTerms"
          error={termsError}
          label={
            <>
              Elolvastam és elfogadom az{" "}
              <Link href="/aszf" target="_blank" className="font-medium text-primary underline underline-offset-4">
                Általános Szerződési Feltételeket
              </Link>{" "}
              és a{" "}
              <Link href="/lemondasi-feltetelek" target="_blank" className="font-medium text-primary underline underline-offset-4">
                lemondási feltételeket
              </Link>
              .
            </>
          }
        />
        <Consent
          form={form}
          name="acceptPrivacy"
          error={privacyError}
          label={
            <>
              Elfogadom az{" "}
              <Link href="/adatvedelem" target="_blank" className="font-medium text-primary underline underline-offset-4">
                adatkezelési tájékoztatót
              </Link>
              , és hozzájárulok, hogy a foglaláshoz szükséges adataimat kezeljétek.
            </>
          }
        />
      </fieldset>

      <p className="flex items-start gap-3 rounded-xl border border-dashed p-4 text-sm leading-relaxed text-muted-foreground">
        <LockIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        A gombra kattintva a dátumokat {HOLD_MINUTES} percre zároljuk, és átirányítunk a Stripe biztonságos fizetési
        oldalára (bankkártya, Apple Pay, Google Pay). Ha a fizetés nem fejeződik be, a dátumok automatikusan felszabadulnak.
      </p>
    </div>
  )
}

function Consent({
  form,
  name,
  label,
  error,
}: {
  form: BookingForm
  name: "acceptTerms" | "acceptPrivacy"
  label: ReactNode
  error?: string
}) {
  const id = fieldId(name)
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-(--primary)"
          aria-invalid={!!error}
          aria-describedby={describedBy(id, error)}
          {...form.register(name)}
        />
        <label htmlFor={id} className="text-sm leading-relaxed">
          {label}
        </label>
      </div>
      <div className="mt-1 pl-8">
        <FieldMessage id={id} error={error} />
      </div>
    </div>
  )
}

function RedirectStep() {
  return (
    <div className="flex flex-col items-center py-10 text-center" role="status">
      <Loader2Icon className="size-10 animate-spin text-primary" aria-hidden="true" />
      <p className="mt-6 font-heading text-xl font-semibold">Átirányítás a biztonságos fizetési oldalra…</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        A dátumokat {HOLD_MINUTES} percre lefoglaltuk neked. Kérjük, ne zárd be az ablakot.
      </p>
    </div>
  )
}
