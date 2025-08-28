import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🔑 Replace with your own Supabase keys
const SUPABASE_URL = "https://wbpwuntxsjcusqqqvxxw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndicHd1bnR4c2pjdXNxcXF2eHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODI4NjcsImV4cCI6MjA3MTk1ODg2N30.nZ1WZu4nqL06pjsMj9TxETn18Zee4Jji1KXwb6trA4A";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const toggleBtn = document.getElementById("birthday-toggle");
const box = document.getElementById("birthday-box");
const form = document.getElementById("birthday-form");
const msgInput = document.getElementById("giftMessage");
const list = document.getElementById("messages-list");
const countdownEl = document.getElementById("birthday-countdown");

// 🎂 Your birthday (MM-DD)
const BIRTHDAY = "08-27";

// === Utility Functions ===

// Show/hide widget
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    box.classList.toggle("hidden");
  });
}

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
  const target = getNextBirthday();
  setInterval(() => {
    const now = new Date().getTime();
    const distance = target - now;

    if (distance <= 0) {
      countdownEl.textContent = "🎉 It's my Birthday Today!";
      toggleBtn.classList.remove("hidden"); // show the button
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownEl.textContent = `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s left`;
  }, 1000);
}

// === Supabase Messaging ===
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

// === INIT ===

// Hide toggle button before birthday
toggleBtn.classList.add("hidden");

// Start countdown always
startCountdown();

// If today is birthday → show box & messages
if (isTodayBirthday()) {
  toggleBtn.classList.remove("hidden");
  box.classList.remove("hidden");
  loadMessages();
}
