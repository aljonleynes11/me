# Assets

## Images (`assets/images/`)

The site already references these files. To swap any image, replace the file with the same name (or update the `src` in `index.html`).

### App images
| File | Used for |
|------|----------|
| `autoledge-mobile.png` | Hero phone — AutoLedge (center) |
| `bukka-logo.png` | Hero phone (left) + Bukka Services card banner |
| `bukka-business-logo.png` | Hero phone (right) + Bukka Business card banner |
| `autoledgecover.webp` | AutoLedge project card banner |

### Web project logos (`assets/images/projects/`)
| File | Used for |
|------|----------|
| `sigma.png` | Sigma Solutions |
| `iamcare.png` | iamcare |
| `wheelcheck.png` | WheelCheck |
| `bukkaservices.jpg` | Bukka Services |

### Unused (kept but not referenced)
- `bukka-business-cover.png`
- `bukka-mobile-sc.png`

### How images are placed
- **Phone mockups** use `object-fit: contain` centered inside a fixed 9:19 frame — the full image shows, scaled to fit.
- **Card banners** use `object-fit: cover` inside a 130px-tall banner.
- **Web project logos** are grayscale and colorize on hover.

## Quick start

No build step — open `index.html` in a browser, or serve it:

```bash
python -m http.server 8000
# or
npx serve .
```

## Deployment (free options)

- **GitHub Pages** — push to a repo, enable Pages on the root.
- **Cloudflare Pages / Netlify / Vercel** — drag-and-drop or connect the repo.

> Alpine.js loads from a CDN in `index.html`. For zero external dependencies, download `alpine.min.js` into `assets/` and update the `<script>` tag to point at it.
