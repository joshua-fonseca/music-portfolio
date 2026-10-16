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
  if (row.album_art) {
    art.append(el('img', '', { src: `assets/images/${row.album_art}`, alt: `Album art for ${row.song_name}` }));
  } else {
    art.append(el('span', 'songcard__placeholder'));
  }
  const title = el('h2', 'songcard__title');
  title.textContent = row.song_name;
  const stats = el('dl', 'stats');
  stats.append(stat('bpm', row.bpm), stat('length', row.length), stat('genre', row.genre));
  card.append(art, title, stats);

  article.append(card, youtubeEmbed(row.youtube_link, `${row.song_name} — YouTube video`));
  return article;
}

async function main() {
  const list = document.getElementById('originals');
  try {
    const rows = (await loadCsv('data/originals.csv')).filter((r) => r.song_name);
    list.querySelector('.status')?.remove();
    if (!rows.length) throw new Error('no songs in data/originals.csv');
    list.append(...rows.map(buildOriginal));
  } catch (err) {
    console.error(err);
    const status = list.querySelector('.status');
    status.textContent = 'could not load songs right now.';
    status.setAttribute('role', 'alert');
  }
}
main();
