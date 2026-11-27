import { gsap } from 'gsap';

const team = document.querySelector<HTMLElement>('[data-leadership]');
const cursor = team?.querySelector<HTMLElement>('[data-team-cursor]');

if (team && cursor) {
  // Keep viewport coordinates independent of the page's container query context.
  document.body.append(cursor);
  gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: .7, autoAlpha: 0 });
  cursor.dataset.state = 'hidden';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const media = gsap.matchMedia();

  media.add('(hover: hover) and (pointer: fine)', () => {
    const events = new AbortController();
    const tracks = Array.from(team.querySelectorAll<HTMLElement>('[data-team-track]'));
    let activeTrack: HTMLElement | undefined;
    let shown = false;

    const hide = () => {
      if (!shown && !activeTrack) return;
      shown = false;
      activeTrack?.classList.remove('has-team-cursor');
      activeTrack = undefined;
      cursor.dataset.state = 'hidden';
      gsap.to(cursor, { autoAlpha: 0, scale: .7, duration: reducedMotion.matches ? 0 : .15, ease: 'power2.out', overwrite: 'auto' });
    };
    const follow = (track: HTMLElement, event: PointerEvent) => {
      const bounds = track.getBoundingClientRect();
      const target = document.elementFromPoint(event.clientX, event.clientY);
      if (event.pointerType === 'touch' || target?.closest('a,button') || event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) { hide(); return; }
      if (activeTrack !== track) activeTrack?.classList.remove('has-team-cursor');
      activeTrack = track;
      track.classList.add('has-team-cursor');
      if (!shown) {
        gsap.killTweensOf(cursor);
        gsap.set(cursor, { x: event.clientX, y: event.clientY, autoAlpha: 0, scale: .7 });
        gsap.to(cursor, { autoAlpha: 1, scale: event.buttons & 1 ? .9 : 1, duration: reducedMotion.matches ? 0 : .2, ease: 'power3.out' });
      } else gsap.to(cursor, { x: event.clientX, y: event.clientY, duration: reducedMotion.matches ? 0 : .16, ease: 'power3.out', overwrite: 'auto' });
      shown = true;
      cursor.dataset.state = 'visible';
    };

    tracks.forEach(track => {
      track.addEventListener('pointerenter', event => follow(track, event), { signal: events.signal });
      track.addEventListener('pointermove', event => follow(track, event), { signal: events.signal });
      track.addEventListener('pointerleave', hide, { signal: events.signal });
      track.addEventListener('pointerdown', event => {
        if (shown && event.button === 0) gsap.to(cursor, { scale: .9, duration: reducedMotion.matches ? 0 : .15, overwrite: 'auto' });
      }, { signal: events.signal });
      const release = () => { if (shown) gsap.to(cursor, { scale: 1, duration: reducedMotion.matches ? 0 : .2, overwrite: 'auto' }); };
      track.addEventListener('pointerup', release, { signal: events.signal });
      track.addEventListener('pointercancel', hide, { signal: events.signal });
      track.addEventListener('lostpointercapture', release, { signal: events.signal });
    });
    window.addEventListener('scroll', hide, { passive: true, signal: events.signal });
    window.addEventListener('resize', hide, { signal: events.signal });
    window.addEventListener('blur', hide, { signal: events.signal });
    window.addEventListener('keydown', event => { if (event.key === 'Tab' || event.key === 'Escape') hide(); }, { signal: events.signal });
    document.addEventListener('visibilitychange', hide, { signal: events.signal });
    reducedMotion.addEventListener('change', hide, { signal: events.signal });

    return () => {
      events.abort();
      tracks.forEach(track => track.classList.remove('has-team-cursor'));
      gsap.killTweensOf(cursor);
      gsap.set(cursor, { autoAlpha: 0 });
      cursor.dataset.state = 'hidden';
    };
  });
}
