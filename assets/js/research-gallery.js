import { mountQuantization } from './research/quantization.js';
import { mountRL } from './research/rl.js';
import { mountOlympiad } from './research/olympiad.js';
import { mountGraphSearch } from './research/graph-search.js';
import { mountSampling } from './research/sampling.js';
import { mountKDEformer } from './research/kdeformer.js';

const demos = { quantize: mountQuantization, rl: mountRL, olympiad: mountOlympiad, search: mountGraphSearch, sketch: mountSampling, attention: mountKDEformer };

document.querySelectorAll('[data-research-gallery]').forEach((gallery) => {
  const panel = gallery.querySelector('[data-research-panel]');
  const content = gallery.querySelector('[data-research-content]');
  const title = gallery.querySelector('[data-research-title]:not([data-research-choice])');
  const paper = gallery.querySelector('[data-research-paper]');
  let selected = null;
  let cleanup;
  // Without JavaScript the illustrations remain ordinary paper links.
  const buttons = [...gallery.querySelectorAll('[data-research-choice]')].map((link) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = link.className;
    button.title = link.title;
    button.innerHTML = link.innerHTML;
    button.dataset.researchChoice = link.dataset.researchChoice;
    button.dataset.researchTitle = link.dataset.researchTitle;
    button.setAttribute('aria-label', link.getAttribute('aria-label'));
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', panel.id);
    link.replaceWith(button);
    return button;
  });

  function close() {
    const previous = selected;
    cleanup?.();
    cleanup = undefined;
    content.replaceChildren();
    panel.hidden = true;
    selected = null;
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-expanded', 'false');
    });
    previous?.focus();
  }

  buttons.forEach((button) => button.addEventListener('click', () => {
    if (selected === button) { close(); return; }
    cleanup?.();
    content.replaceChildren();
    selected = button;
    title.textContent = button.dataset.researchTitle;
    paper.textContent = button.title;
    panel.hidden = false;
    buttons.forEach((choice) => {
      choice.setAttribute('aria-pressed', String(choice === button));
      choice.setAttribute('aria-expanded', String(choice === button));
    });
    cleanup = demos[button.dataset.researchChoice](content);
  }));
  gallery.querySelector('[data-research-close]').addEventListener('click', close);
  gallery.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && selected) { event.preventDefault(); close(); }
  });
});
