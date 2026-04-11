import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.API_CONFIG || {};
const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

// 🎂 Your birthday (MM-DD)
const BIRTHDAY = "08-29";

async function initBirthdayWidget() {
  const toggleBtn = document.getElementById("birthday-toggle");
  const box = document.getElementById("birthday-box");
  const form = document.getElementById("birthday-form");
  const msgInput = document.getElementById("giftMessage");
  const list = document.getElementById("messages-list");
  const countdownEl = document.getElementById("birthday-countdown");

  if (!toggleBtn || !box) return;

  // Show/hide widget
  toggleBtn.addEventListener("click", () => {
    box.classList.toggle("hidden");
  });

  // Check if today is your birthday
  function isTodayBirthday() {
    const today = new Date();
    const mmdd =
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");
    return mmdd === BIRTHDAY;
  }

  // Get next birthday date (this year or next)
  function getNextBirthday() {
    const [mm, dd] = BIRTHDAY.split("-");
    const today = new Date();
    let year = today.getFullYear();
    let next = new Date(`${year}-${mm}-${dd}T00:00:00`);
    if (next < today) {
      next = new Date(`${year + 1}-${mm}-${dd}T00:00:00`);
    }
    return next;
  }

  // Countdown updater
  function startCountdown() {
    if (!countdownEl) return;
    const target = getNextBirthday();
    setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance <= 0) {
        countdownEl.textContent = "🎉 It's my Birthday Today!";
        return;
      }

      // Check if today is birthday and show if not already shown
      if (isTodayBirthday() && !birthdayShown) {
        toggleBtn.classList.remove("hidden");
        box.classList.remove("hidden");
        loadMessages();
        birthdayShown = true;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownEl.textContent = `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s left To My Birthday`;
    }, 1000);
  }

  // Supabase Messaging
  async function loadMessages() {
    const { data, error } = await supabase
      .from("birthday_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    list.innerHTML = "";
    data.forEach((row) => {
      const li = document.createElement("li");
      li.textContent = row.message;
      list.appendChild(li);
    });
  }

  async function saveMessage(msg) {
    const { error } = await supabase
      .from("birthday_messages")
      .insert([{ message: msg }]);

    if (error) {
      console.error(error);
    } else {
      loadMessages();
    }
  }

  // Form submit handler
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = msgInput.value.trim();
      if (msg) {
        saveMessage(msg);
        msgInput.value = "";
      }
    });
  }

  // Hide toggle button before birthday
  toggleBtn.classList.add("hidden");

  let birthdayShown = false;

  // Start countdown always
  startCountdown();

  // If today is birthday → show box & messages
  if (isTodayBirthday()) {
    toggleBtn.classList.remove("hidden");
    box.classList.remove("hidden");
    loadMessages();
    birthdayShown = true;
  }
}

// Wait for components to load, then initialize
function waitForComponents() {
  if (document.querySelector('[data-component="birthday-widget"]')) {
    const observer = new MutationObserver((mutations, obs) => {
      const widget = document.getElementById("birthday-widget");
      if (widget) {
        obs.disconnect();
        initBirthdayWidget();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

waitForComponents();
