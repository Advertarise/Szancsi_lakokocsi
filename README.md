# RoadNest – egyoldalas bemutató- és foglalóoldal egyetlen lakóautóhoz

Modern, reszponzív, magyar nyelvű weboldal online foglalással és fizetéssel.
Nincs admin felület: minden tartalmat **egyetlen fájlban** (`content/camper.ts`) állítasz be, a képeket pedig a `public/camper/` mappába teszed.

**Mit tud?**

- Teljes képernyős kezdőkép, bemutatkozás, galéria nagyítással, felszereltség, árak és szezonok, „Hogyan működik”, vélemények, GYIK, térkép és kapcsolat
- Kétoldalas foglalási naptár: foglalt napok szürkén, a napok alatt az aznapi ár, minimum éjszakák betartatása
- Árpanel: napi díj × éjszakák (szezononként), takarítási díj, extrák, kaució, összesen
- 4 lépéses foglalás: dátumok és extrák → személyes és jogosítványadatok → feltételek elfogadása → fizetés a Stripe-on (bankkártya, Apple Pay, Google Pay)
- Teljes összeg vagy előleg fizetése; előlegnél a maradékot a rendszer automatikusan levonja 14 nappal indulás előtt
- Dupla foglalás ellen adatbázis-szintű védelem, a dátumok 15 percre zárolódnak a fizetésig
- Visszaigazoló e-mail neked és a vendégnek (naptárfájllal), emlékeztető indulás előtt
- Sötét mód, mobilon alul fix „ár + Foglalás” sáv, billentyűzettel is kezelhető, tájékoztató EUR árak
- SEO: meta tagek, OpenGraph, strukturált adatok, sitemap

---

## 1. A tartalom átírása – `content/camper.ts`

