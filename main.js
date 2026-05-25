/* ═══════════════════════════════════════════════════════════════
   LOADER — timing calibrato, body unlock garantito
═══════════════════════════════════════════════════════════════ */
(function(){
  const loader = document.querySelector('.loader');
  if(!loader) return;

  // Assicura body locked durante loader
  document.body.style.overflow = 'hidden';

  const TOTAL = 2700;  // ms totali prima dello split

  // Start panels exit
  setTimeout(() => {
    loader.classList.add('done');
    document.body.style.overflow = '';
    document.body.classList.remove('locked');
    // Rimuovi completamente dopo la transizione pannelli (1s CSS + 50ms buffer)
    setTimeout(() => {
      loader.classList.add('gone');
    }, 1100);
  }, TOTAL);

  // Avvia video hero dopo loader (evita competizione risorse)
  setTimeout(() => {
    const vid = document.querySelector('.hero__vid');
    if(vid){ vid.load(); vid.play().catch(()=>{}); }
  }, TOTAL + 200);
})();

'use strict';

/* ─────────────────────────────────────────────────────────────
   SMOOTH SCROLL — momentum via lerp
───────────────────────────────────────────────────────────── */
let scrollY = 0, currentY = 0, rafId;
const ease = 0.1;

function smoothScroll(){
  currentY += (scrollY - currentY) * ease;
  if(Math.abs(scrollY - currentY) > 0.1){
    rafId = requestAnimationFrame(smoothScroll);
  }
}

// Only on desktop (no touch devices)
if(window.matchMedia('(hover:hover)').matches){
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  const scroller = document.createElement('div');
  scroller.id = 'smooth-wrapper';
  scroller.style.cssText = 'position:fixed;top:0;left:0;width:100%;will-change:transform;';
  while(document.body.firstChild) scroller.appendChild(document.body.firstChild);
  document.body.appendChild(scroller);

  window.addEventListener('wheel', e => {
    scrollY = Math.max(0, Math.min(scrollY + e.deltaY,
      scroller.scrollHeight - window.innerHeight));
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(smoothScroll);
    requestAnimationFrame(function frame(){
      scroller.style.transform = 'translateY(-' + currentY + 'px)';
      if(Math.abs(scrollY - currentY) > 0.1) requestAnimationFrame(frame);
    });
  }, { passive: true });
  window.addEventListener('keydown', e=>{
    const delta = {ArrowDown:80,ArrowUp:-80,PageDown:window.innerHeight*.9,
      PageUp:-window.innerHeight*.9,End:9999999,Home:-9999999}[e.key]||0;
    if(delta){scrollY=Math.max(0,Math.min(scrollY+delta,scroller.scrollHeight-window.innerHeight));}
  });
  // Touch fallback: disable smooth on touch
  window.addEventListener('touchstart',()=>{
    document.documentElement.style.overflow='';
    document.body.style.overflow='';
    scroller.style.transform='';
    scroller.style.position='';
  },{once:true});
}

/* ─────────────────────────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────────────────────────── */
const cur = document.createElement('div');
cur.className = 'cur';
cur.innerHTML = '<div class="cur__dot"></div><div class="cur__ring"></div><div class="cur__text"></div>';
document.body.appendChild(cur);

const dot  = cur.querySelector('.cur__dot');
const ring = cur.querySelector('.cur__ring');
const curTxt = cur.querySelector('.cur__text');

let mx = -100, my = -100, rx = -100, ry = -100;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left  = mx + 'px';
  dot.style.top   = my + 'px';
});

// Ring follows with lerp
(function animRing(){
  rx += (mx - rx) * 0.14;
  ry += (my - ry) * 0.14;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  curTxt.style.left = rx + 'px';
  curTxt.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

// Hover states
document.querySelectorAll('a,button,[data-cursor]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cur.classList.add('hover');
    const label = el.dataset.cursor;
    if(label){ cur.classList.add('cta-hover'); curTxt.textContent = label; }
  });
  el.addEventListener('mouseleave', () => {
    cur.classList.remove('hover','cta-hover');
    curTxt.textContent = '';
  });
});

document.addEventListener('mousedown',() => cur.classList.add('click'));
document.addEventListener('mouseup',  () => cur.classList.remove('click'));

