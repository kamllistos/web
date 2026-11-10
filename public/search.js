// /search page: search over the security feature database (external file: strict CSP).
// Cards are server-rendered; this only filters, scores, sorts and animates them.
(() => {
  const input = document.getElementById("db-search");
  const grid = document.getElementById("db-grid");
  if (!input || !grid) return;
  const cards = [...grid.querySelectorAll(".db-card")];
  const chips = [...document.querySelectorAll("[data-area]")];
  const sorts = [...document.querySelectorAll("[data-sort]")];
  const count = document.getElementById("db-count");
  const empty = document.getElementById("db-empty");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const total = cards.length;
  const RANK = { must: 0, should: 1, nice: 2 };

  // Words that carry no meaning in "how do I stop people from..." style queries.
  const STOP = new Set("a an the my i me to of in on for and or is it its how do does can with from that this what when your our we be not stop make add get want need people someone site app website".split(" "));
  const stem = (w) => (w.length > 4 ? w.replace(/(ing|ed|es|s)$/, "") : w);
  const terms = (q) => q.toLowerCase().split(/[^a-z0-9$<>/.'=_-]+/).filter((w) => w && !STOP.has(w)).map(stem);

  // Weighted fields: a hit in the name beats a hit in the description.
  const fields = cards.map((c) => [
    [5, c.dataset.name], [4, c.dataset.alias], [3, c.dataset.stops], [2, c.dataset.said], [1, c.dataset.rest],
  ]);

  let area = "all";
  let sort = "priority";

  function score(i, ts) {
    let s = 0, hit = 0;
    for (const t of ts) {
      let best = 0;
      for (const [w, text] of fields[i]) if (w > best && text.includes(t)) best = w;
      if (best) { hit++; s += best; }
    }
    return hit >= Math.ceil(ts.length / 2) ? s + hit * 10 : 0;
  }

  function render() {
    const q = input.value.trim();
    const ts = terms(q);
    const shown = [];
    cards.forEach((c, i) => {
      const inArea = area === "all" || (area === "must" ? c.dataset.pri === "must" : c.dataset.cat === area);
      const s = ts.length ? score(i, ts) : 1;
      const ok = inArea && s > 0;
      c.hidden = !ok;
      if (ok) shown.push({ c, s, i });
    });
    shown.sort((a, b) =>
      (ts.length && b.s - a.s) ||
      (sort === "priority" && RANK[a.c.dataset.pri] - RANK[b.c.dataset.pri]) ||
      a.i - b.i);

    // Re-order in the DOM (keeps tab order honest), then cascade the cards back in.
    shown.forEach(({ c }, n) => {
      grid.appendChild(c);
      c.style.setProperty("--i", Math.min(n, 18));
      c.classList.remove("enter");
    });
    if (!reduce) { void grid.offsetWidth; shown.forEach(({ c }) => c.classList.add("enter")); }

    const n = shown.length;
    count.textContent = q
      ? `${n} of ${total} match “${q}”`
      : n === total ? `${total} features` : `${n} of ${total} features`;
    empty.hidden = n > 0;

    const url = new URL(location.href);
    q ? url.searchParams.set("q", q) : url.searchParams.delete("q");
    area !== "all" ? url.searchParams.set("area", area) : url.searchParams.delete("area");
    history.replaceState(null, "", url);
  }

  function setArea(a) {
    area = chips.some((c) => c.dataset.area === a) ? a : "all";
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.area === area)));
  }

  let t;
  input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(render, 110); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = grid.querySelector(".db-card:not([hidden])");
      if (first) location.href = first.href;
    } else if (e.key === "Escape") { input.value = ""; render(); }
  });
  chips.forEach((c) => c.addEventListener("click", () => { setArea(c.dataset.area); render(); }));
  sorts.forEach((b) => b.addEventListener("click", () => {
    sort = b.dataset.sort;
    sorts.forEach((s) => s.setAttribute("aria-pressed", String(s === b)));
    render();
  }));
  document.getElementById("db-surprise")?.addEventListener("click", () => {
    const pool = cards.filter((c) => !c.hidden);
    const pick = (pool.length ? pool : cards)[Math.floor(Math.random() * (pool.length || total))];
    location.href = pick.href;
  });
  document.getElementById("db-reset")?.addEventListener("click", () => { input.value = ""; setArea("all"); render(); input.focus(); });

  // "You called it" phrases fill the search box instead of reloading the page.
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-q]");
    if (!a) return;
    e.preventDefault();
    input.value = a.dataset.q;
    setArea("all");
    render();
    input.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    input.focus({ preventScroll: true });
  });

  // "/" or Cmd/Ctrl+K jumps to the search box from anywhere.
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });

  // Typewriter placeholder: cycles through the sloppy ways people describe these features.
  const hints = (input.dataset.hints || "").split("|").filter(Boolean);
  if (hints.length && !reduce) {
    let h = 0, ch = 0, del = false;
    const tick = () => {
      const s = hints[h];
      if (!del) { ch++; if (ch > s.length) { del = true; return setTimeout(tick, 1800); } }
      else { ch -= 2; if (ch <= 0) { ch = 0; del = false; h = (h + 1) % hints.length; } }
      input.placeholder = s.slice(0, ch) + (del ? "" : "▍");
      setTimeout(tick, del ? 18 : 45);
    };
    setTimeout(tick, 900);
  }

  const params = new URLSearchParams(location.search);
  input.value = params.get("q") || "";
  setArea(params.get("area") || "all");
  render();
})();
