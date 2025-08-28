// Load birthday widget HTML
async function loadBirthdayWidget() {
  const placeholder = document.getElementById("birthday-placeholder");
  try {
    const response = await fetch("/birthday.html");
    const html = await response.text();
    placeholder.innerHTML = html;

    // 🔄 After injecting HTML, run the widget logic
    initBirthdayWidget();

  } catch (error) {
    console.error("Error loading birthday widget:", error);
  }
}

loadBirthdayWidget();





function initBirthdayWidget() {
  import("https://esm.sh/@supabase/supabase-js@2").then(({ createClient }) => {
    const SUPABASE_URL = "https://wbpwuntxsjcusqqqvxxw.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndicHd1bnR4c2pjdXNxcXF2eHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODI4NjcsImV4cCI6MjA3MTk1ODg2N30.nZ1WZu4nqL06pjsMj9TxETn18Zee4Jji1KXwb6trA4A"; 
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const toggleBtn = document.getElementById("birthday-toggle");
    const box = document.getElementById("birthday-box");
    const form = document.getElementById("birthday-form");
    const msgInput = document.getElementById("giftMessage");
    const list = document.getElementById("messages-list");

    const BIRTHDAY = "08-27"; // 🎂 MM-DD

    // Show/hide box
    toggleBtn.addEventListener("click", () => {
      box.classList.toggle("hidden");
    });

    // Check if today is birthday
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

      if (!error) {
        renderMessages(data);
      }
    }

    // Render list
    function renderMessages(messages) {
      list.innerHTML = "";
      messages.forEach((row) => {
        const li = document.createElement("li");
        li.textContent = row.message;
        list.appendChild(li);
      });
    }

    // Save new message
    async function saveMessage(msg) {
      const { error } = await supabase
        .from("birthday_messages")
        .insert([{ message: msg }]);
      if (error) console.error(error);
    }

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

    // Subscribe to real-time changes
    supabase
      .channel("birthday-messages-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "birthday_messages" },
        (payload) => {
          const li = document.createElement("li");
          li.textContent = payload.new.message;
          list.insertBefore(li, list.firstChild); // newest on top
        }
      )
      .subscribe();

    // Show countdown until birthday OR show widget if today
    function showCountdown() {
      const today = new Date();
      const year = today.getFullYear();
      let nextBirthday = new Date(`${year}-${BIRTHDAY}`);
      if (today > nextBirthday) {
        nextBirthday = new Date(`${year + 1}-${BIRTHDAY}`);
      }

      const diff = nextBirthday - today;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (days === 0 && isTodayBirthday()) {
        toggleBtn.style.display = "block";
        loadMessages(); // initial load
      } else {
        toggleBtn.style.display = "none";
        box.innerHTML = `<h3>🎂 My Birthday is in ${days} day(s)!</h3>`;
        box.classList.remove("hidden");
      }
    }

    showCountdown();
  });
}
