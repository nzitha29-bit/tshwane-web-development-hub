# Kganya Home Cleaning Services website

A website for **Kganya Home Cleaning Services**, a Pretoria cleaning business founded in 2019 by Naledi Dube that serves over 150 homes and offices across Pretoria East, Centurion and Midrand.

- **Live site:** https://kganya-home-cleaning.netlify.app *(update this link after deploying)*
- **Part 3 focus:** JavaScript functionality, dynamic content, form validation, SEO and deployment.

---

## Contents

1. [Pages](#pages)
2. [Part 3 features](#part-3-features)
3. [Forms and validation](#forms-and-validation)
4. [Search engine optimisation](#search-engine-optimisation-seo)
5. [Page speed and security](#page-speed-and-security)
6. [Folder structure](#folder-structure)
7. [Running and deploying the site](#running-and-deploying-the-site)
8. [Changelog](#changelog)
9. [References](#references)

---

## Pages

| Page | Purpose | Part 3 additions |
|---|---|---|
| `index.html` | Home page | Animated counters, scroll animations, before-and-after lightbox gallery |
| `about.html` | History, mission and team | Mission/Vision/Values tabs, team bio modals |
| `services.html` | Services and prices | Service cards loaded with JavaScript, search, filter, sort, details modal, pricing FAQ accordion |
| `enquiry.html` | Quote request | Service-specific questions, JavaScript validation, instant price estimate and availability check, AJAX submission |
| `contact.html` | Contact details and service areas | Interactive Leaflet map with service-area circles, validated contact form that compiles an email |
| `thank-you.html` | Form confirmation (used without JavaScript) | New |
| `404.html` | "Page not found" page | New |

## Part 3 features

All JavaScript is plain (vanilla) JavaScript in the `js/` folder, with comments explaining each section. The brief allows "jQuery or other possible JavaScript frameworks"; vanilla JavaScript was chosen because modern browsers support everything needed natively, and it avoids loading an extra 30 KB library on every page.

### 2.1 Interactive elements (`js/main.js`)

| Feature | Where | How it works |
|---|---|---|
| **Accordion** | "How our pricing works" (Services) and quote FAQ (Get a Quote) | Buttons toggle `aria-expanded` and the panel's `hidden` attribute, following the WAI-ARIA accordion pattern. |
| **Tabs** | "What we stand for" on About Us | `role="tablist"` with click and arrow-key/Home/End support, following the WAI-ARIA tabs pattern. |
| **Modals** | Team bios (About), service details (Services) | Native `<dialog>` element with `showModal()`, so focus is trapped and Escape closes it. Clicking the backdrop also closes it. |
| **Lightbox gallery** | "Before & after" on Home | The lightbox is built with DOM methods when the page loads. Supports next/previous buttons, arrow keys, Escape, captions and an "Image 2 of 3" counter. Without JavaScript the links still open the full image. |
| **Interactive map** | Contact page (`js/map.js`) | Leaflet 1.9.4 with OpenStreetMap tiles. Markers and shaded circles show the three service areas; buttons under the map fly to each area and open its popup. Scroll-zoom only turns on after a click, so the page still scrolls normally. Shows a text fallback if Leaflet cannot load. |
| **Mobile navigation** | Every page | A menu button replaces the wrapping link list on screens under 700 px, with an animated icon, `aria-expanded`, and Escape to close. |
| **Animations and transitions** | Every page | Hero text fades up on load (CSS keyframes); sections fade in as they scroll into view (`IntersectionObserver`); the "150+ homes" figures count up; cards lift on hover; nav links get a sliding underline. All animation is switched off for visitors who set "reduce motion" in their operating system. |

### 2.2 Dynamic content (`js/data.js`, `js/catalogue.js`)

- **Content loaded with JavaScript:** the service cards on `services.html` are built from the `services` array in `data.js` (5 packages and 4 add-ons). Changing a price or adding a service only needs a change in that file, and the quote calculator uses the same file, so prices never disagree.
- **Search, filter and sort:**
  - Search box (matches name, category, description and what is included) with matching words highlighted using `<mark>`. Typing is debounced by 200 ms.
  - Filters for type (Residential, Commercial, Add-ons) and budget (up to R200, R500, R1 000 or R1 500).
  - Sort by featured order, price low to high, price high to low, or name.
  - The results count updates live for screen readers (`aria-live`), and an empty state offers a "Clear filters" button.
- **Advanced DOM techniques:**
  - Filters are saved in the address bar with `history.replaceState`, so a filtered view can be shared. The home page links straight to filtered views, e.g. `services.html?category=Commercial`.
  - "Get a quote" buttons open the quote form with that service already selected; choosing an add-on (e.g. Inside Oven Clean) pre-selects a Standard Clean and ticks the add-on.
  - On the quote form, the "How often?" options are rebuilt by JavaScript for each service (four choices for a Standard Clean, two for the office package, none for once-off cleans).

## Forms and validation

Both forms keep their HTML5 attributes (`required`, `type="email"`, `minlength`, `maxlength`, `min`, `max`) so they still validate if JavaScript is off. When JavaScript runs, `js/validate.js` takes over with clearer messages:

- Each error appears under its field, is linked to it with `aria-describedby`, and the field is marked `aria-invalid`.
- On submit, an error summary at the top lists every problem as a link to the field.
- Fields are checked when you leave them, and re-checked as you type once an error is showing.
- All user input shown back on the page is escaped first (`escapeHTML`), so it cannot inject code.

### Quote request form (`enquiry.html`, `js/enquiry.js`)

**Purpose:** to request a price for a specific cleaning service. The questions change with the service chosen: bedrooms, bathrooms and add-ons for home cleans; floor size for commercial cleans.

| Field | Validation |
|---|---|
| Full name | Required; letters, spaces, hyphens and apostrophes; 2 to 60 characters |
| Email | Required; `name@domain.tld` format |
| Phone | Required; South African format, `0XX XXX XXXX` or `+27 XX XXX XXXX` |
| Service | Required |
| Property type *(home cleans)* | Required: apartment/townhouse or house |
| Bedrooms / bathrooms *(home cleans)* | Whole numbers, 1 to 10 and 1 to 6 |
| Floor size *(commercial)* | 20 to 5 000 m² |
| Area | Required |
| Preferred date | Required; at least 2 days from today, no more than 3 months ahead, and not a Sunday |
| Additional details | Optional; 500 characters maximum, with a live character counter |
| POPIA consent | Required |

**Response shown after validation** (calculated from the price rules in `data.js`):

- **Estimated price** with a line-by-line breakdown: base price for the service and property, extra bedrooms and bathrooms, add-ons, a regular-booking discount (15% weekly, 10% every second week, 5% monthly for Standard Cleans), and a R150 travel fee outside the three main areas. Regular bookings also show the monthly total.
  *Example: Standard Clean, house, 4 bedrooms, 2 bathrooms, inside oven, weekly = R600 + R160 + R60 + R150 − 15% = **R825 per visit**, about R3 298 per month.*
- **Office package:** R1 500 a month every second week or R2 700 a month weekly, up to 150 m². Larger premises and custom contracts are told a free site visit is needed.
- **Availability for the chosen date:** public holidays are flagged with the next available working day; Saturday afternoon requests are moved to the morning, since Saturdays are mornings only; weekdays confirm the morning or afternoon slot.

Each response includes a reference number such as `KHC-20261102-4821`.

**Submission:** the form's `action` attribute is `thank-you.html` and its `method` is `POST`. JavaScript sends the data, including the reference and estimate in hidden fields, to that URL with `fetch` (AJAX), so the page does not reload. On Netlify, the `data-netlify="true"` attribute makes Netlify Forms store each request (viewable in the Netlify dashboard under Forms), and a hidden honeypot field filters out spam bots. If sending fails (for example when the site is opened from a local file), the visitor still sees the estimate plus the phone number and email to use instead.

### Contact form (`contact.html`, `js/contact.js`)

**Purpose:** a general message to the business, as opposed to the quote form's price requests.

| Field | Validation |
|---|---|
| Full name | Required; letters only; 2 to 60 characters |
| Email | Required; email format |
| Phone | Optional; South African format if filled in |
| Type of message | Required: general, booking change, feedback, complaint or careers |
| Subject | Required; 5 to 80 characters |
| Message | Required; 20 to 1 000 characters, with a live counter |
| POPIA consent | Required |

After validation, the details are compiled into an email to the recipient set in `data.js` (`info@kganyacleaning.co.za`): the subject becomes `[Type of message] Subject` and the body contains the message and contact details. The visitor's email app opens with it ready to send, and a preview with "Open in email app" and "Copy message" buttons appears in case no email app is set up. The form's `action` attribute is also a `mailto:` link, so it still works without JavaScript.

## Search engine optimisation (SEO)

### Keyword research

Keywords were chosen by listing what each type of customer would type into a search engine and pairing the service with the suburb, because people search for cleaners near them. *Before submitting, confirm these against Google's autocomplete suggestions or Google Keyword Planner and adjust any that get little search volume.*

| Customer need | Primary keywords | Used on |
|---|---|---|
| Regular home cleaning | home cleaning services Pretoria East, cleaning services Centurion | Home, Services |
| Once-off cleans | deep cleaning Pretoria, move-out cleaning Centurion | Services, Get a Quote |
| Business cleaning | office cleaning Midrand, commercial cleaning Pretoria | Home, Services |
| Price comparison | cleaning prices Pretoria, cleaning quote Centurion | Services, Get a Quote |

### On-page SEO

- **Title tags and meta descriptions:** each of the five main pages has a unique title of 55 to 65 characters (Google shows about 60) and a description of 140 to 155 characters, each containing that page's main keyword and suburb.
- **Header tags:** each page has exactly one `<h1>`, with `<h2>` for sections and `<h3>` for cards, and no skipped levels (checked automatically in testing).
- **Image optimisation:** all photos were renamed from names like `before.jpeg` and `admin.jpeg` to descriptive, hyphenated names such as `kitchen-before-deep-clean-pretoria.jpg`, resized to a maximum of 1 200 px, and compressed. Every image now has descriptive alt text (in Part 2 the images had no `alt` attribute at all) and `width`/`height` attributes to prevent layout shift.
- **URL structure:** short, lowercase, descriptive file names (`services.html`, `enquiry.html`, `contact.html`), a `<link rel="canonical">` on every page, and shareable filter URLs such as `services.html?category=Residential`.
- **Internal linking:** the home page links to filtered service views; the history paragraph links to residential and commercial services; every service links to a pre-filled quote; the pricing FAQ links to the quote form; the footer repeats the main navigation on every page.
- **Mobile-friendliness:** responsive grids, a mobile menu, inputs at least 16 px so phones do not zoom in, and no horizontal scrolling at 390 px wide (checked automatically in testing).
- **Social sharing:** Open Graph and Twitter Card tags so links shared on WhatsApp and Facebook show a title, description and photo.

### Additional files

- **`robots.txt`** allows all crawlers, blocks the thank-you and 404 pages (they have no value in search results), and points to the sitemap. Those two pages also have `<meta name="robots" content="noindex">`.
- **`sitemap.xml`** lists the five main pages with last-modified dates and priorities.

### Local SEO

- **Structured data:** `index.html`, `about.html` and `contact.html` include JSON-LD using the schema.org `LocalBusiness` type, with the business name, founder, phone, email, price range, opening hours, coordinates and the areas served (Pretoria East, Centurion, Midrand).
- **Consistent contact details:** the same name, phone number and email appear in the footer, the contact page and the structured data.
- Suburb names appear in titles, headings, descriptions and the map.

### Off-page SEO (actions for the business)

Off-page SEO happens on other websites, so it cannot be built into the code. The plan:

1. **Google Business Profile:** create a service-area business profile covering Pretoria East, Centurion and Midrand, link it to the website, and ask happy clients to leave reviews there. This is the most important step for appearing in "cleaners near me" searches.
2. **Backlinks:** list the business on South African directories such as Snupit and the local business listings for Centurion and Pretoria East; ask estate agents and property managers who use the move-out clean to link to the site; and offer a cleaning tip article to a local community newspaper or blog.
3. **Social media:** add the website link to the WhatsApp Business profile and Facebook page, and post before-and-after photos linking to the quote form, for example:
   > This Centurion kitchen got our Deep Clean this week ✨ Deep cleans start at R850. See your price in 1 minute: https://kganya-home-cleaning.netlify.app/enquiry.html?service=deep

## Page speed and security

**Page speed**

- Images resized and compressed; all images below the fold use `loading="lazy"`.
- All scripts use `defer`, so they never block the page from displaying.
- The map library (Leaflet) only loads on the contact page.
- Google Fonts use `preconnect` and `display=swap`.
- `_headers` tells browsers to cache images, CSS and JavaScript for a week.

**Security**

- **Content Security Policy** (in a `<meta>` tag on every page and in `_headers`): scripts may only load from this site and unpkg.com, forms may only submit to this site or `mailto:`, and the site cannot be framed by others. All inline styles were removed from the HTML so the policy does not need `'unsafe-inline'`.
- **Subresource Integrity:** Leaflet's CSS and JavaScript have `integrity` hashes, so the browser refuses them if the CDN copy is ever changed.
- **`_headers` (Netlify):** `X-Frame-Options: DENY` (prevents clickjacking), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (no camera, microphone or location), and HSTS (forces HTTPS).
- **Forms:** user input is escaped before being shown on the page, a honeypot field catches spam bots, and every form asks for POPIA consent.
- **External links** use `rel="noopener noreferrer"`.

## Folder structure

```
kganya-home-cleaning/
├── index.html, about.html, services.html, enquiry.html, contact.html
├── thank-you.html, 404.html
├── robots.txt, sitemap.xml
├── _headers              Netlify security and caching headers
├── README.md
├── css/
│   └── style.css         Site styles + Part 3 components
├── js/
│   ├── main.js           Navigation, animations, accordion, tabs, modals, lightbox
│   ├── data.js           Services, prices, quote rules and map locations
│   ├── catalogue.js      Services: rendering, search, filter, sort
│   ├── validate.js       Reusable form validation and AJAX helpers
│   ├── enquiry.js        Quote calculator, availability check and submission
│   ├── contact.js        Contact form and email compilation
│   └── map.js            Leaflet map
└── images/               Descriptively named, compressed photos + favicon.svg
```

## Running and deploying the site

**Run locally:** open `index.html` in a browser, or for the full experience run a local server from this folder (`python -m http.server`) and visit `http://localhost:8000`. Everything works locally except storing form submissions, which needs Netlify.

**Deploy to Netlify** (recommended, because Netlify Forms stores quote requests):

1. Push the repository to GitHub.
2. In Netlify, choose **Add new site > Import an existing project** and pick the repository.
3. Set **Base directory** to `kganya-home-cleaning`, leave the build command empty, and set **Publish directory** to `kganya-home-cleaning`.
4. Deploy, then under **Site configuration > Change site name** use `kganya-home-cleaning`. If that name is taken, update the domain in `sitemap.xml`, `robots.txt` and the canonical/Open Graph tags.
5. Under **Forms**, enable form detection and redeploy, so the `quote-request` form appears there.
6. Test the live site, then submit `sitemap.xml` in Google Search Console.

## Changelog

### Part 3, 2 November 2026

#### Corrections from Part 2

*No written lecturer feedback had been received when this work was done. The issues below were found by reviewing the Part 2 code; add the lecturer's feedback points here once marks are released.*

| # | Issue in Part 2 | Change made | Files |
|---|---|---|---|
| 1 | `style.css` was linked twice in every `<head>` | Removed the duplicate; one stylesheet link per page | All HTML pages |
| 2 | Images had no `alt` attribute (only `role="img"` and an `aria-label` saying "photo placeholder") | Added descriptive alt text to every image and removed the redundant attributes | `index.html`, `about.html` |
| 3 | Inline `style=""` attributes on buttons, images and the map container | Moved into `style.css` as reusable classes (`.btn`, `.btn-light`, `.photo`, `.map`), needed for the Content Security Policy | All HTML pages, `style.css` |
| 4 | White text on the teal hero (`#009B8D`) had a contrast of 3.5:1, below the WCAG AA minimum of 4.5:1 | The hero now uses the darker brand teal `#00786D` (5.4:1) | `style.css` |
| 5 | Form field borders (`#ccc`) had a contrast of 1.6:1, below the WCAG 3:1 minimum for form controls | Darkened to `#879290` (3.2:1) | `style.css` |
| 6 | Image file names were not descriptive (`before.jpeg`, `admin.jpeg`, `teamleader.jpeg`) | Renamed to hyphenated, keyword-rich names, resized and compressed; added `width`, `height` and lazy loading | `images/`, all pages |
| 7 | Fixed inline sizes (e.g. `height: 300px`) squashed or stretched photos | Photos now use `aspect-ratio` and `object-fit: cover` | `style.css` |
| 8 | Leftover `.placeholder-img` striped background styles from Part 1 | Removed; replaced by the `.photo` class | `style.css` |
| 9 | Footer "WhatsApp Business" link pointed to `#` | Now opens a WhatsApp chat (`wa.me` link) in a new tab with `rel="noopener noreferrer"` | All pages |
| 10 | On phones the navigation links wrapped onto several lines | Added a mobile menu button with an animated icon; added a "Skip to main content" link and visible focus outlines | All pages, `main.js` |
| 11 | The quote form mixed "Office / Commercial" into the residential property list and asked no questions that affect price | Restructured: bedrooms, bathrooms and add-ons for homes; floor size for offices; frequency, area and time for all | `enquiry.html` |
| 12 | Contact form only asked for name, email and message | Added phone, type of message, subject and POPIA consent, as the brief requires | `contact.html` |
| 13 | About page said "a decade-strong commitment", but the business was founded in 2019 | Corrected the hero text | `about.html` |
| 14 | `lang="en"` and the page titles had limited local keywords | Set `lang="en-ZA"` and rewrote titles and descriptions around researched local keywords | All pages |
| 15 | The CSS header comment still said "Part 1 base styles, refinement scheduled for Part 2" | Updated the comment | `style.css` |
| 16 | The Google Maps `<iframe>` showed one point in Pretoria Central, which is not one of the service areas, and loads Google tracking cookies | Replaced with an interactive Leaflet/OpenStreetMap map showing all three service areas | `contact.html` |
| 17 | Copyright year was hard-coded | Year is now filled in by JavaScript (with 2026 as the fallback) | All pages, `main.js` |

#### Added in Part 3

| Area | Change | Files |
|---|---|---|
| Interactivity | Accordion FAQs, tabs, team bio modals, before-and-after lightbox, animated counters, scroll animations | `main.js`, `style.css`, `index.html`, `about.html`, `services.html`, `enquiry.html` |
| Map | Leaflet map with service-area circles and "fly to area" buttons | `map.js`, `contact.html` |
| Dynamic content | Services and add-ons loaded from `data.js`, with search, filters, sorting, shareable URLs and a details modal | `data.js`, `catalogue.js`, `services.html` |
| Quote form | Service-specific questions, JavaScript validation, price calculator, availability check, reference numbers, AJAX submission via Netlify Forms | `enquiry.html`, `validate.js`, `enquiry.js` |
| Contact form | JavaScript validation and compiled `mailto:` email with preview and copy button | `contact.html`, `validate.js`, `contact.js` |
| SEO | Keyword-based titles and descriptions, canonical URLs, Open Graph tags, JSON-LD structured data, `robots.txt`, `sitemap.xml`, favicon | All pages |
| Pages | `thank-you.html` (no-JavaScript form confirmation) and `404.html` | New files |
| Security and speed | Content Security Policy, Subresource Integrity, `_headers`, honeypot, input escaping, image compression, lazy loading, deferred scripts | All pages, `_headers` |
| Documentation | This README: features, validation rules, SEO, deployment, changelog and references | `README.md` |

## References

*Add the references from your Part 1 and Part 2 README to this list, including the sources of the photographs.*

Google (no date a) *Influencing your title links in search results*. Available at: https://developers.google.com/search/docs/appearance/title-link (Accessed: 2 November 2026).

Google (no date b) *Control your snippets in search results*. Available at: https://developers.google.com/search/docs/appearance/snippet (Accessed: 2 November 2026).

Google (no date c) *Introduction to robots.txt*. Available at: https://developers.google.com/search/docs/crawling-indexing/robots/intro (Accessed: 2 November 2026).

Google (no date d) *Learn about sitemaps*. Available at: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview (Accessed: 2 November 2026).

Google (no date e) *Google image SEO best practices*. Available at: https://developers.google.com/search/docs/appearance/google-images (Accessed: 2 November 2026).

Google (no date f) *Local business (LocalBusiness) structured data*. Available at: https://developers.google.com/search/docs/appearance/structured-data/local-business (Accessed: 2 November 2026).

Google (no date g) *Search Engine Optimization (SEO) starter guide*. Available at: https://developers.google.com/search/docs/fundamentals/seo-starter-guide (Accessed: 2 November 2026).

Leaflet (no date) *Leaflet quick start guide*. Available at: https://leafletjs.com/examples/quick-start/ (Accessed: 2 November 2026).

MDN Web Docs (no date a) *&lt;dialog&gt;: The Dialog element*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog (Accessed: 2 November 2026).

MDN Web Docs (no date b) *Intersection Observer API*. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API (Accessed: 2 November 2026).

MDN Web Docs (no date c) *Using the Fetch API*. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch (Accessed: 2 November 2026).

MDN Web Docs (no date d) *Client-side form validation*. Available at: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation (Accessed: 2 November 2026).

MDN Web Docs (no date e) *History: replaceState() method*. Available at: https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState (Accessed: 2 November 2026).

MDN Web Docs (no date f) *Content Security Policy (CSP)*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP (Accessed: 2 November 2026).

MDN Web Docs (no date g) *Subresource Integrity*. Available at: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity (Accessed: 2 November 2026).

Netlify (no date a) *Forms setup*. Available at: https://docs.netlify.com/forms/setup/ (Accessed: 2 November 2026).

Netlify (no date b) *Custom headers*. Available at: https://docs.netlify.com/routing/headers/ (Accessed: 2 November 2026).

OpenStreetMap Foundation (no date) *Copyright and licence*. Available at: https://www.openstreetmap.org/copyright (Accessed: 2 November 2026).

Republic of South Africa (2013) *Protection of Personal Information Act 4 of 2013*. Pretoria: Government Printer. Available at: https://www.gov.za/documents/protection-personal-information-act (Accessed: 2 November 2026).

Schema.org (no date) *LocalBusiness*. Available at: https://schema.org/LocalBusiness (Accessed: 2 November 2026).

W3C (2023) *Understanding success criterion 1.4.3: Contrast (minimum)*. Web Content Accessibility Guidelines 2.2. Available at: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html (Accessed: 2 November 2026).

W3C WAI (no date a) *Accordion pattern*. ARIA Authoring Practices Guide. Available at: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/ (Accessed: 2 November 2026).

W3C WAI (no date b) *Tabs pattern*. ARIA Authoring Practices Guide. Available at: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ (Accessed: 2 November 2026).

web.dev (no date) *Browser-level image lazy loading for the web*. Available at: https://web.dev/articles/browser-level-image-lazy-loading (Accessed: 2 November 2026).
