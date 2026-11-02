# Web Development Portfolio: Part 3

This repository contains two websites, each in its own folder with its own README, changelog and references.

| Website | Folder | Live site | Details |
|---|---|---|---|
| **Tshwane Youth Tech Hub**: free coding bootcamps for youth in Tshwane | [`tshwane-youth-tech-hub/`](tshwane-youth-tech-hub/) | https://tshwane-youth-tech-hub.netlify.app | [README](tshwane-youth-tech-hub/README.md) |
| **Kganya Home Cleaning Services**: home and office cleaning in Pretoria | [`kganya-home-cleaning/`](kganya-home-cleaning/) | https://kganya-home-cleaning.netlify.app | [README](kganya-home-cleaning/README.md) |

*Update the live links once both sites are deployed.*

## What Part 3 adds to both sites

- **JavaScript interactivity:** accordions, tabs, modals, a lightbox gallery, an interactive Leaflet map, a mobile menu, and CSS/JavaScript animations.
- **Dynamic content:** programme intakes (Tshwane) and services with prices (Kganya) are loaded from `js/data.js`, with search, filter and sort.
- **Forms:** the enquiry forms validate every field with JavaScript, respond with availability, prices or sponsorship impact, and submit with AJAX (Netlify Forms). The contact forms validate and compile an email to the organisation.
- **SEO:** keyword-based titles and descriptions, structured data, descriptive image names and alt text, `robots.txt` and `sitemap.xml`.
- **Speed and security:** compressed images, lazy loading, deferred scripts, a Content Security Policy, Subresource Integrity and Netlify security headers.

Each site's README lists every change in its changelog, including the corrections to Part 2.

## Running locally

Open either folder's `index.html` in a browser, or run a local server from the repository root:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/tshwane-youth-tech-hub/` or `http://localhost:8000/kganya-home-cleaning/`.

## Deploying

Each site is deployed as a **separate Netlify site from this one repository**, using the folder as the base directory. Step-by-step instructions are in each site's README under *Running and deploying the site*.

GitHub Pages also works (both sites would be at `https://<username>.github.io/<repository>/<folder>/`), but Netlify is recommended because Netlify Forms stores the enquiry submissions and the `_headers` security file only works on Netlify. On GitHub Pages the forms still validate and show their responses, and visitors are given the phone number and email to use instead.
