# RoadNest – egyoldalas bemutató- és foglalóoldal egyetlen lakóautóhoz

Modern, reszponzív, magyar nyelvű weboldal online foglalási kéréssel. **GitHub Pagesen fut** – nincs szerver, adatbázis vagy havidíj.
Nincs admin felület: minden tartalmat **egyetlen fájlban** (`content/camper.ts`) állítasz be, a képeket pedig a `public/camper/` mappába teszed.

**Mit tud?**

- Teljes képernyős kezdőkép, bemutatkozás, galéria nagyítással, felszereltség, árak és szezonok, „Hogyan működik”, vélemények, GYIK, térkép és kapcsolat
- Kétoldalas foglalási naptár: foglalt napok szürkén, a napok alatt az aznapi ár, minimum éjszakák betartatása
- Árpanel: napi díj × éjszakák (szezononként), takarítási díj, extrák, kaució, összesen, előleg
- 4 lépéses foglalás: dátumok és extrák → személyes és jogosítványadatok → feltételek elfogadása → **foglalási kérés elküldése**
- A kérés minden adattal e-mailben érkezik hozzád; te igazolod vissza, és te küldöd el az utalási adatokat
- Sötét mód, mobilon alul fix „ár + Foglalás” sáv, billentyűzettel is kezelhető, tájékoztató EUR árak
- SEO: meta tagek, OpenGraph, strukturált adatok, sitemap

---

## 1. Hogyan működik a foglalás?

1. A vendég kiválasztja a dátumokat és az extrákat. A naptár csak szabad napokat enged kiválasztani, és betartatja a minimum éjszakák számát.
2. Megadja az adatait (a jogosítványt is), elfogadja a feltételeket, és elküldi a **foglalási kérést**. Ekkor még nem fizet.
3. A kérés e-mailben megérkezik hozzád, egy azonosítóval (pl. `RN-7K3F9Q`), a díj részletezésével és a vendég minden adatával. A levélre válaszolva közvetlenül a vendégnek írsz.
4. **Te** visszaigazolod e-mailben, és elküldöd az utalási adatokat (teljes összeg vagy előleg, ahogy a vendég választotta).
5. Ha megjött a pénz, beírod a foglalást a `content/camper.ts` `blockedDates` listájába, és feltöltöd (push). Pár perc múlva a naptárban már foglaltként látszik.

> Mivel nincs adatbázis, a naptár csak azt tudja, amit a `blockedDates`-be írsz. Két vendég kérhet ugyanarra az időpontra – ilyenkor az egyiket elutasítod vagy másik időpontot ajánlasz.

### Honnan érkezik a kérés e-mailben? – Formspree

A statikus oldal a [Formspree](https://formspree.io) szolgáltatásán keresztül küldi el a kérést. Van ingyenes csomagja (a havi keretet lásd az oldalukon), és a beérkezett kérések a Formspree felületén vissza is kereshetők.

1. Regisztrálj a [formspree.io](https://formspree.io)-n azzal az e-mail-címmel, ahová a foglalásokat kéred.
2. **New form** → adj neki nevet (pl. „RoadNest foglalások”). A kapott címből az utolsó rész az azonosító: `https://formspree.io/f/xyzabcde` → `xyzabcde`.
3. A GitHubon: **Settings → Secrets and variables → Actions → Variables → New repository variable**: név `FORMSPREE_ID`, érték `xyzabcde`.
4. Indíts új kitelepítést (bármilyen push, vagy **Actions → Kitelepítés a GitHub Pagesre → Run workflow**).
5. Ha a Formspree megerősítő levelet küld az e-mail-címedre, hagyd jóvá – amíg ez nincs meg, nem továbbítja a kéréseket.

**Ha nincs beállítva Formspree**, az oldal akkor is működik: a „Foglalási kérés elküldése” gomb a vendég levelezőprogramjában nyit meg egy kitöltött levelet a `contact.email` címre. Ez kevésbé kényelmes (a vendégnek el kell küldenie), ezért a Formspree ajánlott.

## 2. Kitelepítés a GitHub Pagesre

A kód már a GitHubon van. A kitelepítést egy GitHub Actions workflow végzi ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)): **minden push után** felépíti az oldalt, és kiteszi a Pagesre.

