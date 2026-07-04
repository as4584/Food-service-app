# Shore Eats

A New Jersey-focused food delivery prototype — browse restaurants, build a cart, check out, and watch an order move through delivery, all backed by a real API.

This is an early-stage prototype, not a finished commercial product. It's being built to demo for a prospective client, to prove out the core ordering flow, and as the foundation for a production platform down the road.

---

## Project Journal

This section is a running log of the project's actual progress, kept up to date as work happens. Newest-at-the-bottom, so it reads top-to-bottom like a diary.

**2026-07-03 — The lead.**
A prospective client — a business owner interested in launching a DoorDash/Uber Eats-style delivery service — asked for something he could hold and tap through the next day, to get a feel for what a real product could look like. He wasn't looking for something live or production-ready yet: just a working, functional-feeling taste of the idea, scoped to New Jersey, that wouldn't actually process real orders or payments. That request is what started this repository.

**2026-07-03 — First build.**
Built the first working version overnight: a FastAPI + SQLite backend (restaurants, menus, orders) and an Expo Router mobile app (restaurant list → menu → cart → checkout → order tracking). Seeded demo data with six fictional NJ shore-town restaurants (Point Pleasant Beach, Asbury Park, Belmar, Seaside Heights, Red Bank, Long Branch) so the demo would feel local and specific rather than generic. Runs in vanilla Expo Go — no custom native build required — and is reachable during a demo via Expo's tunnel plus a Cloudflare Quick Tunnel for the API.

**2026-07-04 — Backend deep dive.**
Went back through the backend looking for bugs and incomplete edges instead of just the happy path. Found and fixed: order timestamps silently losing their UTC marker on the way out of SQLite, a CORS default that didn't match the port the mobile app actually runs on, an arbitrary per-item quantity cap that had no matching limit on the client (a real way the demo could break mid-pitch), and a seed script that wouldn't backfill menu items if a previous run got interrupted partway through. Ran a full pass of edge cases (bad IDs, empty carts, cross-restaurant menu items, zero quantities) against the live server to confirm the fixes held.

**2026-07-04 — Pushed to GitHub.**
Uploaded the initial commit. `.env` files, the local SQLite database, and all dependency folders are excluded — nothing sensitive went up.

**2026-07-04 — README + live demo link.**
Added this journal and a scannable QR code so the current build can be opened in Expo Go directly from this page.

**2026-07-04 — Real restaurant photos + faster demo pacing.**
Replaced the emoji-only restaurant cards with real photos (sourced via web search, Unsplash License — free for commercial use, no attribution required), one per restaurant, matched to its actual cuisine. Also sped up the simulated order-status tracker from a ~6-minute cycle down to ~15 seconds end-to-end, so a live demo doesn't require standing around waiting for "Delivered" to show up.

**2026-07-04 — Photos for every menu item, and a decision not to chase true 3D.**
Sourced and verified a real, dish-matched photo (Unsplash License) for all 33 distinct menu items across the six restaurants — not just generic food stock photos, but ones that actually match each dish (e.g. a real tomato pie photo for the Jersey Tomato Pie, real oysters for the raw bar). Also explored adding a "driver en route" 3D graphic to the order-tracking screen. Before installing anything, checked compatibility of `@react-three/fiber` + `expo-gl` against this project's Expo SDK version and found documented cases of that exact combination breaking on real devices from dependency mismatches, with no confirmed compatibility info yet for the SDK version this app is on. Rather than risk a blank/crashed screen during an actual pitch, went with a 2D animated route map instead — an SVG path from restaurant to delivery address with a vehicle icon animating along it, built entirely on packages already in the project (`react-native-svg`, `react-native-reanimated`), synced to the same order-status data driving the stepper. Verified with a full typecheck and bundle export; on-device confirmation in Expo Go is still pending.

---

## Why This Exists

Local restaurants routinely give up a large cut of every order — and the direct relationship with their own customers — to third-party delivery marketplaces. This project is an attempt to give small businesses another option: ordering software they can run themselves, starting simple (a single restaurant) before growing into something that supports many.

