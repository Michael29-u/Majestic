// birthday.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ Replace with your own keys
const SUPABASE_URL = "https://wbpwuntxsjcusqqqvxxw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndicHd1bnR4c2pjdXNxcXF2eHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODI4NjcsImV4cCI6MjA3MTk1ODg2N30.nZ1WZu4nqL06pjsMj9TxETn18Zee4Jji1KXwb6trA4A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const popup = document.getElementById("birthday-popup");
const form = document.getElementById("birthday-form");
const msgInput = document.getElementById("giftMessage");
const list = document.getElementById("messages-list");
const closeBtn = document.getElementById("close-popup");

// 🎂 Birthday check
const BIRTHDAY = "08-27"; // <-- change to your MM-DD
function isTodayBirthday() {
  const today = new Date();
  const mmdd = String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
  return mmdd === BIRTHDAY;
}

// Load all messages from Supabase
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
  data.forEach(row => {
    const li = document.createElement("li");
    li.textContent = row.message;
    list.appendChild(li);
  });
}

// Save message to Supabase
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

// Initialize popup
if (popup && isTodayBirthday()) {
  popup.classList.remove("hidden");
  loadMessages();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const msg = msgInput.value.trim();
    if (msg) {
      saveMessage(msg);
      msgInput.value = "";
    }
  });

  closeBtn.addEventListener("click", () => popup.classList.add("hidden"));
}
