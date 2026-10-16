import { loadCsv } from './csv.js';
import { el, youtubeId, thumbUrl, fetchYouTubeInfo } from './youtube.js';

const SPEED = 35; // px per second; cards drift left -> right
const FRICTION = 0.7; // seconds for a flick to settle back to the drift speed
const MAX_FLICK = 3500; // px per second

// ---- fill blank song_name / artist from the YouTube link ----
// Bracketed extras like "(Official Video)" or "[MV]" are dropped from titles.
const EXTRAS = /\s*[(\[【][^)\]】]*\b(official|music video|mv|audio|lyrics?|visuali[sz]er)\b[^)\]】]*[)\]】]/gi;
const cleanTitle = (t) => t.replace(EXTRAS, '').replace(/\s{2,}/g, ' ').trim();
const cleanChannel = (c) => c.replace(/\s*-\s*Topic$/i, '').replace(/\s*(VEVO|Official)$/i, '').trim();

function songFromYouTube(info) {
  const channel = info.author_name || '';
  const isTopic = /-\s*Topic$/i.test(channel); // YouTube Music auto channels: title is already the song
  let title = cleanTitle(info.title || '');
  let artist = cleanChannel(channel);
  const dash = title.match(/^(.+?)\s+[-–—]\s+(.+)$/); // "Artist - Song"
  if (!isTopic && dash) { artist = dash[1].trim(); title = dash[2].trim(); }
  return { title, artist };
}

async function fillFromYouTube(song) {
  const id = youtubeId(song.youtube_link);
  if ((song.song_name && song.artist) || !id) return song;
  try {
    const { title, artist } = songFromYouTube(await fetchYouTubeInfo(id));
    // anything typed into the CSV wins over the lookup
    return { ...song, song_name: song.song_name || title, artist: song.artist || artist };
  } catch (err) {
    console.warn('could not look up', song.youtube_link, err);
    return { ...song, song_name: song.song_name || 'untitled' };
  }
}

