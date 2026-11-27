import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const story = document.querySelector<HTMLElement>('[data-company-story]');
const hero = document.querySelector<HTMLElement>('[data-carousel]');
const numberFormat = new Intl.NumberFormat('en-US');
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
    const counters = Array.from(story.querySelectorAll<HTMLElement>('[data-stat-value]')).map(element => {
      const finalText = element.textContent!;
      const suffix = element.dataset.statSuffix ?? '';
      const state = { value: 0 };
      element.textContent = `0${suffix}`;
      element.dataset.statState = 'waiting';
      const tween = gsap.to(state, {
        value: Number(element.dataset.statValue),
        duration: 1.8,
        ease: 'power2.out',
        paused: true,
        onStart: () => { element.dataset.statState = 'counting'; },
        onUpdate: () => {
          const text = `${numberFormat.format(Math.round(state.value))}${suffix}`;
          if (element.textContent !== text) element.textContent = text;
        },
        onComplete: () => { element.textContent = finalText; element.dataset.statState = 'complete'; },
      });
      const trigger = ScrollTrigger.create({
        trigger: element.closest('[data-story-stat]')!,
        start: 'top 85%',
        once: true,
        onEnter: () => { tween.play(); },
      });
      return { element, finalText, tween, trigger };
    });
    const observer = new ResizeObserver(() => ScrollTrigger.refresh());
    observer.observe(story);
    void document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => {
      observer.disconnect();
      counters.forEach(({ element, finalText, tween, trigger }) => {
        trigger.kill();
        tween.kill();
        element.textContent = finalText;
        delete element.dataset.statState;
      });
      shade.scrollTrigger?.kill();
      ribbon.scrollTrigger?.kill();
      shade.revert();
      ribbon.revert();
      hero.classList.remove('is-scroll-background');
      covered(false);
      delete hero.dataset.covered;
    };
  });
}
