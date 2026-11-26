import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const story = document.querySelector<HTMLElement>('[data-company-story]');
const hero = document.querySelector<HTMLElement>('[data-carousel]');

if (story && hero) {
  const stage = story.querySelector<HTMLElement>('[data-story-stage]')!;
  const about = story.querySelector<HTMLElement>('[data-story-about]')!;
  const eyebrow = about.querySelector<HTMLElement>('.company-about__eyebrow')!;
  const statistics = story.querySelector<HTMLElement>('[data-story-statistics]')!;
  const cards = Array.from(story.querySelectorAll<HTMLElement>('[data-story-card]'));
  const facts = Array.from(story.querySelectorAll<HTMLElement>('[data-story-stat]'));
  const media = gsap.matchMedia();
  const smoothstep = (value: number) => {
    const t = gsap.utils.clamp(0, 1, value);
    return t * t * (3 - 2 * t);
  };

  media.add('(prefers-reduced-motion: no-preference)', () => {
    story.classList.add('is-enhanced');
    hero.classList.add('is-scroll-background');

    const state = { travel: 0, bend: 0, fact: 0, exit: 0 };
    const geometry = { width: 0, height: 0, unit: 1, factHeights: [] as number[], factRadius: 0 };
    const step = Math.PI * 2 / cards.length;
    const degrees = 180 / Math.PI;
    // This card stays near its starting position as the row curves around it.
    const anchorIndex = 6;

    gsap.set(cards, { xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });
    gsap.set(facts, { xPercent: -100, opacity: 1 });
    gsap.set(about, { autoAlpha: 1, y: 0 });
    gsap.set(eyebrow, { opacity: 1 });
    gsap.set(statistics, { autoAlpha: 0 });
    const cardSetters = cards.map(card => ({
      x: gsap.quickSetter(card, 'x', 'px'),
      y: gsap.quickSetter(card, 'y', 'px'),
      rotation: gsap.quickSetter(card, 'rotation', 'deg'),
    }));
    const factSetters = facts.map(fact => ({
      x: gsap.quickSetter(fact, 'x', 'px'),
      y: gsap.quickSetter(fact, 'y', 'px'),
      opacity: gsap.quickSetter(fact, 'opacity'),
    }));
    const setAboutOpacity = gsap.quickSetter(about, 'opacity');
    const setAboutY = gsap.quickSetter(about, 'y', 'px');
    const setEyebrowOpacity = gsap.quickSetter(eyebrow, 'opacity');
    const setStatisticsOpacity = gsap.quickSetter(statistics, 'opacity');

    function render() {
      const { width, height, unit } = geometry;
      const bend = smoothstep(state.bend);
      const radius = 578 * unit;
      const flatRadius = 180 * unit / step;
      const curveRadius = gsap.utils.interpolate(flatRadius, radius, bend);
      const rowY = Math.min(538 * unit, height - 110 * unit);
      const rowAnchor = (.5 + anchorIndex * 180 - state.travel) * unit;
      const anchorX = gsap.utils.interpolate(rowAnchor, width - radius, bend);
      const anchorY = gsap.utils.interpolate(rowY, height / 2, bend);
      const turn = bend * Math.PI / 2;
      const cosTurn = Math.cos(turn);
      const sinTurn = Math.sin(turn);
      const spin = state.fact * step;
      const cosSpin = Math.cos(spin);
      const sinSpin = Math.sin(spin);

      cardSetters.forEach((set, index) => {
        const offset = index - anchorIndex;
        const angle = offset * step * bend;
        // The same arc tends continuously to a straight line at zero curvature.
        // Keeping its visible anchor in place avoids sweeping the whole row away.
        const arcX = bend < .00001 ? offset * 180 * unit : curveRadius / bend * Math.sin(angle);
        const arcY = bend < .00001 ? 0 : curveRadius / bend * (Math.cos(angle) - 1);
        const x = anchorX + arcX * cosTurn - arcY * sinTurn;
        const y = anchorY + arcX * sinTurn + arcY * cosTurn;
        set.x(width + (x - width) * cosSpin - (y - height / 2) * sinSpin + state.exit * 760 * unit);
        set.y(height / 2 + (x - width) * sinSpin + (y - height / 2) * cosSpin);
        set.rotation((spin - angle) * degrees);
      });

      factSetters.forEach((set, index) => {
        const angle = (index - state.fact) * step;
        set.x((730 - (1 - Math.cos(angle)) * 750) * unit);
        set.y(height / 2 - geometry.factHeights[index] / 2 + Math.sin(angle) * geometry.factRadius);
        set.opacity(.12 + .88 * Math.exp(-Math.pow(angle * degrees / 11, 2)));
      });

      const aboutFade = smoothstep((state.bend - .08) / .48);
      const statisticsReveal = smoothstep((state.bend - .52) / .3);
      setAboutOpacity(1 - aboutFade);
      setAboutY(-32 * unit * aboutFade);
      setEyebrowOpacity(1 - smoothstep((state.bend - .04) / .18));
      about.style.visibility = aboutFade >= 1 ? 'hidden' : 'visible';
      about.inert = aboutFade > .6;
      setStatisticsOpacity(statisticsReveal);
      statistics.style.visibility = statisticsReveal > 0 ? 'visible' : 'hidden';
      story!.dataset.phase = state.exit > 0 ? 'outro' : state.bend <= 0 ? 'ribbon' : state.bend < 1 ? 'bending' : 'statistics';
      story!.dataset.fact = state.fact.toFixed(4);
      story!.dataset.exit = state.exit.toFixed(4);
    }

    function measure() {
      geometry.width = stage.clientWidth;
      geometry.height = stage.clientHeight;
      geometry.unit = geometry.width / 1440;
      geometry.factHeights = facts.map(fact => fact.offsetHeight);
      // Larger captions need enough distance along the arc to pass each other.
      geometry.factRadius = (Math.max(...geometry.factHeights) + 80 * geometry.unit) / Math.sin(step);
      render();
    }

    function setHeroCovered(covered: boolean) {
      if (hero!.dataset.covered === String(covered)) return;
      hero!.dataset.covered = String(covered);
      hero!.inert = covered;
      hero!.dispatchEvent(new Event('finova:coverchange'));
    }

    measure();
    const heroTransition = gsap.to(hero, {
      '--hero-shade': .65,
      ease: 'none',
      scrollTrigger: {
        trigger: story,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        onUpdate: self => setHeroCovered(self.progress >= 1),
      },
    });

    const approach = gsap.to(state, {
      travel: 260,
      ease: 'power1.inOut',
      onUpdate: render,
      scrollTrigger: {
        trigger: story,
        start: 'top 60%',
        end: 'top 20%',
        scrub: .2,
      },
    });

    // Timeline units correspond to pixels in the 1440px design. There are no
    // holds or snapping: rotation overlaps the end of the bend and stays linear.
    const timeline = gsap.timeline({ onUpdate: render });
    timeline
      .to(state, { bend: 1, duration: 900, ease: 'none' }, 0)
      .to(state, { fact: 3, duration: 2030, ease: 'none' }, 820)
      // Clear the complete ring through the right edge before sticky releases.
      .to(state, { exit: 1, duration: 700, ease: 'power1.inOut' }, 2750);

    const sequence = ScrollTrigger.create({
      trigger: story,
      start: 'top 20%',
      end: 'bottom bottom',
      animation: timeline,
      scrub: .25,
      invalidateOnRefresh: true,
      onRefreshInit: measure,
      onRefresh: render,
    });

    const observer = new ResizeObserver(() => ScrollTrigger.refresh());
    observer.observe(stage);
    facts.forEach(fact => observer.observe(fact));
    void document.fonts.ready.then(() => ScrollTrigger.refresh());

    return () => {
      observer.disconnect();
      sequence.kill();
      approach.scrollTrigger?.kill();
      heroTransition.scrollTrigger?.kill();
      timeline.revert();
      approach.revert();
      heroTransition.revert();
      story.classList.remove('is-enhanced');
      hero.classList.remove('is-scroll-background');
      setHeroCovered(false);
      delete hero.dataset.covered;
      delete story.dataset.phase;
      delete story.dataset.fact;
      delete story.dataset.exit;
      about.inert = false;
    };
  });
}
