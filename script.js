/* =========================================================================
   CONFIG — edit these values to customise the scroll animation
   =========================================================================
   FRAME PROMPTS (for your AI image / video generators)

   START FRAME
   Create a photorealistic luxury jewellery product photograph. A fully assembled, intricately crafted gold bracelet with refined gemstone details, centered in the frame. Deep emerald-green studio background with a subtle radial gradient. Soft, premium studio lighting and realistic contact shadows. Front three-quarter camera angle, fixed camera position, consistent perspective, and generous negative space. Ultra-detailed gold material, realistic reflections, premium jewellery advertising photography. No text, no logo, no watermark, no hands, and no additional props.

   END FRAME
   Reproduce the exact same bracelet with the same design, materials, background, lighting, camera angle, camera distance, and framing. The bracelet is now separated into its individual components in a carefully organized exploded view. Every component floats apart with clear spacing, arranged symmetrically around the original bracelet's central axis. Maintain realistic gold reflections, accurate component proportions, and consistent perspective. No camera movement, no additional objects, no text, no logo, and no watermark.

   IMAGE-TO-VIDEO ANIMATION PROMPT
   Create a smooth, continuous transition from the fully assembled bracelet to its exploded view. The camera remains completely stationary throughout the animation. Only the bracelet components move. The components separate gradually, evenly, and naturally, revealing their individual construction. Maintain identical lighting, background, perspective, and shadows throughout. No camera zoom, no panning, no cuts, no flashes, no added objects, and no text. The final frame must closely match the supplied exploded-view reference.

   FRAME NAMING: frames/frame_0001.webp, frame_0002.webp ... (4-digit, starts at 1)
   ========================================================================= */
const CONFIG = {
  frameCount: 90,          // total frames you placed in /frames/
  framePath: i => `frames/frame_${String(i).padStart(4, '0')}.webp`,
  mobileStep: 2,           // on phones load every 2nd frame (halves downloads)
  mobileBreakpoint: 820,
  scrollLengthDesktop: 500, // vh of scroll for the whole animation  (longer = slower)
  scrollLengthMobile: 400,
  concurrency: 6
};

