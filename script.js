// Original synthesised train sounds (Web Audio, no asset files). Silent until the visitor turns sound on.
window.Snd = (() => {
  let ctx, m, srcs = [], buf; const o = { on: false, cur: null };
  const noise = () => buf || (buf = (() => { const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })());
  const ns = () => { const s = ctx.createBufferSource(); s.buffer = noise(); s.loop = true; srcs.push(s); return s; };
  const chain = (s, type, f, q, g) => { const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const gn = ctx.createGain(); gn.gain.value = 0; s.connect(fl); fl.connect(gn); gn.connect(m); return [fl, gn]; };
  o.set = v => { o.on = v; if (v) { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } else o.stop(); };
  o.stop = () => { if (!m) return; try { m.gain.cancelScheduledValues(0); m.gain.setValueAtTime(0, ctx.currentTime); } catch (e) {} srcs.forEach(s => { try { s.stop(); } catch (e) {} }); srcs = []; m = null; };
  // total = seconds of the animation; el = seconds already elapsed (if sound is switched on mid-way)
  o.play = (total, el = 0) => {
    if (!o.on || !ctx) return; o.stop(); m = ctx.createGain(); m.gain.value = .6; m.connect(ctx.destination);
    const T = t => ctx.currentTime + Math.max(0, t - el), ramp = (g, pts) => pts.forEach(([t, v]) => g.gain.linearRampToValueAtTime(v, T(t)));
    // 1. approach swell
    let s = ns(), [f, g] = chain(s, 'bandpass', 300, .8); f.frequency.linearRampToValueAtTime(1400, T(1.2)); ramp(g, [[.9, .2], [1.8, .05], [2.2, 0]]); s.start(T(0)); s.stop(T(2.4));
    // 2. low rumble while carriages pass
    s = ns(); [f, g] = chain(s, 'lowpass', 150, .7); ramp(g, [[.4, .2], [total - .8, .17], [total, 0]]); s.start(T(0)); s.stop(T(total));
    // 3. rhythmic wheel-on-rail clatter
    for (let t = .5, k = 0; t < total - .6; t += .14, k++) if (t >= el) { const c = ns(), [cf, cg] = chain(c, 'bandpass', 2200, 2); cg.gain.setValueAtTime(0, T(t)); cg.gain.linearRampToValueAtTime(k % 2 ? .035 : .07, T(t) + .006); cg.gain.linearRampToValueAtTime(0, T(t) + .04); c.start(T(t)); c.stop(T(t) + .06); }
    // 4. one short two-tone electric horn
    if (el < .9) { const hf = ctx.createBiquadFilter(), hg = ctx.createGain(); hf.type = 'lowpass'; hf.frequency.value = 1500; hg.gain.value = 0; hf.connect(hg); hg.connect(m);
      [415, 554].forEach(fr => { const os = ctx.createOscillator(); os.type = 'sawtooth'; os.frequency.value = fr; os.connect(hf); os.start(T(.25)); os.stop(T(.25) + .9); srcs.push(os); });
      hg.gain.setValueAtTime(0, T(.25)); hg.gain.linearRampToValueAtTime(.09, T(.25) + .05); hg.gain.setValueAtTime(.09, T(.25) + .6); hg.gain.linearRampToValueAtTime(0, T(.25) + .8); }
    // 5. soft departure whoosh as the last carriage leaves
    s = ns(); [f, g] = chain(s, 'bandpass', 900, .8); f.frequency.linearRampToValueAtTime(250, T(total)); ramp(g, [[total - 1, .1], [total, 0]]); s.start(T(Math.max(0, total - 1.1))); s.stop(T(total));
  };
  return o;
})();
document.querySelectorAll('.sndbtn').forEach(b => b.addEventListener('click', () => {
  const v = !Snd.on; Snd.set(v);
  document.querySelectorAll('.sndbtn').forEach(x => { x.setAttribute('aria-pressed', v); x.setAttribute('aria-label', v ? 'Turn train sounds off' : 'Turn train sounds on'); const sp = x.querySelector('span'); if (sp) sp.textContent = v ? 'Sound on' : 'Sound off'; });
  if (v && Snd.cur) Snd.play(Snd.cur.total, (performance.now() - Snd.cur.start) / 1000);
}));
// Full side-view Mumbai local: 8 coupled carriages, driving cab at the right-hand end, cab at the left end too
const trainSVG = () => {
  let s = '';
  for (let i = 0; i < 8; i++) {
    const X = i * 300;
    s += `<g class="car" style="animation-delay:${-i * .07}s"><rect x="${X + 8}" y="118" width="264" height="14" fill="#1b1030"/><rect x="${X}" y="22" width="280" height="96" rx="8" fill="#2675D8"/><rect x="${X}" y="70" width="280" height="48" fill="#6638B6"/><rect x="${X}" y="62" width="280" height="9" fill="#F5C928"/><rect x="${X + 10}" y="12" width="260" height="11" rx="3" fill="#3a2f78"/>`;
    s += [12, 146].map(d => `<rect x="${X + d}" y="30" width="34" height="88" fill="#1b1030"/><rect x="${X + d + 5}" y="36" width="24" height="30" fill="#FFF4DF"/>`).join('');
    s += [54, 100, 190, 236].map((w, k) => `<rect x="${X + w}" y="34" width="38" height="28" rx="3" fill="${(i + k) % 3 === 0 ? '#ffe27a' : '#FFF4DF'}"/>`).join('');
    s += [40, 70, 210, 240].map(w => `<g class="wh"><circle cx="${X + w}" cy="136" r="9" fill="#1b1030" stroke="#8a7ab5" stroke-width="2"/><rect x="${X + w - 1}" y="128" width="2" height="16" fill="#8a7ab5"/></g>`).join('') + '</g>';
    if (i < 7) s += `<rect x="${X + 280}" y="40" width="20" height="78" fill="#241a3a"/><rect x="${X + 280}" y="118" width="20" height="6" fill="#241a3a"/>`; // flexible gangway between carriages
  }
  const n = 7 * 300 + 280;
  s += `<polygon points="${n},22 ${n + 44},46 ${n + 44},118 ${n},118" fill="#2675D8"/><polygon points="${n},70 ${n + 44},70 ${n + 44},118 ${n},118" fill="#6638B6"/><rect x="${n}" y="62" width="44" height="9" fill="#F5C928"/><polygon points="${n + 6},34 ${n + 32},48 ${n + 32},62 ${n + 6},62" fill="#FFF4DF"/><circle cx="${n + 38}" cy="88" r="5" fill="#F5C928"/>`;
  s += `<polygon points="0,22 -44,46 -44,118 0,118" fill="#2675D8"/><polygon points="0,70 -44,70 -44,118 0,118" fill="#6638B6"/><rect x="-44" y="62" width="44" height="9" fill="#F5C928"/><rect x="-60" y="144" width="2620" height="4" fill="#b9a5f0"/>`;
  return s;
};
document.getElementById('ltrain').innerHTML = '<g transform="translate(0 335) scale(.49)">' + trainSVG() + '</g>';
document.getElementById('outrotrain').innerHTML = trainSVG();
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // Mobile menu
  const burger = $('.burger'), menu = $('#menu');
  burger.addEventListener('click', () => burger.setAttribute('aria-expanded', menu.classList.toggle('open')));
  menu.addEventListener('click', e => { if (e.target.matches('a')) { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });
  // Scrapbook: flip pages, reveal sticker notes
  const sb = $('.scrap'), pages = $$('.page', sb), note = $('.note', sb); let cur = 0;
  const show = n => {
    cur = (n + pages.length) % pages.length;
    pages.forEach((p, i) => p.hidden = i !== cur);
    $('.count', sb).textContent = `Page ${cur + 1} of ${pages.length}`;
    note.textContent = 'Tap a sticker on the page.';
  };
  sb.addEventListener('click', e => {
    const f = e.target.closest('.flip'), s = e.target.closest('.stickers button');
    if (f) show(cur + +f.dataset.dir);
    if (s) { $$('.stickers button', sb).forEach(x => x.setAttribute('aria-pressed', x === s)); note.textContent = s.dataset.t; }
  });
  sb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
  // Interest picker (unused if absent)
  $$('.picker').forEach(p => p.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', p).forEach(x => x.setAttribute('aria-pressed', x === b));
    $('.note', p).textContent = b.dataset.text;
  }));
  // Active nav link while scrolling
  const links = $$('#menu a');
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle('on', a.hash === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => io.observe(s));
  // Contact: mailto only, no fake form
  $('.mail').addEventListener('submit', e => {
    e.preventDefault();
    location.href = 'mailto:aditiagarwal.0306@gmail.com?body=' + encodeURIComponent($('#m').value);
  });
})();

