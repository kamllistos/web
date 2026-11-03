// Light/dark switch (same as camtoan.me). Loaded in <head> without defer so a saved choice applies before paint.
(() => {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch {}
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;

  document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("[data-theme-set]");
    const sync = () => {
      const current = root.dataset.theme || "system";
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeSet === current)));
    };
    buttons.forEach((b) => b.addEventListener("click", () => {
      const v = b.dataset.themeSet;
      try {
        if (v === "system") { delete root.dataset.theme; localStorage.removeItem("theme"); }
        else { root.dataset.theme = v; localStorage.setItem("theme", v); }
      } catch { if (v !== "system") root.dataset.theme = v; }
      sync();
    }));
    sync();
  });
})();
