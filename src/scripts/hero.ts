import { gsap } from 'gsap';

const hero = document.querySelector<HTMLElement>('[data-carousel]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll<HTMLElement>('[data-slide]'));
  const images = slides.map(slide => slide.querySelector('img')!);
  const buttons = Array.from(hero.querySelectorAll<HTMLButtonElement>('[data-slide-button]'));
  const blurs = Array.from(hero.querySelectorAll<SVGElement>('[data-blur]'));
  const progress = buttons.map(button => button.querySelector<HTMLElement>('.slide-picker__progress')!);
  const playback = hero.querySelector<HTMLButtonElement>('[data-playback]')!;
  const status = hero.querySelector<HTMLElement>('[data-slide-status]')!;
  const picker = hero.querySelector<HTMLElement>('.slide-picker')!;
  const menu = document.querySelector<HTMLDialogElement>('#site-menu')!;
  const openMenu = hero.querySelector<HTMLButtonElement>('[data-menu-open]')!;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 5.5;
  let active = 0;
  let requested = 0;
  let busy = false;
  let userPaused = reducedMotion.matches;
  let hovering = false;
  let focused = false;
  let timer: gsap.core.Tween | undefined;
  let meter: gsap.core.Tween | undefined;

  const shouldPause = () => userPaused || hovering || focused || document.hidden || menu.open;
  const normalize = (index: number) => (index + slides.length) % slides.length;

  function syncPlayback() {
    playback.setAttribute('aria-pressed', String(userPaused));
    playback.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
    timer?.paused(shouldPause());
    meter?.paused(shouldPause());
  }

  function schedule() {
    timer?.kill();
    meter?.kill();
    gsap.set(progress, { scaleX: 0 });
    meter = gsap.to(progress[active], { scaleX: 1, duration: interval, ease: 'none', paused: shouldPause() });
    timer = gsap.delayedCall(interval, () => { void goTo(active + 1, false); });
    timer.paused(shouldPause());
    syncPlayback();
  }

  function finish(index: number, manual: boolean) {
    active = index;
    busy = false;
    hero!.dataset.active = String(active);
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === active);
      slide.setAttribute('aria-hidden', String(i !== active));
      buttons[i].classList.toggle('is-active', i === active);
      buttons[i].setAttribute('aria-pressed', String(i === active));
      blurs[i].setAttribute('stdDeviation', '0 0');
    });
    gsap.set(slides, { clearProps: 'opacity,visibility,zIndex,transform,willChange' });
    gsap.set(images, { clearProps: 'filter,transform,willChange' });
    if (manual) status.textContent = `Image ${active + 1} of ${slides.length}. ${images[active].alt}.`;
    if (requested !== active) void goTo(requested, true);
    else schedule();
  }

  async function goTo(index: number, manual = true) {
    requested = normalize(index);
    if (busy) return; // Keep the latest request; finish the current transition cleanly.
    if (requested === active) { schedule(); return; }
    const next = requested;
    const previous = active;
    busy = true;
    timer?.kill();
    meter?.kill();
    try {
      await images[next].decode();
    } catch {
      if (!images[next].naturalWidth) {
        buttons[next].disabled = true;
        requested = active;
        busy = false;
        userPaused = true;
        status.textContent = 'This image could not be loaded. Choose another image.';
        schedule();
        return;
      }
    }

    gsap.set(slides[previous], { zIndex: 1, willChange: 'opacity' });
    gsap.set(slides[next], { autoAlpha: 0, zIndex: 2, willChange: 'opacity' });
    if (reducedMotion.matches) {
      gsap.to(slides[next], { autoAlpha: 1, duration: .18, onComplete: () => finish(next, manual) });
      return;
    }

    // A horizontal blur builds as the old frame dissolves; the new frame resolves
    // from the same soft, directional blur. Each image has its own SVG filter.
    const blur = { outgoing: 0, incoming: 32 };
    const updateBlur = () => {
      blurs[previous].setAttribute('stdDeviation', `${blur.outgoing} ${blur.outgoing * .18}`);
      blurs[next].setAttribute('stdDeviation', `${blur.incoming} ${blur.incoming * .18}`);
    };
    gsap.set(images[previous], { filter: `url(#hero-blur-${previous})`, willChange: 'filter,transform' });
    gsap.set(images[next], { filter: `url(#hero-blur-${next})`, scale: 1.055, xPercent: 1, willChange: 'filter,transform' });
    updateBlur();
    const transition = gsap.timeline({ onComplete: () => finish(next, manual) });
    transition
      .to(blur, { outgoing: 32, duration: .75, ease: 'power2.inOut', onUpdate: updateBlur }, 0)
      .to(images[previous], { scale: 1.035, xPercent: -1, duration: 1.25, ease: 'power2.inOut' }, 0)
      .to(slides[previous], { autoAlpha: 0, duration: .8, ease: 'power1.inOut' }, .3)
      .to(slides[next], { autoAlpha: 1, duration: .95, ease: 'power1.inOut' }, .2)
      .to(blur, { incoming: 0, duration: 1.25, ease: 'power2.inOut', onUpdate: updateBlur }, .15)
      .to(images[next], { scale: 1, xPercent: 0, duration: 1.4, ease: 'power2.out' }, 0);
  }

  buttons.forEach((button, index) => button.addEventListener('click', () => { void goTo(index); }));
  playback.addEventListener('click', () => { userPaused = !userPaused; syncPlayback(); });
  picker.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovering = true; syncPlayback(); } });
  picker.addEventListener('pointerleave', () => { hovering = false; syncPlayback(); });
  hero.addEventListener('focusin', () => { focused = true; syncPlayback(); });
  hero.addEventListener('focusout', event => {
    if (!hero.contains(event.relatedTarget as Node | null)) { focused = false; syncPlayback(); }
  });
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', () => { userPaused = reducedMotion.matches; syncPlayback(); });

  hero.addEventListener('keydown', event => {
    const target = event.target as HTMLElement;
    if (target !== hero && !target.closest('[data-slide-button]')) return;
    const destination = event.key === 'ArrowRight' ? requested + 1 : event.key === 'ArrowLeft' ? requested - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : null;
    if (destination === null) return;
    event.preventDefault();
    void goTo(destination);
    if (target !== hero) buttons[normalize(destination)].focus();
  });

  let touchStart: { x: number; y: number } | undefined;
  hero.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || (event.target as HTMLElement).closest('a,button')) return;
    touchStart = { x: event.clientX, y: event.clientY };
  });
  hero.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = undefined;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) void goTo(requested + (dx < 0 ? 1 : -1));
  });
  hero.addEventListener('pointercancel', () => { touchStart = undefined; });

  openMenu.addEventListener('click', () => {
    menu.showModal();
    syncPlayback();
    if (!reducedMotion.matches) gsap.fromTo(menu, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: .4, clearProps: 'opacity,transform' });
  });
  document.querySelector('[data-menu-close]')!.addEventListener('click', () => menu.close());
  document.querySelector('[data-menu-home]')!.addEventListener('click', event => { event.preventDefault(); menu.close(); });
  menu.addEventListener('close', () => { syncPlayback(); openMenu.focus(); });

  const translations: Record<string, Record<string, string>> = {
    en: { menu: 'Menu', close: 'Close', contacts: 'Contacts', home: 'Home', about: 'Who we are', title1: 'World-Class', title2: 'Corporate Services', location1: 'Singapore &', location2: 'Hong Kong' },
    zh: { menu: '菜单', close: '关闭', contacts: '联系我们', home: '首页', about: '关于我们', title1: '世界级', title2: '企业服务', location1: '新加坡与', location2: '香港' },
  };
  document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach(button => button.addEventListener('click', () => {
    const language = button.dataset.lang!;
    document.documentElement.lang = language === 'zh' ? 'zh-Hans' : 'en';
    document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(element => { element.textContent = translations[language][element.dataset.i18n!]; });
  }));

  if (!reducedMotion.matches) {
    gsap.from('.header', { opacity: 0, duration: .9, ease: 'power2.out' });
    gsap.from('.hero__content > *', { opacity: 0, y: 18, filter: 'blur(8px)', duration: 1.15, stagger: .1, ease: 'power2.out', clearProps: 'opacity,transform,filter' });
    gsap.from(buttons, { opacity: 0, x: 10, duration: .7, stagger: .08, delay: .15, ease: 'power2.out', clearProps: 'opacity,transform' });
  }
  schedule();
}
