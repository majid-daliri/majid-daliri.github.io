// A small 2D rotation + uniform scalar quantizer, not the full TurboQuant method.
export function mountQuantization(root) {
  const points = [[-.82,-.2],[-.65,.06],[-.51,-.34],[-.4,.4],[-.25,-.12],[-.12,.62],[.04,.2],[.15,-.5],[.28,.43],[.4,-.18],[.55,.17],[.69,.43],[.78,-.28],[.29,.76],[-.46,-.63],[-.16,-.7]];
  let stage = 'input';
  root.innerHTML = `
    <p class="research-demo__intro">Rotate a cloud of vectors, then store each coordinate using just a few bits.</p>
    <div class="research-demo__controls">
      <div role="group" aria-label="Quantization steps">
        <button type="button" data-quant-stage="input" aria-pressed="true">Input</button>
        <button type="button" data-quant-stage="rotate" aria-pressed="false">Rotate</button>
        <button type="button" data-quant-stage="quantize" aria-pressed="false">Quantize</button>
      </div>
      <label>Precision <select data-quant-bits aria-label="Bits per coordinate"><option value="1">1 bit</option><option value="2">2 bits</option><option value="3" selected>3 bits</option><option value="4">4 bits</option></select></label>
    </div>
    <svg class="research-demo__plot" viewBox="0 0 480 240" role="img" data-quant-plot></svg>
    <p class="research-demo__status" aria-live="polite" data-quant-status></p>
    <p class="research-demo__note">A 2D illustration with uniform levels. <a href="https://arxiv.org/abs/2504.19874" target="_blank" rel="noopener">TurboQuant</a> uses random rotations and optimized quantizers in high dimensions.</p>`;
  const plot = root.querySelector('[data-quant-plot]');
  const select = root.querySelector('[data-quant-bits]');
  const buttons = [...root.querySelectorAll('[data-quant-stage]')];
  const cos = Math.cos(Math.PI / 5), sin = Math.sin(Math.PI / 5);
  const px = (x) => 240 + 92 * x;
  const py = (y) => 120 - 92 * y;

  function render() {
    const levels = 2 ** Number(select.value);
    const step = 2 / levels;
    const round = (value) => -1 + (Math.min(levels - 1, Math.max(0, Math.floor((value + 1) / step))) + .5) * step;
    const quantized = stage === 'quantize';
    let svg = '<path d="M140 120H340M240 20V220" stroke="#dedfd7" fill="none"/>';
    if (quantized) {
      for (let i = 0; i < levels; i++) {
        const level = -1 + (i + .5) * step;
        svg += `<path d="M${px(level)} 28V212M148 ${py(level)}H332" stroke="#dedfd7" stroke-width=".6"/>`;
      }
    }
    let error = 0;
    points.forEach(([x, y]) => {
      const rx = stage === 'input' ? x : cos * x - sin * y;
      const ry = stage === 'input' ? y : sin * x + cos * y;
      const qx = quantized ? round(rx) : rx, qy = quantized ? round(ry) : ry;
      if (quantized) svg += `<path d="M${px(rx)} ${py(ry)}L${px(qx)} ${py(qy)}" stroke="#8ca99a"/><circle cx="${px(rx)}" cy="${py(ry)}" r="3.8" fill="white" stroke="#8ca99a"/>`;
      svg += `<circle cx="${px(qx)}" cy="${py(qy)}" r="4" fill="#246653"/>`;
      error += (qx - rx) ** 2 + (qy - ry) ** 2;
    });
    plot.innerHTML = svg;
    const text = stage === 'input' ? '16 original vectors. Each point has two coordinates.'
      : stage === 'rotate' ? 'Same distances, different axes. Rotation has not lost any information.'
      : `${levels} levels per coordinate. Mean squared displacement: ${(error / points.length).toFixed(4)}. Hollow dots show the values before rounding.`;
    plot.setAttribute('aria-label', text);
    root.querySelector('[data-quant-status]').textContent = text;
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.quantStage === stage)));
  }
  buttons.forEach((button) => button.addEventListener('click', () => { stage = button.dataset.quantStage; render(); }));
  select.addEventListener('change', () => { stage = 'quantize'; render(); });
  render();
}
