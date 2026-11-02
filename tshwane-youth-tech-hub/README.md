# Tshwane Youth Tech Hub website

A website for **Tshwane Youth Tech Hub (TYTH)**, a non-profit that runs free coding bootcamps, digital literacy workshops and career readiness programmes for young people aged 16 to 25 in Soshanguve, Atteridgeville and Mamelodi.

- **Live site:** https://tshwane-youth-tech-hub.netlify.app *(update this link after deploying)*
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
| `index.html` | Home page | Animated impact counters, scroll animations, lightbox gallery |
| `about.html` | History, mission and team | Mission/Vision/Values tabs, team bio modals |
| `services.html` | Programmes and upcoming intakes | Intakes loaded with JavaScript, search, filter and sort, details modal, FAQ accordion |
| `enquiry.html` | Apply, volunteer, sponsor or partner | Role-based form, JavaScript validation, instant availability/impact response, AJAX submission |
| `contact.html` | Contact details and venues | Interactive Leaflet map, validated contact form that compiles an email |
| `thank-you.html` | Form confirmation (used without JavaScript) | New |
| `404.html` | "Page not found" page | New |

## Part 3 features

All JavaScript is plain (vanilla) JavaScript in the `js/` folder, with comments explaining each section. The brief allows "jQuery or other possible JavaScript frameworks"; vanilla JavaScript was chosen because modern browsers support everything needed natively, and it avoids loading an extra 30 KB library on every page.

### 2.1 Interactive elements (`js/main.js`)

| Feature | Where | How it works |
|---|---|---|
| **Accordion** | FAQ on Programmes and Get Involved | Buttons toggle `aria-expanded` and the panel's `hidden` attribute, following the WAI-ARIA accordion pattern. |
| **Tabs** | "What drives us" on About Us | `role="tablist"` with click and arrow-key/Home/End support, following the WAI-ARIA tabs pattern. |
| **Modals** | Team bios (About), intake details (Programmes) | Native `<dialog>` element with `showModal()`, so focus is trapped and Escape closes it. Clicking the backdrop also closes it. |
| **Lightbox gallery** | "Inside our bootcamps" on Home | The lightbox is built with DOM methods when the page loads. Supports next/previous buttons, arrow keys, Escape, captions and an "Image 2 of 4" counter. Without JavaScript the links still open the full image. |
| **Interactive map** | Contact page (`js/map.js`) | Leaflet 1.9.4 with OpenStreetMap tiles. Venue markers come from `data.js`; buttons under the map fly to each venue and open its popup. Scroll-zoom only turns on after a click, so the page still scrolls normally. Shows a text fallback if Leaflet cannot load. |
| **Mobile navigation** | Every page | A menu button replaces the wrapping link list on screens under 700 px, with an animated icon, `aria-expanded`, and Escape to close. |
| **Animations and transitions** | Every page | Hero text fades up on load (CSS keyframes); sections fade in as they scroll into view (`IntersectionObserver`); impact numbers count up; cards lift on hover; nav links get a sliding underline. All animation is switched off for visitors who set "reduce motion" in their operating system. |

### 2.2 Dynamic content (`js/data.js`, `js/catalogue.js`)

- **Content loaded with JavaScript:** the "Upcoming intakes" cards on `services.html` are built from the `intakes` array in `data.js`. Adding a new intake only needs one new object in that file.
- **Search, filter and sort:**
  - Search box (matches title, venue, type and outcomes) with the matching words highlighted using `<mark>`. Typing is debounced by 200 ms.
  - Filters for programme type and venue, plus "Only show intakes with open seats".
  - Sort by soonest date, most seats open, or name.
  - The results count updates live for screen readers (`aria-live`), and an empty state offers a "Clear filters" button.
- **Advanced DOM techniques:**
  - Intakes whose start date has passed are hidden automatically, and a countdown ("Starts in 3 weeks") is calculated from today's date.
  - Seat badges change colour when seats run low or an intake is full, and the button changes to "Join waiting list".
  - Filters are saved in the address bar with `history.replaceState`, so a filtered view can be shared or linked to. The home page links straight to filtered views, e.g. `services.html?type=Coding%20bootcamp`.
  - "Apply" links pre-fill the Get Involved form with the right programme and venue.

## Forms and validation

Both forms keep their HTML5 attributes (`required`, `type="email"`, `minlength`, `maxlength`, `min`, `max`) so they still validate if JavaScript is off. When JavaScript runs, `js/validate.js` takes over with clearer messages:

