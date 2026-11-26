import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const section = document.querySelector<HTMLElement>('[data-finova-values]');

if (section) {
  const image = section.querySelector<HTMLElement>('[data-values-image]')!;
  const media = gsap.matchMedia();

  media.add('(prefers-reduced-motion: no-preference)', () => {
    // The reference keeps a constant 1.12 crop and moves only the image layer.
    // Its extra 6% on each edge covers the frame throughout the scroll range.
    const parallax = gsap.fromTo(image, { yPercent: -6, scale: 1.12 }, {
      yPercent: 6,
      scale: 1.12,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: .35,
        invalidateOnRefresh: true,
      },
    });

    const observer = new ResizeObserver(() => ScrollTrigger.refresh());
    observer.observe(section);
    void document.fonts.ready.then(() => ScrollTrigger.refresh());

    return () => {
      observer.disconnect();
      parallax.scrollTrigger?.kill();
      parallax.revert();
    };
  });

  // The preceding scenes acquire their scroll height during initialization.
  // Resolve a shared deep link after that layout, without overriding user input.
  if (window.location.hash === '#finova-values') {
    const interaction = new AbortController();
    ['wheel', 'touchstart', 'keydown'].forEach(type => window.addEventListener(type, () => interaction.abort(), { once: true, passive: true, signal: interaction.signal }));
    const alignInitialAnchor = async () => {
      await document.fonts.ready;
      ScrollTrigger.refresh();
      if (!interaction.signal.aborted) section.scrollIntoView({ behavior: 'instant', block: 'start' });
      interaction.abort();
    };
    if (document.readyState === 'complete') void alignInitialAnchor();
    else window.addEventListener('load', () => { void alignInitialAnchor(); }, { once: true });
  }
}
