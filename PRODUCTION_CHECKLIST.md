# NJ Eats — Production Readiness Checklist

> **Goal:** a fully functional food-delivery platform — customer app, restaurant
> (merchant) app, and driver app — backed by a real server, ready to sell and
> operate as a production product for North Jersey restaurants.
>
> This is a **living document**. Update the checkboxes as things land. Each item
> is marked with its status so anyone can see at a glance what's left.
>
> Legend: `[x]` done · `[~]` in progress / partial · `[ ]` not started

Last updated: 2026-07-07

---

## 0. What exists today (baseline)

- [x] Customer app: browse real NJ restaurants, menus, cart, checkout, order tracking
- [x] "Spin the Wheel" mood-based discovery with nearby sorting
- [x] Location-aware nearest-restaurant sorting + distances
- [x] NJ Eats brand: loading screen, logo, app icon, palette
- [x] FastAPI backend (restaurants, menus, orders) + SQLite + Alembic migrations
- [x] Backend test suite (pytest) + mobile smoke test (Playwright)
- [x] Real, persisted orders with tax/total calculation

---

## 1. Core order lifecycle (the backbone) — IN PROGRESS TONIGHT

- [~] Real, authoritative order status (not time-simulated)
- [~] Merchant actions: **accept / reject / mark ready**
- [~] Driver actions: **pick up / mark delivered**
- [~] Order state machine with validated transitions (reject invalid moves)
- [~] Audit timestamps (accepted_at, ready_at, out_for_delivery_at, delivered_at)
- [~] Customer tracking reflects real status, including "declined" + driver name
- [ ] Real-time push instead of polling (WebSocket / SSE) — polling for now
- [ ] Order cancellation by customer (before accept)
- [ ] Estimated prep/delivery time surfaced from merchant

## 2. Apps / surfaces

- [x] Customer app (Expo / React Native)
- [~] Restaurant (merchant) app — accept/reject/ready queue
- [~] Driver app — available deliveries + active delivery
- [ ] Split merchant & driver into their own installable apps (currently routes
      inside the customer app for demo speed; separate builds before launch)
- [ ] Owner/admin web dashboard (sales, order history, menu editing)

## 3. Accounts & auth (NOT STARTED — required for production)

- [ ] Customer accounts (email/phone, social login)
- [ ] Restaurant staff accounts scoped to their restaurant
- [ ] Driver accounts + onboarding / background-check gate
- [ ] JWT/session auth on the API (every write endpoint is currently open)
- [ ] Role-based authorization (customer vs merchant vs driver vs admin)
- [ ] Password reset / phone OTP

## 4. Payments (NOT STARTED — required for production)

- [ ] Stripe (or similar) integration — real card capture
- [ ] Payment intent created at checkout, captured on merchant accept
- [ ] Refunds on rejected/cancelled orders
- [ ] Restaurant payouts (Stripe Connect) + platform commission split
- [ ] Driver payout / tip handling
- [ ] PCI: never store card data ourselves (delegate to Stripe)

## 5. Notifications

- [ ] Push notifications (Expo Push / FCM / APNs)
- [ ] Merchant: "New order came in" alert (sound + push)
- [ ] Customer: accepted / out-for-delivery / delivered pushes
- [ ] Driver: "New delivery available" alert
- [ ] SMS fallback (Twilio) for merchants without the app open

## 6. Real-time & location

- [ ] Live driver GPS tracking on the customer map (currently simulated)
- [ ] WebSocket/SSE channel for order + location updates
- [ ] Geocoding of delivery addresses (validate + lat/lng)
- [ ] Delivery-radius enforcement per restaurant

## 7. Data & backend hardening

- [ ] Move from SQLite → managed Postgres (Supabase / RDS / Neon)
- [ ] Connection pooling + proper migrations in CI (not on app startup)
- [ ] Input validation & rate limiting on all endpoints
- [ ] Idempotency keys on order creation (avoid double-charge/double-order)
- [ ] Soft deletes + audit log
- [ ] Backups + restore runbook

## 8. Infra / deploy / ops

- [ ] Production API hosting (Fly.io / Render / Railway / a droplet) w/ HTTPS
- [ ] Environment config via Doppler (secrets manager) — no secrets in repo
- [ ] CI/CD (GitHub Actions): run tests, build, deploy on green
- [ ] Error tracking (Sentry) for backend + mobile
- [ ] Uptime monitoring + health-check alerts
- [ ] Structured logging + request tracing

## 9. Mobile release

