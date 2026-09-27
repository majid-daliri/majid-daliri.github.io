// Enhance the static slide pages; every page remains available without JavaScript.
document.querySelectorAll('[data-slide-viewer]').forEach((viewer) => {
  const slides = [...viewer.querySelectorAll('[data-slide]')];
  if (!slides.length) return;

  const previous = viewer.querySelector('[data-previous]');
  const next = viewer.querySelector('[data-next]');
  const select = viewer.querySelector('[data-slide-select]');
  const status = viewer.querySelector('[data-slide-status]');
  let current = 0;

  function showSlide(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    select.value = String(current);
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    status.textContent = `Slide ${current + 1} of ${slides.length}`;
  }

  previous.addEventListener('click', () => showSlide(current - 1));
  next.addEventListener('click', () => showSlide(current + 1));
  select.addEventListener('change', () => showSlide(Number(select.value)));
  viewer.addEventListener('keydown', (event) => {
    if (event.target.matches('select') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showSlide(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });

  viewer.querySelector('.slide-controls').hidden = false;
  showSlide(0);
});
