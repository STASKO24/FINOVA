import { gsap } from 'gsap';

const navbar = document.querySelector<HTMLElement>('[data-scroll-navbar]');
const hero = document.querySelector<HTMLElement>('[data-carousel]');
const menu = document.querySelector<HTMLDialogElement>('#site-menu');

if (navbar && hero && menu) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let previousY = window.scrollY;
  let direction = 0;
  let distance = 0;
  let frame = 0;

  gsap.set(navbar, { y: 0, yPercent: -110, autoAlpha: 0 });

  function setVisible(next: boolean) {
    if (next === visible) return;
    visible = next;
    navbar!.inert = !next;
    navbar!.setAttribute('aria-hidden', String(!next));
    navbar!.dataset.state = next ? 'visible' : 'hidden';
    gsap.to(navbar, {
      yPercent: next ? 0 : -110,
      autoAlpha: next ? 1 : 0,
      duration: reducedMotion.matches ? 0 : next ? .65 : .45,
      ease: next ? 'power3.out' : 'power2.inOut',
      overwrite: true,
    });
  }

  function update() {
    frame = 0;
    // Clamp elastic overscroll so bouncing at a page edge cannot reveal the bar.
    const y = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight));
    const delta = y - previousY;
    previousY = y;
    if (menu!.open) { distance = 0; direction = 0; return; }
    if (y <= hero!.clientHeight) { setVisible(false); distance = 0; direction = 0; return; }
    if (Math.abs(delta) < .5) return;

    const nextDirection = Math.sign(delta);
    if (nextDirection !== direction) { direction = nextDirection; distance = 0; }
    distance += Math.abs(delta);
    const unit = navbar!.clientWidth / 1440;
    if (direction < 0 && distance >= Math.max(10, 12 * unit)) setVisible(true);
    if (direction > 0 && distance >= Math.max(8, 8 * unit)) setVisible(false);
  }

  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener('resize', () => { previousY = window.scrollY; direction = 0; distance = 0; if (previousY <= hero.clientHeight) setVisible(false); });
  menu.addEventListener('finova:menuchange', () => { previousY = window.scrollY; direction = 0; distance = 0; });
  reducedMotion.addEventListener('change', () => {
    gsap.killTweensOf(navbar);
    gsap.set(navbar, { yPercent: visible ? 0 : -110, autoAlpha: visible ? 1 : 0 });
  });
}
