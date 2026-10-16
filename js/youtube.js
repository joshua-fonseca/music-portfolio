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

export const embedUrl = (id) => `https://www.youtube-nocookie.com/embed/${id}`;
export const thumbUrl = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

export function youtubeEmbed(link, title) {
  const id = youtubeId(link);
  const box = el('div', 'embed');
  if (!id) {
    box.classList.add('embed--empty');
    box.textContent = 'video coming soon';
    return box;
  }
  box.append(el('iframe', '', {
    src: embedUrl(id),
    title,
    loading: 'lazy',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    referrerpolicy: 'strict-origin-when-cross-origin',
    allowfullscreen: '',
  }));
  return box;
}
