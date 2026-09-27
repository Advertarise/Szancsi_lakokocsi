import type { icons } from "lucide-react"

/** Bármely Lucide ikon neve, pl. "CookingPot" – lista: https://lucide.dev/icons */
export type IconName = keyof typeof icons

/** Dátum „ÉÉÉÉ-HH-NN” formában, pl. "2026-07-01". */
export type ISODate = `${number}-${number}-${number}`

/** Évente ismétlődő nap „HH-NN” formában, pl. "06-15". */
export type MonthDay = `${number}-${number}`

/** "ÓÓ:PP" formátumú időpont, pl. "15:00". */
export type ClockTime = `${number}:${number}`

export interface CamperImage {
  /** Elérési út a /public mappához képest, pl. "/camper/kulso-erdo.jpg" */
  src: string
  /** Rövid leírás a képernyőolvasóknak és a keresőknek */
  alt: string
  category: "exterior" | "interior"
  caption?: string
}

export interface Season {
  id: string
  name: string
  /** Évente ismétlődő kezdőnap (HH-NN), a nap is beleszámít */
  from: MonthDay
  /** Évente ismétlődő utolsó nap (HH-NN), a nap is beleszámít. Lehet évfordulón átnyúló is (pl. 12-20 → 01-05). */
  to: MonthDay
  nightlyPrice: number
  /** Ha meg van adva, ebben a szezonban ennyi a minimum éjszakák száma (az érkezés napja számít) */
  minNights?: number
  description?: string
}

export interface Extra {
  id: string
  name: string
  description?: string
  price: number
  /** "perNight": éjszakánként, "perBooking": egyszeri díj */
  unit: "perNight" | "perBooking"
  icon?: IconName
}

export interface BlockedPeriod {
  /** Első nem elérhető nap */
  from: ISODate
  /** Utolsó nem elérhető nap (a nap is beleszámít) */
  to: ISODate
  /** Csak neked szól, a látogatók nem látják */
  reason?: string
}

export interface LegalSection {
  title: string
  paragraphs: string[]
}

export interface CamperConfig {
  name: string
  slogan: string
  shortDescription: string
  longDescription: string[]
  vehicle: {
    model: string
    year: number
  }
  hero: {
    image: string
    alt: string
    eyebrow: string
  }
  images: CamperImage[]
  specs: {
    seats: number
    berths: number
    transmission: "manual" | "automatic"
    fuel: string
    lengthCm: number
    widthCm: number
    heightCm: number
    weightKg: number
    licenceCategory: string
    petsAllowed: boolean
    petNote?: string
  }
  amenities: { icon: IconName; label: string; description?: string }[]
  pricing: {
    /** A fizetés pénzneme. Minden ár ebben értendő. */
    currency: "HUF" | "EUR"
    /** Ha HUF az alap pénznem és ez meg van adva, a látogató tájékoztató EUR árakat is kérhet (1 EUR = ennyi HUF). */
    eurRate?: number
    baseNightlyPrice: number
    minNights: number
    maxNights: number
    seasons: Season[]
    cleaningFee: number
    securityDeposit: {
      amount: number
      /** "atPickup": átvételkor kell kifizetni, "online": a foglalás összegével együtt kerül terhelésre */
      collect: "atPickup" | "online"
      note: string
    }
    /** Előleg százaléka, ha a vendég az előleges fizetést választja (0 = kikapcsolva) */
    depositPercent: number
    /** A fennmaradó összeget ennyi nappal az indulás előtt vonjuk le automatikusan */
    balanceDueDaysBefore: number
    includedKmPerDay?: number
    extraKmFee?: number
  }
  extras: Extra[]
  blockedDates: BlockedPeriod[]
  booking: {
    /** Legkorábban hány nap múlva lehet érkezni (0 = már ma is) */
    minDaysBeforeCheckIn: number
    /** Legfeljebb hány hónapra előre lehet foglalni */
    maxMonthsAhead: number
    /** Emlékeztető e-mail ennyi nappal indulás előtt */
    reminderDaysBefore: number
    minDriverAge: number
    minLicenceYears: number
  }
  pickup: {
    address: string
    lat: number
    lng: number
    directions: string
    pickupWindow: { from: ClockTime; to: ClockTime }
    returnWindow: { from: ClockTime; to: ClockTime }
  }
  contact: {
    ownerName: string
    phone: string
    email: string
    whatsapp?: string
    instagram?: string
    facebook?: string
    responseTime: string
  }
  howItWorks: { icon: IconName; title: string; text: string }[]
  reviews: { name: string; location?: string; date: ISODate; rating: 1 | 2 | 3 | 4 | 5; text: string }[]
  faq: { question: string; answer: string }[]
  legal: {
    operator: {
      name: string
      address: string
      taxNumber?: string
      registrationNumber?: string
    }
    lastUpdated: ISODate
    cancellation: {
      intro: string
      rules: { daysBefore: number; refundPercent: number }[]
      notes: string[]
    }
    terms: LegalSection[]
    privacy: LegalSection[]
  }
  seo: {
    title: string
    description: string
    keywords: string[]
  }
}

/** Csak a típusellenőrzés és az automatikus kiegészítés miatt kell. */
export function defineCamper(config: CamperConfig): CamperConfig {
  return config
}
