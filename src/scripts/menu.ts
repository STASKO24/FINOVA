import { gsap } from 'gsap';

const menu = document.querySelector<HTMLDialogElement>('#site-menu');
const triggers = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-menu-open]'));

if (menu && triggers.length) {
  let activeTrigger = triggers[0];
  const surface = menu.querySelector<HTMLElement>('[data-menu-surface]')!;
  const visual = menu.querySelector<HTMLElement>('[data-menu-visual]')!;
  const images = Array.from(menu.querySelectorAll<HTMLImageElement>('[data-menu-image]'));
  const previewLinks = Array.from(menu.querySelectorAll<HTMLAnchorElement>('[data-menu-preview]'));
  const header = Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-header-item]'));
  const primary = Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-primary-reveal]'));
  const secondary = Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-secondary-reveal]'));
  const socials = Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-social-reveal]'));
  const close = menu.querySelector<HTMLButtonElement>('[data-menu-close]')!;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rollAnimations: gsap.core.Timeline[] = [];
  let state: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
  let destination: HTMLElement | null = null;
  let hoveredLink: HTMLAnchorElement | null = null;
  let focusedLink: HTMLAnchorElement | null = null;
  let previewId: string | null = null;

  function resetPreview() {
    gsap.killTweensOf([visual, ...images]);
    gsap.set(visual, { autoAlpha: 0 });
    gsap.set(images, { autoAlpha: 0, scale: 1 });
    hoveredLink = focusedLink = null;
    previewId = null;
    delete visual.dataset.preview;
  }

  function syncPreview() {
    const nextId = state === 'closing' || state === 'closed' ? null : (hoveredLink ?? focusedLink)?.dataset.menuPreview ?? null;
    if (nextId === previewId) return;
    previewId = nextId;
    const next = images.find(image => image.dataset.menuImage === nextId);
    if (!next) {
      delete visual.dataset.preview;
      gsap.to(visual, { autoAlpha: 0, duration: reducedMotion.matches ? 0 : .25, ease: 'power2.out', overwrite: true });
      return;
    }
    visual.dataset.preview = nextId!;
    const others = images.filter(image => image !== next);
    gsap.set(others, { zIndex: 0 });
    gsap.set(next, { zIndex: 1 });
    gsap.to(visual, { autoAlpha: 1, duration: reducedMotion.matches ? 0 : .35, ease: 'power2.out', overwrite: true });
    gsap.to(others, { autoAlpha: 0, duration: reducedMotion.matches ? 0 : .3, overwrite: true });
    gsap.fromTo(next, { autoAlpha: 0, scale: reducedMotion.matches ? 1 : 1.06 }, { autoAlpha: 1, scale: 1, duration: reducedMotion.matches ? 0 : .6, ease: 'power3.out', overwrite: true });
  }

  function notifyMenuChange() {
    menu!.dispatchEvent(new Event('finova:menuchange'));
  }

  function finishClose() {
    animation.pause(0, true);
    state = 'closed';
    menu!.dataset.state = state;
    triggers.forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
    if (menu!.open) menu!.close();
    rollAnimations.forEach(roll => roll.pause(0, true));
    resetPreview();
    notifyMenuChange();
    activeTrigger.focus({ preventScroll: true });
    if (destination) {
      destination.scrollIntoView({ behavior: 'instant', block: 'start' });
      destination.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
      destination = null;
    }
  }

  const animation = gsap.timeline({
    paused: true,
    onComplete: () => { state = 'open'; menu.dataset.state = state; },
    onReverseComplete: finishClose,
  });
  animation
    .fromTo(surface, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .95, ease: 'power4.inOut' }, 0)
    .fromTo(header, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: .55, stagger: .035, ease: 'power2.out' }, .25)
    .fromTo(primary, { yPercent: 115, rotation: 3 }, { yPercent: 0, rotation: 0, duration: .85, stagger: .08, ease: 'power4.out' }, .38)
    .fromTo(secondary, { yPercent: 115 }, { yPercent: 0, duration: .7, stagger: .065, ease: 'power3.out' }, .62)
    .fromTo(socials, { yPercent: 115 }, { yPercent: 0, duration: .65, stagger: .06, ease: 'power3.out' }, .72);

  function openMenu(source: HTMLButtonElement) {
    if (state === 'open' || state === 'opening') return;
    activeTrigger = source;
    resetPreview();
    state = 'opening';
    menu!.dataset.state = state;
    triggers.forEach(trigger => trigger.setAttribute('aria-expanded', 'true'));
    if (!menu!.open) menu!.showModal();
    notifyMenuChange();
    if (reducedMotion.matches) animation.progress(1).pause();
    else animation.timeScale(1).play();
  }

  function closeMenu() {
    if (state === 'closed' || state === 'closing') return;
    state = 'closing';
    menu!.dataset.state = state;
    triggers.forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
    syncPreview();
    if (reducedMotion.matches || animation.time() === 0) finishClose();
    else animation.timeScale(1.35).reverse();
  }

  triggers.forEach(trigger => trigger.addEventListener('click', () => openMenu(trigger)));
  close.addEventListener('click', closeMenu);
  menu.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
  menu.addEventListener('close', () => { if (!menu.open && state !== 'closed') finishClose(); });
  menu.querySelectorAll<HTMLAnchorElement>('[data-menu-link]').forEach(link => link.addEventListener('click', event => {
    const href = link.getAttribute('href');
    if (href?.startsWith('#')) {
      event.preventDefault();
      destination = document.querySelector<HTMLElement>(href);
    }
    closeMenu();
  }));
  menu.querySelector('[data-menu-home]')!.addEventListener('click', closeMenu);

  previewLinks.forEach(link => {
    link.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hoveredLink = link;
      syncPreview();
    });
    link.addEventListener('pointerleave', () => {
      if (hoveredLink === link) hoveredLink = null;
      syncPreview();
    });
    link.addEventListener('focus', () => {
      if (!link.matches(':focus-visible')) return;
      focusedLink = link;
      syncPreview();
    });
    link.addEventListener('blur', () => {
      if (focusedLink === link) focusedLink = null;
      syncPreview();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-roll]').forEach(label => {
    const control = label.closest<HTMLElement>('a, button')!;
    const text = [label.querySelector<HTMLElement>('.rolling-text__original')!, label.querySelector<HTMLElement>('.rolling-text__copy')!];
    const roll = gsap.timeline({ paused: true }).to(text, { yPercent: -110, duration: .42, ease: 'power3.inOut' });
    rollAnimations.push(roll);
    const enter = () => { if (!reducedMotion.matches) roll.timeScale(1).play(); };
    const leave = () => { if (!control.matches(':focus-visible')) roll.timeScale(1.2).reverse(); };
    control.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') enter(); });
    control.addEventListener('pointerleave', leave);
    control.addEventListener('focus', () => { if (control.matches(':focus-visible')) enter(); });
    control.addEventListener('blur', () => roll.timeScale(1.2).reverse());
  });

  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    rollAnimations.forEach(roll => roll.pause(0, true));
    gsap.killTweensOf([visual, ...images]);
    gsap.set(visual, { autoAlpha: previewId ? 1 : 0 });
    gsap.set(images, { autoAlpha: 0, scale: 1 });
    if (previewId) gsap.set(images.find(image => image.dataset.menuImage === previewId)!, { autoAlpha: 1 });
    if (state === 'closing') finishClose();
    else if (menu.open) animation.progress(1).pause();
  });
}