(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // Intro: skippable, never blocks
  const ld = $('#loader'), hide = () => { Snd.stop(); Snd.cur = null; ld && ld.remove(); };
  let seen = false; try { seen = sessionStorage.getItem('intro'); sessionStorage.setItem('intro', '1'); } catch (e) {}
  if (seen) hide(); else {
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('#skipintro').addEventListener('click', hide);
    if (rm) { $('#ind').textContent = 'ARRIVING'; setTimeout(hide, 1500); }
    else { // sequence: ~2.9s total, never blocks the page beneath
      Snd.cur = { total: 3, start: performance.now() };
      setTimeout(() => { $('#ind').textContent = 'ARRIVING'; }, 1200);
      setTimeout(() => { Snd.stop(); Snd.cur = null; ld.classList.add('out'); }, 3000);
      setTimeout(hide, 3500);
    }
  }
  // Route map: reveal "Visit this stop" link for the chosen station
  $$('.routemap').forEach(p => p.addEventListener('click', e => {
    const b = e.target.closest('button'), v = $('.visit', p); if (!b) return;
    v.href = '#' + b.dataset.target; v.hidden = false;
  }));
  // Train marker + destination board follow scroll
  const train = $('#train'), dest = $('#dest');
  const names = { home: 'Platform 1 · Home', route: 'My Route', about: 'About', projects: 'Projects', chai: 'Chai Break', experience: 'Experience', qualities: 'Qualities', next: 'Next Stops', adventures: 'Adventures', contact: 'Last Stop? Not Quite' };
  const move = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    train.style.top = (max > 0 ? scrollY / max : 0) * ($('.rail').clientHeight - 24) + 'px';
  };
  addEventListener('scroll', move, { passive: true }); move();
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) dest.textContent = names[en.target.id] || ''; }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => io.observe(s));
  // Optional outro: train leaves the platform
  const leave = $('#leave'), tr = $('#outrotrain'), rmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  leave.addEventListener('click', () => {
    if (leave.disabled) return; leave.disabled = true; // no overlapping trains
    tr.classList.remove('go'); void tr.getBoundingClientRect(); tr.classList.add('go');
    const total = rmo ? 1.8 : 4.2; Snd.cur = { total, start: performance.now() }; Snd.play(total, 0);
    let fin = false; const done = () => { if (fin) return; fin = true; tr.classList.remove('go'); leave.disabled = false; Snd.stop(); Snd.cur = null; };
    if (!rmo) tr.addEventListener('animationend', done, { once: true });
    setTimeout(done, rmo ? 1800 : 4600);
  });
})();

(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.add('js');
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(pointer: fine)').matches;
  // Scroll reveal
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  $$('.proj,.qcard,.dests article,.line li,.scrap,.chips li,.skills > div').forEach(el => { el.classList.add('rv'); io.observe(el); });
  // Collectible chai cups
  let n = 0; const out = $('#cups');
  const grab = c => { out.textContent = '☕ ' + (++n); c.classList.remove('pop'); void c.getBoundingClientRect(); c.classList.add('pop'); };
  $$('.pcup').forEach(c => { c.addEventListener('click', () => grab(c)); c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); grab(c); } }); });
})();
