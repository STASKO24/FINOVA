import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './services';
import './team-cursor';
gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const officeCards = Array.from(document.querySelectorAll<HTMLElement>('[data-office-card]'));
officeCards.forEach(card => {
  const activate = () => officeCards.forEach(other => other.classList.toggle('is-active', other === card));
  card.addEventListener('pointerenter', activate);
  card.addEventListener('focusin', activate);
});

const team = document.querySelector<HTMLElement>('[data-leadership]');
if (team) {
  const tabs = Array.from(team.querySelectorAll<HTMLButtonElement>('[data-team-tab]'));
  const activateTab = (tab: HTMLButtonElement, focus = false) => {
    tabs.forEach(control => {
      const active = control === tab;
      control.setAttribute('aria-selected', String(active));
      control.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(control.getAttribute('aria-controls')!)!;
      panel.hidden = !active;
      if (active) {
        panel.scrollLeft = 0;
        gsap.fromTo(panel, { opacity: 0, y: reducedMotion.matches ? 0 : 12 }, { opacity: 1, y: 0, duration: reducedMotion.matches ? 0 : .5, ease: 'power2.out', clearProps: 'opacity,transform', overwrite: true });
      }
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : event.key === 'ArrowRight' ? (i + 1) % tabs.length : event.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : -1;
      if (index < 0) return;
      event.preventDefault(); activateTab(tabs[index], true);
    });
  });
  team.querySelectorAll<HTMLElement>('[data-team-track]').forEach(track => {
    const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-director-card]'));
    cards.forEach(card => {
      const activate = () => cards.forEach(other => {
        const active = other === card;
        if (active === other.classList.contains('is-active')) return;
        const image = other.querySelector<HTMLElement>('[data-director-image]')!;
        const current = image.getBoundingClientRect();
        gsap.set(image, { width: current.width, height: current.height });
        other.classList.toggle('is-active', active);
        gsap.to(image, { width: active ? '100%' : '55.238095%', height: active ? '100%' : '55.416667%', duration: reducedMotion.matches ? 0 : .7, ease: 'power3.inOut', overwrite: true });
      });
      card.addEventListener('pointerenter', activate);
      card.addEventListener('focusin', activate);
    });
    let drag: { x: number; scroll: number; moved: boolean } | undefined;
    track.addEventListener('pointerdown', event => {
      if (event.button !== 0 || (event.target as HTMLElement).closest('a')) return;
      drag = { x: event.clientX, scroll: track.scrollLeft, moved: false };
    });
    track.addEventListener('pointermove', event => {
      if (!drag) return;
      const delta = event.clientX - drag.x;
      if (Math.abs(delta) > 5) { drag.moved = true; track.classList.add('is-dragging'); track.setPointerCapture(event.pointerId); }
      if (drag.moved) track.scrollLeft = drag.scroll - delta;
    });
    const endDrag = () => { drag = undefined; track.classList.remove('is-dragging'); };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('lostpointercapture', endDrag);
    track.addEventListener('pointerleave', () => { if (!drag?.moved) endDrag(); });
  });
}

const contact = document.querySelector<HTMLElement>('[data-contact-section]');
const motion = gsap.matchMedia();
motion.add('(prefers-reduced-motion: no-preference)', () => {
  if (!contact) return;
  // Three times the previous travel; the larger crop covers both ends of the frame.
  gsap.fromTo(contact.querySelector('[data-contact-image]'), { yPercent: -18, scale: 1.4 }, {
    yPercent: 18,
    scale: 1.4,
    ease: 'none',
    scrollTrigger: {
      trigger: contact,
      start: 'top bottom',
      end: 'bottom top',
      scrub: .4,
      invalidateOnRefresh: true,
    },
  });
});
void document.fonts.ready.then(() => ScrollTrigger.refresh());
document.addEventListener('finova:layoutchange', () => ScrollTrigger.refresh());