Nyisd meg a `content/camper.ts` fájlt (pl. [VS Code](https://code.visualstudio.com/)-ban). Minden szöveg, ár és beállítás itt van, magyar megjegyzésekkel. Ha elgépelsz valamit (pl. rossz dátumformátum vagy ikonnév), a szerkesztő pirossal aláhúzza.

| Mit szeretnél módosítani? | Hol találod? |
| --- | --- |
| Név, szlogen, rövid és hosszú leírás | `name`, `slogan`, `shortDescription`, `longDescription` |
| Kezdőkép | `hero.image`, `hero.alt`, `hero.eyebrow` |
| Galéria képei | `images` – `category: "exterior"` (kívül) vagy `"interior"` (belül) |
| Férőhely, alvóhely, váltó, üzemanyag, méretek, kisállat | `specs`, `vehicle` |
| Felszereltség | `amenities` – ikon + felirat + leírás |
| Alapár, szezonális árak, minimum éjszakák | `pricing.baseNightlyPrice`, `pricing.seasons`, `pricing.minNights` |
| Takarítási díj, kaució, előleg %-a | `pricing.cleaningFee`, `pricing.securityDeposit`, `pricing.depositPercent` |
| Választható extrák | `extras` – `unit: "perNight"` (éjszakánként) vagy `"perBooking"` (egyszeri) |
| Blokkolt napok (szerviz, saját használat) | `blockedDates` |
| Foglalási szabályok (legkorábbi érkezés, életkor, stb.) | `booking` |
| Átvételi cím, térkép, átvételi/leadási idő | `pickup` |
| Telefon, e-mail, WhatsApp, Instagram | `contact` |
| „Hogyan működik” lépései | `howItWorks` |
| Vélemények, GYIK | `reviews`, `faq` |
| ÁSZF, adatvédelem, lemondási feltételek, cégadatok | `legal` |
| Keresőben megjelenő cím és leírás | `seo` |

**Formátumok**

- **Dátum:** `"2026-07-01"` (év-hónap-nap). A blokkolt időszak mindkét napja nem foglalható.
- **Szezon:** évente ismétlődő `"06-15"` (hónap-nap). Átnyúlhat az évfordulón is (`from: "12-20", to: "01-06"`). Ha két szezon átfedi egymást, a listában előbb álló érvényes. Ha egy szezonban `minNights` is meg van adva, ott az érkezés napjától ennyi éjszaka a minimum.
- **Ár:** egész szám forintban, szóköz nélkül (`45000`). Tájékoztató EUR árakhoz add meg az árfolyamot: `eurRate: 395` (ha nem kell, töröld a sort – eltűnik a Ft/€ kapcsoló). A fizetés mindig forintban történik.
- **Ikonok:** a [lucide.dev/icons](https://lucide.dev/icons) oldalról; a nevet NagyKezdőbetűvel, szóköz nélkül írd (pl. `cooking-pot` → `"CookingPot"`).

> ⚠️ **Élesítés előtt:** a vélemények, a cím, a cégadatok és a jogi szövegek **mintaszövegek**. Cseréld valódiakra, a jogi szövegeket nézesd át jogásszal. A jogi szövegekben lévő számokat (kaució, időpontok) nem frissíti automatikusan a rendszer, ha az árakat módosítod.

## 2. Képek – `public/camper/`

1. Másold a fotóidat a `public/camper/` mappába. A fájlnév legyen kisbetűs, ékezet és szóköz nélkül (pl. `kulso-balaton.jpg`).
2. A `content/camper.ts`-ben hivatkozz rájuk így: `"/camper/kulso-balaton.jpg"`.
3. Minden képhez írj rövid, leíró `alt` szöveget (képernyőolvasóknak és a Google-nek).

| Kép | Ajánlott méret | Tipp |
| --- | --- | --- |
| Kezdőkép (`hero.image`) | min. 2400 × 1350 px, fekvő | A jármű inkább jobbra legyen, a bal oldalra kerül a szöveg. Ez lesz a megosztási (OpenGraph) kép is. |
| Galéria | min. 1800 × 1200 px (3:2), fekvő | Az első kép nagyobb méretben jelenik meg. |

JPG vagy WebP, képenként legfeljebb ~5 MB. Az oldal automatikusan kicsinyíti és modern formátumra alakítja őket. A mappában most mintaillusztrációk vannak – ezeket nyugodtan töröld.

## 3. Futtatás a saját gépeden

Kell hozzá [Node.js](https://nodejs.org/) (20-as vagy újabb).

```bash
npm install
cp .env.example .env.local   # majd töltsd ki (lásd lent)
npm run dev                  # → http://localhost:3000
```

**Demó mód:** kulcsok nélkül is elindul az oldal. Ilyenkor a naptár csak a `blockedDates` napokat mutatja foglaltnak, a fizetés gomb pedig udvarias üzenetet ad, hogy az online foglalás még nincs beállítva.

Egyéb parancsok: `npm run build` (éles build), `npm run lint` (kódellenőrzés).

## 4. A szolgáltatások beállítása

Mindháromnak van ingyenes csomagja. A kulcsokat a `.env.local` fájlba (helyben), illetve a Vercel beállításaiba (élesben) kell beírni. A változók listája és leírása a [`.env.example`](.env.example) fájlban van.

### Supabase – a foglalások adatbázisa

1. Regisztrálj a [supabase.com](https://supabase.com)-on, és hozz létre egy új projektet (régió: pl. Frankfurt).
2. Bal oldalt **SQL Editor** → **New query** → másold be a [`supabase/migrations/0001_bookings.sql`](supabase/migrations/0001_bookings.sql) teljes tartalmát → **Run**.
3. **Project Settings → API:** a *Project URL* kerüljön a `SUPABASE_URL`-be, a *service_role* (vagy az új *secret*, `sb_secret_…`) kulcs a `SUPABASE_SERVICE_ROLE_KEY`-be.

A kulcs titkos, csak a szerver használja. A táblát a sor szintű biztonság (RLS) minden más elől elzárja.

### Stripe – fizetés

1. Regisztrálj a [stripe.com](https://stripe.com)-on. Teszteléshez maradj **Test mode**-ban.
2. **Developers → API keys:** a *Secret key* (`sk_test_…`) kerüljön a `STRIPE_SECRET_KEY`-be.
3. **Settings → Payment methods:** ellenőrizd, hogy a *Cards*, az *Apple Pay* és a *Google Pay* be van kapcsolva. A Stripe fizetési oldalán ezek maguktól megjelennek.
4. **Webhook (élesben):** *Developers → Webhooks → Add endpoint*
   - URL: `https://a-te-domained.hu/api/stripe/webhook`
   - Események: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - A *Signing secret* (`whsec_…`) kerüljön a `STRIPE_WEBHOOK_SECRET`-be.
5. **Webhook (helyben):** telepítsd a [Stripe CLI](https://docs.stripe.com/stripe-cli)-t, és futtasd:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Az itt kiírt `whsec_…` titkot írd a `.env.local`-ba.

**Tesztkártyák** (bármilyen jövőbeli lejárat és CVC):

| Kártyaszám | Mit tesztel? |
| --- | --- |
| `4242 4242 4242 4242` | Sikeres fizetés |
| `4000 0025 0000 3155` | Banki megerősítés (3D Secure) |
| `4000 0027 6000 3184` | Sikeres előleg, de a hátralék automatikus levonása meghiúsul (a vendég fizetési linket kap) |

### Resend – e-mailek

1. Regisztrálj a [resend.com](https://resend.com)-on.
2. **Domains → Add domain:** add hozzá a domainedet, és állítsd be a kapott DNS-rekordokat a domainszolgáltatódnál. Amíg ez nincs meg, csak a saját regisztrációs címedre tudsz levelet küldeni.
3. **API Keys:** a kulcs kerüljön a `RESEND_API_KEY`-be.
4. `EMAIL_FROM`: pl. `RoadNest <foglalas@a-te-domained.hu>`; `OWNER_EMAIL`: ahová az új foglalásokról kérsz értesítést.

## 5. Telepítés a Vercelre

1. Töltsd fel a projektet egy **GitHub**-tárolóba (a `.env.local` fájl nem kerül fel, ez így helyes).
2. A [vercel.com](https://vercel.com)-on: **Add New → Project →** válaszd ki a tárolót. A beállításokat (Next.js) a Vercel magától felismeri.
3. **Environment Variables:** add meg a `.env.example` összes változóját. `NEXT_PUBLIC_SITE_URL` = az éles cím (pl. `https://roadnest.hu`). `CRON_SECRET`-nek adj meg egy hosszú véletlen szöveget (pl. `openssl rand -hex 32`).
4. **Deploy.**
5. **Settings → Domains:** kösd be a saját domainedet, majd frissítsd a `NEXT_PUBLIC_SITE_URL`-t és indíts új deployt.
6. A Stripe-ban állítsd be a webhookot az éles címre (lásd fent), és a kapott titkot írd a Vercelbe.
7. **Napi ütemezett feladat:** a [`vercel.json`](vercel.json) alapján a Vercel minden nap 06:00-kor (UTC, nálunk 7–8 óra) meghívja a `/api/cron/daily` címet. Ez felszabadítja a lejárt zárolásokat, levonja az esedékes hátralékokat, kiküldi az emlékeztetőket, és törli a 30 napnál régebbi, ki nem fizetett foglalásokat. Az ingyenes Hobby csomagban is működik.

Ha élesíteni szeretnél: a Stripe-ban kapcsolj **Live mode**-ra, és cseréld a teszt kulcsokat (`sk_live_…`, új webhook titok) a Vercelben.

## 6. Hogyan működik a foglalás a háttérben?

1. A vendég kiválasztja a dátumokat, megadja az adatait, és a **„Tovább a biztonságos fizetéshez”** gombra kattint.
2. A szerver újraszámolja az árat (a böngészőben számolt árat soha nem veszi át), ellenőrzi a szabályokat, majd **függő** foglalást hoz létre, ami **15 percre** zárolja a dátumokat.
3. Az adatbázis egy *exclusion constraint* segítségével elutasít minden átfedő foglalást – két vendég egyszerre sem tudja lefoglalni ugyanazt a napot. A távozás napján a következő vendég már érkezhet.
4. A vendég a Stripe oldalán fizet. A Stripe **webhookja** véglegesíti a foglalást **megerősített** állapotúra, és e-mailt küld neked és a vendégnek.
5. Ha a fizetés megszakad vagy lejár, a dátumok felszabadulnak. Ha valaki a zárolás lejárta után mégis fizetne, és közben más lefoglalta az időpontot, a rendszer automatikusan visszatéríti az összeget, és mindkettőtöket értesít.
6. **Előlegnél** a Stripe elmenti a kártyát, és a napi feladat 14 nappal indulás előtt levonja a maradékot. Ha ez nem sikerül (pl. a bank megerősítést kér), a vendég fizetési linket kap, te pedig értesítést.

### Hol látom a foglalásokat?

- **E-mailben:** minden foglalásról részletes értesítést kapsz (dátumok, vendég adatai, jogosítvány, összegek, link a Stripe-fizetéshez).
- **Stripe irányítópult → Payments:** az összes fizetés, a leírásban a foglalási azonosítóval (pl. `RN-7K3F9Q`).
- **Supabase → Table Editor → `bookings`:** az összes foglalás minden adattal.

### Lemondás kezelése

Automatikus lemondás nincs, ezt te intézed:

1. **Stripe → Payments →** keresd meg a fizetést → **Refund** (a lemondási feltételek szerinti összeggel).
2. **Supabase → Table Editor → `bookings`:** a foglalás `status` mezőjét állítsd `cancelled`-re. Ezzel a dátumok újra foglalhatók lesznek.

### Hasznos tudnivalók

- Az ingyenes Supabase projekt egy hét tétlenség után szünetel. A napi ütemezett feladat (és a látogatók forgalma) segít ezt megelőzni, ezért fontos, hogy a `CRON_SECRET` be legyen állítva.
- A napi feladat kézzel is futtatható (pl. teszteléshez):
  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/daily
  ```
  A hátralék-levonás teszteléséhez a Supabase-ben állítsd egy előleges foglalás `balance_due_date` mezőjét a mai napra, és futtasd a fenti parancsot.

## 7. Élesítés előtti ellenőrzőlista

- [ ] Saját képek a `public/camper/` mappában, mintaillusztrációk törölve
- [ ] `content/camper.ts`: név, leírás, árak, extrák, cím, elérhetőség kitöltve
- [ ] Valódi vélemények (vagy a `reviews` lista üres – ilyenkor a szekció eltűnik)
- [ ] Jogi szövegek és cégadatok jogász által átnézve
- [ ] Supabase tábla létrehozva, Stripe és Resend kulcsok a Vercelben
- [ ] Stripe webhook az éles címre, Apple Pay / Google Pay bekapcsolva
- [ ] Resend domain ellenőrizve
- [ ] Egy teljes próbafoglalás tesztkártyával (e-mailek megérkeznek, a naptárban szürke lesz az időszak)
- [ ] `CRON_SECRET` beállítva

## A projekt felépítése

```
content/camper.ts          ← MINDEN tartalom és beállítás
public/camper/             ← képek
app/                       ← oldalak (főoldal, /foglalas, jogi oldalak) és API végpontok
  api/checkout             ← foglalás indítása (zárolás + Stripe)
  api/stripe/webhook       ← fizetés véglegesítése
  api/cron/daily           ← napi feladat
components/sections/       ← a főoldal szekciói
components/booking/        ← naptár, árpanel, foglalási varázsló
lib/pricing.ts             ← árszámítás (böngésző és szerver közös)
lib/availability.ts        ← foglalhatósági szabályok
lib/server/                ← adatbázis, Stripe, e-mailek (csak szerveren fut)
supabase/migrations/       ← adatbázis-séma
```

Technológia: Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · Framer Motion (motion) · Supabase · Stripe Checkout · Resend · date-fns · Zod + React Hook Form.