function buildCard(song) {
  const id = youtubeId(song.youtube_link);
  const link = id !== null;
  const card = el(link ? 'a' : 'div', 'songcard songcard--fav');
  if (link) {
    card.href = song.youtube_link;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.draggable = false;
    card.setAttribute('aria-label', `${song.song_name}${song.artist ? ` by ${song.artist}` : ''} (on YouTube, opens in a new tab)`);
  }

  // album_art (a file in assets/images/) wins; else the YouTube thumbnail; else a placeholder
  const art = el('span', 'songcard__art');
  const placeholder = () => el('span', 'songcard__placeholder');
  const artSrc = song.album_art ? `assets/images/${song.album_art}` : link ? thumbUrl(id) : null;
  if (artSrc) {
    const img = el('img', '', { src: artSrc, alt: '', loading: 'lazy', draggable: 'false' });
    // thumbnails are 4:3 with black bars baked in top and bottom; zoom past them
    if (!song.album_art) img.classList.add('songcard__thumb');
    img.addEventListener('error', () => img.replaceWith(placeholder()), { once: true });
    art.append(img);
  } else {
    art.append(placeholder());
  }

  const title = el('span', 'songcard__title');
  const titleText = el('span');
  titleText.textContent = song.song_name;
  title.append(titleText);
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
      // anything that isn't the one real copy is hidden from screen readers and
      // skipped by Tab, but stays clickable: most visible cards are copies
      if (hidden || r > 0) {
        li.setAttribute('aria-hidden', 'true');
        li.firstElementChild.tabIndex = -1;
      }
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

  // Track = [copy][real][copy], each setWidth wide. The real set sits at
  // screen x - setWidth .. x. x wraps within [low, low + setWidth); starting
  // the range at half the viewport (not 0) means every real card, including
  // the first, has a position where it is fully on screen.
  let setWidth = 1, low = 0;
  let x = 0; // content moves right as x grows
  let focused = false, dragging = false;
  let userPaused = false;

  const toggle = el('button', 'carousel__toggle', { type: 'button' });
  const syncToggle = () => {
    toggle.textContent = userPaused ? 'play' : 'pause';
    toggle.setAttribute('aria-label', userPaused ? 'Play song carousel' : 'Pause song carousel');
  };
  toggle.addEventListener('click', () => { userPaused = !userPaused; syncToggle(); });
  syncToggle();
  root.append(toggle);

  const normalize = () => { x = low + ((((x - low) % setWidth) + setWidth) % setWidth); };
  const paint = () => { track.style.transform = `translate3d(${x - 2 * setWidth}px,0,0)`; };

  function build() {
    track.replaceChildren();
    // measure one pass of the songs, then repeat to fill the viewport
    const probe = buildSet(songs, 1, false);
    track.append(probe);
    const single = probe.getBoundingClientRect().width || 1;
    const repeats = Math.max(1, Math.ceil(viewport.clientWidth / single));
    const real = buildSet(songs, repeats, false);
    track.replaceChildren(buildSet(songs, repeats, true), real, buildSet(songs, repeats, true));
    setWidth = real.getBoundingClientRect().width || 1;
    low = viewport.clientWidth / 2;
    normalize();
    paint();
  }

  // --- auto-scroll + momentum ---
  // vel (px/s) eases toward the drift speed (or 0 when paused), so a flick
  // keeps coasting after release and a pause fades out instead of snapping.
  let vel = SPEED;
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!dragging) {
      const target = userPaused || focused ? 0 : SPEED;
      vel = target + (vel - target) * Math.exp(-dt / FRICTION);
      x += vel * dt;
      normalize();
      paint();
    }
    requestAnimationFrame(frame);
  }

  // --- pause on keyboard focus ---
  viewport.addEventListener('focusin', (e) => {
    // a mouse click also focuses the link (and keeps it focused after you come
    // back from the new tab), so only keyboard focus counts
    if (!e.target.matches(':focus-visible')) return;
    focused = true;
    vel = 0; // stop at once so the focused card can't drift off screen
    const card = e.target.closest('.songcard');
    if (!card) return;
    // bring the card fully on screen with the smallest move that stays inside
    // the wrap range (wrapping would jump this card a whole set away)
    const M = 16;
    const v = viewport.getBoundingClientRect(), c = card.getBoundingClientRect();
    const pos = c.left - v.left;
    const lo = Math.max(x + M - pos, low);
    const hi = Math.min(x + (v.width - c.width - M) - pos, low + setWidth - 0.01);
    if (lo <= hi) x = Math.min(Math.max(x, lo), hi);
    paint();
  });
  viewport.addEventListener('focusout', (e) => {
    if (!viewport.contains(e.relatedTarget)) focused = false;
  });

  // --- click/touch drag, either direction ---
  let down = false, moved = false, startX = 0, startPos = 0, pid = 0, suppressClick = false;
  let samples = []; // recent pointer positions, for release velocity
  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    down = true; moved = false; startX = e.clientX; startPos = x; pid = e.pointerId;
    samples = [{ t: e.timeStamp, x: e.clientX }];
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
    samples.push({ t: e.timeStamp, x: e.clientX });
    while (samples.length > 2 && e.timeStamp - samples[0].t > 100) samples.shift();
  });
  const endDrag = () => {
    if (!down) return;
    down = false; dragging = false;
    viewport.classList.remove('is-dragging');
    if (moved) {
      suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
      // hand the release velocity to the animation loop
      const a = samples[0], b = samples[samples.length - 1];
      const span = b.t - a.t;
      const fresh = performance.now() - b.t < 100; // finger was still moving when it lifted
      vel = fresh && span > 0
        ? Math.max(-MAX_FLICK, Math.min(MAX_FLICK, ((b.x - a.x) / span) * 1000))
        : 0;
    }
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  // a drag must not count as a click on a card
  viewport.addEventListener('click', (e) => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  // opening a card (click, or Enter from the keyboard) resumes the drift, so it
  // is moving again when you come back from YouTube; Tab to a card to pause
  viewport.addEventListener('click', (e) => {
    if (e.target.closest('a.songcard')) focused = false;
  });
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
    const rows = (await loadCsv('data/favourites.csv')).filter((s) => s.song_name || s.youtube_link);
    const songs = await Promise.all(rows.map(fillFromYouTube));
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
