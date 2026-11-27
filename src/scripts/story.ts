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
    const ribbon = gsap.fromTo(story.querySelector('[data-story-ribbon]'), { x: () => 180 * story.clientWidth / 1440 }, { x: 0, ease: 'none', scrollTrigger: { trigger: story, start: 'top 80%', end: 'top 20%', scrub: .35, invalidateOnRefresh: true } });
    const observer = new ResizeObserver(() => ScrollTrigger.refresh());
    observer.observe(story);
    void document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => { observer.disconnect(); shade.scrollTrigger?.kill(); ribbon.scrollTrigger?.kill(); shade.revert(); ribbon.revert(); hero.classList.remove('is-scroll-background'); covered(false); delete hero.dataset.covered; };
  });
}