- [x] `eas.json` build profiles (development / preview / production)
- [x] iOS location permission string + non-exempt-encryption flag (app.json)
- [x] Android location permissions declared
- [ ] `eas init` + link an EAS project (needs Expo login — Alex)
- [ ] First production iOS build (`eas build -p ios --profile production`)
- [ ] App Store + Play Store listings (screenshots, copy, privacy labels)
- [ ] Apple/Google developer accounts + signing (needs Alex)
- [ ] Over-the-air update channel (EAS Update)
- [ ] Deep links / universal links

## 10. Legal / trust / business

- [x] Privacy policy page (`docs/legal/privacy.html` — host on lexmakesit.com)
- [x] Support page (`docs/legal/support.html`) — App Store requires a support URL
- [ ] Terms of service
- [ ] Restaurant merchant agreement + commission terms
- [ ] Driver contractor agreement
- [ ] Food-handling / liability disclaimers
- [ ] Support contact + refund policy
- [ ] Business entity, insurance, sales-tax remittance

## 11. Quality gates (keep green before every ship)

- [x] Backend pytest suite
- [x] Mobile Playwright smoke test
- [~] Lifecycle/transition tests (added tonight)
- [ ] End-to-end test across customer → merchant → driver
- [ ] Load test on order creation
- [ ] Accessibility pass on the customer app

---

---

## Reference: Enatega (open-source multivendor) — what we take, what we don't

`github.com/enatega/food-delivery-multivendor` is the same architecture we're
building (customer app, restaurant app, rider app — all React Native/Expo — plus
an admin dashboard and a customer web app). It validates our direction.

**Decision (ordo):** its *frontend* is MIT, but its **backend is proprietary/paid**
(Node + Express + **GraphQL** + **MongoDB**). We already have a working **FastAPI**
backend, so we do **not** adopt theirs — we'd be paying for a black box or
rebuilding what we have. Instead we borrow their **MIT frontend patterns** and the
specific libraries a food app needs for the store:

- `expo-notifications` (+ Firebase) — push for new orders / status
- `@stripe/stripe-react-native` — card payments
- Google Places autocomplete — real, geocoded delivery addresses
- `expo-auth-session` — OAuth incl. **Sign in with Apple** (App Store 4.8)
- `@sentry/react-native` — crash/error reporting

Do not copy their code wholesale into our repo (licensing + backend mismatch);
use it as a reference implementation.

---

## App Store 2-day sprint (goal: submittable build)

Ordo note: after every change run the gate — backend `pytest`, mobile `tsc` +
`expo export` + Playwright smoke — before moving on. That's what keeps features
from breaking each other.

### Blockers only Alex can unblock (needed before actual submission)
- [ ] Apple Developer Program account ($99/yr) + App Store Connect app record
- [ ] Expo account login for `eas init` / `eas build`
- [ ] A host for the API (Fly.io / Render / Railway / the existing droplet) + a
      managed Postgres — **Apple's reviewers must reach a real server, not a
      laptop tunnel.** This is the #1 hard blocker.
- [ ] Stripe account + keys (store in Doppler)
- [ ] Point `privacy.html` / `support.html` at real URLs on lexmakesit.com

### Day 1 — make it real (code side, no external creds)
- [x] Real order lifecycle + merchant/driver apps + new-order alert
- [x] iOS/Android permission config + eas.json + privacy/support pages
- [ ] Config-driven API base URL + a `staging`/`prod` switch (no hardcoded tunnel)
- [ ] `expo-notifications`: register push token, store on backend, send on new order
- [ ] Lightweight auth: phone/email for merchant + driver (customer stays guest v1)
- [ ] Postgres-compatible models verified (no SQLite-only assumptions)

### Day 2 — build, harden, submit
- [ ] Stripe checkout (test mode) end-to-end
- [ ] Sentry wired (backend + mobile)
- [ ] `eas build -p ios --profile production` → TestFlight
- [ ] App Store listing: screenshots (have brand), description, privacy labels
- [ ] Reviewer demo account + notes (guest customer + how to reach merchant view)
- [ ] Final gate green, submit for review

---

## Suggested path to first paid launch (Master Pizza of Clifton)

A pragmatic MVP-to-revenue slice, in order:

1. **Order lifecycle** (tonight) — real accept/reject/deliver.
2. **Merchant app polish + push** — the owner must reliably hear new orders.
3. **Auth (merchant + driver only to start)** — customers can stay guest at first.
4. **Payments (Stripe)** — even cash-on-delivery works for a single-restaurant pilot,
   but card payment is what makes it feel real.
5. **Managed Postgres + hosted API** — get off tunnels/SQLite.
6. **One real driver + one real restaurant pilot**, then expand the roster.
