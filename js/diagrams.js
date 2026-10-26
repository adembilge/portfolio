import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";

function graphSource(source) {
  return source.trim().replace(/\s+/g, " ")
    .replace(/^(flowchart\s+(?:LR|RL|TD|TB|BT))\s+/, "$1\n")
    .replace(/\b(subgraph\s+\w+\s*\[[^\]]+\])\s+/g, "$1\n")
    .replace(/\s+end\s+/g, "\nend\n")
    .replace(/([\]}])\s+(?=[A-Za-z_]\w*\s*(?:-->|[\[{]))/g, "$1;\n")
    .replace(/(-->\s*(?:\|[^|]+\|\s*)?[A-Za-z_]\w*(?:\[[^\]]*\]|\{[^}]*\})?)\s+(?=[A-Za-z_]\w*\s*(?:-->|[\[{]))/g, "$1;\n");
}

// Keep source text for a readable fallback and redraw only after each render settles.
const figures = [...document.querySelectorAll(".mermaid")].map((element) => ({
  element,
  // Legacy HTML wraps graph definitions as prose. Mermaid needs the direction
  // on its own line, including when a translated label contains spaces.
  source: graphSource(element.textContent),
}));
let rendering = false;
let requested = false;
async function render() {
  requested = true;
  if (rendering) return;
  rendering = true;
  while (requested) {
    requested = false;
    const dark = document.documentElement.dataset.theme !== "light";
    mermaid.initialize({ startOnLoad: false, theme: dark ? "dark" : "default", securityLevel: "strict" });
    for (const { element, source } of figures) {
      element.removeAttribute("data-processed");
      element.textContent = source;
    }
    try { await mermaid.run({ nodes: figures.map(({ element }) => element) }); }
    catch (error) {
      console.warn("Article diagrams could not render:", error.message);
      for (const { element, source } of figures) element.textContent = source;
    }
  }
  rendering = false;
}
document.addEventListener("portfolio-theme-change", render);
render();
