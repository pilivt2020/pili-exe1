/* PILI.EXE — original laser click sound; can be muted.
   No audio plays on page load; AudioContext is initialized only upon direct user interaction. */
(() => {
  const toggle = document.getElementById('laser-toggle');
  if (!toggle) return;
  let enabled = true, audio = null, last = 0;
  const update = () => {
    toggle.textContent = enabled ? '♫ EFECTOS ON' : '♫ EFECTOS OFF';
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.title = enabled ? 'Silenciar sonido de clics' : 'Activar sonido de clics';
  };
  const sound = () => {
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const now = performance.now();
    if (now - last < 65) return;
    last = now;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      if (!audio) audio = new Audio();
      if (audio.state === 'suspended') audio.resume();
      const t = audio.currentTime, osc = audio.createOscillator(), gain = audio.createGain();
      const filter = audio.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1180, t);
      osc.frequency.exponentialRampToValueAtTime(230, t + .14);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, t);
      filter.frequency.exponentialRampToValueAtTime(450, t + .14);
      gain.gain.setValueAtTime(.0001, t);
      gain.gain.exponentialRampToValueAtTime(.035, t + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, t + .155);
      osc.connect(filter);filter.connect(gain);gain.connect(audio.destination);
      osc.start(t);osc.stop(t + .16);
      osc.onended = () => {osc.disconnect();filter.disconnect();gain.disconnect();};
    } catch (_) {}
  };
  toggle.addEventListener('click', (e) => { e.stopPropagation(); enabled = !enabled; update(); if (enabled) sound(); });
  document.addEventListener('click', e => {
    if (!e.isTrusted || e.target.closest('#laser-toggle')) return;
    // Do not beep when changing music volume or within the game rapid-click button.
    if (e.target.closest('input[type="range"], #click-target, .pili-wow')) return;
    sound();
  }, {passive:true});
  update();
})();