// Light cursor on cream sections
const lightSections = document.querySelectorAll('.home-sedi,.menu-intro,.storia-intro .split__content');
const co = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting) cur.classList.add('light');
    else cur.classList.remove('light');
  });
},{threshold:0.5});
lightSections.forEach(s => co.observe(s));

/* ─────────────────────────────────────────────────────────────
   PAGE TRANSITION CURTAIN
───────────────────────────────────────────────────────────── */
const curtain = document.createElement('div');
curtain.className = 'curtain';
curtain.innerHTML = '<p class="curtain__brand">da I Gemelli</p>';
document.body.appendChild(curtain);

// Exit animation on internal link clicks
document.querySelectorAll('a[href]').forEach(a => {
  const href = a.getAttribute('href');
  if(!href || href.startsWith('http') || href.startsWith('#')
     || href.startsWith('tel:') || href.startsWith('mailto:')
     || href.startsWith('https://wa.me')) return;
  a.addEventListener('click', e => {
    e.preventDefault();
    curtain.classList.add('enter');
    setTimeout(() => { window.location = a.href; }, 550);
  });
});

// Enter animation on load
window.addEventListener('load', () => {
  curtain.classList.add('exit');
  setTimeout(() => curtain.classList.remove('enter','exit'), 600);
});

/* ─────────────────────────────────────────────────────────────
   NAV + PROGRESS
───────────────────────────────────────────────────────────── */
const prog = document.querySelector('.prog');
const nav  = document.querySelector('.nav');
const heroBg = document.querySelector('.hero__bg');

window.addEventListener('scroll', () => {
  const y   = window.scrollY;
  const max = document.body.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(1, y / max) : 0;
  if(nav)   nav.classList.toggle('scrolled', y > 50);
  // progress bar rimossa
  if(heroBg && y < window.innerHeight)
    heroBg.style.transform = 'scale(1.02) translateY(' + (y * 0.2) + 'px)';
}, { passive: true });

/* ─────────────────────────────────────────────────────────────
   MOBILE MENU
───────────────────────────────────────────────────────────── */
const burger = document.querySelector('.burger');
const mmenu  = document.querySelector('.mmenu');
if(burger && mmenu){
  burger.addEventListener('click', () => {
    const o = burger.classList.toggle('open');
    mmenu.classList.toggle('open', o);
    document.body.classList.toggle('locked', o);
    burger.setAttribute('aria-expanded', o);
  });
  mmenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    mmenu.classList.remove('open');
    document.body.classList.remove('locked');
  }));
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && mmenu.classList.contains('open')){
      burger.classList.remove('open');
      mmenu.classList.remove('open');
      document.body.classList.remove('locked');
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   ACTIVE NAV LINK
───────────────────────────────────────────────────────────── */
(()=>{
  const path = location.pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';
  document.querySelectorAll('.nav__links a,.mmenu__nav a').forEach(a=>{
    const h = a.getAttribute('href').replace(/\.html$/,'').replace(/\/$/,'')||'/';
    if(h===path) a.classList.add('active');
  });
})();

/* ─────────────────────────────────────────────────────────────
   WORD-BY-WORD REVEAL
───────────────────────────────────────────────────────────── */
function wrapWords(el){
  const html = el.innerHTML;
  // Split by spaces, wrap each word
  el.innerHTML = html.split(/(\s+)/).map((tok, i) => {
    if(/^\s+$/.test(tok)) return tok;
    return `<span class="wr-word"><span class="wr-inner" style="--wi:${i}">${tok}</span></span>`;
  }).join('');
}
document.querySelectorAll('[data-word-reveal]').forEach(el => {
  wrapWords(el);
  el.classList.add('word-reveal');
});

/* ─────────────────────────────────────────────────────────────
   REVEAL ON SCROLL (IntersectionObserver)
───────────────────────────────────────────────────────────── */
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('visible');
      ro.unobserve(e.target);
    }
  });
},{threshold:0.06, rootMargin:'0px 0px -30px 0px'});
document.querySelectorAll('.reveal,.reveal-img,.word-reveal,.clip-reveal,.count-up,.breathe,.food-item,.food-strip__item,.split__img').forEach(el => ro.observe(el));

