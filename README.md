# FINOVA — Astro prototype

Live website: [stasko24.github.io/FINOVA](https://stasko24.github.io/FINOVA/).

Five sections from the [FINOVA Exploration design](https://www.figma.com/design/l2ma2RrGkZDpbYNZgbipX0/FINOVA-Exploration?node-id=11-3): the hero, Who we are, statistics, “Where is your company today?”, and the final Finova values section.

## Development

```sh
npm ci
npm run dev
```

Local development URL: `http://127.0.0.1:4321/FINOVA/`.

```sh
npm run check
npm run build
npm run preview
```

## Hero and slideshow

- Astro 7, TypeScript, and GSAP 3.15.
- Reference dimensions: 1440 × 820, a 64 px heading, 32 px location text, 20 px edge spacing, and a 109.91 × 72 px logo.
- One fluid desktop composition using container units: elements scale proportionally to the 1440 px design width. The hero fills the viewport height with `100dvh` and a `100vh` fallback.
- No separate mobile, tablet, or ultrawide layouts, breakpoints, or maximum width.
- Four photos based on the original Figma imagery, PP Neue Montreal Regular, and the original FINOVA logo. The logo silhouette matches the design; a CSS mask controls its color.
- Slides advance every 5.5 seconds, with a 1.4-second transition. GSAP combines a crossfade, directional SVG blur, and subtle image movement.
- Navigation through thumbnails, the ←/→/Home/End keys, and swipes. Playback pauses on keyboard focus, thumbnail hover, a hidden browser tab, or an open menu.
- The active thumbnail border fades in and out over 0.5 seconds, starting with the slide transition. There is no play/pause button. `prefers-reduced-motion` disables autoplay and blur.
- Menu opens the full-screen navigation from its separate design. Contacts opens the official contact page. EN/CN switches the page and menu language together. Hero autoplay also pauses when the second section fully covers it or it leaves the viewport.

The interval and transition settings are in `src/scripts/hero.ts`. Image selection and slide order are in `src/components/Hero.astro`.

The hero and its thumbnails use four enhanced images from the image upscaling chat: the muted lounge version (`exec-49c967b6…`), library (`exec-2b07425a…`), conversation (`exec-c0e802b8…`), and meeting room (`exec-76268065…`). The actual PNG resolution is 1672 × 941 px. Optimized WebP files are named `slide-01-upscaled.webp` through `slide-04-upscaled.webp`; the originals in `generated_images/` remain unchanged. The first thumbnail uses the landscape image without the special crop previously needed for the portrait source.

## Menu

The composition follows the [FINOVA menu design](https://www.figma.com/design/l2ma2RrGkZDpbYNZgbipX0/FINOVA-Exploration?node-id=12-148): a `#220807` background, centered FINOVA mark, 72 px primary links, 20 px secondary links, and an 808 × 587 px image positioned at x=612/y=213 in the 1440 × 820 reference frame. The menu fills the viewport height, and its elements scale with the desktop layout.

The GSAP animations reference [OH Architecture](https://www.oharchitecture.com.au/): the panel reveals from the top, and links appear sequentially through masks. The image area starts empty. An image appears only when a link is hovered or receives keyboard focus. Nine links—the primary and secondary navigation, Contacts, and social links—each use a different existing photo. Images crossfade over 0.6 seconds with a subtle zoom, then fade out over 0.25 seconds when the pointer leaves. Reopening the menu resets the preview.

Menu/Close and navigation labels roll on hover or keyboard focus. Closing reverses the animation. A native dialog supports Escape and focus restoration. The slideshow pauses while the menu is open. `prefers-reduced-motion` makes opening, closing, and image switching immediate.

About closes the menu and scrolls to the local Who we are section. Services scrolls to the four “Where is your company today?” cards. Other links open the corresponding official FINOVA pages.

Implementation: `src/components/Menu.astro`, `src/scripts/menu.ts`, and `src/styles/menu.css`.

## Who we are and statistics

The original copy, nine photos, and colors come from Figma. At a viewport width of 1440 px, the Who we are copy starts at x=730, with a 32 px lead, 16 px body text, and 160 × 160 px photos separated by 20 px gaps. Statistics use 240 px numbers and 64 px captions, both aligned right at x=730 in a 710 px block. These sizes scale fluidly to 320 / 85.33 px at a width of 1920 px. Each statistic is centered vertically using its measured height. Spacing along the arc accounts for the longest caption and updates after language or viewport changes.

The final caption reads “accreditations: ICAEW, CA (Singapore), ACCA”, preserving all three accreditations. At widths of 1280, 1440, and 1920 px, English captions occupy no more than two lines without reducing the font size or clipping text.

The second section scrolls over the sticky hero as the hero darkens proportionally to the scroll, reaching 65%. Scrolling back up reverses the shading.

A shared ribbon of 16 cards moves horizontally for a short distance while the second section's top edge travels from 60% to 20% of the viewport height. GSAP ScrollTrigger then gradually changes its curvature into a circle with a 578 px radius on the right. A visible anchor card stays near its original position, allowing the ribbon to bend without shifting the entire composition sideways.

Rotation begins before the bend finishes. The photo circle and the arc of four statistics move continuously in opposite directions. Their angles depend linearly on scroll distance, with no holds, snapping, or discrete value changes. Every stage works in reverse.

Motion references: [Double circular carousel](https://madewithgsap.com/effects/tutorial040) and [Kononenko Group](https://kononenkogroup.com/). The implementation uses CSS sticky and one GSAP timeline while preserving native page scrolling.

With `prefers-reduced-motion`, the sections follow normal document flow, with a horizontal photo ribbon and a grid showing all statistics. The same layout is available without JavaScript. The ribbon's WebP images total approximately 325 KB and are served from the project.

Before the scene ends, the circle moves smoothly 760 design units beyond the right edge. This exit starts near the end of the rotation and finishes before the sticky scene begins moving upward. The section edge therefore does not cut off the last photo, and the next heading appears after the images have exited.

Implementation: `src/components/CompanyStory.astro`, `src/scripts/story.ts`, and `src/styles/story.css`. After the section reaches 20% of the viewport height, the scroll sequence spans `3450 * var(--u)`: bending takes 900 units; rotation takes 2030 units starting at unit 820; and the rightward exit takes 700 units starting at unit 2750. ScrollTrigger smoothing is 0.25 seconds.

## Navigation on upward scroll

The navbar follows the [Navbar design](https://www.figma.com/design/l2ma2RrGkZDpbYNZgbipX0/FINOVA-Exploration?node-id=36-344): 52 px tall at a width of 1440 px, with a `#FDF5E3` background, `#220807` text, Menu at x=20/y=16, language controls at x≈106, and a 24 × 24 px circular mark at x=708/y=14. Dimensions scale with the rest of the desktop composition.

After the first screen, scrolling up reveals the panel over 0.65 seconds with `power3.out`. Scrolling down hides it over 0.45 seconds with `power2.inOut`. A small direction-change threshold prevents flicker, and elastic overscroll does not trigger it. The hero retains its original navigation. `prefers-reduced-motion` switches the state immediately.

Both Menu buttons open the same menu and restore focus to the button that opened it. EN/CN stays synchronized across the hero, menu, and navbar. The fixed navbar sits outside the page container so it remains at the top of the viewport across all sections.

Implementation: `src/components/ScrollNavbar.astro`, `src/scripts/scroll-navbar.ts`, and `src/styles/scroll-navbar.css`.

## Where is your company today?

Four full-screen cards follow Figma: Setting up, Running your company, Funds and family offices, and Restructuring or closing. Their colors are `#548DDE`, `#6D170A`, `#DE865E`, and `#AD4112`. Original photos are optimized as WebP. At a viewport size of 1440 × 820, outer spacing and the column gap are 20 px, photos occupy 690 × 780 px, headings and numbers are 64 px, and descriptions and service links are 16 px. The copy, including the repeated Executive search row in the second card, follows the design.

The animation references [Scrolling sections / tutorial 031](https://madewithgsap.com/effects/tutorial031): each new card rises over the previous card while the previous card shrinks to 88%, tilts to −8°, and darkens slightly. GSAP ScrollTrigger ties each transition to one viewport of native scrolling, with 0.3-second smoothing. Reverse scrolling restores the previous card. CSS sticky holds the cards, while separate stationary markers preserve their coordinates during refresh and viewport resizing.

Fully covered cards are removed from keyboard navigation with `inert`. Without JavaScript or with `prefers-reduced-motion`, cards follow normal document flow. EN/CN also applies to this section. Service links open FINOVA's official service catalog, and Guide links open Insights. Local deep link: `http://127.0.0.1:4322/FINOVA/#company-stages`.

Implementation: `src/components/CompanyStages.astro`, `src/data/company-stages.ts`, `src/scripts/company-stages.ts`, and `src/styles/company-stages.css`.

## Final section

The final section uses the original interior photo from Figma, the FINOVA / PROFESSIONALISM / PASSION / AGILITY row, a statement, and a Learn more button. At a width of 1440 px, the section is 1080 px tall. The values row sits at y=531 px with 355 px spacing between column starts. The copy occupies a 690 px right column starting at x=730, with a 32 px font. The button is 40 px tall, with 80 px of space below it. All dimensions scale through the shared `--u` unit.

The parallax follows the image movement in the Plan a trip section on [Tengile MalaMala](https://tengilemalamala.com/): a constant scale of 1.12 and a vertical shift from −6% to +6% as the section passes through the viewport. GSAP ScrollTrigger uses `top bottom` → `bottom top`, linear movement, and 0.35-second smoothing. Text scrolls normally, and the section is not pinned. The enlarged image covers the frame throughout its movement. Without JavaScript or with `prefers-reduced-motion`, the image stays static.

EN/CN supports the section's copy. Learn more opens the official About Finova page. Local deep link: `http://127.0.0.1:4322/FINOVA/#finova-values`.

Implementation: `src/components/FinovaValues.astro`, `src/scripts/finova-values.ts`, and `src/styles/finova-values.css`. The 736 × 913 px original is optimized as WebP without increasing its resolution.

## Favicon

The favicon uses the mark from the [light and dark Figma variants](https://www.figma.com/design/l2ma2RrGkZDpbYNZgbipX0/FINOVA-Exploration?node-id=43-354): `#220807` for the light theme and `#FDF5E3` for the dark theme, on a transparent background. `public/favicon-light.png` and `public/favicon-dark.png` are linked in `Layout.astro` using `prefers-color-scheme`; the light version is also the fallback. Both PNGs are 420 × 420 px and preserve the proportions of the original square frames.

## GitHub Pages

Repository: `STASKO24/FINOVA`. The `site` and `base` settings are in `astro.config.mjs`.

The workflow in `.github/workflows/deploy.yml` checks TypeScript, builds Astro, and publishes `dist` on every push to `main`. The Pages source is **GitHub Actions**.

The prototype contains five sections. Search engine indexing is disabled.

## Validation

- `npm run check`: 0 errors, warnings, or hints.
- Astro production build completes successfully.
- Hero, heading, logo, and thumbnail positions checked at 1440 × 820.
- The desktop composition scales proportionally with viewport width, without a 1600 px cap.
- Autoplay, manual selection, rapid-click queuing, keyboard arrows, pause behavior, menu controls, and EN/CN checked.
- All images are served locally, with no temporary Figma asset URLs in the code.
- The horizontal ribbon, intermediate arc, circle, and reverse scrolling checked in the production preview at 1440 × 820. Fluid scaling checked at 1920 × 1080, without horizontal overflow.
- All three card overlaps, reverse scrolling, 690 × 780 px image slots, scaling at 1920 × 1080, the Services menu link, EN/CN, and direct section navigation checked in the browser. Photos and icons load without console errors.
- The circle's exit checked at 1440 × 820 and 1920 × 1080: all photos leave through the right edge before the next heading appears, without horizontal overflow. The navbar appears on upward scroll and hides on downward scroll or near the hero. Both menu triggers, Escape, focus restoration, and EN/CN synchronization work.
- The final section checked at 1440 × 820 and 1920 × 1080: geometry and line wrapping match the design, and the photo moves continuously in both directions while covering the frame. EN/CN and the deep link work. The image loads without horizontal overflow or console errors.
- All four enhanced hero images and all nine menu images load. The menu starts without an image; hovering switches the image and leaving hides it. Eight navigation and social links checked with the keyboard. Reopening resets the preview.
- Statistics use 240/64 px at a width of 1440 px and 320/85.33 px at 1920 px. Numbers and captions share a right edge and do not overlap the photo circle. Long English captions and EN/CN switching checked without console errors. English captions stay within two lines at 1280, 1440, and 1920 px.

Original Figma PNGs are kept in the local `design-assets/` directory, which is excluded from Git. Enhanced source images remain in `generated_images/`, also excluded from Git. The website uses optimized WebP assets.
