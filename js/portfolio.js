/* Progressive enhancements. Native HTML keeps the page readable without JS. */
(() => {
  "use strict";
  const italian = document.documentElement.lang === "it";
  const t = (en, it) => italian ? it : en;
  const motion =
    window.portfolioMotion || matchMedia("(prefers-reduced-motion: reduce)");

  function readingProgress() {
    const header = document.querySelector("#site-header");
    if (!header) return;
    let pending = false;
    const paint = () => {
      pending = false;
      const distance = document.documentElement.scrollHeight - innerHeight;
      const progress = distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0;
      header.style.setProperty("--scroll-progress", progress.toFixed(6));
      document.documentElement.style.setProperty("--header-height", `${header.offsetHeight}px`);
    };
    const request = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(paint);
    };
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request, { passive: true });
    addEventListener("pageshow", request);
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(request);
      observer.observe(document.body);
      observer.observe(header);
    }
    paint();
  }

  function disclosures() {
    document.querySelectorAll("details").forEach((details) => {
      const summary = details.querySelector(":scope > summary");
      if (!summary) return;
      const content = document.createElement("div");
      content.className = "disclosure-content";
      for (const node of [...details.childNodes])
        if (node !== summary) content.append(node);
      details.append(content);
      let expanded = details.open;
      let animation = null;
      let run = 0;
      content.inert = !expanded;
      const setOpen = (want) => {
        const current = ++run;
        const from = details.open ? content.getBoundingClientRect().height : 0;
        animation?.cancel();
        animation = null;
        expanded = want;
        if (!want && content.contains(document.activeElement)) summary.focus();
        content.inert = !want;
        if (motion.matches || typeof content.animate !== "function") {
          details.open = want;
          content.style.removeProperty("overflow");
          return;
        }
        details.open = true;
        content.style.overflow = "hidden";
        animation = content.animate(
          [{ height: `${from}px`, opacity: want ? 0.35 : 1 },
           { height: `${want ? content.scrollHeight : 0}px`, opacity: want ? 1 : 0 }],
          { duration: want ? 440 : 280, easing: "cubic-bezier(.22,1,.36,1)" },
        );
        animation.finished.catch(() => {}).finally(() => {
          if (current !== run) return;
          details.open = want;
          content.style.removeProperty("overflow");
          animation = null;
        });
      };
      summary.addEventListener("click", (event) => {
        event.preventDefault();
        setOpen(!expanded);
      });
      summary.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        if (!event.repeat) setOpen(!expanded);
      });
      details.addEventListener("disclosure-request", (event) => {
        event.preventDefault();
        setOpen(true);
      });
      details.addEventListener("toggle", () => {
        if (!animation) {
          expanded = details.open;
          content.inert = !expanded;
        }
      });
      motion.addEventListener("change", () => {
        if (motion.matches && animation) setOpen(expanded);
      });
    });
  }

  function navigation() {
    const button = document.querySelector("#nav-toggle");
    const dialog = document.querySelector("#nav-menu");
    if (!button || !dialog || typeof dialog.showModal !== "function") return;
    button.hidden = false;
    let destination = null;
    let closing = false;
    dialog.querySelectorAll("nav a").forEach((link, index) => {
      link.style.setProperty("--menu-index", index);
    });
    const closeMenu = () => {
      if (closing) return;
      if (motion.matches) return dialog.close();
      closing = true;
      const exit = dialog.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }],
        { duration: 230, easing: "cubic-bezier(.76,0,.24,1)" },
      );
      exit.finished
        .catch(() => {})
        .finally(() => {
          dialog.close();
          closing = false;
        });
    };
    motion.addEventListener("change", () => {
      if (motion.matches)
        dialog.getAnimations().forEach((animation) => animation.cancel());
    });
    button.addEventListener("click", () => {
      dialog.showModal();
      button.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
    });
    dialog.querySelector(".close-menu").addEventListener("click", closeMenu);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeMenu();
    });
    dialog.addEventListener("click", (event) => {
      const backdrop =
        event.target === dialog &&
        event.clientX < dialog.getBoundingClientRect().left;
      const link = event.target.closest('a[href^="#"]');
      if (link) destination = document.getElementById(link.hash.slice(1));
      if (backdrop || link) closeMenu();
    });
    dialog.addEventListener("close", () => {
      button.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      if (destination) {
        destination.setAttribute("tabindex", "-1");
        destination.focus({ preventScroll: true });
        destination = null;
      } else button.focus({ preventScroll: true });
    });
    const openAnchor = (hash) => {
      const target = document.getElementById(hash.slice(1));
      if (target?.tagName === "DETAILS") {
        const request = new Event("disclosure-request", { cancelable: true });
        if (target.dispatchEvent(request)) target.open = true;
      }
    };
    document
      .querySelectorAll('a[href^="#"]')
      .forEach((link) =>
        link.addEventListener("click", () => openAnchor(link.hash)),
      );
    openAnchor(location.hash);
    if (!("IntersectionObserver" in window)) return;
    const links = [...document.querySelectorAll(".desktop-nav a")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          links.forEach((link) => {
            if (link.hash === `#${entry.target.id}`)
              link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    document
      .querySelectorAll("main>section[id]")
      .forEach((section) => observer.observe(section));
  }

  function reveals() {
    if (!("IntersectionObserver" in window)) return;
    // No hidden waiting state: a failed script can never leave a blank section.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || motion.matches) return;
          entry.target.classList.add("is-revealing");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((element) => {
      observer.observe(element);
      const finish = (event) => {
        const lastWord = element.querySelector(
          ".word-mask:last-child .word-rise",
        );
        if (event.target !== element && event.target !== lastWord) return;
        element.classList.remove("is-revealing");
        element.removeEventListener("animationend", finish);
      };
      element.addEventListener("animationend", finish);
    });
    motion.addEventListener("change", (event) => {
      observer.disconnect();
      document
        .querySelectorAll(".is-revealing")
        .forEach((element) => element.classList.remove("is-revealing"));
      if (!event.matches)
        document
          .querySelectorAll(".reveal")
          .forEach((element) => observer.observe(element));
    });
  }

  function showcase() {
    const root = document.querySelector("#cognify-showcase");
    if (!root) return;
    const controls = root.querySelector(".shot-controls");
    const image = root.querySelector("#cognify-main");
    const status = root.querySelector("#shot-status");
    controls.hidden = false;
    const buttons = [...controls.querySelectorAll("button")];
    let request = 0;
    const show = async (button) => {
      const current = ++request;
      const preview = new Image();
      preview.src = button.dataset.src;
      try {
        await preview.decode();
      } catch {
        if (current === request)
          status.textContent =
            t("This preview could not load. Please try another view.", "Impossibile caricare l’anteprima. Prova un’altra vista.");
        return;
      }
      if (current !== request) return;
      image.src = button.dataset.src;
      image.alt = button.dataset.alt;
      buttons.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      status.textContent = italian
        ? `Schermata visualizzata: ${button.textContent.trim()}.`
        : `Showing ${button.textContent.trim()} screenshot.`;
      if (!motion.matches)
        image.animate(
          [
            { opacity: 0.35, transform: "translateY(6px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 300, easing: "ease-out" },
        );
    };
    controls.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (button) show(button);
    });
    controls.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      const index = buttons.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? buttons.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) %
              buttons.length;
      buttons[next].focus();
      show(buttons[next]);
    });
  }

  function demo() {
    const button = document.querySelector(".demo-toggle");
    const image = document.querySelector(".cryptme-demo");
    if (!button || !image) return;
    button.hidden = false;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const playing = image.hidden;
      image.hidden = !playing;
      if (playing) image.src = image.dataset.demo;
      else image.removeAttribute("src");
      button.textContent = playing
        ? t("Stop demo", "Ferma la demo") : t("Play original demo", "Riproduci la demo originale");
      button.setAttribute("aria-pressed", String(playing));
    });
    image.addEventListener("error", () => {
      image.hidden = true;
      button.textContent = t("Demo could not load. Try again", "Impossibile caricare la demo. Riprova");
      button.setAttribute("aria-pressed", "false");
    });
    motion.addEventListener("change", (event) => {
      if (event.matches && !image.hidden) button.click();
    });
  }

  function contact() {
    const copy = document.querySelector(".copy-email");
    if (copy && navigator.clipboard?.writeText) {
      copy.hidden = false;
      let timer;
      copy.addEventListener("click", async () => {
        const status = document.querySelector(".copy-status");
        try {
          await navigator.clipboard.writeText("firatadem.bilge@gmail.com");
          copy.textContent = t("Email address copied", "Indirizzo email copiato");
          status.textContent = t("Email address copied to clipboard.", "Indirizzo email copiato negli appunti.");
        } catch {
          copy.textContent = t("Select the email address above to copy", "Seleziona l’indirizzo email qui sopra per copiarlo");
          status.textContent =
            t("Clipboard access is unavailable. Select and copy the email address above.", "Accesso agli appunti non disponibile. Seleziona e copia l’indirizzo email qui sopra.");
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
          copy.textContent = t("Copy email address", "Copia indirizzo email");
        }, 4000);
      });
    }
    const form = document.querySelector("#contact-form");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const subject = `${t("Portfolio enquiry from", "Richiesta dal portfolio di")} ${String(data.get("name")).trim()}`;
      const body = `${t("Name", "Nome")}: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`;
      document.querySelector("#form-status").textContent =
        t("Your email app will open with this message. Review it there and send when ready. If it does not open, use the email address alongside.", "L’app di posta si aprirà con questo messaggio. Controllalo e invialo quando vuoi. Se non si apre, usa l’indirizzo email indicato accanto.");
      location.href = `mailto:firatadem.bilge@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  readingProgress();
  navigation();
  disclosures();
  reveals();
  showcase();
  demo();
  contact();
})();
