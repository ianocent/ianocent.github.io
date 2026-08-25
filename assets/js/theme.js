(function () {
  const btn = document.getElementById("themeTgl");
  if (!btn) return;
  const icon = btn.querySelector("i");
  const KEY = "iano-theme";

  function apply(theme) {
    if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    // Icon menunjukkan mode yang akan dipilih kalau diklik
    if (icon) icon.className = theme === "light" ? "bx bx-moon" : "bx bx-sun";
    btn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
  }

  let current = "dark";
  try { current = localStorage.getItem(KEY) || "dark"; } catch (e) {}
  apply(current);

  btn.addEventListener("click", () => {
    current = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    try { localStorage.setItem(KEY, current); } catch (e) {}
    apply(current);
  });
})();
