// Weighted threshold sampling and its inverse-probability estimator, following
// Algorithms 1 and 2 of https://arxiv.org/html/2309.16157v4 (Section 2).
const vectorA = [0, 1, 4, 0, 2, 3, 0, 1, 4, 2, 0, 3];
const vectorB = [2, 0, 3, 1, 2, 0, 3, 2, 4, 0, 1, 3];

function probabilities(vector, budget) {
  const normSquared = vector.reduce((sum, value) => sum + value * value, 0);
  return vector.map((value) => Math.min(1, budget * value * value / normSquared));
}

function sketchPair(budget, mode, drawsA, drawsB) {
  const pA = probabilities(vectorA, budget);
  const pB = probabilities(vectorB, budget);
  const retainedA = pA.map((p, i) => drawsA[i] < p);
  const retainedB = pB.map((p, i) => (mode === 'shared' ? drawsA[i] : drawsB[i]) < p);
  const matches = retainedA.map((retained, i) => retained && retainedB[i]);
  const estimate = matches.reduce((sum, match, i) => {
    if (!match) return sum;
    const jointProbability = mode === 'shared' ? Math.min(pA[i], pB[i]) : pA[i] * pB[i];
    return sum + vectorA[i] * vectorB[i] / jointProbability;
  }, 0);
  return { retainedA, retainedB, matches, estimate };
}

export function mountSampling(root) {
  root.innerHTML = `
    <p class="research-demo__intro">Keep a small sample of each vector. Shared randomness helps the sketches keep matching coordinates, so they can estimate a dot product together.</p>
    <div class="research-demo__controls">
      <button type="button" data-sampling-mode="shared" aria-pressed="true">Shared</button>
      <button type="button" data-sampling-mode="independent" aria-pressed="false">Independent</button>
      <label>Budget <select data-sampling-budget aria-label="Expected sample budget per vector">
        <option value="2">2</option><option value="4" selected>4</option><option value="6">6</option><option value="8">8</option>
      </select></label>
      <button type="button" data-sampling-draw>New draw</button>
    </div>
    <svg class="research-demo__plot" viewBox="0 0 480 240" role="img" data-sampling-plot></svg>
    <p class="research-demo__legend">Filled: kept · Hollow: skipped · Linked: kept in both</p>
    <p class="research-demo__status" aria-live="polite" data-sampling-status></p>
    <p class="research-demo__note">Weighted threshold sampling on toy vectors. The budget bounds the expected count per vector; actual counts and estimates vary. <a href="https://arxiv.org/abs/2309.16157">Sampling Methods for Inner Product Sketching</a></p>`;

  const plot = root.querySelector('[data-sampling-plot]');
  const status = root.querySelector('[data-sampling-status]');
  const budgetSelect = root.querySelector('[data-sampling-budget]');
  const buttons = [...root.querySelectorAll('[data-sampling-mode]')];
  const exact = vectorA.reduce((sum, value, i) => sum + value * vectorB[i], 0);
  let mode = 'shared';
  let seed = 42;
  let drawNumber = 0;
  let drawsA;
  let drawsB;

  function random() {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return (seed + 0.5) / 4294967296;
  }

  function draw() {
    drawsA = vectorA.map(random);
    drawsB = vectorB.map(random);
    drawNumber++;
  }

  function render() {
    const budget = Number(budgetSelect.value);
    const { retainedA, retainedB, matches, estimate } = sketchPair(budget, mode, drawsA, drawsB);
    const xAt = (index) => 62 + index * 34;
    const height = (value) => value * 13.5;
    let markup = `<text class="demo-label" x="17" y="81" font-size="19" fill="#246653">A</text><text class="demo-label" x="17" y="181" font-size="19" fill="#246653">B</text>`;
    markup += `<path class="demo-axis" d="M49 101H453M49 201H453" fill="none" stroke="#dedfd7" />`;
    matches.forEach((match, index) => {
      if (match) markup += `<line class="demo-edge demo-active" x1="${xAt(index)}" y1="106" x2="${xAt(index)}" y2="${195 - height(vectorB[index])}" stroke="#246653" stroke-width="2" stroke-dasharray="3 4" />`;
    });
    [vectorA, vectorB].forEach((vector, row) => {
      const retained = row === 0 ? retainedA : retainedB;
      const baseline = row === 0 ? 100 : 200;
      vector.forEach((value, index) => {
        const x = xAt(index);
        if (value === 0) {
          markup += `<line x1="${x - 5}" y1="${baseline - 1}" x2="${x + 5}" y2="${baseline - 1}" stroke="#aeb9b1" stroke-width="2" />`;
          return;
        }
        const kept = retained[index];
        markup += `<rect class="demo-node${kept ? ' demo-active' : ''}" x="${x - 10}" y="${baseline - height(value)}" width="20" height="${height(value)}" rx="2" fill="${kept ? '#246653' : 'white'}" stroke="${kept ? '#246653' : '#bdc8c0'}" stroke-width="1.5" />`;
      });
    });
    markup += `<text class="demo-label" x="240" y="230" text-anchor="middle" font-size="14" fill="#626f67">12 shared coordinates · bar height = value</text>`;
    plot.innerHTML = markup;
    const countA = retainedA.filter(Boolean).length;
    const countB = retainedB.filter(Boolean).length;
    const countMatches = matches.filter(Boolean).length;
    status.textContent = `Draw ${drawNumber}: kept ${countA} in A and ${countB} in B, with ${countMatches} matching ${countMatches === 1 ? 'coordinate' : 'coordinates'}. Reweighted estimate: ${estimate.toFixed(1)}. Exact dot product: ${exact}.`;
    plot.setAttribute('aria-label', `${mode === 'shared' ? 'Shared' : 'Independent'} weighted sampling. ${status.textContent}`);
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.samplingMode === mode)));
  }

  function onClick(event) {
    const button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    if (button.hasAttribute('data-sampling-mode')) mode = button.dataset.samplingMode;
    else if (button.hasAttribute('data-sampling-draw')) draw();
    else return;
    render();
  }

  function onChange(event) {
    if (event.target === budgetSelect) render();
  }

  draw();
  render();
  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  return () => {
    root.removeEventListener('click', onClick);
    root.removeEventListener('change', onChange);
  };
}
