import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const entries = Array.from(document.querySelectorAll<HTMLElement>('[data-service-entry]'));
const parts = entries.map(entry => ({
  entry,
  trigger: entry.querySelector<HTMLButtonElement>('[data-service-trigger]')!,
  panel: entry.querySelector<HTMLElement>('[data-service-panel]')!,
  details: entry.querySelector<HTMLElement>('.service-entry__details')!,
  media: entry.querySelector<HTMLElement>('[data-service-media]')!,
  image: entry.querySelector<HTMLImageElement>('[data-service-image]')!,
  copy: entry.querySelector<HTMLElement>('.service-entry__copy')!,
}));
let initialReveal: ScrollTrigger | undefined;

const revealImage = (index: number, open: boolean) => {
  const { media, image } = parts[index];
  media.dataset.revealState = open ? 'opening' : 'closing';
  gsap.to(media, {
    clipPath: open ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
    duration: reducedMotion.matches ? 0 : open ? .8 : .55,
    ease: 'power3.inOut',
    overwrite: true,
  });
  gsap.to(image, {
    scale: open ? 1 : 1.18,
    duration: reducedMotion.matches ? 0 : open ? 1 : .6,
    ease: 'power2.inOut',
    overwrite: true,
    onComplete: () => { media.dataset.revealState = open ? 'open' : 'closed'; },
  });
};

const setService = (index: number, open: boolean) => {
  initialReveal?.kill();
  initialReveal = undefined;
  const { entry, trigger, panel, details, media, image, copy } = parts[index];
  gsap.killTweensOf([panel, media, image, copy]);
  trigger.setAttribute('aria-expanded', String(open));
  panel.inert = !open;
  entry.classList.toggle('is-open', open);
  // The photo stays opaque; only its clipping frame and inner scale reveal it.
  gsap.set(panel, { visibility: 'visible' });
  gsap.to(panel, {
    height: open ? details.getBoundingClientRect().height : 0,
    duration: reducedMotion.matches ? 0 : open ? .75 : .6,
    ease: 'power3.inOut',
    onComplete: () => {
      gsap.set(panel, { height: open ? 'auto' : 0, visibility: open ? 'visible' : 'hidden' });
      ScrollTrigger.refresh();
      document.dispatchEvent(new Event('finova:layoutchange'));
    },
  });
  revealImage(index, open);
  gsap.to(copy, { autoAlpha: open ? 1 : 0, duration: reducedMotion.matches ? 0 : .25, delay: reducedMotion.matches || !open ? 0 : .18, ease: 'power2.out' });
};

parts.forEach(({ trigger, panel, media, image, copy }, index) => {
  const open = index === 0;
  const visibleImage = open && reducedMotion.matches;
  gsap.set(panel, { height: open ? 'auto' : 0, visibility: open ? 'visible' : 'hidden' });
  gsap.set(media, { clipPath: visibleImage ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' });
  gsap.set(image, { scale: visibleImage ? 1 : 1.18 });
  gsap.set(copy, { autoAlpha: open ? 1 : 0 });
  media.dataset.revealState = visibleImage ? 'open' : 'closed';
  trigger.addEventListener('click', () => {
    const open = trigger.getAttribute('aria-expanded') !== 'true';
    parts.forEach(({ entry }, i) => { if (entry.classList.contains('is-open') || i === index) setService(i, i === index && open); });
  });
});

if (parts.length && !reducedMotion.matches) {
  initialReveal = ScrollTrigger.create({ trigger: parts[0].media, start: 'top 90%', once: true, onEnter: () => { if (parts[0].entry.classList.contains('is-open')) revealImage(0, true); } });
}

document.querySelectorAll<HTMLAnchorElement>('[data-open-service]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  const index = Number(link.dataset.openService);
  parts.forEach(({ entry }, i) => { if (entry.classList.contains('is-open') || i === index) setService(i, i === index); });
  document.querySelector('#services')?.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
}));

reducedMotion.addEventListener('change', () => {
  if (!reducedMotion.matches) return;
  parts.forEach(({ entry }, index) => setService(index, entry.classList.contains('is-open')));
});
