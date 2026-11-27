import { gsap } from 'gsap';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const controls: Array<{ animation: gsap.core.Timeline; active: () => boolean }> = [];

document.querySelectorAll<HTMLAnchorElement>('.action-link').forEach(link => {
  const label = link.querySelector<HTMLElement>('.action-link__label')!;
  const trailing = link.querySelector<HTMLElement>('.action-link__icon--trailing')!;
  const leading = link.querySelector<HTMLElement>('.action-link__icon--leading')!;
  const animation = gsap.timeline({ paused: true,
    onComplete: () => { link.dataset.actionState = 'hovered'; },
    onReverseComplete: () => { link.dataset.actionState = 'idle'; },
  });
  let hovering = false;
  let focused = false;
  let active = false;

  if (link.classList.contains('action-link--split')) {
    animation
      .fromTo(trailing, { scale: 1 }, { scale: 0, duration: .22, ease: 'power2.in', immediateRender: false }, 0)
      .fromTo(label, { '--action-label-progress': 0 }, { '--action-label-progress': 1, duration: .46, ease: 'power3.inOut', immediateRender: false }, .22)
      .fromTo(leading, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .46, ease: 'power3.inOut', immediateRender: false }, .22);
  } else {
    animation
      .fromTo(trailing.firstElementChild, { xPercent: 0, autoAlpha: 1 }, { xPercent: 150, autoAlpha: 0, duration: .2, ease: 'power2.in', immediateRender: false }, 0)
      .fromTo(label, { '--action-label-progress': 0 }, { '--action-label-progress': 1, duration: .52, ease: 'power3.inOut', immediateRender: false }, .12)
      .fromTo(leading, { autoAlpha: 0 }, { autoAlpha: 1, duration: .12, immediateRender: false }, .3)
      .fromTo(leading.firstElementChild, { xPercent: -150 }, { xPercent: 0, duration: .38, ease: 'power3.out', immediateRender: false }, .3);
  }

  link.dataset.actionState = 'idle';
  const sync = () => {
    const next = hovering || focused;
    if (active === next) return;
    active = next;
    link.dataset.actionState = next ? 'entering' : 'leaving';
    if (reducedMotion.matches) {
      animation.progress(next ? 1 : 0).pause();
      link.dataset.actionState = next ? 'hovered' : 'idle';
    } else if (next) animation.timeScale(1).play();
    else animation.timeScale(1.2).reverse();
  };
  link.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovering = true; sync(); } });
  link.addEventListener('pointerleave', () => { hovering = false; sync(); });
  link.addEventListener('focus', () => { focused = link.matches(':focus-visible'); sync(); });
  link.addEventListener('blur', () => { focused = false; sync(); });
  controls.push({ animation, active: () => active });
});

// Distances stay fluid in CSS; a preference change settles any active motion.
const settleControls = () => controls.forEach(({ animation, active }) => animation.progress(active() ? 1 : 0).pause());
reducedMotion.addEventListener('change', settleControls);
