# Squnga'esihle Trading (Pty) Ltd — Company Website

A three-page static website for **Squnga'esihle Trading (Pty) Ltd** — project
management, social facilitation and housing development across KwaZulu-Natal.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | **Home** — full-width hero slideshow (the project journey), company overview, core services, credentials and contact. |
| `about.html` | **About** — background story, CEO profile, vision & mission, the three pillars, and track record. |
| `projects.html` | **Projects** — project portfolio, the full "Project Journey" photo gallery, and accreditations/company details. |

## Structure

```
├── index.html · about.html · projects.html
├── assets/
│   ├── css/styles.css     # shared theme (deep-green blueprint / industrial style)
│   ├── js/main.js         # nav, hero slideshow, credential modals, lightbox
│   └── img/
│       ├── logo.jpg / logo.png   # brand seal (cropped from source)
│       ├── favicon.png
│       └── gallery/00.jpg … 21.jpg   # ordered project-journey photos
```

## The hero slideshow

The landing page carries a full-width carousel that tells the story of a
project from start to finish, in photo order. It:

- auto-advances every 5 seconds, with an animated progress bar;
- can be paused/played (❚❚ button, or `Space`);
- is fully user-controllable — prev/next arrows, clickable dots, arrow keys, and swipe on touch;
- pauses on hover and respects the *reduce motion* accessibility setting;
- shows each photo's phase (Research → Engagement → Construction → Handover) and caption.

## Content source

All copy and company details are taken from the official company profile
document. The visual theme (colours, monospace type, heavy blueprint borders)
is preserved from the original brand concept.

## Running locally

It's plain HTML/CSS/JS — open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```
