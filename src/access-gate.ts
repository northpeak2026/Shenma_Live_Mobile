// This is a static-site access hurdle, not server-side authentication.
const storageKey = "shenma-access-date";
const root = document.getElementById("root")!;
const gate = document.getElementById("access-gate")!;
const form = document.getElementById("access-form") as HTMLFormElement;
const input = document.getElementById("access-password") as HTMLInputElement;
const error = document.getElementById("access-error")!;
let verifiedDate: string | null = null;
let appLoad: Promise<unknown> | undefined;

function today(): string {
  // UTC getters after a fixed offset handle calendar rollovers independently of local timezone.
  const date = new Date(Date.now() + 8 * 60 * 60 * 1000);
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid clock");
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
}

function lock() {
  root.hidden = true;
  root.inert = true;
  gate.hidden = false;
  verifiedDate = null;
}

async function unlock(date: string) {
  try {
    // Import the original, unchanged runtime only after successful validation.
    appLoad ??= import("./main");
    await appLoad;
    if (today() !== date || sessionStorage.getItem(storageKey) !== date) {
      lock();
      return;
    }
    verifiedDate = date;
    root.inert = false;
    root.hidden = false;
    gate.hidden = true;
    input.value = "";
    error.textContent = "";
  } catch {
    lock();
    error.textContent = "页面加载失败，请刷新后重试";
  }
}

function check() {
  try {
    const date = today();
    if (sessionStorage.getItem(storageKey) !== date) {
      lock();
      sessionStorage.removeItem(storageKey);
    } else if (verifiedDate !== date) {
      void unlock(date);
    }
  } catch {
    lock();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  lock();
  try {
    const date = today();
    if (input.value !== date) {
      sessionStorage.removeItem(storageKey);
      error.textContent = "密码错误，请重试";
      input.setAttribute("aria-invalid", "true");
      input.select();
      return;
    }
    sessionStorage.setItem(storageKey, date);
    input.removeAttribute("aria-invalid");
    void unlock(date);
  } catch {
    error.textContent = "无法保存验证状态，请检查浏览器设置后重试";
  }
});

// Hide before entering the back-forward cache or switching away, then recheck on return.
window.addEventListener("pagehide", lock);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) lock();
  else check();
});
for (const name of ["pageshow", "focus", "popstate", "hashchange"]) {
  window.addEventListener(name, check);
}
// Check before any interaction even if background timer throttling delayed midnight detection.
for (const name of ["pointerdown", "keydown", "click", "submit", "touchstart", "wheel"]) {
  document.addEventListener(name, (event) => {
    check();
    if (!gate.hidden && event.target instanceof Node && root.contains(event.target)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}
setInterval(check, 250);
check();
