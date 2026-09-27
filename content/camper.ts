/**
 * ─────────────────────────────────────────────────────────────────────────
 *  ROADNEST – A LAKÓAUTÓ ÖSSZES ADATA EGY HELYEN
 * ─────────────────────────────────────────────────────────────────────────
 *  Ebben a fájlban írhatsz át mindent, ami az oldalon megjelenik:
 *  szövegek, képek, árak, szezonok, extrák, blokkolt napok, elérhetőség,
 *  GYIK, vélemények és jogi szövegek.
 *
 *  • A képeket a /public/camper/ mappába tedd, és itt a nevükkel hivatkozz
 *    rájuk (pl. "/camper/sajat-kep.jpg").
 *  • A dátumok formátuma "ÉÉÉÉ-HH-NN" (pl. "2026-07-01"), a szezonoké
 *    évente ismétlődő "HH-NN" (pl. "06-15").
 *  • Az árak egész számok, a `pricing.currency` pénznemben (alapból forint).
 *  • Az ikonok a Lucide készletből jönnek: https://lucide.dev/icons
 *    (a nevet NagyKezdőbetűvel, szóköz nélkül írd, pl. "CookingPot").
 *
 *  Ha elgépelsz valamit, a szerkesztő (VS Code) pirossal aláhúzza.
 */
import { defineCamper } from "@/lib/camper-types"

