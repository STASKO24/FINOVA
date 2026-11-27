import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const story = document.querySelector<HTMLElement>('[data-company-story]');
const hero = document.querySelector<HTMLElement>('[data-carousel]');
if (story && hero) {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    hero.classList.add('is-scroll-background');
    const covered = (value: boolean) => {
      if (hero.dataset.covered === String(value)) return;
      hero.dataset.covered = String(value);
      hero.inert = value;
      hero.dispatchEvent(new Event('finova:coverchange'));
    };
    const shade = gsap.to(hero, { '--hero-shade': .65, ease: 'none', scrollTrigger: { trigger: story, start: 'top bottom', end: 'top top', scrub: true, onUpdate: self => covered(self.progress >= 1), onRefresh: self => covered(self.progress >= 1) } });
    const ribbonElement = story.querySelector<HTMLElement>('[data-story-ribbon]')!;
    // Follow the entire visible passage of the photos, including reverse scroll.
    // A second copy keeps both viewport edges filled throughout the movement.
    const ribbon = gsap.fromTo(ribbonElement, { x: 0 }, {
      x: () => -.5 * story.clientWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: ribbonElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: .4,
        invalidateOnRefresh: true,
      },
    });
    const observer = new ResizeObserver(() => ScrollTrigger.refresh());
    observer.observe(story);
    void document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => { observer.disconnect(); shade.scrollTrigger?.kill(); ribbon.scrollTrigger?.kill(); shade.revert(); ribbon.revert(); hero.classList.remove('is-scroll-background'); covered(false); delete hero.dataset.covered; };
  });
}
