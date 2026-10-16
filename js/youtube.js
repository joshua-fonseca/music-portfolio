// Accepts watch links (youtube.com / music.youtube.com / m.youtube.com),
// youtu.be, /embed/ and /shorts/. Returns the video id or null.
export function youtubeId(link) {
  if (!link) return null;
  let url;
  try { url = new URL(link.trim()); } catch { return null; }
  const host = url.hostname.replace(/^www\./, '');
  let id = null;
  if (host === 'youtu.be') id = url.pathname.slice(1);
  else if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
    id = url.searchParams.get('v');
    if (!id) {
      const m = url.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/);
      id = m ? m[1] : null;
    }
  }
  return id && /^[\w-]{6,}$/.test(id) ? id : null;
}

// Public oEmbed lookup (no API key, CORS-enabled): { title, author_name, ... }
export async function fetchYouTubeInfo(id) {
  const watch = `https://www.youtube.com/watch?v=${id}`;
  const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`,
    { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`oEmbed ${res.status} for ${id}`);
  return res.json();
}

export const embedUrl = (id) => `https://www.youtube-nocookie.com/embed/${id}`;
export const thumbUrl = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// YouTube's IFrame Player API, loaded once on the first play click. It reports
// errors, which a plain iframe can't (e.g. the owner blocked embedding).
let apiPromise = null;
function loadYouTubeApi() {
  apiPromise ??= new Promise((resolve, reject) => {
    if (window.YT?.Player) { resolve(window.YT); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
    const script = el('script', '', { src: 'https://www.youtube.com/iframe_api' });
    script.onerror = () => { apiPromise = null; reject(new Error('YouTube player API failed to load')); };
    document.head.append(script);
  });
  return apiPromise;
}

const PLAY = `<svg viewBox="0 0 68 48" aria-hidden="true"><path d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.2.3 34 .3 34 .3S12.8.3 7.5 1.7a8.5 8.5 0 0 0-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.5 8.5 0 0 0 6 6c5.3 1.4 26.5 1.4 26.5 1.4s21.2 0 26.5-1.4a8.5 8.5 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" fill="currentColor"/><path d="M27 34.5 45 24 27 13.5z" fill="#fff"/></svg>`;

function blockedNotice(box, link) {
  const notice = el('div', 'embed__blocked');
  const p = el('p'); p.textContent = "this video can't play here.";
  const a = el('a', '', { href: link, target: '_blank', rel: 'noopener noreferrer' });
  a.textContent = 'watch on YouTube';
  a.append(Object.assign(el('span', 'sr-only'), { textContent: ' (opens in a new tab)' }));
  notice.append(p, a);
  box.replaceChildren(notice);
  return a;
}

function plainIframe(id, title) {
  return el('iframe', '', {
    src: `${embedUrl(id)}?autoplay=1`,
    title,
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    referrerpolicy: 'strict-origin-when-cross-origin',
    allowfullscreen: '',
  });
}

async function startPlayer(box, id, link, title) {
  const target = el('div');
  box.replaceChildren(target);
  try {
    const YT = await loadYouTubeApi();
    new YT.Player(target, {
      videoId: id,
      host: 'https://www.youtube-nocookie.com',
      playerVars: { autoplay: 1, playsinline: 1, rel: 0 },
      events: {
        onReady: (e) => { const f = e.target.getIframe(); f.title = title; f.focus(); },
        onError: () => blockedNotice(box, link).focus(),
      },
    });
  } catch (err) {
    console.warn(err);
    const frame = plainIframe(id, title);
    box.replaceChildren(frame);
    frame.focus();
  }
}

// Shows the thumbnail with a play button; the real player only loads on click,
// so a page full of videos stays light.
export function youtubeEmbed(link, title) {
  const id = youtubeId(link);
  const box = el('div', 'embed');
  if (!id) {
    box.classList.add('embed--empty');
    box.textContent = 'video coming soon';
    return box;
  }
  const facade = el('button', 'embed__facade', { type: 'button', 'aria-label': `play ${title}` });
  const img = el('img', '', { src: thumbUrl(id), alt: '', loading: 'lazy' });
  img.addEventListener('error', () => img.remove(), { once: true });
  facade.append(img);
  facade.insertAdjacentHTML('beforeend', PLAY);
  facade.addEventListener('click', () => startPlayer(box, id, link, title), { once: true });
  box.append(facade);
  return box;
}
