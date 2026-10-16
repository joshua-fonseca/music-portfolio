import { loadCsv } from './csv.js';
import { el, youtubeEmbed } from './youtube.js';

function stat(label, value) {
  const wrap = el('div');
  const dt = el('dt'); dt.textContent = label;
  const dd = el('dd'); dd.textContent = value || '—';
  wrap.append(dt, dd);
  return wrap;
}

function buildOriginal(row) {
  const article = el('article', 'original');
  article.setAttribute('aria-label', row.song_name);

  const card = el('div', 'songcard songcard--original');
  const art = el('div', 'songcard__art');
  const placeholder = () => {
    const span = el('span', 'songcard__placeholder');
    span.textContent = 'no album art';
    return span;
  };
  if (row.album_art) {
    const img = el('img', '', { src: `assets/images/${row.album_art}`, alt: `Album art for ${row.song_name}` });
    img.addEventListener('error', () => img.replaceWith(placeholder()), { once: true });
    art.append(img);
  } else {
    art.append(placeholder());
  }
  const title = el('h3', 'songcard__title');
  title.textContent = row.song_name;
  const stats = el('dl', 'stats');
  stats.append(stat('bpm', row.bpm), stat('length', row.length), stat('genre', row.genre));
  card.append(art, title, stats);

  article.append(card, youtubeEmbed(row.youtube_link, `${row.song_name} — YouTube video`));
  return article;
}

function buildGroup(heading, rows) {
  const section = el('section', 'originals-group');
  const h2 = el('h2', 'group-title');
  h2.append(Object.assign(el('span', '', { 'aria-hidden': 'true' }), { textContent: '>>> ' }), heading);
  const list = el('div', 'originals');
  list.append(...rows.map(buildOriginal));
  section.append(h2, list);
  return section;
}

async function main() {
  const list = document.getElementById('originals');
  try {
    const rows = (await loadCsv('data/originals.csv')).filter((r) => r.song_name);
    if (!rows.length) throw new Error('no songs in data/originals.csv');
    list.querySelector('.status')?.remove();
    // done = "n" means abandoned; "y" (or blank) means complete
    const abandoned = (r) => (r.done || '').trim().toLowerCase() === 'n';
    const groups = [['complete', rows.filter((r) => !abandoned(r))], ['abandoned', rows.filter(abandoned)]];
    for (const [heading, songs] of groups) {
      if (songs.length) list.append(buildGroup(heading, songs));
    }
  } catch (err) {
    console.error(err);
    const status = list.querySelector('.status');
    status.textContent = 'could not load songs right now.';
    status.setAttribute('role', 'alert');
  }
}
main();
