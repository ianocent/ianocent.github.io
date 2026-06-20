// ═══════════════════════════════════════════
//  CURSOR & REACTIVE BACKGROUND GLOW
// ═══════════════════════════════════════════
const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursorRing");
const bgGlow = document.getElementById("bg-glow");
let cx = 0,
  cy = 0,
  rx = 0,
  ry = 0;

document.addEventListener("mousemove", (e) => {
  cx = e.clientX;
  cy = e.clientY;

  const xPos = (e.clientX / window.innerWidth) * 100;
  const yPos = (e.clientY / window.innerHeight) * 100;
  bgGlow.style.setProperty("--mx", `${xPos}%`);
  bgGlow.style.setProperty("--my", `${yPos}%`);
});

document
  .querySelectorAll("a, button, .chip, .w-card, .info-item, .ct-item, .stat")
  .forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("hover");
      ring.classList.add("hover");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("hover");
      ring.classList.remove("hover");
    });
  });

function loop() {
  if (cursor) {
    cursor.style.left = cx + "px";
    cursor.style.top = cy + "px";
  }
  rx += (cx - rx) * 0.15;
  ry += (cy - ry) * 0.15;
  if (ring) {
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
  }
  requestAnimationFrame(loop);
}
loop();

// ═══════════════════════════════════════════
//  MOBILE-AWARE SCROLL TARGET
//  Desktop (>768px): #page-clip / #page-scroll is the cinema-frame
//  scroll container (position:fixed, overflow:scroll).
//  Mobile (<=768px): CSS switches #page-scroll to position:static /
//  overflow:visible, so the real scrolling element becomes the
//  window/document instead. We detect that and read/scroll the
//  right target without touching desktop behavior at all.
// ═══════════════════════════════════════════
const scrollerEl = document.getElementById("page-scroll");
const isMobileLayout = () => window.matchMedia("(max-width: 768px)").matches;

function getScrollTop() {
  return isMobileLayout()
    ? window.scrollY || document.documentElement.scrollTop
    : scrollerEl.scrollTop;
}
function getScrollMax() {
  return isMobileLayout()
    ? document.documentElement.scrollHeight - window.innerHeight
    : scrollerEl.scrollHeight - scrollerEl.clientHeight;
}
function scrollToTarget(top) {
  if (isMobileLayout()) {
    window.scrollTo({ top, behavior: "smooth" });
  } else {
    scrollerEl.scrollTo({ top, behavior: "smooth" });
  }
}
function getOffsetTopFor(el) {
  // offsetTop is relative to the nearest positioned ancestor; on mobile
  // #page-scroll is position:static so offsetTop already resolves
  // correctly against the document. On desktop it resolves against
  // #page-scroll itself, which is what we want too.
  return el.offsetTop;
}

// ═══════════════════════════════════════════
//  SCROLL OBSERVER, ANIMATIONS, PROGRESS
// ═══════════════════════════════════════════
const bar = document.getElementById("bar");
const nav = document.getElementById("nav");
const frameLabel = document.querySelector(".cinema-label-top");
const sections = document.querySelectorAll(".slide");
const links = document.querySelectorAll(".nav-list a");

// Reveal animations (.r) re-trigger every time they enter/leave the
// viewport — fixes the "animations only play once, gone after
// scrolling back up" issue. Slide-level bookkeeping (frame counter,
// active nav link, stat counters, skill bars) still only needs to
// fire forward, so it keeps its own one-shot guards via classList.
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      const el = e.target;

      if (el.classList.contains("r")) {
        el.classList.toggle("v", e.isIntersecting);
      }

      if (!e.isIntersecting) return;

      el.classList.add("v");

      // Update frame counter based on Slide Index
      if (el.classList.contains("slide")) {
        const index = Array.from(sections).indexOf(el) + 1;
        const frameNum = String(index).padStart(3, "0");
        if (frameLabel)
          frameLabel.textContent = `DWIRIANTO — FULLSTACK DEVELOPER · 2026 · FRAME ${frameNum}`;

        links.forEach((a) =>
          a.classList.toggle("on", a.getAttribute("href") === "#" + el.id),
        );
      }

      // Stats counter (one-shot, re-running a count-up every scroll would be noisy)
      el.querySelectorAll("[data-count]").forEach((num) => {
        if (num.classList.contains("done")) return;
        num.classList.add("done");
        const target = parseInt(num.dataset.count);
        const suffix = num.dataset.count >= 90 ? "" : "+";
        let current = 0;
        const step = target / 30;
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          num.textContent =
            Math.floor(current) + (current >= target ? suffix : "");
          if (current >= target) clearInterval(timer);
        }, 30);
      });

      // Skill bars
      el.querySelectorAll(".sk-bar-fill").forEach((bar) => {
        bar.style.transform = `scaleX(${bar.dataset.w})`;
      });
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
);

