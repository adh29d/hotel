# RMS Pay — Guest Payment Portal (Demo)

A clickable frontend mockup of an in-room express checkout experience.
A guest scans a QR on the back of their door, lands on `/room/[roomNumber]`,
sees their balance, optionally extends checkout and orders coffee + pastries,
pays in one go, and leaves a review.

This is a demo only — there is no backend, no real payment processing, and no
real RMS integration. Everything is wired to local mock data so the full flow
feels real on a phone.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/demo`.

## What to click

- `/demo` — a hidden index of four scenarios.
- `/room/204` — $87 balance, standard checkout.
- `/room/312` — $0 balance (can still buy coffee or extend checkout).
- `/room/415` — $312 balance with restaurant + minibar.
- `/room/508` — already paid (coffee + late checkout only).

The full flow on each room: landing → payment → confirmation + review.

## Tech

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Fonts via `next/font`: Fraunces (display) + Inter (body)
- React Context for in-memory order state across pages (refresh resets — by design)

## Where things live

- `lib/mockData.ts` — single source of truth: reservations, coffee/pastry menu,
  late-checkout pricing config. Edit this to tweak demo prices/scenarios.
- `lib/OrderContext.tsx` — order state + computed totals.
- `app/demo/page.tsx` — scenario picker.
- `app/room/[roomNumber]/page.tsx` — landing (balance + slider + coffee + total).
- `app/room/[roomNumber]/payment/page.tsx` — Apple Pay / Samsung Pay / card.
- `app/room/[roomNumber]/confirmation/page.tsx` — success + receipt + review flow.
- `components/` — `LateCheckoutSlider`, `CoffeeOrder`, `QuantityStepper`,
  `AnimatedTotal`, `SuccessTick`, `ReviewCard`.

## Mocked vs. production

| Area | Today (demo) | Production |
| --- | --- | --- |
| Reservation lookup | Static `reservations` map keyed by room | RMS API: pull guest, nights, charges by room + token |
| Itemised charges | Coarse "Restaurant", "Minibar" rows | Itemised line-items from SWIFTPOS / RMS folio |
| Payment | Mock buttons + 2s spinner | Stripe / Adyen / hotel PSP — Apple Pay / Samsung Pay / card |
| Late checkout | Local price config, "subject to availability" | Availability check against housekeeping; post fee to folio |
| Coffee order | Local menu config, fake pickup time | Kitchen ticketing system (printed docket / KDS) on payment success |
| QR token | Ignored | Signed token tied to room + check-in window |
| High-rating review | Mock "Post to Google" → thank-you | Deep link to Google Reviews for the property |
| Low-rating feedback | Mock "Send to GM" → thank-you | Email to GM (and/or guest experience tool like Revinate) |

## Out of scope

- Real RMS / SWIFTPOS integration
- Real payment processing (PCI, 3DS, refunds, receipts)
- QR generation, signed tokens, auth
- Email sending
- Real Google review posting
- Real kitchen ticketing
