/* Run before styles to restore the theme without a flash. URLs define language. */
(() => {
  "use strict";
  const root = document.documentElement;
  const key = "portfolio-theme";
  const valid = (value) => value === "light" || value === "dark";
  let theme = "dark";
  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) theme = saved;
  } catch { /* A blocked storage API must never prevent reading or switching. */ }
  const apply = (value) => {
    theme = value;
    root.dataset.theme = theme;
    const italian = root.lang === "it";
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      button.hidden = false;
      button.setAttribute("aria-pressed", String(theme === "dark"));
      button.setAttribute("aria-label", italian ? "Tema scuro" : "Dark theme");
      button.title = italian
        ? (theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro")
        : (theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    });
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#211a17" : "#f4ede4");
  };
  apply(theme);
  document.addEventListener("DOMContentLoaded", () => {
    apply(theme);
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        apply(theme === "dark" ? "light" : "dark");
        try { localStorage.setItem(key, theme); } catch { /* Visit-only choice. */ }
        document.dispatchEvent(new Event("portfolio-theme-change"));
      });
    });
    document.querySelectorAll(".language-switch").forEach((link) => {
      const update = () => {
        const url = new URL(link.getAttribute("href"), location.href);
        url.hash = location.hash;
        const motion = new URL(location.href).searchParams.get("motion");
        if (["full", "reduce", "system"].includes(motion)) url.searchParams.set("motion", motion);
        link.href = url.href;
      };
      update();
      addEventListener("hashchange", update);
    });
  });
  addEventListener("storage", (event) => {
    if (event.key !== key) return;
    apply(valid(event.newValue) ? event.newValue : "dark");
    document.dispatchEvent(new Event("portfolio-theme-change"));
  });
})();
