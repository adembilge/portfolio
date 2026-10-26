/* Local previews show motion; hosted pages follow the visitor's device. */
(() => {
  "use strict";
  const device = matchMedia("(prefers-reduced-motion: reduce)");
  const localPreview = location.protocol === "file:";
  const events = new EventTarget();
  const preference = {
    get matches() {
      return !localPreview && device.matches;
    },
    addEventListener: (...args) => events.addEventListener(...args),
  };
  const update = () => {
    document.documentElement.dataset.motion = preference.matches
      ? "reduce"
      : "full";
    const event = new Event("change");
    Object.defineProperty(event, "matches", { value: preference.matches });
    events.dispatchEvent(event);
  };
  window.portfolioMotion = preference;
  device.addEventListener("change", update);
  update();
})();
