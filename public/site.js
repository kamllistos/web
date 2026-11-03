// Site-wide behaviour, loaded on every page (external file — strict CSP).
// 1) Scroll-reveal: elements with .reveal spawn in the first time they scroll into view.
// 2) "Days since last update" in the footer.
(() => {
  const root = document.documentElement;
  root.classList.add("js"); // CSS only hides .reveal when JS is present

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // --- Scroll reveal ---
  const revealables = [...document.querySelectorAll(".reveal")];
  if (revealables.length) {
    if (reduce.matches || !("IntersectionObserver" in window)) {
      revealables.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              obs.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
      );
      revealables.forEach((el) => io.observe(el));
    }
  }

  // --- "X days since last update" (computed in the browser so it never goes stale) ---
  for (const el of document.querySelectorAll(".updated[data-updated]")) {
    const then = new Date(el.dataset.updated);
    if (isNaN(then)) continue;
    const days = Math.max(0, Math.floor((Date.now() - then.getTime()) / 864e5));
    el.textContent = days === 0 ? "Updated today" : days === 1 ? "1 day since last update" : `${days} days since last update`;
    el.title = `Last update: ${then.toLocaleString()}`;
  }
})();