- Each error appears under its field, is linked to it with `aria-describedby`, and the field is marked `aria-invalid`.
- On submit, an error summary at the top lists every problem as a link to the field.
- Fields are checked when you leave them, and re-checked as you type once an error is showing.
- All user input shown back on the page is escaped first (`escapeHTML`), so it cannot inject code.

### Get Involved form (`enquiry.html`, `js/enquiry.js`)

**Purpose:** to apply as a learner, volunteer as an instructor, sponsor a programme, or propose a partnership. The questions change with the role chosen.

| Field | Validation |
|---|---|
| Full name | Required; letters, spaces, hyphens and apostrophes; 2 to 60 characters |
| Email | Required; `name@domain.tld` format |
| Phone | Required; South African format, `0XX XXX XXXX` or `+27 XX XXX XXXX` |
| Role | Required |
| Date of birth *(learner)* | Required; must be a real date (age 10 to 100) |
| Venue, programme *(learner)* | Required |
| Guardian consent *(learner under 18 only)* | Required; this box only appears when the date of birth shows the learner is under 18 |
| Skills *(volunteer)* | At least one checkbox |
| Availability, hours per month *(volunteer)* | Required; 2 to 40 hours |
| Organisation *(sponsor/partner)* | Required; 2 to 100 characters |
| Amount *(sponsor)* | R500 to R5 000 000, numbers only; hidden for venue support |
| Message | Optional; 500 characters maximum, with a live character counter |
| POPIA consent | Required |

**Response shown after validation** (calculated from `data.js`):

- **Learners:** the next intake with open seats at their venue (date, countdown, seats left), or the waiting list and an alternative venue if it is full. Applicants outside 16 to 25 are pointed to the career sessions that are open to everyone. Python applicants who have not done the Digital Literacy Workshop are shown the next workshop first.
- **Volunteers:** upcoming intakes that need their skills, how many sessions their hours cover, and the date of the next volunteer induction (the first Saturday of next month).
- **Sponsors:** the impact of their amount, e.g. R50 000 = 20 learners through a bootcamp (R2 500 each), or laptops at R6 500 each.
- **Partners:** next steps and the communities currently served.

Each response includes a reference number such as `TYTH-20261102-4821`.

**Submission:** the form's `action` attribute is `thank-you.html` and its `method` is `POST`. JavaScript sends the data to that URL with `fetch` (AJAX), so the page does not reload. On Netlify, the `data-netlify="true"` attribute makes Netlify Forms store each submission (viewable under *Site configuration > Forms*), and a hidden honeypot field filters out spam bots. If sending fails (for example when the site is opened from a local file), the visitor still sees their response plus a phone number and email to use instead.

### Contact form (`contact.html`, `js/contact.js`)

**Purpose:** a general message to the organisation, as opposed to the Get Involved form's applications.

| Field | Validation |
|---|---|
| Full name | Required; letters only; 2 to 60 characters |
| Email | Required; email format |
| Phone | Optional; South African format if filled in |
| Type of message | Required: general, programme question, feedback, complaint or media |
| Subject | Required; 5 to 80 characters |
| Message | Required; 20 to 1 000 characters, with a live counter |
| POPIA consent | Required |

After validation, the details are compiled into an email to the recipient set in `data.js` (`info@tshwaneyouthtechhub.org.za`): the subject becomes `[Type of message] Subject` and the body contains the message and contact details. The visitor's email app opens with it ready to send, and a preview with "Open in email app" and "Copy message" buttons appears in case no email app is set up. The form's `action` attribute is also a `mailto:` link, so it still works without JavaScript.

## Search engine optimisation (SEO)

### Keyword research

Keywords were chosen by listing what each audience would type into a search engine and pairing the service with the local area, because people look for youth programmes close to home. *Before submitting, confirm these against Google's autocomplete suggestions or Google Keyword Planner and adjust any that get little search volume.*

| Audience | Primary keywords | Used on |
|---|---|---|
| Young people and parents | free coding bootcamp Tshwane, learn to code Soshanguve, digital skills training Atteridgeville | Home, Programmes |
| Learners with little computer experience | digital literacy workshop Mamelodi, computer skills course Pretoria | Programmes |
| Job seekers | CV help Soshanguve, bursaries and learnerships Tshwane | Programmes (career readiness) |
| Volunteers | volunteer coding tutor Pretoria | Get Involved |
| Sponsors | sponsor youth digital skills South Africa | Get Involved, About |

### On-page SEO

