import { loadCsv } from './csv.js';
import { el, youtubeId, thumbUrl } from './youtube.js';

const SPEED = 35; // px per second; cards drift left -> right
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function buildCard(song) {
  const id = youtubeId(song.youtube_link);
  const link = id !== null;
  const card = el(link ? 'a' : 'div', 'songcard songcard--fav');
  if (link) {
    card.href = song.youtube_link;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.draggable = false;
    card.setAttribute('aria-label', `${song.song_name} by ${song.artist} (on YouTube, opens in a new tab)`);
  }

  const art = el('span', 'songcard__art');
  if (link) {
    const img = el('img', '', { src: thumbUrl(id), alt: '', loading: 'lazy', draggable: 'false' });
    art.append(img);
  } else {
    art.append(el('span', 'songcard__placeholder'));
  }

  const title = el('span', 'songcard__title');
  title.textContent = song.song_name;
  const meta = el('span', 'songcard__meta');
  const label = el('span', 'songcard__label'); label.textContent = 'Artist';
  const value = el('span', 'songcard__value'); value.textContent = song.artist;
  meta.append(label, value);

  card.append(art, title, meta);
  const li = el('li');
  li.append(card);
  return li;
}

function buildSet(songs, repeats, hidden) {
  const ul = el('ul', 'carousel__set');
  for (let r = 0; r < repeats; r++) {
    for (const song of songs) {
      const li = buildCard(song);
      // anything that isn't the one real copy is hidden from AT and the tab order
      if (hidden || r > 0) { li.setAttribute('aria-hidden', 'true'); li.inert = true; }
      ul.append(li);
    }
  }
  return ul;
}

function initCarousel(root, songs) {
  const viewport = el('div', 'carousel__viewport');
  const track = el('div', 'carousel__track');
  viewport.append(track);
  root.append(viewport);

  let setWidth = 1;
  let x = 0; // 0 <= x < setWidth; content moves right as x grows
  let hovered = false, focused = false, dragging = false;

  const normalize = () => { x = ((x % setWidth) + setWidth) % setWidth; };
  const paint = () => { track.style.transform = `translate3d(${x - setWidth}px,0,0)`; };

  function build() {
    track.replaceChildren();
    // measure one pass of the songs, then repeat to fill the viewport
    const probe = buildSet(songs, 1, false);
    track.append(probe);
    const single = probe.getBoundingClientRect().width || 1;
    const repeats = Math.max(1, Math.ceil(viewport.clientWidth / single));
    const real = buildSet(songs, repeats, false);
    const clone = buildSet(songs, repeats, true);
    track.replaceChildren(real, clone);
    setWidth = real.getBoundingClientRect().width || 1;
    normalize();
    paint();
  }

  // --- auto-scroll ---
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!(hovered || focused || dragging || reducedMotion.matches)) {
      x += SPEED * dt;
      normalize();
      paint();
    }
    requestAnimationFrame(frame);
  }

  // --- pause on hover / focus ---
  viewport.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovered = true; });
  viewport.addEventListener('pointerleave', () => { hovered = false; });
  viewport.addEventListener('focusin', (e) => {
    focused = true;
    const card = e.target.closest('.songcard');
    if (!card) return;
    const v = viewport.getBoundingClientRect(), c = card.getBoundingClientRect();
    if (c.left < v.left) x += v.left - c.left + 16;
    else if (c.right > v.right) x -= c.right - v.right + 16;
    normalize(); paint();
  });
  viewport.addEventListener('focusout', (e) => {
    if (!viewport.contains(e.relatedTarget)) focused = false;
  });

  // --- click/touch drag, either direction ---
  let down = false, moved = false, startX = 0, startPos = 0, pid = 0, suppressClick = false;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    down = true; moved = false; startX = e.clientX; startPos = x; pid = e.pointerId;
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 6) {
      moved = true; dragging = true;
      viewport.setPointerCapture(pid);
      viewport.classList.add('is-dragging');
    }
    if (moved) { x = startPos + dx; normalize(); paint(); }
  });
  const endDrag = () => {
    if (!down) return;
    down = false; dragging = false;
    viewport.classList.remove('is-dragging');
    if (moved) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); }
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  // a drag must not count as a click on a card
  viewport.addEventListener('click', (e) => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  viewport.addEventListener('dragstart', (e) => e.preventDefault());

  // --- rebuild when the width changes ---
  let lastWidth = 0, timer;
  new ResizeObserver(() => {
    const w = viewport.clientWidth;
    if (w === lastWidth) return;
    const first = lastWidth === 0;
    lastWidth = w;
    clearTimeout(timer);
    timer = setTimeout(build, first ? 0 : 150);
  }).observe(viewport);

  requestAnimationFrame(frame);
}

async function main() {
  const root = document.getElementById('favourites');
  try {
    const songs = (await loadCsv('data/favourites.csv')).filter((s) => s.song_name);
    if (!songs.length) throw new Error('no songs in data/favourites.csv');
    root.querySelector('.status')?.remove();
    initCarousel(root, songs);
  } catch (err) {
    console.error(err);
    const status = root.querySelector('.status');
    status.textContent = 'could not load songs right now.';
    status.setAttribute('role', 'alert');
  }
}
main();
