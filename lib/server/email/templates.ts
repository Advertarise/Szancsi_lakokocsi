import "server-only"

import { camper } from "@/content/camper"
import { formatDate, formatRange, formatWeekday } from "@/lib/dates"
import { formatMoney } from "@/lib/money"
import { HOLD_MINUTES } from "@/lib/availability"
import type { BookingRow } from "@/lib/server/bookings"
import { env } from "@/lib/server/env"

export interface EmailContent {
  subject: string
  html: string
  text: string
}

type Row = [label: string, value: string]

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const COLORS = { forest: "#2F4F3A", sand: "#F4ECE0", sunset: "#E07A3F", ink: "#1C1A17", muted: "#5B5750", line: "#E6DCCD" }

const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${camper.pickup.lat},${camper.pickup.lng}`

function button(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${COLORS.sunset};color:${COLORS.ink};font-weight:600;text-decoration:none;padding:12px 22px;border-radius:12px">${escapeHtml(label)}</a>`
}

function table(rows: Row[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid ${COLORS.line};color:${COLORS.muted};font-size:14px;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:8px 0;border-bottom:1px solid ${COLORS.line};font-size:14px;font-weight:500">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("")}</table>`
}

interface Block {
  heading?: string
  paragraphs?: string[]
  rows?: Row[]
  list?: string[]
  button?: { href: string; label: string }
}

function render(opts: { preheader: string; title: string; blocks: Block[] }): { html: string; text: string } {
  const body = opts.blocks
    .map((b) => {
      let html = ""
      if (b.heading) html += `<h2 style="font-family:Georgia,serif;font-size:18px;margin:24px 0 8px;color:${COLORS.forest}">${escapeHtml(b.heading)}</h2>`
      for (const p of b.paragraphs ?? []) html += `<p style="margin:0 0 12px;font-size:15px;line-height:1.6">${escapeHtml(p)}</p>`
      if (b.rows) html += table(b.rows)
      if (b.list) html += `<ul style="margin:0 0 12px;padding-left:20px;font-size:15px;line-height:1.6">${b.list.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`
      if (b.button) html += `<p style="margin:20px 0">${button(b.button.href, b.button.label)}</p>`
      return html
    })
    .join("")

  const html = `<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;background:${COLORS.sand};color:${COLORS.ink};font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">${escapeHtml(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:${COLORS.forest};padding:24px 28px;color:#ffffff"><div style="font-family:Georgia,serif;font-size:22px;font-weight:700">${escapeHtml(camper.name)}</div><div style="font-size:13px;opacity:.85;margin-top:4px">${escapeHtml(camper.slogan)}</div></td></tr>
<tr><td style="padding:28px">
<h1 style="font-family:Georgia,serif;font-size:24px;line-height:1.3;margin:0 0 16px;color:${COLORS.ink}">${escapeHtml(opts.title)}</h1>
${body}
</td></tr>
<tr><td style="padding:20px 28px;background:${COLORS.sand};font-size:12px;color:${COLORS.muted};line-height:1.6">${escapeHtml(camper.name)} · ${escapeHtml(camper.contact.phone)} · <a href="mailto:${escapeHtml(camper.contact.email)}" style="color:${COLORS.forest}">${escapeHtml(camper.contact.email)}</a><br>${escapeHtml(camper.legal.operator.name)}, ${escapeHtml(camper.legal.operator.address)}</td></tr>
</table></td></tr></table></body></html>`

  const text = [
    opts.title,
    "",
    ...opts.blocks.flatMap((b) => [
      ...(b.heading ? [b.heading.toUpperCase()] : []),
      ...(b.paragraphs ?? []),
      ...(b.rows ?? []).map(([l, v]) => `${l}: ${v}`),
      ...(b.list ?? []).map((i) => `• ${i}`),
      ...(b.button ? [`${b.button.label}: ${b.button.href}`] : []),
      "",
    ]),
    `${camper.name} · ${camper.contact.phone} · ${camper.contact.email}`,
  ].join("\n")

  return { html, text }
}

function stayRows(b: BookingRow): Row[] {
  const { pickup } = camper
  return [
    ["Foglalási azonosító", b.reference],
    ["Időpont", `${formatRange(b.check_in, b.check_out)} (${b.nights} éj)`],
    ["Átvétel", `${formatDate(b.check_in)}, ${formatWeekday(b.check_in)} · ${pickup.pickupWindow.from}–${pickup.pickupWindow.to}`],
    ["Visszaadás", `${formatDate(b.check_out)}, ${formatWeekday(b.check_out)} · ${pickup.returnWindow.from}–${pickup.returnWindow.to}`],
    ["Helyszín", pickup.address],
    ["Utazók", `${b.guest_count} fő`],
    ["Extrák", b.extras.length ? b.extras.map((e) => e.name).join(", ") : "–"],
  ]
}

function paymentRows(b: BookingRow): Row[] {
  const deposit = camper.pricing.securityDeposit
  const rows: Row[] = [
    ["Bérleti díj összesen", formatMoney(b.total_amount)],
    ["Eddig kifizetve", formatMoney(b.amount_paid)],
  ]
  if (b.balance_amount > 0 && b.balance_status !== "paid" && b.balance_due_date) {
    rows.push(["Hátralék", `${formatMoney(b.balance_amount)} – automatikus levonás: ${formatDate(b.balance_due_date)}`])
  }
  rows.push(["Kaució", `${formatMoney(b.security_deposit)} (${deposit.collect === "atPickup" ? "átvételkor fizetendő, visszajár" : "online terhelve, visszajár"})`])
  return rows
}

function guestRows(b: BookingRow): Row[] {
  return [
    ["Név", b.guest_name],
    ["E-mail", b.guest_email],
    ["Telefon", b.guest_phone],
    ["Lakcím", `${b.guest_postal_code} ${b.guest_city}, ${b.guest_street}, ${b.guest_country}`],
    ["Születési dátum", formatDate(b.guest_birth_date)],
    ["Jogosítvány", `${b.licence_number} (${b.licence_country})\nkiállítva: ${formatDate(b.licence_issued_at)}, lejár: ${formatDate(b.licence_expires_at)}`],
    ["Fizetési mód", b.payment_option === "deposit" ? `Előleg (${camper.pricing.depositPercent}%) + automatikus levonás` : "Teljes összeg"],
    ["Megjegyzés", b.notes || "–"],
  ]
}

function stripeLink(paymentIntentId: string | null): Row[] {
  if (!paymentIntentId) return []
  const test = env.stripeSecretKey?.startsWith("sk_test") ? "test/" : ""
  return [["Stripe", `https://dashboard.stripe.com/${test}payments/${paymentIntentId}`]]
}

const bringList = [
  "Jogosítvány és személyi igazolvány vagy útlevél",
  camper.pricing.securityDeposit.collect === "atPickup"
    ? `Kaució: ${formatMoney(camper.pricing.securityDeposit.amount)} (készpénz vagy átutalás)`
    : "A kauciót már online kifizetted",
  "Kényelmes ruha, jókedv – minden mást mi biztosítunk",
]

export function guestConfirmedEmail(b: BookingRow): EmailContent {
  const title = "Foglalásod megerősítve!"
  const { html, text } = render({
    preheader: `${formatRange(b.check_in, b.check_out)} · ${b.reference}`,
    title,
    blocks: [
      {
        paragraphs: [
          `Kedves ${b.guest_name}!`,
          `Köszönjük, hogy minket választottál! A lakóautó a megadott időszakra a tiéd. Alább minden fontos információt megtalálsz; a mellékelt naptárfájllal az időpontot egy kattintással felveheted a naptáradba.`,
        ],
      },
      { heading: "A foglalás adatai", rows: stayRows(b) },
      { heading: "Fizetés", rows: paymentRows(b) },
      ...(b.payment_option === "deposit" && b.balance_due_date
        ? [
            {
              paragraphs: [
                `A fennmaradó ${formatMoney(b.balance_amount)} összeget ${formatDate(b.balance_due_date)} napon automatikusan levonjuk a foglaláskor használt kártyáról. Ha a levonás nem sikerül, e-mailben küldünk egy fizetési linket.`,
              ],
            },
          ]
        : []),
      { heading: "Mit hozz magaddal?", list: bringList },
      {
        heading: "Megközelítés",
        paragraphs: [camper.pickup.directions],
        button: { href: mapsUrl, label: "Útvonaltervezés" },
      },
      {
        paragraphs: [
          `Lemondási feltételeink: ${env.siteUrl}/lemondasi-feltetelek`,
          `Kérdésed van? Írj nekünk válaszként erre az e-mailre, vagy hívj: ${camper.contact.phone}. Jó utat kívánunk!`,
          `${camper.contact.ownerName} és a ${camper.name} csapata`,
        ],
      },
    ],
  })
  return { subject: `Foglalásod megerősítve – ${b.reference} | ${camper.name}`, html, text }
}

export function ownerConfirmedEmail(b: BookingRow): EmailContent {
  const { html, text } = render({
    preheader: `${b.guest_name} · ${formatRange(b.check_in, b.check_out)}`,
    title: `Új foglalás érkezett: ${b.reference}`,
    blocks: [
      { rows: stayRows(b) },
      { heading: "Fizetés", rows: [...paymentRows(b), ...stripeLink(b.stripe_payment_intent_id)] },
      { heading: "Bérlő", rows: guestRows(b) },
    ],
  })
  return {
    subject: `Új foglalás: ${b.reference} · ${formatRange(b.check_in, b.check_out)} · ${b.guest_name}`,
    html,
    text,
  }
}

export function guestReminderEmail(b: BookingRow, daysLeft: number): EmailContent {
  const when = daysLeft <= 0 ? "Ma" : daysLeft === 1 ? "Holnap" : `${daysLeft} nap múlva`
  const title = `${when} indul a kaland!`
  const unpaid = b.balance_amount > 0 && b.balance_status !== "paid" && b.balance_status !== "not_required"
  const { html, text } = render({
    preheader: `Átvétel: ${formatDate(b.check_in)} ${camper.pickup.pickupWindow.from}–${camper.pickup.pickupWindow.to}`,
    title,
    blocks: [
      {
        paragraphs: [
          `Kedves ${b.guest_name}!`,
          `Már csak pár nap, és indulhatsz! Összegyűjtöttük, amire az átvételnél szükséged lesz.`,
        ],
      },
      { heading: "Átvétel és visszaadás", rows: stayRows(b) },
      { heading: "Mit hozz magaddal?", list: bringList },
      ...(unpaid
        ? [{ paragraphs: [`Figyelem: a foglalásodon még ${formatMoney(b.balance_amount)} hátralék van. Kérjük, rendezd az átvétel előtt – ha kérdésed van, keress minket.`] }]
        : []),
      {
        heading: "Megközelítés",
        paragraphs: [camper.pickup.directions],
        button: { href: mapsUrl, label: "Útvonaltervezés" },
      },
      { paragraphs: [`Ha bármi közbejönne, hívj nyugodtan: ${camper.contact.phone}.`] },
    ],
  })
  return { subject: `${title} – ${b.reference}`, html, text }
}

export function guestBalancePaidEmail(b: BookingRow): EmailContent {
  const { html, text } = render({
    preheader: `${formatMoney(b.balance_amount)} sikeresen kifizetve`,
    title: "Sikeres fizetés – minden rendezve",
    blocks: [
      {
        paragraphs: [
          `Kedves ${b.guest_name}!`,
          `A foglalásod fennmaradó ${formatMoney(b.balance_amount)} összegét sikeresen levontuk. Ezzel a bérleti díj teljes egészében rendezve van.`,
        ],
      },
      { rows: [...stayRows(b).slice(0, 2), ...paymentRows(b)] },
    ],
  })
  return { subject: `Sikeres fizetés – ${b.reference}`, html, text }
}

export function guestBalanceFailedEmail(b: BookingRow, payUrl: string): EmailContent {
  const { html, text } = render({
    preheader: "A fennmaradó összeg levonása nem sikerült",
    title: "Teendőd van a foglalásoddal",
    blocks: [
      {
        paragraphs: [
          `Kedves ${b.guest_name}!`,
          `A foglalásod fennmaradó ${formatMoney(b.balance_amount)} összegét nem sikerült automatikusan levonni a kártyádról (például mert a bankod megerősítést kért, vagy a kártya lejárt). Kérjük, fizesd ki az alábbi gombbal – néhány perc az egész.`,
        ],
        button: { href: payUrl, label: "Fennmaradó összeg kifizetése" },
      },
      { rows: stayRows(b).slice(0, 2) },
      { paragraphs: [`Ha segítség kell, hívj minket: ${camper.contact.phone}.`] },
    ],
  })
  return { subject: `Teendő: fennmaradó összeg kifizetése – ${b.reference}`, html, text }
}

export function ownerBalanceFailedEmail(b: BookingRow, reason: string): EmailContent {
  const { html, text } = render({
    preheader: `${b.reference} – sikertelen automatikus levonás`,
    title: `Sikertelen hátralék-levonás: ${b.reference}`,
    blocks: [
      {
        paragraphs: [
          `A(z) ${formatMoney(b.balance_amount)} hátralék automatikus levonása nem sikerült (${reason}). A vendég e-mailben fizetési linket kapott.`,
        ],
      },
      { rows: [...stayRows(b).slice(0, 2), ["Bérlő", `${b.guest_name} · ${b.guest_phone} · ${b.guest_email}`]] },
    ],
  })
  return { subject: `Sikertelen hátralék-levonás – ${b.reference}`, html, text }
}

export function guestConflictEmail(b: BookingRow): EmailContent {
  const { html, text } = render({
    preheader: "A befizetett összeget visszatérítettük",
    title: "Sajnos a foglalás nem jöhetett létre",
    blocks: [
      {
        paragraphs: [
          `Kedves ${b.guest_name}!`,
          `A fizetésed a ${HOLD_MINUTES} perces zárolási idő lejárta után érkezett meg, és a kiválasztott időszakot közben valaki más lefoglalta. A befizetett ${formatMoney(b.amount_due_now)} összeget teljes egészében visszatérítettük, néhány munkanapon belül megjelenik a számládon.`,
          `Nagyon sajnáljuk a kellemetlenséget! Ha másik időpont is megfelel, szívesen segítünk: ${env.siteUrl}/#foglalas`,
        ],
      },
      { rows: stayRows(b).slice(0, 2) },
    ],
  })
  return { subject: `A foglalás nem jött létre – visszatérítés (${b.reference})`, html, text }
}

export function ownerConflictEmail(b: BookingRow): EmailContent {
  const { html, text } = render({
    preheader: `${b.reference} – automatikusan visszatérítve`,
    title: `Késve érkezett fizetés visszatérítve: ${b.reference}`,
    blocks: [
      {
        paragraphs: [
          "A vendég a zárolás lejárta után fizetett, miközben az időszakot már más lefoglalta. A rendszer a fizetést automatikusan visszatérítette, és értesítette a vendéget.",
        ],
      },
      { rows: [...stayRows(b).slice(0, 2), ["Bérlő", `${b.guest_name} · ${b.guest_phone} · ${b.guest_email}`], ...stripeLink(b.stripe_payment_intent_id)] },
    ],
  })
  return { subject: `Visszatérített fizetés (ütközés) – ${b.reference}`, html, text }
}
