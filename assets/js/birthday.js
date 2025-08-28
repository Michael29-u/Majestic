import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🔑 Replace with your own Supabase keys
const SUPABASE_URL = "https://wbpwuntxsjcusqqqvxxw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndicHd1bnR4c2pjdXNxcXF2eHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODI4NjcsImV4cCI6MjA3MTk1ODg2N30.nZ1WZu4nqL06pjsMj9TxETn18Zee4Jji1KXwb6trA4A"; 
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const toggleBtn = document.getElementById("birthday-toggle");
const box = document.getElementById("birthday-box");
const form = document.getElementById("birthday-form");
const msgInput = document.getElementById("giftMessage");
const list = document.getElementById("messages-list");

// 🎂 Your birthday (MM-DD)
const BIRTHDAY = "08-27";

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

// Load messages from Supabase
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

// Save a new message
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

// Auto-show widget on your birthday
if (isTodayBirthday()) {
  box.classList.remove("hidden");
  loadMessages();
}
