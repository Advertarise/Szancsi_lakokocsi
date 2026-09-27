import { z } from "zod"

import { camper } from "@/content/camper"
import { isISODate, yearsBetween } from "@/lib/dates"

const { minDriverAge, minLicenceYears } = camper.booking

function isoDate(message: string) {
  return z.string({ error: message }).refine(isISODate, message)
}

export interface StayContext {
  checkIn: string
  checkOut: string
  today: string
}

/**
 * A foglalási űrlap sémája. A vezetői feltételek (életkor, jogosítvány) az
 * érkezés és a távozás napjához viszonyulnak, ezért a séma ezekből készül.
 */
export function makeBookingFormSchema(ctx: StayContext) {
  const ref = ctx.checkIn || ctx.today
  const end = ctx.checkOut || ctx.today

  return z.object({
    fullName: z
      .string()
      .trim()
      .min(3, "Add meg a teljes neved (vezeték- és keresztnév).")
      .max(120, "A név legfeljebb 120 karakter lehet."),
    email: z.string().trim().pipe(z.email("Érvényes e-mail-címet adj meg, pl. nev@pelda.hu.")),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9][0-9 ()/-]{6,18}[0-9]$/, "Érvényes telefonszámot adj meg, pl. +36 30 123 4567."),
    birthDate: isoDate("Add meg a születési dátumod.")
      .refine((d) => d < ctx.today && yearsBetween(d, ctx.today) < 100, "Ellenőrizd a születési dátumot.")
      .refine(
        (d) => yearsBetween(d, ref) >= minDriverAge,
        `A vezetőnek az érkezés napján legalább ${minDriverAge} évesnek kell lennie.`,
      ),
    postalCode: z.string().trim().min(3, "Add meg az irányítószámot.").max(10, "Túl hosszú irányítószám."),
    city: z.string().trim().min(2, "Add meg a települést.").max(80, "Túl hosszú településnév."),
    street: z.string().trim().min(3, "Add meg az utcát és a házszámot.").max(120, "Túl hosszú cím."),
    country: z.string().trim().min(2, "Add meg az országot.").max(60, "Túl hosszú országnév."),
    guestCount: z
      .number({ error: "Add meg, hányan utaztok." })
      .int()
      .min(1, "Legalább 1 fő utazik.")
      .max(camper.specs.seats, `Legfeljebb ${camper.specs.seats} fő utazhat.`),
    licenceNumber: z
      .string()
      .trim()
      .min(5, "Add meg a jogosítvány számát.")
      .max(20, "Túl hosszú jogosítványszám.")
      .regex(/^[A-Za-z0-9 -]+$/, "A jogosítványszám csak betűket és számokat tartalmazhat."),
    licenceCountry: z.string().trim().min(2, "Add meg a kiállító országot.").max(60, "Túl hosszú országnév."),
    licenceIssuedAt: isoDate("Add meg, mikor kaptad a jogosítványt.")
      .refine((d) => d <= ctx.today, "A dátum nem lehet a jövőben.")
      .refine(
        (d) => yearsBetween(d, ref) >= minLicenceYears,
        `Legalább ${minLicenceYears} éve meglévő jogosítvány szükséges.`,
      ),
    licenceExpiresAt: isoDate("Add meg a jogosítvány lejárati dátumát.").refine(
      (d) => d >= end,
      "A jogosítványnak a bérlés végéig érvényesnek kell lennie.",
    ),
    notes: z.string().trim().max(1000, "Legfeljebb 1000 karakter."),
    paymentOption: z.enum(["full", "deposit"], { error: "Válassz fizetési módot." }),
    acceptTerms: z.boolean().refine((v) => v, "Az ÁSZF és a lemondási feltételek elfogadása kötelező."),
    acceptPrivacy: z.boolean().refine((v) => v, "Az adatkezelési tájékoztató elfogadása kötelező."),
  })
}

export type BookingFormValues = z.input<ReturnType<typeof makeBookingFormSchema>>
export type BookingFormData = z.output<ReturnType<typeof makeBookingFormSchema>>

/** A 2. lépés mezői – ezeket ellenőrizzük a továbblépés előtt. */
export const guestFields = [
  "fullName",
  "email",
  "phone",
  "birthDate",
  "postalCode",
  "city",
  "street",
  "country",
  "guestCount",
  "licenceNumber",
  "licenceCountry",
  "licenceIssuedAt",
  "licenceExpiresAt",
  "notes",
] as const satisfies readonly (keyof BookingFormValues)[]