export const camper = defineCamper({
  name: "RoadNest",
  slogan: "A te fészked az úton.",
  shortDescription:
    "Prémium, négyszemélyes lakóautó zuhannyal, konyhával és napelemmel – hogy ott ébredj, ahol a legszebb a kilátás.",
  longDescription: [
    "A RoadNest 2022-ben született egy egyszerű ötletből: olyan lakóautót szerettünk volna, amiben nem kell lemondani a kényelemről, mégis elég kicsi ahhoz, hogy felkapaszkodjon egy hegyi szerpentinen vagy beálljon egy csendes tóparti tisztásra.",
    "Hónapokig terveztük minden négyzetcentiméterét: a hátsó franciaágy mellé emelőtetős második hálóhely került, a konyhában kompresszoros hűtő és kétlapos tűzhely vár, a fürdőben pedig melegvizes zuhany. A tetőn napelemek gondoskodnak róla, hogy kemping nélkül is napokig önellátó maradj.",
    "Azóta több tucat család, pár és baráti társaság indult vele útnak a Balaton-felvidéktől a Dolomitokig. Ha kérdésed van, bátran írj – szívesen segítünk útvonalat tervezni is.",
  ],
  vehicle: {
    model: "Fiat Ducato alapú kastenwagen",
    year: 2022,
  },

  // ── Kezdőkép (a /public/camper mappában) ────────────────────────────────
  hero: {
    image: "/camper/hero.jpg",
    alt: "A RoadNest lakóautó egy tóparton naplementében, fenyőerdő szélén",
    eyebrow: "Lakóautó-bérlés Budapest mellől",
  },

  // ── Galéria ─ category: "exterior" (kívül) vagy "interior" (belül) ──────
  images: [
    { src: "/camper/kulso-naplemente.jpg", alt: "A lakóautó naplementében egy tó partján", category: "exterior", caption: "Naplemente a tóparton" },
    { src: "/camper/belso-nappali.jpg", alt: "Étkezősarok két üléssel, asztallal és nagy ablakkal", category: "interior", caption: "Étkező és nappali" },
    { src: "/camper/kulso-erdo.jpg", alt: "A lakóautó kinyitott napellenzővel egy erdei tisztáson, kempingszékekkel", category: "exterior", caption: "Reggeli kávé az erdő szélén" },
    { src: "/camper/belso-konyha.jpg", alt: "Konyha kétlapos tűzhellyel, mosogatóval és rengeteg tárolóhellyel", category: "interior", caption: "Teljesen felszerelt konyha" },
    { src: "/camper/kulso-ejszaka.jpg", alt: "A lakóautó éjszaka csillagos ég alatt, égő fényfüzérrel és tábortűzzel", category: "exterior", caption: "Csillagfényes esték" },
    { src: "/camper/belso-halo.jpg", alt: "Hátsó franciaágy párnákkal, két ablakkal és fényfüzérrel", category: "interior", caption: "Hátsó franciaágy (140 × 195 cm)" },
    { src: "/camper/kulso-tengerpart.jpg", alt: "A lakóautó egy tengerparti úton", category: "exterior", caption: "Úton a tenger felé" },
    { src: "/camper/belso-furdo.jpg", alt: "Fürdőszoba zuhannyal, mosdóval és tükörrel", category: "interior", caption: "Fürdő melegvizes zuhannyal" },
  ],

  // ── Főbb adatok ─────────────────────────────────────────────────────────
  specs: {
    seats: 4,
    berths: 4,
    transmission: "automatic",
    fuel: "Dízel",
    lengthCm: 636,
    widthCm: 205,
    heightCm: 290,
    weightKg: 3500,
    licenceCategory: "B",
    petsAllowed: true,
    petNote: "Legfeljebb 2 jól nevelt kutya vagy macska",
  },

  // ── Felszereltség ───────────────────────────────────────────────────────
  amenities: [
    { icon: "CookingPot", label: "Konyha", description: "Kétlapos gáztűzhely, mosogató, edények és evőeszközök 4 főre" },
    { icon: "Refrigerator", label: "Hűtő", description: "90 literes kompresszoros hűtő fagyasztórekesszel" },
    { icon: "ShowerHead", label: "Zuhany", description: "Melegvizes zuhany külön fürdőkabinban" },
    { icon: "Toilet", label: "WC", description: "Kazettás WC, vegyszer az első töltethez" },
    { icon: "Flame", label: "Fűtés", description: "Dízelüzemű állófűtés és melegvíz – télen is kellemes" },
    { icon: "SunMedium", label: "Napelem", description: "2 × 175 W napelem és 200 Ah lítium akkumulátor" },
    { icon: "Snowflake", label: "Klíma", description: "Automata klíma a vezetőfülkében" },
    { icon: "Wifi", label: "Mobilinternet", description: "4G router 50 GB adatkerettel" },
    { icon: "PlugZap", label: "230 V és USB-C", description: "Inverter, konnektorok és gyorstöltők" },
    { icon: "Umbrella", label: "Napellenző", description: "4 méteres kitekerhető előtető" },
    { icon: "Camera", label: "Tolatókamera", description: "Navigáció, Apple CarPlay és Android Auto" },
    { icon: "Baby", label: "Gyerekülés-rögzítés", description: "2 db ISOFIX pont a hátsó üléseken" },
  ],

  // ── Árak ────────────────────────────────────────────────────────────────
  pricing: {
    currency: "HUF",
    eurRate: 395,
    baseNightlyPrice: 38000,
    minNights: 2,
    maxNights: 28,
    seasons: [
      { id: "elo", name: "Előszezon", from: "04-01", to: "06-14", nightlyPrice: 45000, minNights: 3, description: "Virágzó tájak, kevesebb turista" },
      { id: "fo", name: "Főszezon", from: "06-15", to: "08-31", nightlyPrice: 58000, minNights: 5, description: "Nyári vakáció, hosszú esték" },
      { id: "uto", name: "Utószezon", from: "09-01", to: "10-15", nightlyPrice: 45000, minNights: 3, description: "Szüret, meleg színek, csend" },
      { id: "unnep", name: "Ünnepi időszak", from: "12-20", to: "01-06", nightlyPrice: 52000, minNights: 4, description: "Karácsony és szilveszter a hegyekben" },
    ],
    cleaningFee: 25000,
    securityDeposit: {
      amount: 300000,
      note: "Átvételkor fizetendő készpénzben vagy átutalással, a jármű sérülésmentes visszaadása után 7 napon belül visszajár.",
    },
    depositPercent: 30,
    balanceDueDaysBefore: 14,
    includedKmPerDay: 250,
    extraKmFee: 60,
  },

  // ── Választható extrák ─ unit: "perNight" (éjszakánként) vagy "perBooking" (egyszeri) ──
  extras: [
    { id: "bedding", name: "Ágynemű- és törölközőcsomag", description: "Friss ágynemű és fürdőlepedő 4 főre", price: 12000, unit: "perBooking", icon: "BedDouble" },
    { id: "bike-rack", name: "Kerékpártartó", description: "Hátsó tartó 2 kerékpárra (e-bike is mehet)", price: 3000, unit: "perNight", icon: "Bike" },
    { id: "camping-set", name: "Kempingbútor-szett", description: "Összecsukható asztal és 4 szék", price: 2500, unit: "perNight", icon: "Armchair" },
    { id: "unlimited-km", name: "Korlátlan kilométer", description: "Nincs napi 250 km-es korlát", price: 6000, unit: "perNight", icon: "Route" },
    { id: "pet", name: "Kisállat-csomag", description: "Kisállat utáni mélytakarítás, tál és takaró", price: 15000, unit: "perBooking", icon: "PawPrint" },
    { id: "starlink", name: "Starlink Mini", description: "Műholdas internet a legeldugottabb helyeken is", price: 4000, unit: "perNight", icon: "SatelliteDish" },
  ],

  // ── Nem foglalható napok ─ mindkét nap beleszámít ─────────────────────
  //  Ide kerül minden VISSZAIGAZOLT FOGLALÁS is: a naptár ebből tudja, mely napok
  //  foglaltak. Érkezés–távozás esetén a "to" a távozás előtti nap legyen
  //  (a távozás napján már érkezhet a következő vendég), pl. júl. 1–8. foglalás:
  //  { from: "2027-07-01", to: "2027-07-07", reason: "Foglalás RN-ABC234 – Kiss Anna" }
  blockedDates: [
    { from: "2026-10-12", to: "2026-10-16", reason: "Őszi szerviz" },
    { from: "2026-12-23", to: "2026-12-27", reason: "Saját használat – karácsony" },
    { from: "2027-03-15", to: "2027-03-20", reason: "Tavaszi nagyszerviz" },
  ],

  // ── Foglalási szabályok ─────────────────────────────────────────────────
  booking: {
    minDaysBeforeCheckIn: 2,
    maxMonthsAhead: 12,
    reminderDaysBefore: 3,
    minDriverAge: 21,
    minLicenceYears: 2,
  },

  // ── Átvétel ─────────────────────────────────────────────────────────────
  pickup: {
    address: "2083 Solymár, Minta utca 1.",
    lat: 47.5914,
    lng: 18.9334,
    directions:
      "Budapest belvárosából kb. 25 perc autóval. Saját autódat az átvétel idejére ingyenesen, zárt udvarban hagyhatod nálunk. Tömegközlekedéssel: S76-os vonattal Solymár megállóig, onnan 8 perc séta.",
    pickupWindow: { from: "15:00", to: "18:00" },
    returnWindow: { from: "08:00", to: "11:00" },
  },

  // ── Elérhetőség ─────────────────────────────────────────────────────────
  contact: {
    ownerName: "Nóra",
    phone: "+36 30 123 4567",
    email: "hello@roadnest.hu",
    whatsapp: "36301234567",
    // instagram: "https://instagram.com/a-te-oldalad",
    // facebook: "https://facebook.com/a-te-oldalad",
    responseTime: "Általában 2 órán belül válaszolunk.",
  },

  // ── Hogyan működik (3 lépés) ────────────────────────────────────────────
  howItWorks: [
    {
      icon: "CalendarCheck",
      title: "Foglalás",
      text: "Válaszd ki a dátumokat és az extrákat, add meg az adataidat, és küldd el a foglalási kérést. Hamarosan e-mailben visszaigazoljuk, és elküldjük az utalási adatokat.",
    },
    {
      icon: "KeyRound",
      title: "Átvétel",
      text: "Az érkezés napján 15 és 18 óra között személyesen adjuk át a lakóautót. Mindent megmutatunk, a kérdéseidre válaszolunk, és kapsz egy részletes kézikönyvet is.",
    },
    {
      icon: "Mountain",
      title: "Kaland",
      text: "Irány a Balaton-felvidék, az Alpok vagy a horvát tengerpart! Az út alatt telefonon is elérsz minket. Visszaérkezéskor 8 és 11 óra között várunk.",
    },
  ],

  // ── Vélemények ─ FIGYELEM: ezek mintaszövegek! Élesítés előtt cseréld valódiakra. ──
  reviews: [
    { name: "Kata és Bence", location: "Budapest", date: "2026-08-24", rating: 5, text: "Két hetet töltöttünk vele Szlovéniában és Olaszországban. Minden tiszta volt, a konyhában tényleg minden megvolt, a napelemnek hála három napig kemping nélkül is elvoltunk. Nóra hihetetlenül segítőkész volt!" },
    { name: "A Tóth család", location: "Győr", date: "2026-07-30", rating: 5, text: "Két gyerekkel is kényelmes volt: a gyerekek imádták a tetőágyat, mi pedig a hátsó franciaágyat. Az átadás alapos volt, mindenre kaptunk választ." },
    { name: "Gergely", location: "Debrecen", date: "2026-06-18", rating: 5, text: "Első lakóautós utam volt, de az automata váltó és a tolatókamera miatt pár óra után teljesen magabiztosan vezettem. Már tervezzük a következőt." },
    { name: "Dóra", location: "Szeged", date: "2026-05-12", rating: 4, text: "Gyönyörű, igényes belső tér, jó ágy és erős zuhany. Egyetlen apróság, hogy a kerékpártartót nehezebb volt felszerelni, mint gondoltam – de telefonon azonnal segítettek." },
    { name: "Márton és Lili", location: "Pécs", date: "2026-04-21", rating: 5, text: "A kutyánkat is vihettük, ami nekünk döntő szempont volt. Hosszú hétvégét töltöttünk a Bükkben – pont olyan volt, mint a képeken." },
    { name: "Anna", location: "Bécs", date: "2026-09-08", rating: 5, text: "Wunderbar! A foglalás és a fizetés percek alatt megvolt, az emlékeztető e-mail minden fontos infót tartalmazott. Csak ajánlani tudom." },
  ],

  // ── Gyakori kérdések ────────────────────────────────────────────────────
  faq: [
    { question: "Milyen jogosítvány kell a vezetéshez?", answer: "Elég a B kategóriás jogosítvány, mert a lakóautó össztömege 3,5 tonna. A vezetőnek legalább 21 évesnek kell lennie, és legalább 2 éve kell rendelkeznie jogosítvánnyal." },
    { question: "Mit tartalmaz a bérleti díj?", answer: "Kötelező és casco biztosítást, 24 órás európai assistance-t, a teljes konyhai felszerelést, gázpalackot, WC-vegyszert, valamint napi 250 km-t. Az üzemanyag és az autópályadíjak a bérlőt terhelik." },
    { question: "Mennyi a kaució, és mikor kapom vissza?", answer: "A kaució 300 000 Ft, amit átvételkor kell kifizetni készpénzben vagy átutalással. Ha a lakóautó sérülésmentesen, tisztán és tele tankkal érkezik vissza, 7 napon belül visszautaljuk." },
    { question: "Hogyan működik az előleges fizetés?", answer: "Foglaláskor választhatod, hogy a visszaigazolás után csak a bérleti díj 30%-át utalod el előlegként. A fennmaradó részt legkésőbb 14 nappal az indulás előtt kell átutalni – erre e-mailben emlékeztetünk. Ha az indulás 16 napon belül van, a teljes összeget kell egyben kifizetni." },
    { question: "Mehetek vele külföldre?", answer: "Igen, az Európai Unió országaiba, valamint Svájcba, Norvégiába és az Egyesült Királyságba szabadon utazhatsz. Egyéb országokba előzetes egyeztetés szükséges." },
    { question: "Vihetek kisállatot?", answer: "Igen, legfeljebb 2 jól nevelt kutya vagy macska jöhet. Kérjük, ilyenkor válaszd a Kisállat-csomag extrát, hogy a következő vendégek is makulátlan autót kapjanak." },
    { question: "Mi történik, ha le kell mondanom az utat?", answer: "Az indulás előtt 60 nappal még díjmentesen lemondhatod, utána a lemondási feltételekben leírt mértékben térítjük vissza a befizetett összeget. Időpont-módosításra egyszer díjmentesen van lehetőség." },
    { question: "Hol hagyhatom az autómat az út alatt?", answer: "Az átvételi helyszínen, zárt és kamerával figyelt udvarban ingyenesen parkolhatsz a teljes bérlés ideje alatt." },
    { question: "Kell tele tankkal visszahozni?", answer: "Igen, tele tankkal adjuk át, és tele tankkal kérjük vissza. A szürke- és a WC-tartályt is ürítsd ki visszaadás előtt – ebben az átadáskor részletes útmutatót kapsz." },
  ],

  // ── Jogi szövegek ─ MINTASZÖVEGEK, élesítés előtt nézesd át jogásszal! ──
  legal: {
    operator: {
      name: "Minta Vállalkozás Kft.",
      address: "2083 Solymár, Minta utca 1.",
      taxNumber: "12345678-1-13",
      registrationNumber: "Cg. 13-09-123456",
    },
    lastUpdated: "2026-09-01",
    cancellation: {
      intro:
        "Tudjuk, hogy néha közbejön valami. A lemondást e-mailben kérjük jelezni, a visszatérítés mértéke attól függ, hány nappal az érkezés előtt érkezik meg hozzánk.",
      rules: [
        { daysBefore: 60, refundPercent: 100 },
        { daysBefore: 30, refundPercent: 50 },
        { daysBefore: 14, refundPercent: 25 },
        { daysBefore: 0, refundPercent: 0 },
      ],
      notes: [
        "A visszatérítés a befizetett bérleti díjra vonatkozik, a befizetéshez használt bankszámlára utaljuk 5 munkanapon belül.",
        "Időpont-módosítás egyszer díjmentes, ha legalább 30 nappal az érkezés előtt jelzed, és az új időpontban a lakóautó szabad.",
        "Ha a mi oldalunkon merül fel akadály (például műszaki hiba miatt), a teljes befizetett összeget visszatérítjük.",
        "A korábbi visszahozatal nem jár díjvisszatérítéssel.",
      ],
    },
    terms: [
      {
        title: "1. Általános rendelkezések",
        paragraphs: [
          "Jelen Általános Szerződési Feltételek (ÁSZF) a Minta Vállalkozás Kft. (a továbbiakban: Bérbeadó) és a weboldalon keresztül lakóautót foglaló személy (a továbbiakban: Bérlő) között létrejövő bérleti szerződés feltételeit tartalmazzák.",
          "A foglalás leadásával a Bérlő kijelenti, hogy az ÁSZF-et megismerte és elfogadja.",
        ],
      },
      {
        title: "2. A foglalás és a szerződés létrejötte",
        paragraphs: [
          "A weboldalon elküldött foglalási kérés nem minősül megrendelésnek. A Bérbeadó a kérést e-mailben visszaigazolja vagy elutasítja. A bérleti szerződés a visszaigazolás után az előleg vagy a teljes bérleti díj határidőben történő beérkezésével jön létre. Ha a befizetés a visszaigazolásban megadott határidőn belül nem érkezik meg, a Bérbeadó az időpontot felszabadíthatja.",
          "A 45/2014. (II. 26.) Korm. rendelet 29. § (1) bekezdés l) pontja alapján a meghatározott időpontra szóló gépjármű-bérleti szerződés esetén a Bérlőt nem illeti meg a 14 napos indokolás nélküli elállási jog; a lemondásra a Lemondási feltételek irányadók.",
        ],
      },
      {
        title: "3. Árak és fizetés",
        paragraphs: [
          "A bérleti díj a foglalás pillanatában a weboldalon feltüntetett napi díjakból, a takarítási díjból és a kiválasztott extrák díjából áll. Az árak bruttó árak.",
          "A Bérlő választhat a teljes bérleti díj egy összegben történő kifizetése, illetve előleg fizetése között. Előleg választása esetén a fennmaradó összeget legkésőbb az érkezés előtt 14 nappal kell megfizetni.",
          "A fizetés banki átutalással történik a visszaigazoló e-mailben megadott számlaszámra.",
        ],
      },
      {
        title: "4. Kaució",
        paragraphs: [
          "Az átvételkor 300 000 Ft kauciót kell fizetni. A kaució a jármű sérülésmentes, tiszta és tele tankkal történő visszaadása után 7 napon belül visszajár. Kár, hiányzó felszerelés vagy rendkívüli takarítás esetén a Bérbeadó a kaucióból levonást eszközölhet.",
        ],
      },
      {
        title: "5. Vezetői feltételek",
        paragraphs: [
          "A járművet csak a szerződésben megnevezett, legalább 21 éves, legalább 2 éve érvényes B kategóriás jogosítvánnyal rendelkező személy vezetheti. Az átvételkor a jogosítványt és a személyi igazolványt be kell mutatni.",
        ],
      },
      {
        title: "6. Átvétel és visszaadás",
        paragraphs: [
          "Az átvétel az érkezés napján 15:00 és 18:00 óra között, a visszaadás a távozás napján 08:00 és 11:00 óra között történik az átvételi helyszínen. Az átadás-átvételről jegyzőkönyv készül.",
          "Késedelmes visszaadás esetén minden megkezdett óra után a napi díj 10%-a, 3 órát meghaladó késés esetén egy teljes napi díj kerül felszámításra.",
        ],
      },
      {
        title: "7. Használati szabályok",
        paragraphs: [
          "A járműben dohányozni tilos. Kisállat csak előzetes jelzéssel, a Kisállat-csomag megrendelésével vihető. A jármű nem használható versenyzésre, terepen való közlekedésre, továbbbérbeadásra vagy áruszállításra.",
          "A napi 250 km-en felüli futásteljesítmény után 60 Ft/km díj fizetendő, kivéve, ha a Bérlő a Korlátlan kilométer extrát választotta.",
        ],
      },
      {
        title: "8. Biztosítás és kárügyintézés",
        paragraphs: [
          "A jármű kötelező gépjármű-felelősségbiztosítással és casco biztosítással rendelkezik. Casco-kár esetén az önrész összege megegyezik a kaució összegével. Balesetet vagy kárt haladéktalanul jelezni kell a Bérbeadónak, és szükség esetén rendőrségi jegyzőkönyvet kell felvetetni.",
        ],
      },
      {
        title: "9. Záró rendelkezések",
        paragraphs: [
          "A jelen ÁSZF-ben nem szabályozott kérdésekben a Polgári Törvénykönyv (2013. évi V. törvény) rendelkezései irányadók. Panasz esetén a Bérlő a Bérbeadó elérhetőségein, illetve a lakóhelye szerint illetékes békéltető testületnél élhet jogaival.",
        ],
      },
    ],
    privacy: [
      {
        title: "1. Az adatkezelő",
        paragraphs: [
          "Minta Vállalkozás Kft., 2083 Solymár, Minta utca 1., e-mail: hello@roadnest.hu, telefon: +36 30 123 4567.",
        ],
      },
      {
        title: "2. A kezelt adatok köre",
        paragraphs: [
          "Név, e-mail-cím, telefonszám, lakcím, születési dátum, a jogosítvány száma, kiállító országa és érvényességi adatai, az utazók száma, a foglalás adatai, valamint a befizetések adatai. Bankkártyaadatokat nem kezelünk.",
        ],
      },
      {
        title: "3. Az adatkezelés célja és jogalapja",
        paragraphs: [
          "A bérleti szerződés megkötése és teljesítése (GDPR 6. cikk (1) b) pont), a számviteli kötelezettségek teljesítése (GDPR 6. cikk (1) c) pont), valamint a jármű védelméhez fűződő jogos érdek (GDPR 6. cikk (1) f) pont).",
        ],
      },
      {
        title: "4. Adatfeldolgozók",
        paragraphs: [
          "Formspree Inc. (a foglalási űrlap továbbítása e-mailben), GitHub Inc. (a weboldal tárhelye). Az adatfeldolgozók az adatokat kizárólag a szolgáltatás nyújtásához használják.",
        ],
      },
      {
        title: "5. Megőrzési idő",
        paragraphs: [
          "A foglalási adatokat a szerződés megszűnésétől számított 5 évig, a számviteli bizonylatokat 8 évig őrizzük meg. A meg nem valósult foglalási kérések adatait 30 nap után töröljük.",
        ],
      },
      {
        title: "6. Jogaid",
        paragraphs: [
          "Kérheted az adataidhoz való hozzáférést, azok helyesbítését, törlését vagy kezelésük korlátozását, valamint tiltakozhatsz az adatkezelés ellen. Panasszal a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH, 1055 Budapest, Falk Miksa utca 9–11., www.naih.hu) fordulhatsz.",
        ],
      },
      {
        title: "7. Sütik",
        paragraphs: [
          "Az oldal csak a működéshez szükséges böngészőtárhelyet használja: megjegyzi a sötét mód és a pénznem beállítását, a félbehagyott foglalási űrlap adatait pedig csak az adott böngészőfül bezárásáig őrzi meg. Követő vagy hirdetési sütiket nem használunk. A térképet az OpenStreetMap szolgáltatja.",
        ],
      },
    ],
  },

  // ── Keresőoptimalizálás ─────────────────────────────────────────────────
  seo: {
    title: "RoadNest – prémium lakóautó-bérlés Budapest mellől",
    description:
      "Bérelj négyszemélyes, teljesen felszerelt lakóautót zuhannyal, konyhával és napelemmel. Online foglalási kérés, gyors visszaigazolás, rugalmas fizetés.",
    keywords: ["lakóautó bérlés", "lakóautó kölcsönzés", "campervan bérlés", "lakóbusz bérlés Budapest", "kastenwagen bérlés", "RoadNest"],
  },
})


