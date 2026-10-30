/* Motion stays inside the existing frame; the static HTML is the fallback. */
(() => {
  "use strict";
  const preference =
    window.portfolioMotion || matchMedia("(prefers-reduced-motion: reduce)");
  const ease = "cubic-bezier(.16,1,.3,1)";
  const animations = new Set();
  const introAnimations = new Set();
  const animate = (element, frames, options) => {
    if (preference.matches || !element?.animate) return null;
    const animation = element.animate(frames, { easing: ease, ...options });
    animations.add(animation);
    animation.finished
      .catch(() => {})
      .finally(() => animations.delete(animation));
    return animation;
  };
  preference.addEventListener("change", () => {
    if (preference.matches)
      document.getAnimations().forEach((animation) => animation.cancel());
  });
  const introAnimate = (element, frames, options) => {
    const animation = animate(element, frames, options);
    if (animation) {
      introAnimations.add(animation);
      animation.finished
        .catch(() => {})
        .finally(() => introAnimations.delete(animation));
    }
    return animation;
  };
  let openingRun = 0;

  function opening() {
    const title = document.querySelector(".hero-name");
    if (!title) return;
    const run = ++openingRun;
    introAnimations.forEach((animation) => animation.cancel());
    document.documentElement.dataset.introState = "playing";
    title.setAttribute(
      "aria-label",
      title.textContent.trim().replace(/\s+/g, " "),
    );
    if (!title.querySelector(".hero-letter"))
      title.querySelectorAll(":scope > span").forEach((word) => {
        word.classList.add("hero-word");
        word.setAttribute("aria-hidden", "true");
        const text = word.textContent;
        word.textContent = "";
        for (const character of text) {
          const letter = document.createElement("span");
          letter.className = "hero-letter";
          letter.textContent = character;
          word.append(letter);
        }
      });
    title.querySelectorAll(".hero-letter").forEach((letter, index) => {
      introAnimate(
        letter,
        [
          { transform: "translateY(125%) rotate(12deg)", opacity: 0.2 },
          { transform: "translateY(0) rotate(0)", opacity: 1 },
        ],
        {
          duration: 1200,
          delay: index * 55,
          fill: "backwards",
          easing: "cubic-bezier(.22,.68,.15,1)",
        },
      );
    });
    introAnimate(
      document.querySelector(".hero-portrait picture"),
      [
        { clipPath: "inset(0 100% 0 0)", transform: "scale(.96)" },
        { clipPath: "inset(0 0% 0 0)", transform: "scale(1)" },
      ],
      { duration: 1450, delay: 180, fill: "backwards" },
    );
    document
      .querySelectorAll(".hero-intro > *, .hero-bottom")
      .forEach((element, i) => {
        introAnimate(
          element,
          [
            { opacity: 0.25, transform: "translateY(36px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 900, delay: 250 + i * 90, fill: "backwards" },
        );
      });
    Promise.allSettled(
      [...introAnimations].map((animation) => animation.finished),
    ).then(() => {
      if (run === openingRun)
        document.documentElement.dataset.introState = "complete";
    });
  }

  function openingLifecycle() {
    const title = document.querySelector(".hero-name");
    if (!title) return;
    let request = 0;
    let queued = true;
    let hasPlayed = false;
    const titleIsVisible = () => {
      const rect = title.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < innerHeight;
    };
    const ready = Promise.race([
      document.fonts?.ready || Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 450)),
    ]);
    const play = async () => {
      const current = ++request;
      queued = true;
      if (document.hidden || preference.matches || !titleIsVisible()) return;
      await ready;
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      if (
        current !== request ||
        document.hidden ||
        preference.matches ||
        !titleIsVisible()
      )
        return;
      queued = false;
      hasPlayed = true;
      opening();
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && queued) play();
      }).observe(title);
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        introAnimations.forEach((animation) => {
          if (animation.playState === "running") animation.pause();
        });
      } else {
        introAnimations.forEach((animation) => {
          if (animation.playState === "paused") animation.play();
        });
        if (queued || !hasPlayed) play();
      }
    });
    addEventListener("pageshow", (event) => {
      if (event.persisted || !hasPlayed) play();
    });
    preference.addEventListener("change", () => {
      if (preference.matches) ++request;
      else play();
    });
    play();
  }

  function rotatingProfession() {
    const root = document.querySelector(".role-rotator");
    if (!root) return;
    const roles = [...root.querySelectorAll(".role-line")];
    let index = 0;
    let timer;
    const running = new Set();
    const isVisible = () => {
      const rect = root.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < innerHeight;
    };
    const stop = () => {
      clearTimeout(timer);
      running.forEach((animation) => animation.cancel());
      running.clear();
    };
    const remember = (animation) => {
      if (!animation) return;
      running.add(animation);
      animation.finished.catch(() => {}).finally(() => running.delete(animation));
    };
    const schedule = () => {
      clearTimeout(timer);
      if (preference.matches || document.hidden || !isVisible()) return;
      timer = setTimeout(() => {
        if (document.hidden || preference.matches || !isVisible()) return;
        const outgoing = roles[index];
        index = (index + 1) % roles.length;
        const incoming = roles[index];
        outgoing.classList.remove("is-current");
        incoming.classList.add("is-current");
        remember(animate(outgoing,
          [{ transform: "translateY(0)", opacity: 1 },
           { transform: "translateY(-110%)", opacity: 0 }],
          { duration: 420 }));
        remember(animate(incoming,
          [{ transform: "translateY(110%)", opacity: 0 },
           { transform: "translateY(0)", opacity: 1 }],
          { duration: 600 }));
        schedule();
      }, 3200);
    };
    if ("IntersectionObserver" in window)
      new IntersectionObserver(() => { stop(); schedule(); }).observe(root);
    else addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", () => { stop(); schedule(); });
    preference.addEventListener("change", () => { stop(); schedule(); });
    addEventListener("pageshow", schedule);
    schedule();
  }

  function headings() {
    document.querySelectorAll("h2.reveal").forEach((heading) => {
      // Preserve nested links and manual line breaks, if any are added later.
      if (heading.children.length) return;
      const label = heading.textContent.trim().replace(/\s+/g, " ");
      heading.setAttribute("aria-label", label);
      heading.classList.add("motion-heading");
      heading.textContent = "";
      label.split(" ").forEach((word, i) => {
        if (i) heading.append(" ");
        const mask = document.createElement("span");
        mask.className = "word-mask";
        mask.setAttribute("aria-hidden", "true");
        const inner = document.createElement("span");
        inner.className = "word-rise";
        inner.style.setProperty("--word-index", i);
        inner.textContent = word;
        mask.append(inner);
        heading.append(mask);
      });
    });
  }

  function figures() {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          if (preference.matches) return;
          const element = entry.target;
          const first = element.firstChild;
          const original = first.textContent;
          const target = Number.parseInt(original, 10);
          if (!Number.isFinite(target)) return;
          const accessible = document.createElement("span");
          accessible.className = "sr-only";
          accessible.textContent = element.textContent;
          const visual = document.createElement("span");
          visual.className = "figure-value";
          visual.setAttribute("aria-hidden", "true");
          visual.textContent = original;
          first.replaceWith(visual);
          element
            .querySelectorAll(":scope > span:not(.figure-value)")
            .forEach((unit) => {
              unit.setAttribute("aria-hidden", "true");
            });
          element.append(accessible);
          let frame;
          const started = performance.now();
          const tick = (now) => {
            const progress = Math.min(1, (now - started) / 1050);
            if (preference.matches || document.hidden || progress === 1) {
              visual.textContent = original;
              cancelAnimationFrame(frame);
              return;
            }
            visual.textContent = `${String(Math.round(target * (1 - (1 - progress) ** 4))).padStart(String(target).length, "0")}${original.includes("+") ? "+" : ""}`;
            frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.65 },
    );
    document
      .querySelectorAll(".proof-number")
      .forEach((element) => observer.observe(element));
  }

  function depth() {
    if (!("IntersectionObserver" in window)) return;
    const photos = [
      ...document.querySelectorAll(
        ".hero-portrait picture, .about-photo-frame, .cryptme-media",
      ),
    ];
    const visible = new Set();
    const frames = new Map();
    let scheduled = false;
    let enabled = !preference.matches;
    const paint = () => {
      scheduled = false;
      visible.forEach((element) => {
        const image = element.querySelector("img");
        if (!image) return;
        const rect = frames.get(element);
        if (!enabled || !rect) {
          image.style.removeProperty("transform");
          return;
        }
        const progress = Math.max(
          -1,
          Math.min(
            1,
            (rect.top + rect.height / 2 - scrollY - innerHeight / 2) /
              (innerHeight / 2 + rect.height / 2),
          ),
        );
        image.style.transform = `translateY(${progress * 2.2}%) scale(1.055)`;
      });
    };
    const request = () => {
      if (!enabled || document.hidden || scheduled || !visible.size) return;
      scheduled = true;
      requestAnimationFrame(paint);
    };
    const measure = () => {
      photos.forEach((element) => {
        const rect = element.getBoundingClientRect();
        frames.set(element, { top: rect.top + scrollY, height: rect.height });
      });
      request();
    };
    photos.forEach((element) => element.classList.add("depth-frame"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) visible.add(target);
        else visible.delete(target);
      });
      measure();
    });
    photos.forEach((element) => observer.observe(element));
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", measure, { passive: true });
    // Expanded coursework/project details change section positions.
    if ("ResizeObserver" in window)
      new ResizeObserver(measure).observe(document.body);
    preference.addEventListener("change", () => {
      enabled = !preference.matches;
      photos.forEach((element) =>
        element.querySelector("img")?.style.removeProperty("transform"),
      );
      measure();
    });
    document.addEventListener("visibilitychange", request);
  }

  function education() {
    const gallery = document.querySelector("#education-gallery");
    if (!gallery) return;
    const section = document.querySelector("#education");
    const slides = [...gallery.querySelectorAll(".campus-slide")];
    const controls = gallery.querySelector(".campus-controls");
    const stage = gallery.querySelector(".campus-stage");
    const choices = [...gallery.querySelectorAll(".campus-picker button")];
    const previous = gallery.querySelector(".campus-prev");
    const next = gallery.querySelector(".campus-next");
    const navigation = [previous, next, ...choices];
    const status = gallery.querySelector(".campus-status");
    const italian = document.documentElement.lang === "it";
    let current = 0;
    let sequence = 0;
    let timer;
    let userPaused = true;
    let hovered = false;
    let touching = false;
    let focused = false;
    let locked = false;
    const interval = 7000;
    const paused = () => userPaused || hovered || touching || focused || locked || document.hidden || preference.matches;
    const schedule = () => {
      clearTimeout(timer);
      if (paused()) return;
      const rect = stage.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= innerHeight) return;
      timer = setTimeout(() => { show(current + 1, false); schedule(); }, interval);
    };
    const show = (index, manual = true, instant = false) => {
      const target = (index + slides.length) % slides.length;
      const request = ++sequence;
      const outgoing = slides[current];
      const incoming = slides[target];
      slides.forEach((slide, i) => {
        slide.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
        slide.hidden = slide !== incoming && (!instant && slide === outgoing ? false : true);
        slide.inert = i !== target;
        slide.setAttribute("aria-hidden", String(i !== target));
        slide.classList.toggle("is-current", i === target);
      });
      current = target;
      choices.forEach((button, i) => button.setAttribute("aria-pressed", String(i === current)));
      gallery.querySelector(".campus-count").textContent = italian
        ? (current + 1) + " di " + slides.length : (current + 1) + " of " + slides.length;
      if (manual) status.textContent = incoming.querySelector("figcaption").textContent.trim();
      const transition = !instant && incoming !== outgoing
        ? animate(incoming.querySelector(".campus-image"), [{ opacity: 0 }, { opacity: 1 }], { duration: 600 })
        : null;
      const finish = () => {
        if (request === sequence) slides.forEach(slide => { slide.hidden = slide !== incoming; });
      };
      if (transition) transition.finished.catch(() => {}).then(finish);
      else finish();
      if (manual) schedule();
    };
    const sync = () => {
      const active = section.querySelector('details[data-university][data-expanded="true"]');
      locked = Boolean(active);
      navigation.forEach(button => { button.disabled = locked; });
      if (active) show(slides.findIndex(slide => slide.dataset.university === active.dataset.university), true, true);
      schedule();
    };
    slides.forEach(slide => { slide.querySelector("img").loading = "eager"; });
    gallery.classList.add("gallery-ready");
    gallery.setAttribute("aria-roledescription", "carousel");
    controls.hidden = false;
    show(0, false, true);
    choices.forEach((button, i) => button.addEventListener("click", () => { if (!locked) show(i); }));
    previous.addEventListener("click", () => { if (!locked) show(current - 1); });
    next.addEventListener("click", () => { if (!locked) show(current + 1); });
    gallery.addEventListener("keydown", event => {
      if (locked || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      show(event.key === "Home" ? 0 : event.key === "End" ? slides.length - 1 : current + (event.key === "ArrowRight" ? 1 : -1));
    });
    gallery.addEventListener("mouseenter", () => { hovered = true; schedule(); });
    gallery.addEventListener("mouseleave", () => { hovered = false; schedule(); });
    gallery.addEventListener("focusin", () => { focused = true; schedule(); });
    gallery.addEventListener("focusout", () => {
      queueMicrotask(() => { focused = gallery.contains(document.activeElement); schedule(); });
    });
    let touch;
    stage.addEventListener("touchstart", event => {
      touching = true;
      touch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      schedule();
    }, { passive: true });
    stage.addEventListener("touchend", event => {
      if (touch && !locked) {
        const x = event.changedTouches[0].clientX - touch.x;
        const y = event.changedTouches[0].clientY - touch.y;
        if (Math.abs(x) > 50 && Math.abs(x) > Math.abs(y) * 1.5) show(current + (x < 0 ? 1 : -1));
      }
      touch = null; touching = false; schedule();
    }, { passive: true });
    stage.addEventListener("touchcancel", () => { touch = null; touching = false; schedule(); }, { passive: true });
    section.addEventListener("disclosure-state", sync);
    if ("IntersectionObserver" in window) new IntersectionObserver(schedule, { threshold: 0.05 }).observe(stage);
    preference.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", schedule);
    addEventListener("pageshow", schedule);
    sync();
  }

  openingLifecycle();
  rotatingProfession();
  headings();
  figures();
  depth();
  education();
})();