The near-term goal is narrow on purpose: prove the core ordering experience is good enough to show a real prospective client, starting with a single restaurant, before any of the harder platform problems (multi-vendor onboarding, drivers, payments) get tackled.

---

## Features

### ✅ Current
- Browse a seeded list of NJ restaurants (cuisine, rating, ETA, price range), each with a real photo
- View full restaurant menus grouped by category, with a real photo per dish (33 menu items, individually sourced to match)
- Add/remove items and adjust quantities in a cart
- Checkout with editable customer name and delivery address
- Orders are created and persisted through a real backend API — not mocked on the client
- Automatic order-status progression (Placed → Preparing → Out for Delivery → Delivered), computed from elapsed time since the order was placed (~15 seconds end-to-end for demo pacing)
- An animated 2D route map on the tracking screen — a vehicle icon moving from restaurant to delivery address, synced to the same order-status data
- NJ sales tax (6.625%) and delivery fee calculated server-side
- Runs directly in Expo Go — no custom native build required

### 🚧 In Development
- Backend hardening — validation, edge cases, and correctness fixes as the API surface grows
- Demo content refinement based on pitch feedback

### 💡 Planned
- Restaurant self-onboarding (so an owner can set up their own menu without a developer)
- Real payment processing
- Driver / rider app
- Live GPS order tracking (today's tracking is a simulated, time-based stepper — not real GPS)
- Push notifications
- Owner analytics dashboard
- User accounts / authentication (there is currently no login — the app opens straight to a fixed demo customer)
- Multi-restaurant marketplace support beyond the current demo seed data
- Production hosting (today this only runs locally plus a temporary tunnel — nothing is deployed)

---

## Live Demo

Scan this in the **Expo Go** app to open the current build directly on your phone:

![Scan in Expo Go](docs/demo-qr.png)

This only works while the development machine and its tunnel are actually running — it is not a hosted, always-on link. As of **2026-07-04** it points to:

```
exp://h0asava-lexmakesit-8082.exp.direct
```

This section will be updated (or removed) as the demo setup changes.

---

## Tech Stack

**Mobile**
- Expo SDK 54, React Native 0.81, Expo Router (file-based navigation)
- TypeScript
- React Native Reanimated (drives the animated order-status stepper)

**Backend**
- FastAPI + Pydantic
- SQLAlchemy + Alembic (migrations)
- SQLite for local/demo persistence

**Demo tooling**
- Expo's built-in tunnel (`@expo/ngrok`) to reach the mobile bundler
- Cloudflare Quick Tunnel to expose the local API during a live demo

---

## Project Structure

```
backend/
  app/
    routers/       REST endpoints (restaurants, orders)
    models/        SQLAlchemy models
    schemas/       Pydantic request/response schemas
    services/      Business logic (order-status simulation)
  alembic/         Database migrations
  seed_dev.py      Seeds demo restaurants + menus

mobile/
  app/             Expo Router screens (list, menu, cart, checkout, order tracking)
  components/      Reusable UI (restaurant card, menu row, cart bar, status stepper)
  context/         Cart state
  services/        API client
  theme/           Design tokens

docs/
  demo-qr.png      Scannable link to the current live demo build
```

---

## Roadmap

- [x] Browse restaurants & menus
- [x] Cart & checkout flow
- [x] Orders persisted through a real backend
- [x] Simulated order-status tracking
- [ ] Restaurant self-onboarding dashboard
- [ ] Real payment processing
- [ ] Driver / rider app
- [ ] Live GPS order tracking
- [ ] Push notifications
- [ ] Owner analytics dashboard
- [ ] User accounts / authentication
- [ ] Multi-restaurant marketplace support
- [ ] Production deployment / hosting

---

## Contributing

This is a solo, actively developed prototype tied to a specific client pitch — it isn't yet set up for outside contributions. That may change once the core flow is validated and the project moves toward a real multi-restaurant platform.

---

## License

No license has been chosen yet. Until one is added, treat this repository as all rights reserved.
