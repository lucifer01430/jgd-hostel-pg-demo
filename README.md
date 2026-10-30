# Jaigurudev Hostel PG & Kitchen — storefront demo

An unofficial, frontend-only demo website, built to show the owner how the business could
move from daily Instagram menu posts to its own branded storefront. It is **not** a live
ordering platform: every order or enquiry opens WhatsApp with a ready-made message, and the
customer sends it themselves.

## Files

```
index.html                 Single-page storefront (semantic HTML; inline SVG icon sprite)
css/style.css              All styles: mobile-first, self-hosted fonts, animations, reduced-motion
js/data.js                 Business constants, image URLs (centralised), demo meals and menus
js/i18n.js                 Hindi / English dictionary (Hindi default)
js/script.js               Interactions: preloader, nav, tabs, filters, modals, cart, WhatsApp, form, FAQ
assets/logo/               Original logo, round-masked only (not redrawn) + favicons
assets/fonts/              Rozha One + Mukta (Devanagari + Latin), woff2, SIL Open Font License
assets/img/thali-illustration.svg   Local fallback artwork, shown if a photo can't load
```

The data and the dictionary sit in their own files, separate from `script.js`, so menus,
prices and text can be changed without touching the logic.

## Run it

- **Simplest:** double-click `index.html`. Everything works from `file://`.
- **Local server (recommended for testing on a phone over Wi-Fi):**
  `python3 -m http.server 8080` in this folder, then open `http://<your-ip>:8080`.

No build step, no backend, no database, no npm install.

## What works

- Preloader. It hides when the page loads and never waits more than about 2 s. If JS fails, a CSS fallback hides it anyway.
- Sticky header that shrinks on scroll, highlights the current section, and turns into a hamburger panel on mobile.
- Hindi/English switcher (in the header, mobile menu and footer). It translates the whole UI: nav, buttons, cards, cart, modals, FAQ, form labels, validation messages and the WhatsApp messages. The choice is saved, and the cart is kept when switching.
- Today's Menu with Morning/Evening tabs (arrow keys work), the visitor's local date, and a clear "Demo menu" label.
- Catalogue: 6 demo meals, category filters (All / Today's Thali / Morning / Evening / Special) with animated changes. Each card has View Details and Order Now.
- Meal details modal: quantity stepper, live total, Add to Order, WhatsApp Order. It closes with Esc or the backdrop, traps focus, and returns focus to the button that opened it.
- Cart drawer: adjust quantities, remove items, empty state, choose Morning/Evening/Either. Name and address are optional. Total = plates × ₹90. Checkout goes to WhatsApp.
- WhatsApp messages: sent to `wa.me/916307833638`, properly URL-encoded. The script never builds a blank message. Opening WhatsApp doesn't place an order: the customer still has to press send.
- Bulk-order enquiry modal: name, event and location are required; date and plate count are checked if filled in. Errors show inline, get read out by screen readers, and the cursor jumps to the first problem field. The enquiry then goes out as a WhatsApp message.
- FAQ accordion, scroll-reveal (IntersectionObserver), mobile bottom order bar (hidden over the footer and when a modal is open).
- Accessibility: skip link, visible focus, labelled controls, `aria-pressed` and `aria-expanded` on toggles, tab roles, `prefers-reduced-motion` respected.

## What is illustrative (replace before going live)

- **Menus.** All meal combinations come from the kitchen's own Instagram posts. They are examples, not a live daily menu. ₹90/plate is the only price used anywhere.
- **Photos.** Royalty-free Unsplash photos (fuseviews, Karthik B K, Usman Yousaf, Chetanya Sharma, Unsplash contributor). Each was checked against its Unsplash page for vegetarian content. They are **not** this kitchen's food and are labelled "Illustrative photo" on the page. Swap in the owner's real photos via `js/data.js → IMAGES`.
- **Hostel & PG section.** Marked "Coming soon". It lists no rooms, rent or facilities, and has no booking.
- **Not included on purpose:** opening hours, delivery charges, delivery time promises, ratings, reviews, map coordinates. None of these were in the supplied material. The site asks visitors to confirm on WhatsApp instead.
- **SEO.** `og:image` is a relative placeholder and `<meta name="robots" content="noindex">` is set for the demo. Change both when going live.

## External dependencies

- None needed to run the site. Fonts and icons (Bootstrap Icons, MIT, inlined) are bundled.
- `images.unsplash.com` is used for photos at runtime. If it's unreachable, the local illustration shows instead.
- `wa.me` and `instagram.com` links.

## Manual test checklist

1. Load the page: preloader fades quickly, hero animates in, no console errors.
2. Click every nav link (desktop and mobile hamburger). Each lands below the sticky header.
3. Switch हिंदी ⇄ English: all text changes, cart count and contents stay the same, and the choice survives a reload.
4. Menu tabs: click and arrow keys switch Morning/Evening, and the date shows today.
5. Filters: All 6 · Today 2 · Morning 3 · Evening 3 · Special 1.
6. View Details: modal opens with content, quantity changes the total, Esc closes it and focus returns.
7. Order Now: drawer opens. Use +/−/remove (2 plates → ₹180). Empty the cart and you should see the empty state and no checkout button.
8. Checkout: WhatsApp opens with meal, quantity, ₹90 per plate, total, preferred time, and name/address if filled in.
9. Bulk enquiry: submitting empty shows 3 errors; plates = 0 is rejected; a valid form opens WhatsApp.
10. Resize to 360 / 390 / 768 / 1024 / 1440: no sideways scrolling, and the mobile bar never covers the footer or modals.
11. Block `images.unsplash.com` in DevTools: the illustration replaces each photo.
12. Turn on OS "reduce motion": content shows without animation.
