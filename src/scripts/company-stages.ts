import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const section = document.querySelector<HTMLElement>('[data-company-stages]');

if (section) {
  const scene = section.querySelector<HTMLElement>('[data-stages-scene]')!;
  const stack = section.querySelector<HTMLElement>('[data-stages-stack]')!;
  const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-stage-card]'));
  const media = gsap.matchMedia();

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const initialHold = .2;
    const betweenCards = .15;
    const finalHold = .25;
    const transitionStarts: number[] = [];
    const animation = gsap.timeline({ paused: true });
    let refreshFrame = 0;
    let disposed = false;

    section.classList.add('is-enhanced');
    animation.to({}, { duration: initialHold });

    // Each outgoing card reveals the stationary card underneath. The two
    // halves close in opposite directions, without moving or scaling the art.
    cards.slice(0, -1).forEach((card, index) => {
      const start = animation.duration();
      transitionStarts.push(start);
      animation.fromTo(card.querySelector('[data-stage-copy-mask]'), {
        clipPath: 'inset(0% 0% 0% 0%)',
      }, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 1,
        ease: 'none',
        immediateRender: false,
      }, start);
      animation.fromTo(card.querySelector('[data-stage-image-mask]'), {
        clipPath: 'inset(0% 0% 0% 0%)',
      }, {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 1,
        ease: 'none',
        immediateRender: false,
      }, start);
      if (index < cards.length - 2) animation.to({}, { duration: betweenCards });
    });
    animation.to({}, { duration: finalHold });

    const scrollDistance = () => scene.clientHeight * .85 * animation.duration();
    const updateLayout = () => {
      section.style.setProperty('--stage-scroll', `${scrollDistance()}px`);
      // Preserve the width-based type scale unless a shorter desktop viewport
      // needs a smaller content scale to keep every service link in the frame.
      section.style.setProperty('--stage-copy-u', `${Math.min(section.clientWidth / 1440, stack.clientHeight / 650)}px`);
    };
    const syncActiveCard = () => {
      const active = transitionStarts.filter(start => animation.time() >= start + .5).length;
      section.dataset.activeStage = String(active);
      cards.forEach((card, index) => {
        card.inert = index !== active;
        card.setAttribute('aria-hidden', String(index !== active));
      });
    };

    updateLayout();
    animation.eventCallback('onUpdate', syncActiveCard);
    const trigger = ScrollTrigger.create({
      trigger: section,
      animation,
      start: () => `top+=${parseFloat(getComputedStyle(section).paddingTop)} top`,
      end: () => `+=${scrollDistance()}`,
      scrub: .4,
      invalidateOnRefresh: true,
    });
    syncActiveCard();

    // CSS sticky holds the whole scene inside this measured scroll runway.
    // The heading and all card bounds share the same fixed viewport position.
    ScrollTrigger.addEventListener('refreshInit', updateLayout);
    const observer = new ResizeObserver(() => {
      if (refreshFrame) return;
      refreshFrame = requestAnimationFrame(() => {
        refreshFrame = 0;
        ScrollTrigger.refresh();
      });
    });
    observer.observe(scene);
    observer.observe(stack);
    void document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });

    return () => {
      disposed = true;
      cancelAnimationFrame(refreshFrame);
      observer.disconnect();
      ScrollTrigger.removeEventListener('refreshInit', updateLayout);
      trigger.kill();
      animation.revert();
      section.classList.remove('is-enhanced');
      section.style.removeProperty('--stage-scroll');
      section.style.removeProperty('--stage-copy-u');
      delete section.dataset.activeStage;
      cards.forEach(card => { card.inert = false; card.removeAttribute('aria-hidden'); });
    };
  });

  if (window.location.hash === '#company-stages') {
    const interaction = new AbortController();
    ['wheel', 'touchstart', 'keydown'].forEach(type => window.addEventListener(type, () => interaction.abort(), { once: true, passive: true, signal: interaction.signal }));
    const alignInitialAnchor = async () => {
      await document.fonts.ready;
      ScrollTrigger.refresh();
      if (!interaction.signal.aborted) {
        if (section.classList.contains('is-enhanced')) {
          const top = section.getBoundingClientRect().top + window.scrollY + parseFloat(getComputedStyle(section).paddingTop);
          window.scrollTo({ top, behavior: 'instant' });
        } else section.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
      interaction.abort();
    };
    if (document.readyState === 'complete') void alignInitialAnchor();
    else window.addEventListener('load', () => { void alignInitialAnchor(); }, { once: true });
  }
}