document.querySelectorAll(".r, .slide").forEach((el) => io.observe(el));

function handleScroll() {
  // Nav backdrop
  nav.classList.toggle("scrolled", getScrollTop() > 20);
  // Progress bar
  const max = getScrollMax();
  bar.style.width = (max > 0 ? (getScrollTop() / max) * 100 : 0) + "%";
}

// Desktop: the cinema-frame container scrolls.
scrollerEl.addEventListener("scroll", handleScroll, { passive: true });
// Mobile: the window/document scrolls (see CSS @media max-width:768px,
// where #page-scroll becomes position:static/overflow:visible).
window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("resize", handleScroll, { passive: true });

// Anchor smooth scroll override
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      scrollToTarget(getOffsetTopFor(target));
    }
  });
});

// ═══════════════════════════════════════════
//  INTERACTIVE ELEMENTS (Magnetic, Drawer, Lightbox, Filters)
// ═══════════════════════════════════════════
document.querySelectorAll(".magnetic").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
    btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-2px)`;
  });
  btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
});

const hbg = document.getElementById("hbg");
const drawer = document.getElementById("drawer");
let openDrawerState = false;
hbg.addEventListener("click", () => {
  openDrawerState = !openDrawerState;
  drawer.classList.toggle("show", openDrawerState);
});
function closeDrawer() {
  openDrawerState = false;
  drawer.classList.remove("show");
}

function openLb(src) {
  const lb = document.createElement("div");
  lb.className = "lb";
  lb.innerHTML = `<img src="${src}" alt="">`;
  lb.onclick = () => lb.remove();
  document.body.appendChild(lb);
}

document.querySelectorAll(".flt").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".flt").forEach((b) => b.classList.remove("on"));
    btn.classList.add("on");
    const f = btn.dataset.f;
    document.querySelectorAll(".w-card").forEach((c) => {
      if (f === "all" || c.dataset.cat === f) {
        c.classList.remove("hidden");
        setTimeout(() => {
          c.style.opacity = "1";
          c.style.transform = "";
        }, 10);
      } else {
        c.style.opacity = "0";
        c.style.transform = "scale(0.9)";
        setTimeout(() => c.classList.add("hidden"), 200);
      }
    });
  });
});

// ═══════════════════════════════════════════
//  CAROUSEL
// ═══════════════════════════════════════════
const cars = {};
function initCar(id) {
  const el = document.getElementById(id);
  if (!el) return;
  cars[id] = { cur: 0, total: el.querySelectorAll(".car-slide").length };
}
function carGo(id, numId, dir) {
  if (!cars[id]) initCar(id);
  const c = cars[id];
  c.cur = (c.cur + dir + c.total) % c.total;
  document.getElementById(id).querySelector(".car-track").style.transform =
    `translateX(-${c.cur * 100}%)`;
  if (numId) document.getElementById(numId).textContent = c.cur + 1;
}
window.carNext = (id, numId) => carGo(id, numId, 1);
window.carPrev = (id, numId) => carGo(id, numId, -1);
window.addEventListener("load", () => {
  ["mobCar", "kompCar", "calCar"].forEach(initCar);
});

document.querySelectorAll("img:not(.avatar-img)").forEach((img) => {
  img.addEventListener(
    "error",
    () => {
      const fallback = document.createElement("div");
      fallback.className = `${img.className || ""} img-fallback-box`.trim();
      fallback.textContent = img.alt
        ? `${img.alt} preview unavailable`
        : "Preview unavailable";
      if (img.onclick) fallback.onclick = img.onclick;
      img.replaceWith(fallback);
    },
    { once: true },
  );
});

const GSCRIPT = 'https://script.google.com/macros/s/AKfycbwoxraERRIDFq-YBg5NBQ1d_HjJc6u0UQI4OXhnUnonlspaFF8eRGKVirU3KpCdubBY/exec';
document.getElementById('cf').addEventListener('submit', e => {
  e.preventDefault();
  const btn = document.getElementById('sbtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Sending…';
  fetch(GSCRIPT, { method:'POST', body: new FormData(e.target) })
    .then(() => {
      const ok = document.getElementById('form-ok');
      ok.style.display = 'block';
      e.target.reset();
      btn.disabled = false;
      btn.innerHTML = '<i class="bx bx-send"></i> Send Message';
      setTimeout(() => ok.style.display = 'none', 6000);
    })
    .catch(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="bx bx-send"></i> Send Message';
    });
});
