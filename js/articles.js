/* Keep the reading layout static unless its motion preference permits effects. */
(() => {
  "use strict";
  const preference = window.portfolioMotion || matchMedia("(prefers-reduced-motion: reduce)");
  const active = new Set();
  const seen = new WeakSet();
  let opened = false;
  let request = 0;
  const enter = (element, delay = 0) => {
    if (preference.matches || !element.animate) return;
    const animation = element.animate(
      [{ opacity: 0.45, transform: "translateY(20px)" },
       { opacity: 1, transform: "translateY(0)" }],
      { duration: 720, delay, fill: "backwards", easing: "cubic-bezier(.16,1,.3,1)" },
    );
    active.add(animation);
    animation.finished.catch(() => {}).finally(() => active.delete(animation));
    return animation;
  };
  const ready = Promise.race([
    document.fonts?.ready || Promise.resolve(),
    new Promise((resolve) => setTimeout(resolve, 450)),
  ]);
  const opening = async () => {
    const current = ++request;
    if (opened || document.hidden || preference.matches) return;
    await ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (current !== request || document.hidden || preference.matches || opened) return;
    const hero = document.querySelector(".article-page .hero");
    if (!hero || hero.getBoundingClientRect().bottom <= 0) return;
    opened = true;
    hero.dataset.motionIntro = "playing";
    const arrivals = [...hero.children].map((element, index) => enter(element, Math.min(index, 3) * 80));
    Promise.allSettled(arrivals.filter(Boolean).map((animation) => animation.finished)).then(() => {
      if (current === request) hero.dataset.motionIntro = "complete";
    });
  };
  const targets = [...document.querySelectorAll("article > h2, article > h3, article .figure, .article-card")];
  let observer;
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      if (document.hidden || preference.matches) return;
      for (const entry of entries) {
        if (!entry.isIntersecting || seen.has(entry.target)) continue;
        seen.add(entry.target);
        observer.unobserve(entry.target);
        enter(entry.target);
      }
    }, { threshold: 0.08 });
    targets.forEach((element) => observer.observe(element));
  }
  preference.addEventListener("change", () => {
    if (preference.matches) {
      ++request;
      active.forEach((animation) => animation.cancel());
    } else {
      opening();
      targets.filter((element) => !seen.has(element)).forEach((element) => observer?.observe(element));
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      active.forEach((animation) => animation.pause());
    } else {
      active.forEach((animation) => { if (animation.playState === "paused") animation.play(); });
      opening();
    }
  });
  addEventListener("pageshow", (event) => {
    if (event.persisted) opened = false;
    opening();
  });
  opening();
})();
