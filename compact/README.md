# COMPACT — E-commerce Store (Shell)

A modern clothing store shell. The full flow works end-to-end
(shop → product → bag → checkout → confirmation → order tracking),
but all content is placeholder — ready to be filled in.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Homepage — hero, category tiles, featured products |
| `shop.html` | Catalogue with category filters and sorting |
| `product.html` | Product detail — gallery, sizes, quantity, add to bag |
| `cart.html` | Shopping bag |
| `checkout.html` | Contact, delivery address, delivery method, payment |
| `confirmation.html` | Order confirmed + order number |
| `track.html` | Order tracking with status timeline |

## Where to edit content (when ready)

1. **Products** — `js/store.js`, the `PRODUCTS` array at the top.
   Add real names, categories, prices (ZAR) and sizes.
2. **Images** — every grey block labelled "Image" / "Category image" /
   "Hero image" is a placeholder waiting for photography.
3. **Brand copy** — hero text, brand strip and footer text in `index.html`.
4. **Delivery pricing** — `js/store.js`, the `STORE` object
   (shipping options + free-delivery threshold).
5. **Payment** — `checkout.html` has a marked placeholder where a payment
   provider (PayFast, Yoco, Stripe, …) will be integrated.
6. **Colours / fonts** — `css/store.css`, the `:root` design tokens.

## Notes

- Cart and orders are stored in the browser (`localStorage`) so the whole
  flow is testable with no backend. Order tracking advances one stage every
  12 hours as a demo; a real backend/courier API replaces this later.
- No build step — plain HTML/CSS/JS. Open `index.html` in a browser.