const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const isMobile = () => innerWidth <= CONFIG.mobileBreakpoint;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Generated vector artwork (placeholders for real photography) ---------- */
const ART = {
  bracelet: `<ellipse cx="200" cy="200" rx="150" ry="70" fill="none" stroke="url(#g)" stroke-width="26"/><ellipse cx="200" cy="200" rx="150" ry="70" fill="none" stroke="#062C1D" stroke-width="2" stroke-dasharray="3 14"/>${[0,1,2,3,4].map(i=>`<rect x="${70+i*52}" y="${i%2?252:140}" width="34" height="26" rx="4" fill="#0b9d62" stroke="url(#g)" stroke-width="5"/>`).join('')}`,
  earrings: [110,290].map(x=>`<path d="M${x} 50v90" stroke="url(#g)" stroke-width="5"/><circle cx="${x}" cy="48" r="12" fill="url(#g)"/><path d="M${x} 140c-34 30-34 90 0 120 34-30 34-90 0-120z" fill="#0b9d62" stroke="url(#g)" stroke-width="8"/>`).join(''),
  rings: `<circle cx="200" cy="230" r="90" fill="none" stroke="url(#g)" stroke-width="20"/><path d="M200 90l50 50-50 50-50-50z" fill="#0b9d62" stroke="url(#g)" stroke-width="8"/><path d="M175 140h50" stroke="#fff6" stroke-width="3"/>`,
  necklaces: `<path d="M60 70c0 170 280 170 280 0" fill="none" stroke="url(#g)" stroke-width="7" stroke-dasharray="14 5"/>${[110,160,200,240,290].map((x,i)=>`<circle cx="${x}" cy="${[165,205,222,205,165][i]}" r="13" fill="#0b9d62" stroke="url(#g)" stroke-width="5"/>`).join('')}`,
  pendants: `<path d="M120 40l80 150 80-150" fill="none" stroke="url(#g)" stroke-width="5"/><path d="M200 190c-50 40-50 100 0 130 50-30 50-90 0-130z" fill="#0b9d62" stroke="url(#g)" stroke-width="10"/><circle cx="200" cy="190" r="10" fill="url(#g)"/>`,
  statement: `<circle cx="200" cy="200" r="120" fill="none" stroke="url(#g)" stroke-width="10" stroke-dasharray="2 18" stroke-linecap="round"/><circle cx="200" cy="200" r="80" fill="none" stroke="url(#g)" stroke-width="14"/>${[0,1,2,3,4,5].map(i=>`<ellipse cx="200" cy="105" rx="14" ry="26" fill="#0b9d62" stroke="url(#g)" stroke-width="5" transform="rotate(${i*60} 200 200)"/>`).join('')}<circle cx="200" cy="200" r="22" fill="url(#g)"/>`
};
function art(type, tone = 0) {
  const bg = ['#0a7a4c', '#062C1D', '#075C3B'][tone % 3];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3D59B"/><stop offset=".5" stop-color="#D7AD58"/><stop offset="1" stop-color="#8f6a22"/></linearGradient><radialGradient id="b" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#03190F"/></radialGradient></defs><rect width="400" height="400" fill="url(#b)"/>${ART[type]}</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
// Transparent version for hero / light cards
function artT(type) { return art(type).replace(/%3Crect%20width%3D%22400%22%20height%3D%22400%22%20fill%3D%22url\(%23b\)%22%2F%3E/, ''); }

document.querySelectorAll('[data-art]').forEach((img, i) => {
  img.src = img.closest('.hero-art,.glass') ? artT(img.dataset.art) : art(img.dataset.art, i);
});

/* ---------- Data ---------- */
const CATEGORIES = ['Bracelets', 'Earrings', 'Rings', 'Necklaces', 'Pendants', 'Statement Pieces'];
const CAT_ART = ['bracelet', 'earrings', 'rings', 'necklaces', 'pendants', 'statement'];
const PRODUCTS = [
  { name: 'Verdant Link Bracelet', price: '$3,200', art: 'bracelet', desc: 'A hand-linked bracelet with emerald-cut stones.', details: ['18k gold (demo)', 'Emerald-cut green stones', 'Concealed clasp'] },
  { name: 'Aurora Drop Earrings', price: '$1,450', art: 'earrings', desc: 'Teardrop earrings that catch every flicker of light.', details: ['18k gold (demo)', 'Teardrop gemstones', 'Secure posts'] },
  { name: 'Halo Solitaire Ring', price: '$2,300', art: 'rings', desc: 'A single bold stone on a sculpted band.', details: ['18k gold (demo)', 'Kite-cut centre stone', 'Comfort-fit band'] },
  { name: 'Regal Bloom Pendant', price: '$1,900', art: 'pendants', desc: 'A pendant shaped like a drop of green light.', details: ['18k gold (demo)', 'Teardrop gemstone', 'Adjustable chain'] }
];
const GALLERY = [['bracelet', 'Bracelet close-up', 'tall'], ['earrings', 'Gold earrings', 'sq'], ['rings', 'Elegant ring', 'sq'], ['necklaces', 'Necklace detail', 'tall'], ['statement', 'Gemstone jewellery', 'sq'], ['pendants', 'Pendant study', 'tall'], ['bracelet', 'Bracelet detail', 'sq']];

/* ---------- Render sections ---------- */
$('#grid').innerHTML = CATEGORIES.map((c, i) => `<a class="cat reveal" style="transition-delay:${i * 90}ms" href="#featured"><img src="${artT(CAT_ART[i])}" alt="${c}" loading="lazy" width="300" height="300"><span>${c}</span></a>`).join('');
$('#products').innerHTML = PRODUCTS.map((p, i) => `<article class="prod reveal" style="transition-delay:${i * 90}ms"><img src="${art(p.art, i)}" alt="${p.name}" loading="lazy" width="300" height="300"><h3>${p.name}</h3><p>${p.price} · demo price</p><button class="btn ghost" data-p="${i}">VIEW DETAILS</button></article>`).join('');
$('#gal').innerHTML = GALLERY.map((g, i) => `<button data-g="${i}" aria-label="Open ${g[1]}"><img src="${art(g[0], i + 1)}" alt="${g[1]}" loading="lazy" style="aspect-ratio:${g[2] === 'tall' ? '3/4' : '1'}"></button>`).join('');

/* ---------- Nav ---------- */
const burger = $('#burger'), menu = $('#menu');
burger.onclick = () => burger.setAttribute('aria-expanded', menu.classList.toggle('open'));
menu.onclick = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); };

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- Dialogs ---------- */
document.addEventListener('click', e => {
  if (e.target.matches('[data-close]') || (e.target.tagName === 'DIALOG')) e.target.closest('dialog').close();
  const p = e.target.closest('[data-p]'); if (p) openProduct(+p.dataset.p);
  const g = e.target.closest('[data-g]'); if (g) openLB(+g.dataset.g);
});
function openProduct(i) {
  const p = PRODUCTS[i];
  $('#pmI').src = art(p.art, i); $('#pmI').alt = p.name;
  $('#pmT').textContent = p.name; $('#pmP').textContent = p.price + ' (demonstration price)'; $('#pmD').textContent = p.desc;
  $('#pmL').innerHTML = p.details.map(d => `<li>${d}</li>`).join('');
  $('#pm').showModal();
}
let lbIdx = 0;
function openLB(i) {
  lbIdx = (i + GALLERY.length) % GALLERY.length;
  const g = GALLERY[lbIdx];
  $('#lbI').src = art(g[0], lbIdx + 1); $('#lbI').alt = g[1]; $('#lbC').textContent = g[1];
  if (!$('#lb').open) $('#lb').showModal();
}
$('#lbP').onclick = () => openLB(lbIdx - 1);
$('#lbN').onclick = () => openLB(lbIdx + 1);
$('#lb').addEventListener('keydown', e => { if (e.key === 'ArrowLeft') openLB(lbIdx - 1); if (e.key === 'ArrowRight') openLB(lbIdx + 1); });
$('#enqBtn').onclick = () => { $('#eqM').textContent = 'This is a demo form. Nothing is sent.'; $('#eq').showModal(); };
$('#eqF').onsubmit = e => { e.preventDefault(); $('#eqM').textContent = 'Demo only: no message was sent.'; };

