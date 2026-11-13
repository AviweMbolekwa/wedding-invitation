/* Amara & Daniel — wedding invitation */
(() => {
  'use strict';

  /* Set this to a URL that accepts a JSON POST (Formspree, a Google Apps
     Script web app, your own API) to collect replies. Left empty, replies
     are only kept in the guest's own browser. */
  const RSVP_ENDPOINT = '';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const body = document.body;
  const isStatic = new URLSearchParams(location.search).has('static');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (min, max) => min + Math.random() * (max - min);

  /* ---------- Seven-segment date on the hero ---------- */
  function buildSegmentDate(el, text) {
    const W = 9, H = 18, T = 2.3, G = 0.3;          // digit cell, stroke, gap between segments
    const DIGIT_GAP = 5.2, DOT_GAP = 2.1, DOT = 2.4;
    const h = (y, x1, x2) => `M${x1} ${y}l${T / 2} ${-T / 2}H${x2 - T / 2}l${T / 2} ${T / 2}l${-T / 2} ${T / 2}H${x1 + T / 2}z`;
    const v = (x, y1, y2) => `M${x} ${y1}l${T / 2} ${T / 2}V${y2 - T / 2}l${-T / 2} ${T / 2}l${-T / 2} ${-T / 2}V${y1 + T / 2}z`;
    const m = T / 2;
    const seg = {
      a: h(m, m + G, W - m - G),
      g: h(H / 2, m + G, W - m - G),
      d: h(H - m, m + G, W - m - G),
      f: v(m, m + G, H / 2 - G),
      b: v(W - m, m + G, H / 2 - G),
      e: v(m, H / 2 + G, H - m - G),
      c: v(W - m, H / 2 + G, H - m - G),
    };
    const map = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
    let x = 0, out = '', prev = '';
    for (const ch of text) {
      if (ch === '.') {
        x += DOT_GAP;
        out += `<rect x="${x}" y="${H - DOT}" width="${DOT}" height="${DOT}"/>`;
        x += DOT;
      } else {
        x += prev === '' ? 0 : prev === '.' ? DOT_GAP : DIGIT_GAP;
        out += `<path transform="translate(${x} 0)" d="${[...map[ch]].map((s) => seg[s]).join('')}"/>`;
        x += W;
      }
      prev = ch;
    }
    el.innerHTML = `<svg viewBox="0 0 ${x} ${H}" fill="#fff" aria-hidden="true">${out}</svg>`;
  }
  buildSegmentDate($('#heroDate'), '16.12.2026');

  /* ---------- Chandelier sparkles ---------- */
  (function sparkles() {
    const box = $('#sparkles');
    const spots = [[46, 14.2], [57.5, 11.2], [35.5, 18], [48.5, 19.2], [52.5, 13.8], [61, 16.5], [40.5, 12.4], [66, 13.6], [31, 14.6], [55, 21]];
    for (const [x, y] of spots) {
      const s = document.createElement('i');
      const size = rand(0.9, 1.7);
      s.style.cssText = `left:${x}%;top:${y}%;width:${size}rem;height:${size}rem;margin:${-size / 2}rem 0 0 ${-size / 2}rem;animation-duration:${rand(2.4, 4.6).toFixed(2)}s;animation-delay:${(-rand(0, 4)).toFixed(2)}s`;
      box.appendChild(s);
    }
  })();

  /* ---------- Falling petals ---------- */
  (function petals() {
    if (isStatic || reduceMotion) return;
    const box = $('#petals');
    const sprites = [
      { src: 'assets/img/petal-1.webp', w: 2.17 },
      { src: 'assets/img/petal-2.webp', w: 5.09 },
      { src: 'assets/img/petal-3.webp', w: 3.07 },
      { src: 'assets/img/petal-4.webp', w: 2.2 },
    ];
    const COUNT = 16;
    for (let i = 0; i < COUNT; i++) {
      const sp = sprites[i % sprites.length];
      const scale = rand(0.4, 1);
      const p = document.createElement('span');
      const img = new Image();
      p.className = 'petal';
      img.src = sp.src;
      img.alt = '';
      const x0 = rand(-2, 38);
      const dur = rand(11, 20);
      p.style.cssText = `width:${(sp.w * scale).toFixed(2)}rem;--x0:${x0.toFixed(1)}rem;--x1:${(x0 + rand(-7, 7)).toFixed(1)}rem;--fall:${box.offsetHeight + 80}px;animation-duration:${dur.toFixed(1)}s;animation-delay:${(-rand(0, dur)).toFixed(1)}s;${scale < 0.55 ? 'filter:blur(.08rem);opacity:.9;' : ''}`;
      img.style.cssText = `--r0:${rand(-50, 40).toFixed(0)}deg;--r1:${rand(60, 220).toFixed(0)}deg;animation-duration:${rand(2.2, 4.4).toFixed(1)}s`;
      p.appendChild(img);
      box.appendChild(p);
    }
    addEventListener('resize', () => $$('.petal', box).forEach((p) => p.style.setProperty('--fall', `${box.offsetHeight + 80}px`)));
  })();

  /* ---------- Scroll reveal ---------- */
  let pending = [];
  let revealRaf = 0;
  function checkReveals() {
    revealRaf = 0;
    const line = innerHeight * 0.92;
    pending = pending.filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < line && r.bottom > 0) { el.classList.add('is-in'); return false; }
      return true;
    });
  }
  function queueReveals() {
    if (pending.length && !revealRaf) revealRaf = requestAnimationFrame(checkReveals);
  }
  function startReveals() {
    pending = $$('.reveal, #swatches');
    addEventListener('scroll', queueReveals, { passive: true });
    addEventListener('resize', queueReveals);
    checkReveals();
  }

  /* ---------- Timeline: line fills and the butterfly follows the scroll ---------- */
  (function timeline() {
    const list = $('#timeline');
    const items = $$('.timeline__item', list);
    const fill = $('#timelineFill');
    const fly = $('#timelineFly');
    const track = $('.timeline__track', list);
    let target = 0, current = 0, raf = 0;

    function measure() {
      const r = track.getBoundingClientRect();
      const row = items[1].offsetTop - items[0].offsetTop;
      const lastDot = row * (items.length - 1);
      const head = Math.max(0, Math.min(r.height, innerHeight * 0.5 - r.top));
      return { head, row, lastDot, height: r.height, visible: r.top < innerHeight && r.bottom > 0 };
    }
    function paint() {
      raf = 0;
      const m = measure();
      target = isStatic ? m.height : m.head;
      current += (target - current) * (isStatic || reduceMotion ? 1 : 0.2);
      if (Math.abs(target - current) < 0.3) current = target;
      fill.style.height = `${current}px`;
      fly.style.transform = `translate3d(0, ${Math.min(current, m.lastDot)}px, 0)`;
      items.forEach((it, i) => {
        if (current >= i * m.row - 2 && (m.visible || isStatic)) it.classList.add('is-on');
      });
      if (current !== target) raf = requestAnimationFrame(paint);
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(paint); };
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick);
    kick();
  })();

  /* ---------- Music ---------- */
  const audio = $('#audio');
  const musicBtn = $('#music');
  function setMusic(on) {
    const done = () => {
      const playing = !audio.paused;
      musicBtn.classList.toggle('is-playing', playing);
      musicBtn.setAttribute('aria-pressed', String(playing));
      musicBtn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    };
    if (on) audio.play().then(done, done); else { audio.pause(); done(); }
  }
  musicBtn.addEventListener('click', () => setMusic(audio.paused));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !audio.paused) { audio.dataset.resume = '1'; setMusic(false); }
    else if (!document.hidden && audio.dataset.resume) { delete audio.dataset.resume; setMusic(true); }
  });

  /* ---------- Envelope intro ---------- */
  const intro = $('#intro');
  const video = $('#introVideo');
  let opened = false, playing = false;

  function reveal() {
    if (opened) return;
    opened = true;
    intro.classList.add('is-done');
    body.classList.remove('is-locked', 'pre-open');
    body.classList.add('is-open');
    startReveals();
    setTimeout(() => intro.remove(), 900);
  }
  function openEnvelope() {
    if (playing || opened) return;
    playing = true;
    setMusic(true);
    if (reduceMotion) return reveal();
    video.addEventListener('ended', reveal, { once: true });
    video.addEventListener('error', reveal, { once: true });
    video.addEventListener('timeupdate', () => {
      if (video.duration && video.currentTime >= video.duration - 0.12) reveal();
    });
    // never leave a guest stuck on the envelope: if the video can't start
    // within 6s (blocked, or a very slow connection), go straight in
    const stall = setTimeout(() => { if (video.currentTime === 0) reveal(); }, 6000);
    video.addEventListener('playing', () => {
      clearTimeout(stall);
      setTimeout(reveal, ((video.duration || 4.5) - video.currentTime + 1.5) * 1000);
    }, { once: true });
    const p = video.play();
    if (p && p.catch) p.catch(reveal);
  }
  intro.addEventListener('click', openEnvelope);
  intro.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
  });

  if (isStatic) {
    body.classList.add('is-static');
    intro.remove();
    opened = true;
    body.classList.remove('is-locked', 'pre-open');
    body.classList.add('is-open');
    $$('.reveal, #swatches').forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- RSVP sheet ---------- */
  const sheet = $('#sheet');
  const form = $('#rsvpForm');
  const thanks = $('#thanks');
  const guestsRow = $('#guestsRow');
  const guestsCount = $('#guestsCount');
  const MAX_GUESTS = 10;
  let guests = 1, lastFocus = null;

  function openSheet() {
    lastFocus = document.activeElement;
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    setTimeout(() => { if (!form.hidden) form.elements.name.focus({ preventScroll: true }); }, 450);
  }
  function closeSheet() {
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    body.classList.remove('is-locked');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  $('#openRsvp').addEventListener('click', openSheet);
  $$('[data-close]', sheet).forEach((el) => el.addEventListener('click', closeSheet));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet();
  });

  function setGuests(n) {
    guests = Math.max(1, Math.min(MAX_GUESTS, n));
    guestsCount.textContent = guests;
  }
  $('#guestsMinus').addEventListener('click', () => setGuests(guests - 1));
  $('#guestsPlus').addEventListener('click', () => setGuests(guests + 1));

  form.addEventListener('change', (e) => {
    if (e.target.name !== 'attending') return;
    guestsRow.hidden = e.target.value !== 'yes';
    $('.attend', form).classList.remove('is-invalid');
  });
  form.elements.name.addEventListener('input', (e) => e.target.closest('.field').classList.remove('is-invalid'));

  function showThanks(data) {
    const first = data.name.split(/\s+/)[0];
    $('#thanksTitle').textContent = `Thank you, ${first}`;
    $('#thanksText').textContent = data.attending === 'yes'
      ? `Your reply for ${data.guests} guest${data.guests === 1 ? '' : 's'} is noted.\nWe can't wait to celebrate with\nyou on 16 December.`
      : `Your reply is noted.\nWe're sorry you can't make it,\nyou will be dearly missed.`;
    form.hidden = true;
    thanks.hidden = false;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const attending = form.elements.attending.value;
    const nameField = form.elements.name.closest('.field');
    nameField.classList.toggle('is-invalid', !name);
    $('.attend', form).classList.toggle('is-invalid', !attending);
    if (!name) return form.elements.name.focus();
    if (!attending) return;

    const data = {
      name,
      phone: form.elements.phone.value.trim(),
      attending,
      guests: attending === 'yes' ? guests : 0,
      note: form.elements.note.value.trim(),
      sentAt: new Date().toISOString(),
    };
    try { localStorage.setItem('rsvp', JSON.stringify(data)); } catch (_) { /* private mode */ }
    if (RSVP_ENDPOINT) {
      fetch(RSVP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => { /* reply is still saved locally */ });
    }
    showThanks(data);
  });
})();
