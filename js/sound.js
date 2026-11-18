// Sound button + volume slider on the about page: restarts the clip on every press.
const btn = document.querySelector('[data-sound]');
const slider = document.querySelector('[data-volume]');
const label = document.querySelector('[data-volume-label]');
if (btn) {
  const audio = new Audio(btn.dataset.sound);
  audio.preload = 'auto';
  const setVolume = () => {
    const pct = Number(slider?.value ?? 50);
    audio.volume = pct / 100;
    slider?.style.setProperty('--pct', `${pct}%`);
    if (label) label.textContent = `${pct}%`;
  };
  setVolume();
  slider?.addEventListener('input', setVolume);
  btn.addEventListener('click', () => {
    audio.currentTime = 0;
    audio.play().catch((err) => console.warn(err));
  });
}