- **Title tags and meta descriptions:** each of the five main pages has a unique title of 50 to 66 characters (Google shows about 60) and a description of 140 to 160 characters, each containing that page's main keyword and location.
- **Header tags:** each page has exactly one `<h1>`, with `<h2>` for sections and `<h3>` for cards, and no skipped levels (checked automatically in testing).
- **Image optimisation:** all photos were renamed from names like `bootcamp 1.jpeg` and `peace.jpeg` to descriptive, hyphenated names such as `learner-writing-code-with-mentor.jpg`, resized to a maximum of 1 200 px, and compressed. Every image has descriptive alt text (the old alt text said "photo placeholder") and `width`/`height` attributes to prevent layout shift.
- **URL structure:** short, lowercase, descriptive file names (`about.html`, `services.html`, `contact.html`), a `<link rel="canonical">` on every page, and shareable filter URLs such as `services.html?venue=Mamelodi`.
- **Internal linking:** the home page links to filtered programme views; the history paragraph links to each programme type; every intake links to a pre-filled application; the footer repeats the main navigation on every page.
- **Mobile-friendliness:** responsive grids, a mobile menu, inputs at least 16 px so phones do not zoom in, and no horizontal scrolling at 390 px wide (checked automatically in testing).
- **Social sharing:** Open Graph and Twitter Card tags so links shared on Facebook and WhatsApp show a title, description and photo.

### Additional files

- **`robots.txt`** allows all crawlers, blocks the thank-you and 404 pages (they have no value in search results), and points to the sitemap. Those two pages also have `<meta name="robots" content="noindex">`.
- **`sitemap.xml`** lists the five main pages with last-modified dates and priorities.

### Local SEO

- **Structured data:** `index.html`, `about.html` and `contact.html` include JSON-LD using the schema.org `NGO` type, with the organisation's name, area served (Soshanguve, Atteridgeville, Mamelodi), contact details and Facebook page.
- **Consistent contact details:** the same name, phone number and email appear in the footer, the contact page and the structured data.
- Location names appear in titles, headings and descriptions.

### Off-page SEO (actions for the organisation)

Off-page SEO happens on other websites, so it cannot be built into the code. The plan:

1. **Google Business Profile:** create a profile for each venue so TYTH appears in Google Maps and local results, and link it to the website.
2. **Backlinks:** ask the three corporate sponsors and the venue partners to link to the site from their CSR or community pages; list TYTH on NGO directories such as the South African NGO directory on ngopulse.org; and share programme dates with local news sites (e.g. community newspapers in Soshanguve and Mamelodi).
3. **Social media:** add the website link to the Facebook page bio, and post each new intake with a link to the filtered Programmes page, for example:
   > Free coding bootcamp in Soshanguve! Intro to Web Development starts Saturday 16 January 2027, only 7 seats left. Ages 16 to 25, no experience needed. Apply here: https://tshwane-youth-tech-hub.netlify.app/services.html?venue=Soshanguve

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
tshwane-youth-tech-hub/
├── index.html, about.html, services.html, enquiry.html, contact.html
├── thank-you.html, 404.html
├── robots.txt, sitemap.xml
├── _headers              Netlify security and caching headers
├── README.md
├── css/
│   └── style.css         Site styles + Part 3 components
├── js/
│   ├── main.js           Navigation, animations, accordion, tabs, modals, lightbox
│   ├── data.js           Intakes, costs and venue locations
│   ├── catalogue.js      Upcoming intakes: rendering, search, filter, sort
│   ├── validate.js       Reusable form validation and AJAX helpers
│   ├── enquiry.js        Get Involved form logic and responses
│   ├── contact.js        Contact form and email compilation
│   └── map.js            Leaflet map
└── images/               Descriptively named, compressed photos + favicon.svg
```

## Running and deploying the site

**Run locally:** open `index.html` in a browser, or for the full experience run a local server from this folder (`python -m http.server`) and visit `http://localhost:8000`. Everything works locally except storing form submissions, which needs Netlify.

**Deploy to Netlify** (recommended, because Netlify Forms stores enquiries):

1. Push the repository to GitHub.
2. In Netlify, choose **Add new site > Import an existing project** and pick the repository.
3. Set **Base directory** to `tshwane-youth-tech-hub`, leave the build command empty, and set **Publish directory** to `tshwane-youth-tech-hub`.
4. Deploy, then under **Site configuration > Change site name** use `tshwane-youth-tech-hub`. If that name is taken, update the domain in `sitemap.xml`, `robots.txt` and the canonical/Open Graph tags.
5. Under **Forms**, enable form detection and redeploy, so the `get-involved` form appears there.
6. Test the live site, then submit `sitemap.xml` in Google Search Console.

## Changelog

### Part 3, 2 November 2026

#### Corrections from Part 2

*No written lecturer feedback had been received when this work was done. The issues below were found by reviewing the Part 2 code; add the lecturer's feedback points here once marks are released.*

