TORVIA — Premium Coffee & Coorg Honey
=====================================

Files
-----
index.html   Page structure (hero, shop, story, how-it-works, FAQ, cart drawer)
style.css    All styling
script.js    Cart, two-step checkout, WhatsApp order
assets/      Product photos + logo files


BEFORE YOU GO LIVE — 1 THING TO CHANGE
--------------------------------------
Open script.js, line 8, and replace the placeholder with your business
WhatsApp number (country code + number, digits only, no + or spaces):

    const WHATSAPP_NUMBER = '919XXXXXXXXX';   <-- change this
    e.g. for India:  '919876543210'

Nothing else needs editing to launch.


LOGO
----
assets/torvia-logo.svg        brown wordmark  (used in the header)
assets/torvia-logo-light.svg  cream wordmark  (used in the footer)
assets/torvia-mark.svg        square cream tile (favicon / social preview)
assets/torvia-logo.png        the old logo — kept as a backup, not used

The SVG wordmark is built from real vector outlines, so it stays perfectly
sharp at any size and on any screen. If you ever get the original brand
logo file, just overwrite torvia-logo.svg / torvia-logo-light.svg (or
change the two <img src="..."> tags in index.html).


HOW ORDERING WORKS NOW
----------------------
1. "Add to cart" no longer opens the checkout. The customer sees a small
   confirmation and a sticky bar at the bottom, and can keep adding
   products. The cart holds everything together.
2. "Review & proceed" opens the cart (STEP 1 OF 2) — items, quantities,
   remove, plus an "Add another product" button.
3. "Proceed to billing" opens STEP 2 OF 2 — itemised bill, the
   delivery-charge notice, and the delivery details form.
4. "Send order on WhatsApp" validates the form and opens WhatsApp with a
   fully formatted order, including the highlighted amount to pay.

AMOUNT TO PAY is shown in a dark highlighted box in both steps, with MRP
total and discount above it.

DELIVERY CHARGES are stated as not included in five places: the shop
section note, the cart summary row, under the Amount to pay figure, the
billing callout box, the FAQ, and the WhatsApp message itself.


PRICES
------
Prices, MRP and the "SAVE x%" pills live in index.html on each product
card. Change the data-price / data-mrp attributes on the Add to cart
button as well as the visible <div class="price"> when you update a price.


HOSTING
-------
Static site — upload the whole folder to Netlify, Vercel, GitHub Pages,
Hostinger, or any web host. No build step, no server needed.
