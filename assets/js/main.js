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
  return el.offsetTop;
}

const bar = document.getElementById("bar");
const nav = document.getElementById("nav");
const frameLabel = document.querySelector(".cinema-label-top");
const sections = document.querySelectorAll(".slide");
const links = document.querySelectorAll(".nav-list a");

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
          frameLabel.textContent = `FRAME ${frameNum}`;

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

// Drawer (mobile hamburger menu) — defined before the anchor click handler
// below so closeDrawer() is unambiguously available when links are clicked.
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

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      const offset = getOffsetTopFor(target);
      scrollToTarget(offset);
      if (typeof closeDrawer === "function") closeDrawer();
    }
  });
});

document.querySelectorAll(".magnetic").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
    btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-2px)`;
  });
  btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
});

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

const GSCRIPT =
  "https://script.google.com/macros/s/AKfycbwproNCkaC3CuSh0Go5i4bA9mLyuUNW2HYLRAeqFkvgElyaz_e7H4yemzxwC2CgOyit/exec";
document.getElementById("cf").addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = document.getElementById("sbtn");
  btn.disabled = true;
  btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Sending…';
  fetch(GSCRIPT, { method: "POST", body: new FormData(e.target) })
    .then(() => {
      const ok = document.getElementById("form-ok");
      ok.style.display = "block";
      e.target.reset();
      btn.disabled = false;
      btn.innerHTML = '<i class="bx bx-send"></i> Send Message';
      setTimeout(() => (ok.style.display = "none"), 6000);
    })
    .catch(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="bx bx-send"></i> Send Message';
    });
});

const photo = document.querySelector(".photo-frame img");

function updateImageWithEffect(newSrc) {
  photo.classList.add("animate-effect");

  setTimeout(() => {
    photo.src = newSrc;
  }, 200);

  setTimeout(() => {
    photo.classList.remove("animate-effect");
  }, 400);
}

photo.addEventListener("mouseover", () => {
  updateImageWithEffect("assets/img/hehe1.png");
});

photo.addEventListener("mouseout", () => {
  updateImageWithEffect("assets/img/hehe.png");
});
// 1. Fungsi untuk Counter Angka (0% -> target%)
function animateCounter(el, target) {
  let current = 0;
  const duration = 1500; // durasi dalam ms
  const step = target / (duration / 20); // 20ms per update

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = Math.floor(target) + "%";
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current) + "%";
    }
  }, 20);
}

// 2. Fungsi Utama Animasi
function runSkillAnimations(card) {
  const bar = card.querySelector(".sk-bar-fill");
  const label = card.querySelector(".sk-bar-label span:last-child");
  const targetVal = parseFloat(bar.dataset.w) * 100;
  
  // Reset awal
  bar.style.transform = `scaleX(0)`;
  label.textContent = "0%";
  
  // Trigger Animasi (sedikit delay agar smooth)
  setTimeout(() => {
    bar.style.transform = `scaleX(${bar.dataset.w})`;
    animateCounter(label, targetVal);
  }, 200);

  // Milestone Badge Highlight (Looping per item)
  const items = card.querySelectorAll('.sk-row');
  items.forEach((item, index) => {
    const badge = item.querySelector('.badge');
    const delay = 300 + (index * 150);
    setTimeout(() => {
      badge.classList.add('highlight');
      setTimeout(() => badge.classList.remove('highlight'), 500);
    }, delay);
  });
}

// 3. Observer yang Re-trigger
const skillsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Panggil animasi untuk setiap card yang terlihat
      runSkillAnimations(entry.target);
    } else {
      // Opsional: Reset saat keluar layar supaya saat scroll balik ke atas, dia play lagi
      const bar = entry.target.querySelector(".sk-bar-fill");
      bar.style.transform = `scaleX(0)`;
    }
  });
}, { threshold: 0.2 });

// Observe setiap card
document.querySelectorAll('.sk-card').forEach(card => skillsObserver.observe(card));

// ── State terpusat ────────────────────────────────────────────
const ChatState = {
  sessionId: null,
  // Array of { sender, message } yang sudah dirender di DOM
  rendered: [],
  // Jumlah baris yang udah kita kirim ke server (pending write)
  pendingServerRows: 0,
  // Lock: true saat sedang animasi typing atau transisi
  animating: false,
  pollingTimer: null,
};

// ── Init session ──────────────────────────────────────────────
function initSession() {
  let id = localStorage.getItem("ianoBotSession");
  if (!id) {
    id = "session_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("ianoBotSession", id);
  }
  ChatState.sessionId = id;
}

// ── DOM refs ──────────────────────────────────────────────────
const chatFab     = document.getElementById("chatFab");
const chatWindow  = document.getElementById("chatWindow");
const closeChat   = document.getElementById("closeChat");
const chatBody    = document.getElementById("chatBody");
const chatInput   = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");
const chatOptions = document.querySelectorAll(".chat-opt");

// ── Jawaban lokal untuk template buttons ──────────────────────
const botAnswers = {
  stack:        "Gwa biasa pake MERN/MEVN stack, tapi belakangan sering megang Laravel, Next.js, sama Python buat automation. Cek section Skills ya!",
  avail:        "Saat ini gwa lagi ga available sih buat full-time role, tapi gwa bisa considering kalo ada part-time project based! Mau ngobrol lebih lanjut? Langsung WA aja di section Contact.",
  typing:       "Hobi aja sih dari dulu main 10fastfingers & Monkeytype jaman kuliah hahaha. Lumayan ngebantu ngetik code cepet tanpa mikirin keyboard.",
  wpm_game:     "Mau adu cepet ngetik? Klik tombol 'Beat My WPM!' di section Home ya, nanti bakal muncul modal game-nya!",
  coding_stats: "Penasaran sama jam terbang gwa? Klik icon bar chart di box 'Years Experience' di section Home buat liat statistik GitHub & WakaTime gwa.",
};

// ── Render helpers ────────────────────────────────────────────
function buildMsgEl(sender, text) {
  const div = document.createElement("div");
  div.className = `chat-msg ${sender}`;
  div.textContent = text;
  return div;
}

function buildTypingEl() {
  const div = document.createElement("div");
  div.className = "chat-msg bot";
  div.id = "__typing__";
  div.innerHTML = `
    <div class="typing-indicator" style="padding:0 4px;margin:0;">
      <span></span><span></span><span></span>
    </div>`;
  return div;
}
 
function scrollBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}
 
// Tambah satu baris ke DOM + state, tanpa polling interference
function appendMsg(sender, text) {
  ChatState.rendered.push({ sender, message: text });
  chatBody.appendChild(buildMsgEl(sender, text));
  scrollBottom();
}
 
// Full re-render dari array (dipakai pas load awal)
function renderAll(history) {
  chatBody.innerHTML = '<div class="chat-msg bot">Halo! Gwa asisten virtualnya rıan. Mau tanya apa nih?</div>';
  history.forEach(({ sender, message }) => {
    if (message && message.toString().trim()) {
      chatBody.appendChild(buildMsgEl(sender, message));
    }
  });
  scrollBottom();
}
 
// ── Polling ───────────────────────────────────────────────────
// Hash sederhana buat detect perubahan konten server
function hashHistory(arr) {
  return arr.map((r) => `${r.sender}|${r.message}`).join("||");
}
 
let lastServerHash = "";
 
async function poll() {
  // Jangan ganggu kalau lagi animasi
  if (ChatState.animating) return;
 
  let history;
  try {
    const res = await fetch(
      `${GSCRIPT}?action=getChat&sessionId=${ChatState.sessionId}&t=${Date.now()}`
    );
    history = await res.json();
  } catch {
    return; // network error, skip
  }
 
  const newHash = hashHistory(history);
 
  // Kalau konten sama, skip
  if (newHash === lastServerHash) return;
 
  // Hitung berapa baris server yang "extra" di luar yang kita tunggu
  // rendered.length = jumlah baris yang udah ada di layar
  // pendingServerRows = jumlah baris yang kita kirim tapi server belum tentu confirm
  const expectedMin = ChatState.rendered.length - ChatState.pendingServerRows;
 
  if (history.length <= expectedMin) {
    // Server belum up-to-date (data lebih sedikit dari ekspektasi), skip
    return;
  }
 
  // Ada baris baru dari server yang belum ada di layar
  // Cek apakah ada baris di luar yang udah kita render
  if (history.length > ChatState.rendered.length) {
    // Ambil baris-baris baru
    const newRows = history.slice(ChatState.rendered.length);
 
    for (const row of newRows) {
      if (!row.message || !row.message.toString().trim()) continue;
 
      // Kalau itu bot reply (kemungkinan dari spreadsheet manual)
      if (row.sender === "bot") {
        ChatState.animating = true;
        chatBody.appendChild(buildTypingEl());
        scrollBottom();
 
        await new Promise((r) => setTimeout(r, 1200));
 
        const tyEl = document.getElementById("__typing__");
        if (tyEl) tyEl.remove();
        appendMsg("bot", row.message);
        ChatState.animating = false;
      } else {
        appendMsg(row.sender, row.message);
      }
    }
 
    // Reset pending counter — server udah caught up
    ChatState.pendingServerRows = 0;
    lastServerHash = hashHistory(history);
    return;
  }
 
  // Jumlah sama tapi hash beda → konten berubah (edit di spreadsheet)
  // Re-render bersih
  ChatState.rendered = history.filter((r) => r.message && r.message.toString().trim());
  renderAll(ChatState.rendered);
  ChatState.pendingServerRows = 0;
  lastServerHash = newHash;
}
 
// ── Load awal saat chat dibuka ────────────────────────────────
async function loadInitial() {
  try {
    const res = await fetch(
      `${GSCRIPT}?action=getChat&sessionId=${ChatState.sessionId}&t=${Date.now()}`
    );
    const history = await res.json();
    const valid = history.filter((r) => r.message && r.message.toString().trim());
    ChatState.rendered = valid;
    ChatState.pendingServerRows = 0;
    lastServerHash = hashHistory(valid);
    if (valid.length > 0) renderAll(valid);
  } catch {
    // Kalau gagal, biarkan greeting default tetap tampil
  }
}
 
// ── Kirim pesan user (input manual) ──────────────────────────
async function sendCustomMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
 
  // Render lokal SEGERA
  appendMsg("user", text);
  // Tandai 1 baris pending ke server
  ChatState.pendingServerRows += 1;
 
  // Kirim ke server (background)
  const fd = new FormData();
  fd.append("action", "chat");
  fd.append("sessionId", ChatState.sessionId);
  fd.append("sender", "user");
  fd.append("message", text);
  fd.append("isTemplate", "false");
 
  try {
    await fetch(GSCRIPT, { method: "POST", body: fd });
    // Server confirmed write, kurangi pending
    ChatState.pendingServerRows = Math.max(0, ChatState.pendingServerRows - 1);
  } catch {
    ChatState.pendingServerRows = Math.max(0, ChatState.pendingServerRows - 1);
  }
}
 
// ── Template button click ─────────────────────────────────────
chatOptions.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const qText = btn.textContent.trim();
    const qKey  = btn.dataset.q || "default";
    const botReply = botAnswers[qKey] || "Gwa asisten virtualnya rıan. Mau ngobrol apa nih?";
 
    // Disable tombol sementara
    const optionsEl = document.getElementById("chatOptions");
    optionsEl.style.opacity = "0.5";
    optionsEl.style.pointerEvents = "none";
 
    // 1. Render user message lokal SEGERA
    appendMsg("user", qText);
    ChatState.pendingServerRows += 1; // pending: user row
 
    // 2. Kirim user message ke server (background, jangan tunggu)
    const fdUser = new FormData();
    fdUser.append("action", "chat");
    fdUser.append("sessionId", ChatState.sessionId);
    fdUser.append("sender", "user");
    fdUser.append("message", qText);
    fdUser.append("isTemplate", "true");
    fetch(GSCRIPT, { method: "POST", body: fdUser })
      .then(() => { ChatState.pendingServerRows = Math.max(0, ChatState.pendingServerRows - 1); })
      .catch(() => { ChatState.pendingServerRows = Math.max(0, ChatState.pendingServerRows - 1); });
 
    // 3. Typing animation
    ChatState.animating = true;
    chatBody.appendChild(buildTypingEl());
    scrollBottom();
 
    await new Promise((r) => setTimeout(r, 1000));
 
    const tyEl = document.getElementById("__typing__");
    if (tyEl) tyEl.remove();
 
    // 4. Render bot reply lokal
    appendMsg("bot", botReply);
    ChatState.pendingServerRows += 1; // pending: bot row
 
    ChatState.animating = false;
 
    // 5. Kirim bot reply ke server (background)
    const fdBot = new FormData();
    fdBot.append("action", "chat");
    fdBot.append("sessionId", ChatState.sessionId);
    fdBot.append("sender", "bot");
    fdBot.append("message", botReply);
    fdBot.append("isTemplate", "true");
    fetch(GSCRIPT, { method: "POST", body: fdBot })
      .then(() => { ChatState.pendingServerRows = Math.max(0, ChatState.pendingServerRows - 1); })
      .catch(() => { ChatState.pendingServerRows = Math.max(0, ChatState.pendingServerRows - 1); });
 
    optionsEl.style.opacity = "1";
    optionsEl.style.pointerEvents = "auto";
  });
});
 
// ── Event listeners ───────────────────────────────────────────
chatFab.addEventListener("click", () => {
  chatWindow.classList.add("open");
  loadInitial();
  ChatState.pollingTimer = setInterval(poll, 3000);
});
 
closeChat.addEventListener("click", () => {
  chatWindow.classList.remove("open");
  clearInterval(ChatState.pollingTimer);
});
 
sendChatBtn.addEventListener("click", sendCustomMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendCustomMessage();
});
 
// Init
initSession();

// --- BEAT WPM MODAL LOGIC ---
const wpmModal = document.getElementById('wpmModal');
const wpmTrigger = document.getElementById('wpmTrigger');
const wpmClose = document.getElementById('wpmClose');
const wpmNameModal = document.getElementById("wpmNameModal");
const wpmPlayerName = document.getElementById("wpmPlayerName");
const btnSubmitName = document.getElementById("btnSubmitName");
const btnCancelName = document.getElementById("btnCancelName");
const typTarget = document.getElementById('typTarget');
const typInput = document.getElementById('typInput');
const typWPM = document.getElementById('typWPM');
const typAcc = document.getElementById('typAcc');
const typTimer = document.getElementById('typTimer');
const typReset = document.getElementById('typReset');

const originalText = typTarget.innerText;
let startTime = null;
let typingInterval = null;
typInput.addEventListener("paste", (e) => {
  e.preventDefault();
  // Opsional: ganti text target sementara buat nge-troll yang copas
  typTarget.innerText = "Eits, dilarang copas! Ketik manual dong bos 😜";
  setTimeout(() => {
    typTarget.innerText = originalText;
  }, 2000);
});
// Buka Tutup Modal
if(wpmTrigger) {
  wpmTrigger.addEventListener('click', () => {
    wpmModal.classList.add('open');
    typInput.focus(); // Langsung auto focus ke input
  });
}
wpmClose.addEventListener('click', () => wpmModal.classList.remove('open'));

// Tutup modal kalo klik area luar box
wpmModal.addEventListener('click', (e) => {
  if (e.target === wpmModal) wpmModal.classList.remove('open');
});

function calculateStats() {
  const typedText = typInput.value;
  const timeElapsed = (Date.now() - startTime) / 1000 / 60; // dalam menit
  
  // WPM (1 kata = 5 karakter)
  const wordsTyped = typedText.length / 5;
  const wpm = Math.round(wordsTyped / timeElapsed) || 0;
  
  // Akurasi
  let correctChars = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === originalText[i]) correctChars++;
  }
  const accuracy = Math.round((correctChars / Math.max(typedText.length, 1)) * 100);

  typWPM.innerText = wpm;
  typAcc.innerText = accuracy + '%';
  
  // Kalau selesai ngetik semuanya
  if (typedText === originalText) {
    clearInterval(typingInterval);
    typInput.disabled = true;
    typInput.style.borderColor = "var(--green)";

    if (wpm > 95) {
      typWPM.style.color = "var(--green)";
      typWPM.innerText += " 🔥 (You Win!)";
    }

    // Tampilkan modal custom input nama, kosongkan input sebelumnya
    wpmPlayerName.value = "";
    wpmNameModal.style.display = "flex";
    wpmNameModal.classList.add("open");
    wpmPlayerName.focus();

    // Remove event listener lama biar ga numpuk duplikasi submit saat test ulang
    btnSubmitName.onclick = null;
    btnCancelName.onclick = null;

    // Aksi ketika tombol Submit Score ditekan
    btnSubmitName.onclick = () => {
      let playerName = wpmPlayerName.value.trim() || "Anonymous";

      // Tutup modal nama
      wpmNameModal.style.display = "none";
      wpmNameModal.classList.remove("open");

      // Beri feedback loading ke user di text target utama
      typTarget.innerText = "⏳ Lagi nyimpen skor lu ke database...";
      typTarget.style.color = "var(--gold)";

      const fd = new FormData();
      fd.append("action", "save_wpm");
      fd.append("name", playerName);
      fd.append("wpm", wpm);
      fd.append("accuracy", accuracy);

      fetch(GSCRIPT, { method: "POST", body: fd })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            typTarget.innerText = `✅ Mantap ${playerName}! Skor lu udah sukses disimpen ke Leaderboard.`;
            typTarget.style.color = "var(--green)";
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          typTarget.innerText =
            "❌ Yahh, gagal nyimpen ke database. Cek konfigurasi / koneksi lu.";
          typTarget.style.color = "var(--red)";
        });
    };

    // Aksi ketika tombol Cancel ditekan
    btnCancelName.onclick = () => {
      wpmNameModal.style.display = "none";
      wpmNameModal.classList.remove("open");
      typTarget.innerText =
        "Skor tidak disimpan. Tekan tombol reset untuk mencoba kembali.";
    };
  }
}

typInput.addEventListener('input', () => {
  if (!startTime && typInput.value.length > 0) {
    startTime = Date.now();
    typingInterval = setInterval(() => {
      const s = Math.floor((Date.now() - startTime) / 1000);
      typTimer.innerText = s + 's';
    }, 1000);
  }
  calculateStats();
});

typReset.addEventListener('click', () => {
  clearInterval(typingInterval);
  startTime = null;
  typInput.value = '';
  typInput.disabled = false;
  typInput.style.borderColor = 'var(--line2)';
  typWPM.innerText = '0';
  typWPM.style.color = 'var(--gold)';
  typAcc.innerText = '100%';
  typTimer.innerText = '0s';
  typTarget.innerText = originalText;
  typTarget.style.color = "var(--text)";
  typInput.focus();
});

// ── LIVE LEADERBOARD LOGIC ──
const wpmLeaderboardBtn = document.getElementById('wpmLeaderboardBtn');
const wpmLeaderboardModal = document.getElementById('wpmLeaderboardModal');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
const leaderboardLoading = document.getElementById('leaderboardLoading');
const leaderboardTable = document.getElementById('leaderboardTable');
const leaderboardRows = document.getElementById('leaderboardRows');

// Efek hover membesar dikit pada icon piala
if(wpmLeaderboardBtn) {
  wpmLeaderboardBtn.addEventListener('mouseenter', () => wpmLeaderboardBtn.style.transform = 'scale(1.2)');
  wpmLeaderboardBtn.addEventListener('mouseleave', () => wpmLeaderboardBtn.style.transform = 'scale(1)');
  
  // Klik icon piala buat buka leaderboard
  wpmLeaderboardBtn.addEventListener('click', () => {
    wpmLeaderboardModal.style.display = 'flex';
    wpmLeaderboardModal.classList.add('open');
    
    // Tampilkan loading, sembunyikan tabel dulu
    leaderboardLoading.style.display = 'block';
    leaderboardLoading.innerText = '⏳ Loading data...';
    leaderboardTable.style.display = 'none';
    leaderboardRows.innerHTML = '';
    
    // Tarik data dari GSCRIPT
    fetch(`${GSCRIPT}?action=get_leaderboard`)
      .then(res => res.json())
      .then(data => {
        leaderboardLoading.style.display = 'none';
        
        if(data.length === 0) {
          leaderboardLoading.style.display = 'block';
          leaderboardLoading.innerText = '📭 Belum ada skor yang tercatat.';
          return;
        }
        
        // Buat baris tabel berdasarkan data yang dapet
        data.forEach((row, index) => {
          let medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
          let highlightStyle = index === 0 ? 'color: var(--gold); font-weight: 600;' : '';
          
          let tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
          tr.innerHTML = `
            <td style="padding: 0.7rem 0.5rem; font-size: 1.1rem;">${medal}</td>
            <td style="padding: 0.7rem 0.5rem; ${highlightStyle}">${row.name}</td>
            <td style="padding: 0.7rem 0.5rem; text-align: center; font-weight: 500; color: var(--green);">${Math.round(row.wpm)}</td>
            <td style="padding: 0.7rem 0.5rem; text-align: center; color: #9ea1ad;">${row.accuracy}</td>
          `;
          leaderboardRows.appendChild(tr);
        });
        
        leaderboardTable.style.display = 'table';
      })
      .catch(() => {
        leaderboardLoading.style.display = 'block';
        leaderboardLoading.innerText = '❌ Gagal memuat leaderboard.';
      });
  });
}

// Tutup modal Leaderboard
if(closeLeaderboardBtn) {
  closeLeaderboardBtn.addEventListener('click', () => {
    wpmLeaderboardModal.style.display = 'none';
    wpmLeaderboardModal.classList.remove('open');
  });
}

// --- EXPERIENCE / CODING STATS MODAL LOGIC ---
const expModal = document.getElementById('expModal');
const expTrigger = document.getElementById('expTrigger');
const expClose = document.getElementById('expClose');

// Buka Modal
if (expTrigger) {
  expTrigger.addEventListener('click', () => {
    expModal.classList.add('open');
  });
}

// Tutup Modal dari tombol X
if (expClose) {
  expClose.addEventListener('click', () => {
    expModal.classList.remove('open');
  });
}

// Tutup Modal kalo klik area luar box (background gelap)
if (expModal) {
  expModal.addEventListener('click', (e) => {
    if (e.target === expModal) expModal.classList.remove('open');
  });
}