**Egyszeri beállítás:**

1. GitHub → a repó **Settings → Pages** → *Build and deployment* → **Source: GitHub Actions**.
2. Pushold fel a változásokat a `main` ágra. Az **Actions** fülön látod a folyamatot (kb. 2 perc).
3. Az oldal címe: **https://advertarise.github.io/Szancsi_lakokocsi/**

**Saját domain (pl. roadnest.hu):** *Settings → Pages → Custom domain*, majd a domainszolgáltatónál állítsd be a GitHub által kért DNS-rekordokat ([leírás](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)). A workflow a címet és az almappát magától átveszi, a kódban nem kell semmit átírni.

## 3. A tartalom átírása – `content/camper.ts`

Nyisd meg a `content/camper.ts` fájlt (pl. [VS Code](https://code.visualstudio.com/)-ban, vagy közvetlenül a GitHub webes szerkesztőjében: a fájl megnyitása után a ceruza ikon). Minden szöveg, ár és beállítás itt van, magyar megjegyzésekkel. Ha elgépelsz valamit (pl. rossz dátumformátum vagy ikonnév), a szerkesztő pirossal aláhúzza, és a GitHub kitelepítése is hibát jelez – ilyenkor a régi oldal marad fent.

| Mit szeretnél módosítani? | Hol találod? |
| --- | --- |
| Név, szlogen, rövid és hosszú leírás | `name`, `slogan`, `shortDescription`, `longDescription` |
| Kezdőkép | `hero.image`, `hero.alt`, `hero.eyebrow` |
| Galéria képei | `images` – `category: "exterior"` (kívül) vagy `"interior"` (belül) |
| Férőhely, alvóhely, váltó, üzemanyag, méretek, kisállat | `specs`, `vehicle` |
| Felszereltség | `amenities` – ikon + felirat + leírás |
| Alapár, szezonális árak, minimum éjszakák | `pricing.baseNightlyPrice`, `pricing.seasons`, `pricing.minNights` |
| Takarítási díj, kaució, előleg %-a, hátralék határideje | `pricing.cleaningFee`, `pricing.securityDeposit`, `pricing.depositPercent`, `pricing.balanceDueDaysBefore` |
| Választható extrák | `extras` – `unit: "perNight"` (éjszakánként) vagy `"perBooking"` (egyszeri) |
| **Foglalt napok** (visszaigazolt foglalások, szerviz, saját használat) | `blockedDates` |
| Foglalási szabályok (legkorábbi érkezés, életkor, stb.) | `booking` |
| Átvételi cím, térkép, átvételi/leadási idő | `pickup` |
| Telefon, e-mail (ide mennek a levelezős kérések is), WhatsApp, Instagram | `contact` |
| „Hogyan működik” lépései | `howItWorks` |
| Vélemények, GYIK | `reviews`, `faq` |
| ÁSZF, adatvédelem, lemondási feltételek, cégadatok | `legal` |
| Keresőben megjelenő cím és leírás | `seo` |

**Formátumok**

- **Dátum:** `"2026-07-01"` (év-hónap-nap).
- **Foglalt napok:** a `from` és a `to` napja is foglalt. Egy júl. 1-jén érkező és júl. 8-án távozó vendégnél: `{ from: "2027-07-01", to: "2027-07-07", reason: "RN-7K3F9Q – Kiss Anna" }` – így júl. 8-án már érkezhet a következő vendég. A `reason` csak neked szól, a látogatók nem látják.
- **Szezon:** évente ismétlődő `"06-15"` (hónap-nap). Átnyúlhat az évfordulón is (`from: "12-20", to: "01-06"`). Ha két szezon átfedi egymást, a listában előbb álló érvényes. Ha egy szezonban `minNights` is meg van adva, ott az érkezés napjától ennyi éjszaka a minimum.
- **Ár:** egész szám forintban, szóköz nélkül (`45000`). Tájékoztató EUR árakhoz add meg az árfolyamot: `eurRate: 395` (ha nem kell, töröld a sort – eltűnik a Ft/€ kapcsoló).
- **Ikonok:** a [lucide.dev/icons](https://lucide.dev/icons) oldalról; a nevet NagyKezdőbetűvel, szóköz nélkül írd (pl. `cooking-pot` → `"CookingPot"`).

> ⚠️ **Élesítés előtt:** a vélemények, a cím, a cégadatok, az e-mail-cím és a jogi szövegek **mintaszövegek**. Cseréld valódiakra, a jogi szövegeket nézesd át jogásszal. A jogi szövegekben lévő számokat (kaució, időpontok) nem frissíti automatikusan a rendszer, ha az árakat módosítod.

## 4. Képek – `public/camper/`

1. Másold a fotóidat a `public/camper/` mappába. A fájlnév legyen kisbetűs, ékezet és szóköz nélkül (pl. `kulso-balaton.jpg`).
2. **Méretezd át őket webre:** `npm run kepek` – a túl nagy képeket 2400 px szélesre kicsinyíti és tömöríti (a már kicsiket nem bántja). A GitHub Pages nem kicsinyít, egy telefonos fotó átméretezés nélkül 5–10 MB is lehet, ami nagyon lassítja az oldalt.
3. A `content/camper.ts`-ben hivatkozz rájuk így: `"/camper/kulso-balaton.jpg"`.
4. Minden képhez írj rövid, leíró `alt` szöveget (képernyőolvasóknak és a Google-nek).

| Kép | Ajánlott | Tipp |
| --- | --- | --- |
| Kezdőkép (`hero.image`) | fekvő, kb. 16:9 | A jármű inkább jobbra legyen, a bal oldalra kerül a szöveg. Ez lesz a megosztási (OpenGraph) kép is. |
| Galéria | fekvő, kb. 3:2 | Az első kép nagyobb méretben jelenik meg. |

A mappában most mintaillusztrációk vannak – ezeket nyugodtan töröld.

## 5. Futtatás a saját gépeden (nem kötelező)

Csak akkor kell, ha feltöltés előtt meg szeretnéd nézni a változást. Kell hozzá [Node.js](https://nodejs.org/) (20-as vagy újabb).

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # a kész statikus oldal az out/ mappába kerül
npm run kepek      # képek átméretezése
npm run lint       # kódellenőrzés
```

A Formspree-t helyben is kipróbálhatod: másold le a `.env.example`-t `.env.local` néven, és írd bele a `NEXT_PUBLIC_FORMSPREE_ID`-t.

## 6. Élesítés előtti ellenőrzőlista

- [ ] Saját képek a `public/camper/` mappában, átméretezve (`npm run kepek`), mintaillusztrációk törölve
- [ ] `content/camper.ts`: név, leírás, árak, extrák, cím, elérhetőség kitöltve
- [ ] Valódi vélemények (vagy a `reviews` lista üres – ilyenkor a szekció eltűnik)
- [ ] Jogi szövegek és cégadatok jogász által átnézve
- [ ] GitHub Pages forrása: *GitHub Actions*
- [ ] `FORMSPREE_ID` változó beállítva, a Formspree-fiók e-mail-címe megerősítve
- [ ] Egy próbakérés elküldve – megérkezett az e-mail?

## A projekt felépítése

```
content/camper.ts             ← MINDEN tartalom és beállítás (a foglalt napok is)
public/camper/                ← képek
.github/workflows/deploy.yml  ← kitelepítés a GitHub Pagesre minden push után
app/                          ← oldalak: főoldal, /foglalas, jogi oldalak
components/sections/          ← a főoldal szekciói
components/booking/           ← naptár, árpanel, foglalási varázsló
lib/pricing.ts                ← árszámítás
lib/availability.ts           ← foglalhatósági szabályok
lib/booking-request.ts        ← a foglalási kérés összeállítása és elküldése
scripts/optimize-images.mjs   ← képek átméretezése
```

Technológia: Next.js 16 (App Router, statikus export) · TypeScript · Tailwind CSS 4 · shadcn/ui · Framer Motion (motion) · date-fns · Zod + React Hook Form · Formspree · GitHub Pages.

> Az online kártyás fizetéssel, adatbázissal és automatikus e-mailekkel működő változat (Stripe, Supabase, Resend – Vercel-tárhelyre) a git előzményekben, a `18051e0` commitban található meg.
