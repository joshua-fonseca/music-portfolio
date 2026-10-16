// Shared page chrome: navbar, footer, contact popup, "not implemented" popup.
const PAGE = document.body.dataset.page;

const LINKS = {
  apple: 'https://music.apple.com/kh/artist/kkura/1866697057',
  ytm: 'https://music.youtube.com/channel/UCB5h9HWq8Eqe_je_BqlwmBg',
  spotify: 'https://open.spotify.com/artist/2cuFqV91fw2pcqE7h6fljM',
  github: 'https://github.com/joshua-fonseca',
};
const EMAIL = 'jfonse01@uoguelph.ca';

const SUN = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><circle cx="12" cy="12" r="4.5"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></g></svg>`;
const BURGER = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 6h14M5 12h10M5 18h14"/></svg>`;
const CLOSE = `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 2l12 12M14 2L2 14"/></svg>`;
const ORNAMENT = `<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0l5 5-5 5-5-5z" fill="currentColor"/></svg>`;
const ORNAMENT_OPEN = `<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 .8L9.2 5 5 9.2.8 5z" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
const NEW_TAB = `<span class="sr-only"> (opens in a new tab)</span>`;

const current = (name) => (PAGE === name ? ' aria-current="page"' : '');

function headerHTML() {
  const home = PAGE === 'home' ? '' : `
    <nav class="nav-home" aria-label="Home">
      <div class="plate plate--left"><div class="plate__face">
        <a class="nav-link" href="index.html">home</a>
      </div></div>
    </nav>`;
  return `
  <header class="site-header ${PAGE === 'home' ? 'site-header--home-only' : ''}">
    ${home}
    <div class="nav-right">
      <nav class="nav-desktop" aria-label="Primary">
        <div class="plate"><div class="plate__face">
          <ul class="nav-list">
            <li><a class="nav-link" href="originals.html"${current('originals')}>originals</a></li>
            <li><a class="nav-link" href="remakes.html"${current('remakes')}>remakes</a></li>
            <li><button type="button" class="nav-link" data-theme-toggle aria-haspopup="dialog" aria-label="Switch to dark mode">${SUN}</button></li>
          </ul>
        </div></div>
      </nav>
      <nav class="nav-mobile" aria-label="Primary">
        <button type="button" class="menu-btn" aria-expanded="false" aria-controls="mobile-menu">
          <span class="plate"><span class="plate__face">${BURGER}<span>menu</span></span></span>
        </button>
        <ul class="menu-list" id="mobile-menu" data-open="false">
          <li><a class="plate" href="originals.html"${current('originals')}><span class="plate__face">originals</span></a></li>
          <li><a class="plate" href="remakes.html"${current('remakes')}><span class="plate__face">remakes</span></a></li>
          <li><button type="button" class="plate" data-theme-toggle aria-haspopup="dialog"><span class="plate__face">dark mode</span></button></li>
        </ul>
      </nav>
    </div>
  </header>`;
}

function footerHTML() {
  const badge = (cls, href, name) => `
    <li><a class="badge badge--${cls}" href="${href}" target="_blank" rel="noopener noreferrer">
      <span class="badge__pre">Listen on</span><span class="badge__name">${name}</span>${NEW_TAB}
    </a></li>`;
  return `
  <footer class="site-footer">
    <div class="streaming">
      <ul class="streaming__list">
        ${badge('apple', LINKS.apple, 'Apple Music')}
        ${badge('ytm', LINKS.ytm, 'YouTube Music')}
        ${badge('spotify', LINKS.spotify, 'Spotify')}
      </ul>
    </div>
    <div class="legal">
      <p>© <span data-year>2026</span> kkura</p>
      <p class="legal__links">
        <button type="button" class="linklike" data-open-contact aria-haspopup="dialog">contact</button>
        <span aria-hidden="true">|</span>
        <a href="${LINKS.github}" target="_blank" rel="noopener noreferrer">github${NEW_TAB}</a>
      </p>
    </div>
  </footer>`;
}

function dialogHTML(id, inner) {
  return `
  <dialog class="popup" id="${id}" aria-labelledby="${id}-title">
    <button type="button" class="popup__close" aria-label="Close" data-close>${CLOSE}</button>
    <div class="popup__inner">${inner}
      <div class="ornament" aria-hidden="true" style="color:var(--accent-pink)">${ORNAMENT}<span style="color:var(--accent-violet)">${ORNAMENT_OPEN}</span>${ORNAMENT}</div>
    </div>
  </dialog>`;
}

function mount() {
  const main = document.querySelector('main');
  main.id = 'main';
  document.body.insertAdjacentHTML('afterbegin',
    `<a class="skip-link" href="#main">skip to content</a>${headerHTML()}`);
  document.body.insertAdjacentHTML('beforeend', footerHTML()
    + dialogHTML('contact-dialog', `
      <h2 id="contact-dialog-title">Questions, Support &amp; Press</h2>
      <a href="mailto:${EMAIL}">${EMAIL}</a>`)
    + dialogHTML('theme-dialog', `
      <h2 id="theme-dialog-title">dark mode</h2>
      <p>not implemented yet. check back later.</p>`));
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
}

// ----- popups: showModal() dims the page, traps focus and closes on Esc;
// we add backdrop-click close and return focus to whatever opened it.
function wireDialog(dialog, getTrigger) {
  let trigger = null;
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
  });
  dialog.addEventListener('close', () => { (getTrigger?.() ?? trigger)?.focus(); trigger = null; });
  return (opener) => { trigger = opener; dialog.showModal(); };
}

function wireMenu() {
  const btn = document.querySelector('.menu-btn');
  const list = document.getElementById('mobile-menu');
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    list.dataset.open = String(open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-mobile')) set(false);
  });
  return set;
}

mount();
const closeMenu = wireMenu();
const openContact = wireDialog(document.getElementById('contact-dialog'));
const themeDialog = document.getElementById('theme-dialog');
let themeTrigger = null;
const openTheme = wireDialog(themeDialog, () => themeTrigger);

document.querySelector('[data-open-contact]').addEventListener('click', (e) => openContact(e.currentTarget));

// Dark mode is a stub for now: show a notice, leave the light theme alone.
document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const inMenu = btn.closest('.menu-list');
    if (inMenu) closeMenu(false);
    themeTrigger = inMenu ? document.querySelector('.menu-btn') : btn;
    openTheme(themeTrigger);
  });
});
