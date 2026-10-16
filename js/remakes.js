import { loadCsv } from './csv.js';
import { el, youtubeEmbed } from './youtube.js';

const isAudio = (value) => /\.mp3$/i.test(value);

function column(labelText, content) {
  const col = el('div', 'remake__col');
  const label = el('h2', 'remake__label');
  label.textContent = labelText;
  col.append(label, content);
  return col;
}

function remakeMedia(value, originalTitle) {
  if (isAudio(value)) {
    const wrap = el('div', 'remake__audio');
    // bare filenames live in assets/audio/
    const src = value.includes('/') ? value : `assets/audio/${value}`;
    wrap.append(el('audio', '', { controls: '', preload: 'none', src, 'aria-label': `remake of ${originalTitle} (audio)` }));
    return wrap;
  }
  return youtubeEmbed(value, `remake of ${originalTitle} — YouTube video`);
}

function buildRemake(row) {
  const section = el('section', 'remake');
  section.setAttribute('aria-label', `remake of ${row.original_title}`);
  const original = column(`original: ${row.original_title}`,
    youtubeEmbed(row.original_youtube_link, `${row.original_title} (original) — YouTube video`));
  if (row.remake_date) {
    const date = el('p', 'remake__date');
    date.textContent = `remade ${row.remake_date}`;
    original.append(date);
  }
  section.append(original, column('remake', remakeMedia(row.remake_youtube_link, row.original_title)));
  return section;
}

async function main() {
  const list = document.getElementById('remakes');
  try {
    const rows = (await loadCsv('data/remakes.csv')).filter((r) => r.original_title);
    if (!rows.length) throw new Error('no rows in data/remakes.csv');
    list.querySelector('.status')?.remove();
    list.append(...rows.map(buildRemake));
  } catch (err) {
    console.error(err);
    const status = list.querySelector('.status');
    status.textContent = 'could not load remakes right now.';
    status.setAttribute('role', 'alert');
  }
}
main();