/* ─────────────────────────────────────────────────────────────
   COUNTER ANIMATION
───────────────────────────────────────────────────────────── */
function animateCount(el){
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();
  const from = Math.max(0, target - Math.floor(target * 0.15));
  function frame(now){
    const p = Math.min((now - start) / duration, 1);
    // ease out cubic
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(from + (target - from) * eased);
    if(p < 1) requestAnimationFrame(frame);
    else el.textContent = target;
  }
  requestAnimationFrame(frame);
}

const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      animateCount(e.target);
      countObs.unobserve(e.target);
    }
  });
},{threshold:0.5});
document.querySelectorAll('.count-up[data-target]').forEach(el => countObs.observe(el));

/* ─────────────────────────────────────────────────────────────
   3D TILT ON IMAGE CARDS
───────────────────────────────────────────────────────────── */
document.querySelectorAll('.tilt').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x*10}deg) rotateX(${-y*10}deg)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

/* ─────────────────────────────────────────────────────────────
   MAGNETIC BUTTONS
───────────────────────────────────────────────────────────── */
document.querySelectorAll('[data-mag]').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2) * 0.28;
    const y = (e.clientY - r.top - r.height/2) * 0.32;
    el.style.transform = `translate(${x}px,${y}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

/* ─────────────────────────────────────────────────────────────
   LOADER (home only)
───────────────────────────────────────────────────────────── */
const loader = document.querySelector('.loader');
if(loader){
  
    } else { if(ct) ct.textContent = String(c).padStart(2,'0'); }
  }, 30);
}

/* ─────────────────────────────────────────────────────────────
   LETTER ANIMATION (hero words)
───────────────────────────────────────────────────────────── */
document.querySelectorAll('.word').forEach(w => {
  w.querySelectorAll('.ltr').forEach((l,i) => {
    l.style.setProperty('--i',i);
    const f = l.querySelector('.ltr-f');
    if(f) f.style.setProperty('--i',i);
  });
});




/* ── iOS video autoplay safe ── */
(function(){
  const vid = document.querySelector('.hero__vid');
  if(!vid) return;
  // Su iOS Safari, play() può fallire silenziosamente — aggiungiamo poster visibile come fallback
  vid.muted = true;
  const tryPlay = () => {
    const p = vid.play();
    if(p !== undefined){
      p.catch(() => {
        // Autoplay bloccato: mostra poster, nascondi video
        vid.style.display = 'none';
      });
    }
  };
  if(vid.readyState >= 3) tryPlay();
  else vid.addEventListener('canplay', tryPlay, {once:true});
})();

/* ═══ Cookie Banner ═══ */
(function(){
  const KEY = 'dg_cookie';
  if(localStorage.getItem(KEY)) return; // già deciso
  const bar = document.createElement('div');
  bar.className = 'cookie-bar';
  const isEN = location.pathname.startsWith('/en');
  bar.innerHTML = isEN
    ? `<p class="cookie-bar__text">
        We use cookies to improve your experience. By continuing, you agree to our
        <a href="../privacy" target="_blank">Privacy Policy</a>.
      </p>
      <div class="cookie-bar__actions">
        <button class="cookie-btn cookie-btn--reject" data-action="reject">Essential only</button>
        <button class="cookie-btn cookie-btn--accept" data-action="accept">Accept all</button>
      </div>`
    : `<p class="cookie-bar__text">
        Utilizziamo i cookie per migliorare la tua esperienza. Continuando accetti la nostra
        <a href="/privacy" target="_blank">Privacy Policy</a>.
      </p>
      <div class="cookie-bar__actions">
        <button class="cookie-btn cookie-btn--reject" data-action="reject">Solo necessari</button>
        <button class="cookie-btn cookie-btn--accept" data-action="accept">Accetta tutto</button>
      </div>`;
  document.body.appendChild(bar);
  setTimeout(()=>bar.classList.add('visible'),1200);
  bar.querySelectorAll('[data-action]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      localStorage.setItem(KEY, btn.dataset.action);
      bar.classList.add('hidden');
      setTimeout(()=>bar.remove(),700);
    });
  });
})();
