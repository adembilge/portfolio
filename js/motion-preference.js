/* A visitor can opt into full motion without changing their device settings. */
(() => {
  "use strict";
  const device = matchMedia("(prefers-reduced-motion: reduce)");
  const localPreview = location.protocol === "file:" ||
    ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
  const key = "portfolio-motion-mode";
  const valid = (value) => ["full", "reduce", "system"].includes(value);
  let mode = localPreview ? "full" : "system";
  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) mode = saved;
  } catch { /* Storage may be unavailable in private or file previews. */ }
  const requested = new URLSearchParams(location.search).get("motion");
  if (valid(requested)) {
    mode = requested;
    try { localStorage.setItem(key, mode); } catch { /* Keep this visit's choice. */ }
  }
  const events = new EventTarget();
  const preference = {
    get matches() {
      return mode === "reduce" || (mode === "system" && device.matches);
    },
    addEventListener: (...args) => events.addEventListener(...args),
  };
  const update = () => {
    document.documentElement.dataset.motion = preference.matches
      ? "reduce"
      : "full";
    document.documentElement.dataset.motionSource = mode;
    const event = new Event("change");
    Object.defineProperty(event, "matches", { value: preference.matches });
    events.dispatchEvent(event);
  };
  window.portfolioMotion = preference;
  device.addEventListener("change", update);
  update();
})();
