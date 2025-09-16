# 🕊️ Minneslund - Digital Minneslundsplattform

**[English version below](#english)**

> **NFC-aktiverade digitala minneslundar för moderna begravningsbyråer**

Minneslund är en produktionsklar digital plattform som binder samman fysiska gravplatser med rika digitala minnessidor. Projektet drivs av Next.js 14, Sanity CMS och Prisma och levererar en komplett upplevelse för både familjer och begravningsbyråer – från minneskort och gästböcker till prenumerationer och affärsanalys.

## Svenska

### Översikt
- Fullstack Next.js-applikation med App Router, serverkomponenter och Tailwind-baserad design
- Sanity CMS för memorialinnehåll kombinerat med Prisma/PostgreSQL för användare, provperioder och prenumerationer
- NextAuth (e-post/Google) för autentisering och rollbaserade behörigheter
- Stripe-integration för Minnesbricka-planer samt bulk- och adminflöden för begravningsbyråer
- PWA-funktioner med service worker, offline-synk och stöd för NFC/QR-taggar

### Live-deployment
- **🌐 Live-sajt**: [eternal-capsule-alfjhbvch-simon-anderssons-projects-8e7f4176.vercel.app](https://eternal-capsule-alfjhbvch-simon-anderssons-projects-8e7f4176.vercel.app)
- **🚀 Hosting**: Vercel (Next.js 14 optimerad)
- **🗄️ Datakällor**: Sanity CMS + PostgreSQL (Prisma)
- **📅 Senaste deployment**: 24 december 2025

### Centrala funktioner
- **Minnesprofiler och innehåll**: bildgallerier, tidslinjer, minneskort och omfattande memorialsidor med svensk copy
- **Gästbok och interaktion**: moderering, reaktioner, offline-kö och rate-limiting för att skydda API:et
- **NFC & QR**: generering av Minnesbricka-ID, NFC-verktyg i Sanity Studio och loggning av skanningar
- **Prenumerationer & betalningar**: Stripe-betalflöden, provperioder, planbegränsningar och kontohantering på `/account`
- **Admin och analys**: dashboard för användning, affärsnyckeltal, export av memorialdata och gästbokssammanställningar
- **PWA & offline**: service worker-registrering, manifest, bakgrundssynk och komponenter som bevakar installationsstatus
- **Kartor och platsvisning**: React-Leaflet-kartor med stöd för platsinformation vid minnesplatser

### Tekniköversikt
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion, Headless UI-komponenter
- **CMS**: Sanity med skräddarsydda scheman (`src/sanity`) och Studio på `/studio`
- **Databas**: Prisma med PostgreSQL (SQLite-stöd för lokal utveckling via `DATABASE_URL="file:./dev.db"`)
- **Autentisering**: NextAuth (credentials + Google OAuth) och middleware-skyddade rutter
- **Betalningar & ekonomi**: Stripe SDK, webhooks, planvalidering och export av faktureringsdata
- **Kommunikation**: Resend för e-post, automatiska notiser och mallar för gästbokshändelser
- **Observability**: Grundläggande analysmoduler, Sentry-konfiguration och rate-limiting via Redis (valfritt)

### Kom igång
1. Klona repositoriet och gå in i katalogen
   ```bash
   git clone https://github.com/your-org/eternal-capsule-web
   cd eternal-capsule-web
   ```
2. Installera beroenden och generera Prisma-klienten
   ```bash
   npm install
   npx prisma generate
   ```
3. Skapa din miljöfil
   ```bash
   cp env.example .env.local
   # Fyll i värden för minst NEXTAUTH_SECRET och DATABASE_URL innan produktion
   ```
4. Starta utvecklingsservern
   ```bash
   npm run dev
   ```
5. Öppna [http://localhost:3000](http://localhost:3000) och logga in eller skapa konto via `/auth`.

### Miljövariabler
- **Sanity**: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN` (krävs för skrivoperationer i produktion, mockas i utveckling)
- **Autentisering**: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Databas**: `DATABASE_URL` (PostgreSQL för produktion, SQLite rekommenderas lokalt)
- **Betalningar**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_MINNESBRICKA_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- **E-post**: `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`
- **Funktioner & säkerhet**: gästboksflaggor, rate-limiting, Redis-konfiguration m.m. finns dokumenterade i [`env.example`](./env.example)

### Utvecklarflöde och tester
- `npm run dev` – starta utvecklingsservern
- `npm run lint` / `npm run lint:fix` – ESLint med Next.js-regler
- `npm run type-check` – TypeScript-kontroller
- `npm run test` / `npm run test:watch` / `npm run test:coverage` – Jest-komponent- och enhetstester
- `npm run test:e2e` / `npm run test:e2e:ui` – Playwright end-to-end-svit
- `npm run validate` – samlad kontroll (typer, lint, tester)
- `npm run validate:full` – validering inklusive e2e-testning
- `node scripts/validate-env.js` – snabb kontroll av miljövariabler
- `npm run build` – produktionsbuild (körs av Vercel)

### Data och innehåll
- **Sanity CMS**: Alla memorialer, gästboksinlägg och media lagras i Sanity. Utan `SANITY_API_TOKEN` används realistiska mock-svar för lokal utveckling (`src/lib/sanity.ts`).
- **Prisma + PostgreSQL**: Hanterar användare, prenumerationer, provperioder, NFC-taggar och kontoadministration. Modeller definieras i `prisma/schema.prisma`.
- **Bulkflöden**: API:er för CSV-import/export, Zip-generator för memorialpaket och automatiska Minnesbricka-ID:n stödjer begravningsbyråernas processer.

### Ytterligare resurser
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) – fördjupad arkitektur, felsökning och versionsberoenden
- [docs/authentication.md](./docs/authentication.md) – NextAuth-konfiguration och rollmodeller
- [docs/database.md](./docs/database.md) – databasstrategi och schemaöversikt
- [docs/admin-guide.md](./docs/admin-guide.md) – administrations- och analysvyer
- [docs/api.md](./docs/api.md) – API-rutter inklusive bulkimport och gästboksendpoints
- [docs/testing.md](./docs/testing.md) – teststrategier, scenarier och e2e-täckning
- [docs/user-guide.md](./docs/user-guide.md) – flöden för familjer och begravningsbyråer

## English

### Overview
Minneslund is a production-ready memorial platform built with Next.js 14, Sanity CMS and Prisma. It links physical memorial plaques (Minnesbrickor) with rich digital pages that include guestbooks, media galleries, NFC/QR access and subscription-based business tooling for funeral homes.

### Live deployment
- **Live site**: [eternal-capsule-alfjhbvch-simon-anderssons-projects-8e7f4176.vercel.app](https://eternal-capsule-alfjhbvch-simon-anderssons-projects-8e7f4176.vercel.app)
- **Hosting**: Vercel (Next.js 14)
- **Data stores**: Sanity CMS + PostgreSQL via Prisma

### Key capabilities
- Memorial creation, media galleries, curated Swedish copy and printable memorial cards
- Moderated guestbook with reactions, offline queueing and rate-limited API endpoints
- NFC/QR integrations, Minnesbricka ID generation and Sanity Studio tooling
- Subscription management, Stripe billing, trials and protected dashboards for `/dashboard` and `/account`
- Admin analytics, export utilities, CSV bulk import and reporting for funeral homes
- PWA enhancements including service worker registration, background sync and install prompts

### Getting started
```bash
git clone https://github.com/your-org/eternal-capsule-web
cd eternal-capsule-web
npm install
npx prisma generate
cp env.example .env.local   # adjust secrets, Stripe/Sanity keys, etc.
npm run dev
```

### Developer workflow
- `npm run lint`, `npm run type-check`, `npm run test`, `npm run test:e2e`
- `npm run validate` / `npm run validate:full` for pre-flight checks
- `node scripts/validate-env.js` to verify required environment variables
- `npm run build` to produce a production bundle

### Documentation
Additional deep dives live alongside the code base:
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- [`docs/`](./docs) for API, database, authentication, testing, admin dashboard and user onboarding guides
- [`env.example`](./env.example) for the full environment variable matrix

## Contributing
Pull requests are welcome. Kör `npm run validate` innan du skickar in för att säkerställa att typer, lint och tester passerar.

## License
Detta projekt distribueras under MIT-licensen. Se [LICENSE](./LICENSE) för detaljer.
