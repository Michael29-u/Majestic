// main.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wbpwuntxsjcusqqqvxxw.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// 🎂 DOM Elements
const toggleBtn = document.getElementById("birthday-toggle");
const box = document.getElementById("birthday-box");
const form = document.getElementById("birthday-form");
const msgInput = document.getElementById("giftMessage");
const list = document.getElementById("messages-list");

// 🎂 Your Birthday (MM-DD)
const BIRTHDAY = "08-28";

// ✅ Check if today is birthday
function isTodayBirthday() {
  const today = new Date();
  const mmdd =
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");
  return mmdd === BIRTHDAY;
}

// ✅ Load messages from Supabase
async function loadMessages() {
  const { data, error } = await supabase
    .from("birthday_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load error:", error);
    return;
  }

  list.innerHTML = "";
  data.forEach((row) => {
    const li = document.createElement("li");
    li.textContent = row.message;
    list.appendChild(li);
  });
}

// ✅ Save a new message
async function saveMessage(msg) {
  const { error } = await supabase
    .from("birthday_messages")
    .insert([{ message: msg }]);

  if (error) {
    console.error("Insert error:", error);
  } else {
    loadMessages();
  }
}

// ✅ Event Listeners
if (toggleBtn && box) {
  // Show/hide when clicking 🎉
  toggleBtn.addEventListener("click", () => {
    box.classList.toggle("hidden");
  });

  // Handle form submit
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
}

// ✅ Auto-open on your birthday
if (isTodayBirthday()) {
  box.classList.remove("hidden");
  loadMessages();
}
