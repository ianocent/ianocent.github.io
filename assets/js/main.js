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
// --- CHATBOT WIDGET LOGIC (VERSI BERSIH) ---
const chatFab = document.getElementById('chatFab');
const chatWindow = document.getElementById('chatWindow');
const closeChat = document.getElementById('closeChat');
const chatBody = document.getElementById('chatBody');
const chatOptions = document.querySelectorAll('.chat-opt');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');

let chatPollingInterval;
let currentChatLength = 0;

// Setup Session ID
let sessionId = localStorage.getItem('ianoBotSession');
if (!sessionId) {
  sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('ianoBotSession', sessionId);
}
let isTyping = false; // Mencegah bentrok pas animasi jalan
let isSaving = false; // Mencegah pesan kedap-kedip pas lagi dikirim
let lastHistoryLength = 0; // Buat nge-track panjang pesan

// Fungsi buat ngegambar isi chat ke layar
function renderChat(historyArray) {
  let chatContent =
    '<div class="chat-msg bot">Halo! Gwa asisten virtualnya rıan. Mau tanya apa nih?</div>';

  historyArray.forEach((chat) => {
    // Cek biar ga ada bubble "kotak doang" gara-gara ada baris kosong di spreadsheet
    if (chat.message && chat.message.toString().trim() !== "") {
      chatContent += `<div class="chat-msg ${chat.sender}">${chat.message}</div>`;
    }
  });

  chatBody.innerHTML = chatContent;
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Logic ngecek & ngambil data dari spreadsheet
async function loadChatHistory() {
  // Kalo lagi ada animasi ngetik ATAU lagi proses nyimpen chat user, jangan narik data dulu!
  if (isTyping || isSaving) return;

  try {
    const response = await fetch(
      `${GSCRIPT}?action=getChat&sessionId=${sessionId}`,
    );
    const history = await response.json();

    // SKENARIO 1: ADA BALASAN BARU DARI LU (BOT/ADMIN)
    if (history.length > lastHistoryLength && lastHistoryLength !== 0) {
      const lastMsg = history[history.length - 1];

      if (lastMsg.sender === "bot") {
        isTyping = true;

        // 1. Munculin chat sampe pesan sebelum balasan lu
        renderChat(history.slice(0, history.length - 1));

        // 2. Munculin bubble animasi seolah-olah lu lagi ngetik balesan
        chatBody.innerHTML += `
          <div class="chat-msg bot">
            <div class="typing-indicator" style="padding: 0 4px; margin: 0;">
              <span></span><span></span><span></span>
            </div>
          </div>
        `;
        chatBody.scrollTop = chatBody.scrollHeight;

        // 3. Jeda 1.5 detik, hapus animasinya, terus ganti pake pesan asli lu
        setTimeout(() => {
          renderChat(history);
          lastHistoryLength = history.length;
          isTyping = false;
        }, 1500);

        return; // Setop di sini biar ga kerender dobel
      }
    }

    // SKENARIO 2: NORMAL (Ga ada pesan baru, atau pas baru buka chat)
    renderChat(history);
    lastHistoryLength = history.length;
  } catch (error) {
    console.error("Gagal load history:", error);
  }
}

// Logic pas user klik tombol Send
function sendCustomMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = "";

  // 1. Munculin teksnya instan di layar user
  chatBody.innerHTML += `<div class="chat-msg user">${text}</div>`;
  chatBody.scrollTop = chatBody.scrollHeight;

  // 2. Kunci layar (isSaving = true) biar data ga ketimpa pas polling jalan
  isSaving = true;
  lastHistoryLength++; // Update trackernya secara manual

  // 3. Kirim ke Spreadsheet
  const fd = new FormData();
  fd.append("action", "chat");
  fd.append("sessionId", sessionId);
  fd.append("sender", "user");
  fd.append("message", text);

  fetch(GSCRIPT, { method: "POST", body: fd })
    .then(() => {
      // 4. Kalo udah sukses nyimpen di spreadsheet, buka kunciannya
      isSaving = false;
      loadChatHistory();
    })
    .catch((err) => {
      console.error(err);
      isSaving = false;
    });
}

// Fungsi Save
function saveChatToSheet(sender, messageText) {
  const fd = new FormData();
  fd.append('action', 'chat');
  fd.append('sessionId', sessionId);
  fd.append('sender', sender);
  fd.append('message', messageText);
  fetch(GSCRIPT, { method: "POST", body: fd }).catch(err => console.error(err));
}

// Event Buka Chat
chatFab.addEventListener("click", () => {
  chatWindow.classList.add("open");

  loadChatHistory();

  clearInterval(chatPollingInterval);

  chatPollingInterval = setInterval(() => {
    console.log("Mengecek chat baru...");
    loadChatHistory();
  }, 3000);

  console.log("Polling chat dimulai.");
});

// Event Tutup Chat
closeChat.addEventListener('click', () => {
  chatWindow.classList.remove('open');
  clearInterval(chatPollingInterval); // Penting: matiin polling!
});

sendChatBtn.addEventListener('click', sendCustomMessage);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendCustomMessage(); });

// Event Klik Opsi Template
chatOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    const qText = btn.textContent;
    chatBody.innerHTML += `<div class="chat-msg user">${qText}</div>`;
    saveChatToSheet('user', qText);
    currentChatLength++;
    // (Bisa tambahin logic botAnswer di sini kalau mau)
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