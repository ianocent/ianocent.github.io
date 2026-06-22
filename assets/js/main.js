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
  "https://script.google.com/macros/s/AKfycbzFvWxvNA5lJjA0Kdb9fRWK_Gu12Kw-E-BRHkwIGQFu37tAjIDpi-exZGhcbnHYFfUU/exec";
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
// --- CHATBOT WIDGET LOGIC ---
const chatFab = document.getElementById('chatFab');
const chatWindow = document.getElementById('chatWindow');
const closeChat = document.getElementById('closeChat');
const chatBody = document.getElementById('chatBody');
const chatOptions = document.querySelectorAll('.chat-opt');

// Gunakan GSCRIPT yang udah lu definisiin sebelumnya
// const GSCRIPT = "https://script.google.com/macros/s/..."; 

// 1. Setup Session ID pake localStorage
let sessionId = localStorage.getItem('ianoBotSession');
if (!sessionId) {
  // Generate random string buat ID kalo belum ada
  sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('ianoBotSession', sessionId);
}

const botAnswers = {
  stack: "Gwa biasa pake MERN/MEVN stack, tapi belakangan sering megang Laravel, Next.js, sama Python buat automation. Cek section Skills ya!",
  avail: "Saat ini gwa lagi ga available sih buat full-time role, tapi gwa bisa considering kalo ada part-time project based! Mau ngobrol lebih lanjut? Langsung WA aja di section Contact.",
  typing: "Hobi aja sih dari dulu main 10fastfingers & Monkeytype jaman kuliah hahaha. Lumayan ngebantu ngetik code cepet tanpa mikirin keyboard.",
  wpm_game: "Mau adu cepet ngetik? Klik tombol 'Beat My WPM!' di section Home ya, nanti bakal muncul modal game-nya!",
  coding_stats: "Penasaran sama jam terbang gwa? Klik icon bar chart di box 'Years Experience' di section Home buat liat statistik GitHub & WakaTime gwa.",
};
// Ambil elemen input baru
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');

let chatPollingInterval;
let currentChatLength = 0; // Buat nge-track jumlah chat biar ga render ulang kalo ga ada yg baru

// 2. Fungsi Load History (Di-update buat polling)
async function loadChatHistory() {
  try {
    const response = await fetch(`${GSCRIPT}?action=getChat&sessionId=${sessionId}`);
    const history = await response.json();
    
    // Kalo jumlah pesan di database LEBIH BANYAK dari yang ada di layar (ada balasan baru dari lu)
    if (history.length > currentChatLength) {
      chatBody.innerHTML = '<div class="chat-msg bot">Halo! Gwa asisten virtualnya rıan. Mau tanya apa nih?</div>'; 
      
      history.forEach(chat => {
        chatBody.innerHTML += `<div class="chat-msg ${chat.sender}">${chat.message}</div>`;
      });
      
      chatBody.scrollTop = chatBody.scrollHeight;
      currentChatLength = history.length; // Update tracker jumlah chat
    }
  } catch (error) {
    console.error("Gagal load history:", error);
  }
}

// 4. Fungsi buat handle chat dari ketikan user
function sendCustomMessage() {
  const text = chatInput.value.trim();
  if (!text) return; // Kalo kosong ga ngirim

  // Munculin di layar user dulu biar cepet
  chatBody.innerHTML += `<div class="chat-msg user">${text}</div>`;
  chatBody.scrollTop = chatBody.scrollHeight;
  chatInput.value = ''; // Kosongin kolom input
  
  // Nambah tracker manual biar ga ke-render ulang pas polling jalan
  currentChatLength++; 

  // Simpen ke Spreadsheet
  saveChatToSheet('user', text);
}

// Event Listeners buat tombol Send & tombol Enter
sendChatBtn.addEventListener('click', sendCustomMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendCustomMessage();
});

// Update Event buka/tutup chat buat ngatur Polling
let chatPollingInterval; // Variabel buat nyimpen interval

chatFab.addEventListener("click", () => {
  chatWindow.classList.add("open");

  // 1. Load sekali pas dibuka
  loadChatHistory();

  // 2. SET POLLING: Cek ke spreadsheet tiap 3 detik (3000ms)
  chatPollingInterval = setInterval(() => {
    loadChatHistory();
  }, 3000);
});

closeChat.addEventListener("click", () => {
  chatWindow.classList.remove("open");

  // 3. MATIIN POLLING: Penting! Biar ga boros kuota/bikin lemot pas chat ditutup
  clearInterval(chatPollingInterval);
});

closeChat.addEventListener('click', () => {
  chatWindow.classList.remove('open');
  // Matiin interval polling pas chat ditutup biar ga menuhin kuota limit request Google Apps Script
  clearInterval(chatPollingInterval); 
});
// 3. Fungsi Simpen Chat ke Spreadsheet
function saveChatToSheet(sender, messageText) {
  const fd = new FormData();
  fd.append('action', 'chat');
  fd.append('sessionId', sessionId);
  fd.append('sender', sender); // 'user' atau 'bot'
  fd.append('message', messageText);

  fetch(GSCRIPT, { method: "POST", body: fd })
    .catch(err => console.error("Gagal save chat:", err));
}

// Event Listeners Buka/Tutup Chat
chatFab.addEventListener('click', () => {
  chatWindow.classList.add('open');
  // Load history pas pertama kali dibuka (opsional: bisa dikasih if logic biar ga fetch terus)
  if(chatBody.children.length <= 1) { 
    loadChatHistory();
  }
});
closeChat.addEventListener('click', () => chatWindow.classList.remove('open'));

// Event pas user ngeklik opsi chat
chatOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    const qKey = btn.dataset.q;
    const qText = btn.textContent;
    
    // Render Pesan User & Simpen ke DB
    chatBody.innerHTML += `<div class="chat-msg user">${qText}</div>`;
    chatBody.scrollTop = chatBody.scrollHeight;
    saveChatToSheet('user', qText);
    
    document.getElementById('chatOptions').style.opacity = '0.5';
    document.getElementById('chatOptions').style.pointerEvents = 'none';

    // Jeda pura-pura mikir baru keluarin balesan bot
    setTimeout(() => {
      const bText = botAnswers[qKey];
      chatBody.innerHTML += `<div class="chat-msg bot">${bText}</div>`;
      chatBody.scrollTop = chatBody.scrollHeight;
      
      // Simpen balesan Bot ke DB
      saveChatToSheet('bot', bText);
      
      document.getElementById('chatOptions').style.opacity = '1';
      document.getElementById('chatOptions').style.pointerEvents = 'auto';
    }, 800);
  });
});

// --- BEAT WPM MODAL LOGIC ---
const wpmModal = document.getElementById('wpmModal');
const wpmTrigger = document.getElementById('wpmTrigger');
const wpmClose = document.getElementById('wpmClose');

const typTarget = document.getElementById('typTarget');
const typInput = document.getElementById('typInput');
const typWPM = document.getElementById('typWPM');
const typAcc = document.getElementById('typAcc');
const typTimer = document.getElementById('typTimer');
const typReset = document.getElementById('typReset');

const originalText = typTarget.innerText;
let startTime = null;
let typingInterval = null;

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
    typInput.style.borderColor = 'var(--green)';
    
    // Efek gold kalo berhasil ngalahin stat lu
    if(wpm > 95) {
      typWPM.style.color = 'var(--green)';
      typWPM.innerText += ' 🔥 (You Win!)';
    }
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
  typInput.focus();
});

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