import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const section = document.querySelector<HTMLElement>('[data-company-stages]');

if (section) {
  const stack = section.querySelector<HTMLElement>('[data-stages-stack]')!;
  const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-stage-card]'));
  const markers = Array.from(section.querySelectorAll<HTMLElement>('[data-stage-marker]'));
  const media = gsap.matchMedia();

  media.add('(prefers-reduced-motion: no-preference)', () => {
    section.classList.add('is-enhanced');
    const animations: gsap.core.Timeline[] = [];

    cards.slice(0, -1).forEach((card, index) => {
      const surface = card.querySelector<HTMLElement>('[data-stage-surface]')!;
      const shade = card.querySelector<HTMLElement>('[data-stage-shade]')!;
      const syncCoveredState = (progress: number) => {
        card.inert = progress >= .999;
        card.dataset.coverProgress = progress.toFixed(4);
      };
      const animation = gsap.timeline({
        scrollTrigger: {
          // Markers stay in the normal document coordinates while cards stick.
          // Refreshing halfway through the stack therefore preserves its timing.
          trigger: markers[index + 1],
          start: 'top bottom',
          end: 'top top',
          scrub: .3,
          invalidateOnRefresh: true,
          onUpdate: self => syncCoveredState(self.progress),
          onRefresh: self => syncCoveredState(self.progress),
        },
      });
      animation
        .to(surface, {
          scale: .88,
          rotationX: -8,
          y: () => -24 * stack.clientWidth / 1440,
          ease: 'none',
          duration: 1,
        }, 0)
        .to(shade, { opacity: .28, ease: 'none', duration: 1 }, 0);
      animations.push(animation);
    });

    const observer = new ResizeObserver(() => ScrollTrigger.refresh());
    observer.observe(stack);
    void document.fonts.ready.then(() => ScrollTrigger.refresh());

    return () => {
      observer.disconnect();
      animations.forEach(animation => {
        animation.scrollTrigger?.kill();
        animation.revert();
      });
      section.classList.remove('is-enhanced');
      cards.forEach(card => { card.inert = false; delete card.dataset.coverProgress; });
    };
  });

  // The preceding scroll scene changes the document height during startup.
  // Resolve this section's deep link after those layouts and fonts are ready.
  if (window.location.hash === '#company-stages') {
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