| # | Issue in Part 2 | Change made | Files |
|---|---|---|---|
| 1 | `style.css` was linked twice in every `<head>`, and the first link had an invalid `name="stylesheet"` attribute | Removed the duplicate and the invalid attribute; one stylesheet link per page | All HTML pages |
| 2 | Inline `style=""` attributes on buttons, images and the map container | Moved into `style.css` as reusable classes (`.btn-outline-dark`, `.photo`, `.map`), needed for the Content Security Policy | All HTML pages, `style.css` |
| 3 | Image alt text read "photo placeholder", and images also had redundant `role="img"` and `aria-label` | Wrote descriptive alt text for every image and removed the redundant attributes | `index.html`, `about.html` |
| 4 | Image file names had spaces and were not descriptive (`bootcamp 1.jpeg`, `tech 1.jpeg`, `peace.jpeg`) | Renamed to hyphenated, descriptive names, resized to max 1 200 px and compressed; added `width`, `height` and lazy loading | `images/`, all pages |
| 5 | Fixed inline heights (e.g. `height: 217px`) squashed or stretched photos | Photos now use `aspect-ratio` and `object-fit: cover`, so they keep their shape at every screen size | `style.css` |
| 6 | Leftover `.placeholder-img` striped background styles from Part 1 | Removed; replaced by the `.photo` class | `style.css` |
| 7 | Footer "Facebook" link pointed to `#` | Now links to the Facebook page (opens in a new tab with `rel="noopener noreferrer"`) | All pages |
| 8 | On phones the six navigation links wrapped onto several lines | Added a mobile menu button with an animated icon; added a "Skip to main content" link and visible focus outlines | All pages, `main.js` |
| 9 | Form field borders (`#ccc`) had a contrast of 1.6:1, below the WCAG 3:1 minimum for form controls | Darkened to `#8E84A0` (3.5:1) | `style.css` |
| 10 | Contact form only asked for name, email and message | Added phone, type of message, subject and POPIA consent, as the brief requires | `contact.html` |
| 11 | "Donate" and "Volunteer" buttons both opened the same blank form | Buttons now open the form with the right role already selected | `index.html`, `about.html` |
| 12 | Mission and vision were two `<h2>` cards inside a section that already had an `<h2>` | Restructured as a "What drives us" section with Mission/Vision/Values tabs | `about.html` |
| 13 | `lang="en"` and the page titles had no local keywords | Set `lang="en-ZA"` and rewrote titles and descriptions around researched local keywords | All pages |
| 14 | The CSS header comment still said "Part 1 base styles, refinement scheduled for Part 2" | Updated the comment | `style.css` |
| 15 | The Google Maps `<iframe>` was a single static view and loads Google tracking cookies | Replaced with an interactive Leaflet/OpenStreetMap map showing all three venues | `contact.html` |
| 16 | Copyright year was hard-coded | Year is now filled in by JavaScript (with 2026 as the fallback) | All pages, `main.js` |

#### Added in Part 3

| Area | Change | Files |
|---|---|---|
| Interactivity | Accordion FAQ, tabs, team bio modals, lightbox gallery, animated counters, scroll animations | `main.js`, `style.css`, `index.html`, `about.html`, `services.html`, `enquiry.html` |
| Map | Leaflet map with venue markers and "fly to venue" buttons | `map.js`, `contact.html` |
| Dynamic content | Upcoming intakes loaded from `data.js`, with search, filters, sorting, shareable URLs, automatic hiding of past events and a details modal | `data.js`, `catalogue.js`, `services.html` |
| Enquiry form | Role-based questions, JavaScript validation, availability/impact response, reference numbers, AJAX submission via Netlify Forms | `enquiry.html`, `validate.js`, `enquiry.js` |
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

Google (no date f) *Search Engine Optimization (SEO) starter guide*. Available at: https://developers.google.com/search/docs/fundamentals/seo-starter-guide (Accessed: 2 November 2026).

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

Schema.org (no date) *NGO*. Available at: https://schema.org/NGO (Accessed: 2 November 2026).

W3C (2023) *Understanding success criterion 1.4.3: Contrast (minimum)*. Web Content Accessibility Guidelines 2.2. Available at: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html (Accessed: 2 November 2026).

W3C WAI (no date a) *Accordion pattern*. ARIA Authoring Practices Guide. Available at: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/ (Accessed: 2 November 2026).

W3C WAI (no date b) *Tabs pattern*. ARIA Authoring Practices Guide. Available at: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ (Accessed: 2 November 2026).

web.dev (no date) *Browser-level image lazy loading for the web*. Available at: https://web.dev/articles/browser-level-image-lazy-loading (Accessed: 2 November 2026).
