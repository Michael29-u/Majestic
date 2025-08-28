
(function(){
  // Theme toggle with persistence
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if(saved){ root.setAttribute('data-theme', saved); }
  const toggle = document.querySelector('[data-theme-toggle]');
  if(toggle){
    toggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      if(current === 'dark'){ root.removeAttribute('data-theme'); localStorage.removeItem('theme'); }
      else { root.setAttribute('data-theme','light'); localStorage.setItem('theme','light'); }
    });
  }


 // Add hover effects with JavaScript for enhanced interactivity
        document.querySelectorAll('.social-handle').forEach(handle => {
            handle.addEventListener('mouseenter', () => {
                handle.style.cursor = 'pointer';
            });
            
            handle.addEventListener('click', () => {
                const link = handle.querySelector('.social-link');
                if (link && link.href) {
                    window.open(link.href, '_blank');
                }
            });
        });

    document.querySelectorAll('.social-item').forEach(item => {
            item.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
            });
        });     


  // Mobile nav
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('[data-nav]');
  if(btn && nav){
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  // Active nav link based on pathname
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-navlink]').forEach(a => {
    const href = a.getAttribute('href');
    if(href === path){ a.classList.add('active'); }
  });

  // Footer year
  const y = document.getElementById('year');
  if(y){
     y.textContent = new Date().getFullYear(); 
    }

  // Typewriter effect on home
  const tw = document.querySelector('.typewriter');
  if(tw){
    try {
      const phrases = JSON.parse(tw.getAttribute('data-rotate') || '[]');
      let i = 0, j = 0, deleting = false;
      const tick = () => {
        const full = phrases[i % phrases.length] || '';
        tw.textContent = (deleting ? full.slice(0, j--) : full.slice(0, j++));
        if(!deleting && j > full.length + 8){ deleting = true; }
        if(deleting && j === 0){ deleting = false; i++; }
        setTimeout(tick, deleting ? 50 : 120);
      };
      tick();
    } catch(e){ /* no-op */ }
  }

  // Project filters
  const chips = document.querySelectorAll('.chip');
  const grid = document.getElementById('projects-grid');
  if(chips.length && grid){
    chips.forEach(c => c.addEventListener('click', () => {
      chips.forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      const type = c.getAttribute('data-filter');
      grid.querySelectorAll('.project-card').forEach(card => {
        const ok = type === 'all' || card.getAttribute('data-type') === type;
        card.style.display = ok ? '' : 'none';
      });
    }));
  }

  // Contact form validation
  const form = document.getElementById('contactForm');
  if(form){
    const fields = ['name','email','message'];
    const errs = {};
    const get = id => form.querySelector('#'+id);
    const showError = (id, msg) => {
      const el = form.querySelector(`[data-error-for="${id}"]`);
      if(el){ el.textContent = msg || ''; errs[id] = !!msg; }
    };
    const validators = {
      name: v => v.trim().length >= 2 ? '' : 'Please enter at least 2 characters.',
      email: v => /.+@.+\..+/.test(v) ? '' : 'Please enter a valid email address.',
      message: v => v.trim().length >= 10 ? '' : 'Message should be at least 10 characters.'
    };
    fields.forEach(id => {
      const input = get(id);
      input.addEventListener('input', () => showError(id, validators[id](input.value)));
      input.addEventListener('blur', () => showError(id, validators[id](input.value)));
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      fields.forEach(id => {
        const val = get(id).value;
        const msg = validators[id](val);
        showError(id, msg);
        if(msg) ok = false;
      });
      const status = form.querySelector('.form-status');
      if(ok){
        status.textContent = 'Thanks! Your message was validated locally (no backend configured).';
        form.reset();
      }else{
        status.textContent = 'Please fix the errors above and try again.';
      }
    });
  }
})();


(function(){
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
    const mmdd = String(today.getMonth()+1).padStart(2,"0")+"-"+String(today.getDate()).padStart(2,"0");
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
  }})();
