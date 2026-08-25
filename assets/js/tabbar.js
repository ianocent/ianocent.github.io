(function () {
  const bar = document.getElementById("tabbar");
  if (!bar) return;
  const pill = bar.querySelector(".tab-pill");
  const tabs = Array.from(bar.querySelectorAll(".tab"));
  const moreBtn = document.getElementById("tabMore");
  const hbg = document.getElementById("hbg");
  const drawer = document.getElementById("drawer");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobileLayout = () => window.matchMedia("(max-width: 768px)").matches;

  // ── Pill: geser ke tab aktif ────────────────────────────────
  function movePill(tab) {
    if (!pill || !tab) return;
    pill.style.width = tab.offsetWidth + "px";
    pill.style.transform = "translateX(" + tab.offsetLeft + "px)";
    pill.style.opacity = "1";
  }

  function setActive(tab) {
    tabs.forEach((t) => t.classList.toggle("on", t === tab));
    if (!reducedMotion && isMobileLayout()) movePill(tab);
  }

  // Posisi pill pas awal (setelah layout & font siap)
  function initPill() {
    if (isMobileLayout()) movePill(bar.querySelector(".tab.on") || tabs[0]);
    else if (pill) pill.style.opacity = "0";
  }
  window.addEventListener("load", initPill);
  window.addEventListener("resize", () => {
    if (isMobileLayout()) movePill(bar.querySelector(".tab.on") || tabs[0]);
    else if (pill) pill.style.opacity = "0";
  });
  initPill();

  // ── Active tab ngikutin section yang keliatan ───────────────
  const sections = document.querySelectorAll(".slide");
  const byId = {};
  tabs.forEach((t) => {
    const id = (t.getAttribute("href") || "").replace("#", "");
    if (id) byId[id] = t;
  });

  // Saat klik tab, smooth scroll lewatin section tengah → observer bakal
  // aktifin tab intermediate & pill keliatan glitch. Lock ke tab yang diklik
  // sampai section-nya bener-bener keliatan (atau timeout buat jaga-jaga).
  let lockedTab = null;
  let lockTimer = null;
  function lockTo(tab) {
    lockedTab = tab;
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => (lockedTab = null), 1500);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const tab = byId[e.target.id];
        if (!tab) return;
        if (lockedTab) {
          if (tab !== lockedTab) return;
          lockedTab = null;
          clearTimeout(lockTimer);
        }
        setActive(tab);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );
  sections.forEach((s) => io.observe(s));

  // Klik tab → langsung responsif (ga nunggu observer)
  tabs.forEach((t) => {
    t.addEventListener("click", () => {
      setActive(t);
      showBar();
      lockTo(t);
    });
  });

  // ── More → buka drawer lewat burger yang udah ada ───────────
  if (moreBtn && hbg) {
    moreBtn.addEventListener("click", () => hbg.click());
  }
  // Highlight More selagi drawer kebuka
  if (drawer) {
    new MutationObserver(() => {
      moreBtn.classList.toggle("on", drawer.classList.contains("show"));
    }).observe(drawer, { attributes: true, attributeFilter: ["class"] });
  }

  // ── Hide saat scroll turun, muncul lagi saat naik ───────────
  let lastY = 0;
  const scrollerEl = document.getElementById("page-scroll");
  function getY() {
    return isMobileLayout()
      ? window.scrollY || document.documentElement.scrollTop
      : scrollerEl.scrollTop;
  }
  function hideBar() { bar.classList.add("hidden"); }
  function showBar() { bar.classList.remove("hidden"); }

  function onScroll() {
    const y = getY();
    const delta = y - lastY;
    if (delta > 6 && y > 120) hideBar();
    else if (delta < -4) showBar();
    lastY = y;
  }
  if (scrollerEl) scrollerEl.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
})();