/* ---------- Scroll-linked canvas sequence ---------- */
const seq = $('.seq'), cv = $('#cv'), ctx = cv.getContext('2d');
const loader = $('#loader'), tIntro = $('#tIntro'), tOutro = $('#tOutro'), progBar = $('#progBar');
let frames = [], total = 0, current = -1, target = 0, ticking = false, ready = false;

function useFallback(msg) {
  ready = false; cv.hidden = true; $('#fallback').hidden = false; loader.classList.add('done');
  if (msg) { $('#notice').hidden = false; }
  tIntro.style.opacity = 1; tOutro.style.opacity = 1; $('#prog').hidden = true;
  seq.style.height = 'auto'; $('.stage').style.position = 'relative';
}
function frameList() {
  const step = isMobile() ? CONFIG.mobileStep : 1, list = [];
  for (let i = 1; i <= CONFIG.frameCount; i += step) list.push(i);
  if (list[list.length - 1] !== CONFIG.frameCount) list.push(CONFIG.frameCount);
  return list;
}
function loadImg(n) {
  return new Promise(res => { const im = new Image(); im.decoding = 'async'; im.onload = () => res(im); im.onerror = () => res(null); im.src = CONFIG.framePath(n); });
}
async function initSequence() {
  seq.style.setProperty('--scroll-len', (isMobile() ? CONFIG.scrollLengthMobile : CONFIG.scrollLengthDesktop) + 'vh');
  if (reduced) return useFallback(false);
  const list = frameList(); total = list.length; frames = new Array(total).fill(null);
  const first = await loadImg(list[0]);
  if (!first) return useFallback(true);
  frames[0] = first; ready = true; resize();
  let done = 1, next = 1;
  const worker = async () => {
    while (next < total) {
      const k = next++; frames[k] = await loadImg(list[k]); done++;
      $('#loadTxt').textContent = `Preparing the experience… ${Math.round(done / total * 100)}%`;
      if (done === total) loader.classList.add('done');
    }
  };
  // Page stays interactive while frames stream in
  await Promise.all(Array.from({ length: CONFIG.concurrency }, worker));
  loader.classList.add('done');
  if (!frames.some((f, k) => k > 0 && f)) return useFallback(true);
  update();
}
function resize() {
  if (!ready) return;
  const dpr = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
  cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  current = -1; update();
}
function draw(idx) {
  // use nearest earlier loaded frame if this one failed
  let k = idx; while (k > 0 && !frames[k]) k--;
  const im = frames[k]; if (!im) return;
  const cw = cv.width, ch = cv.height, s = Math.min(cw / im.width, ch / im.height);
  const w = im.width * s, h = im.height * s;
  ctx.clearRect(0, 0, cw, ch); ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
}
function update() {
  ticking = false; if (!ready) return;
  const r = seq.getBoundingClientRect();
  const p = clamp(-r.top / (r.height - innerHeight));
  const idx = Math.round(p * (total - 1));
  if (idx !== current) { current = idx; draw(idx); }
  tIntro.style.opacity = 1 - clamp(p / .15);
  tOutro.style.opacity = clamp((p - .82) / .15);
  progBar.style.width = p * 100 + '%';
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { seq.style.setProperty('--scroll-len', (isMobile() ? CONFIG.scrollLengthMobile : CONFIG.scrollLengthDesktop) + 'vh'); resize(); }, 120); });
initSequence();
