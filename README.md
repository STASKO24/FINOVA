# FINOVA — Astro prototype

Live website: [stasko24.github.io/FINOVA](https://stasko24.github.io/FINOVA/).

The homepage follows the updated [FINOVA Exploration design, frame 68:3](https://www.figma.com/design/l2ma2RrGkZDpbYNZgbipX0/FINOVA-Exploration?node-id=68-3). Built with Astro, TypeScript, and GSAP.

## Development

```sh
npm ci
npm run dev
```

Development URL: `http://127.0.0.1:4321/FINOVA/`.

```sh
npm run check
npm run build
npm run preview
```

## Desktop layout

The reference frame is 1440 × 11900 px, with an 820 px hero. A shared container unit (`--u`) scales spacing, typography, and images proportionally to the available desktop width. The hero fills the actual viewport height. There are no separate mobile, tablet, or ultrawide layouts, width breakpoints, or maximum width.

The page includes:

- Full-height hero with four photos, consultation and services links.
- Who we are, four statistics, and a short horizontal photo ribbon.
- Four company-stage cards, followed by the FINOVA values banner.
- Seven-service accordion.
- Singapore and Hong Kong office cards.
- A featured guide and three smaller articles.
- Directors, with Singapore and Hong Kong tabs and a horizontal portrait track.
- Contact banner and footer.

PP Neue Montreal Regular, local photos, flag exports, and the FINOVA marks match the design. Photos are optimized as WebP. Enhanced hero originals remain in `generated_images/`; design exports and research remain in `design-assets/`. Both directories are excluded from Git.

## Interactions

- The hero advances every 5.5 seconds using a 1.4-second GSAP blur transition. Thumbnails, arrow keys, Home/End, and swipes also select slides. The active border fades smoothly. Autoplay pauses on thumbnail hover, keyboard focus, an open menu, a hidden tab, or a covered hero.
- The second section scrolls over the sticky hero while the hero darkens. The photo ribbon moves left by half the desktop width throughout its visible passage, with 0.4-second scroll smoothing. A repeated set of photos keeps both edges filled; reverse scrolling reverses the movement. Statistics stay in the static list layout.
- The company-stage heading and cards remain in one sticky viewport throughout the four-card sequence. Each outgoing left panel closes from bottom to top while its image closes from top to bottom, revealing the next stationary card through GSAP clip paths. Scroll controls all three transitions in both directions, with short pauses between cards and a final hold before the section releases. Inactive cards are inert and hidden from assistive technology; shorter desktop viewports scale the copy to keep all links visible. With reduced motion or without JavaScript, the four cards follow normal document flow.
- The values and contact photographs use scroll-linked vertical parallax. The contact image before the footer has a stronger movement from −18% to +18%, with a constant 1.4 crop that covers the frame throughout the movement.
- The services accordion animates height and opacity. Only one service is expanded at a time; the first is open initially.
- Hovering or focusing an office changes its active color. Hong Kong is active initially.
- Team tabs support click and arrow-key navigation. Hover or keyboard focus expands a portrait. The portrait track supports native horizontal scrolling and dragging.
- The fixed navbar appears on upward scroll and hides on downward scroll. Both Menu buttons open the same animated dialog. Menu images appear only on link hover or keyboard focus.
- EN/CN switches the homepage and menu together. Reduced-motion preferences disable autoplay, scroll effects, and animated transitions.

Primary navigation uses local section anchors. Telephone and email links are actionable. Article and service detail links lead to FINOVA’s official catalog pages; individual article pages are outside this prototype. Footer affiliate contact details reproduce the placeholders in the supplied Figma frame.

## Source organization

- `src/components/`: Astro page sections and shared links.
- `src/data/company-stages.ts`: company-stage content and translations.
- `src/data/home.ts`: services, offices, guides, directors, and translations.
- `src/scripts/`: GSAP motion and interaction logic.
- `src/styles/`: fluid desktop styles.
- `src/layouts/Layout.astro`: metadata, font preload, and theme-aware favicons.

## Deployment

Repository: [STASKO24/FINOVA](https://github.com/STASKO24/FINOVA).

`astro.config.mjs` sets the GitHub Pages site and `/FINOVA` base path. Every push to `main` runs TypeScript checks, builds the static site, and deploys `dist/` through `.github/workflows/deploy.yml`. Pages uses GitHub Actions as its deployment source.

Search engine indexing is disabled for this client prototype.

## Validation

Run `npm run check`, `npm run build`, and `git diff --check` before publishing. Browser checks cover desktop proportions, image loading, overflow, the slideshow and menu, accordion transitions, team tabs and portraits, local anchors, language switching, and scroll effects.
