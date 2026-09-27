// A toy attention row, not an implementation of KDEformer.
// p_i = softmax(5 <q, k_i>), with unit-circle query/key embeddings.
// Sample i ~ p with replacement, then average v_i: E[estimate] = sum_i p_i v_i.
// Computing p exactly here is for illustration; it provides no speedup.
export function mountKDEformer(root) {
  root.innerHTML = `
    <p class="research-demo__intro">Attention mixes token values according to their relevance to a query. Can a small sample recover that mixture?</p>
    <div class="research-demo__controls">
      <label>Query <select data-kde-query><option value="0.15">Left</option><option value="0.5" selected>Center</option><option value="0.85">Right</option></select></label>
      <label>Samples <select data-kde-budget><option value="4">4</option><option value="8" selected>8</option><option value="16">16</option><option value="32">32</option></select></label>
      <button type="button" data-kde-resample>New samples</button>
    </div>
    <svg class="research-demo__plot" viewBox="0 0 480 240" role="img" aria-label="An attention distribution and its sampled output" data-kde-plot></svg>
    <p class="research-demo__legend">Bar height = attention weight. Green bars = sampled tokens; dots count repeated draws.</p>
    <p class="research-demo__status" aria-live="polite" data-kde-status></p>
    <p class="research-demo__note">A toy example using exact attention weights and sampling with replacement. <a href="https://proceedings.mlr.press/v202/zandieh23a.html">KDEformer</a> uses kernel density estimation and importance sampling to approximate full attention efficiently. This illustrates the idea, not the full algorithm or its speed.</p>`;

  const query = root.querySelector('[data-kde-query]');
  const budget = root.querySelector('[data-kde-budget]');
  const plot = root.querySelector('[data-kde-plot]');
  const status = root.querySelector('[data-kde-status]');
  const values = Array.from({ length: 24 }, (_, i) => 0.15 + 0.7 * (0.5 + 0.5 * Math.sin(i * 1.13 + 0.4)));
  let draw = 1;

  function render() {
    const fraction = Number(query.value);
    const samples = Number(budget.value);
    const angle = -1.3 + 2.6 * fraction;
    const kernels = values.map((_, i) => Math.exp(5 * Math.cos(-1.3 + 2.6 * i / 23 - angle)));
    const total = kernels.reduce((sum, value) => sum + value, 0);
    const weights = kernels.map((value) => value / total);
    const exact = weights.reduce((sum, weight, i) => sum + weight * values[i], 0);
    const counts = values.map(() => 0);
    // A repeatable sample stream keeps the first draws fixed when the budget changes.
    let seed = (81799 + draw * 104729) >>> 0;
    for (let sample = 0; sample < samples; sample++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      let remaining = (seed + 0.5) / 4294967296;
      let index = 0;
      while (index < weights.length - 1 && remaining >= weights[index]) {
        remaining -= weights[index++];
      }
      counts[index]++;
    }
    const estimate = counts.reduce((sum, count, i) => sum + count * values[i], 0) / samples;
    const unique = counts.filter(Boolean).length;
    // Keep this scale fixed across queries; 0.125 is above every weight in this example.
    const bars = weights.map((weight, i) => {
      const x = 25 + i * 18.5;
      const height = 88 * weight / 0.125;
      const dots = Array.from({ length: counts[i] }, (_, j) => `<circle cx="${x + (j % 4 - 1.5) * 3.2}" cy="${143 + Math.floor(j / 4) * 3.4}" r="1.45" fill="#246653"/>`).join('');
      return `<rect x="${x - 5.5}" y="${(135 - height).toFixed(2)}" width="11" height="${height.toFixed(2)}" rx="2" fill="${counts[i] ? '#246653' : '#dedfd7'}"/>
        ${dots}`;
    }).join('');
    const qx = 25 + fraction * 23 * 18.5;
    const outputX = (value) => 130 + value * 270;
    const exactX = outputX(exact).toFixed(2);
    const estimateX = outputX(estimate).toFixed(2);

    plot.innerHTML = `
      <text x="16" y="20" class="demo-label" fill="#626f67">Attention over 24 tokens</text>
      <path d="M${qx - 4} 34h8l-4 7z" fill="#a87842"/>
      <text x="${qx + 8}" y="39" class="demo-label" fill="#a87842">query</text>
      <path d="M16 136H462" stroke="#dedfd7" fill="none"/>
      ${bars}
      <text x="16" y="178" class="demo-label" fill="#626f67">Mixed value</text>
      <path d="M130 195H400M130 220H400" stroke="#dedfd7" fill="none"/>
      <path d="M${exactX} 186V229" stroke="#8ca99a" stroke-dasharray="3 4" fill="none"/>
      <text x="16" y="199" class="demo-label" fill="#626f67">All tokens</text>
      <circle cx="${exactX}" cy="195" r="5" fill="#fff" stroke="#246653" stroke-width="2"/>
      <text x="424" y="199" class="demo-label" fill="#246653">${exact.toFixed(3)}</text>
      <text x="16" y="224" class="demo-label" fill="#626f67">Sampled</text>
      <circle cx="${estimateX}" cy="220" r="5" fill="#a87842"/>
      <text x="424" y="224" class="demo-label" fill="#a87842">${estimate.toFixed(3)}</text>
      <text x="130" y="239" class="demo-label" fill="#626f67" text-anchor="middle">0</text>
      <text x="400" y="239" class="demo-label" fill="#626f67" text-anchor="middle">1</text>`;
    status.textContent = `Full output: ${exact.toFixed(3)}. Sampled: ${estimate.toFixed(3)}. Error: ${Math.abs(estimate - exact).toFixed(3)}. ${samples} draws touched ${unique} of 24 tokens. More samples improve accuracy on average; individual estimates vary.`;
    plot.setAttribute('aria-label', `Attention weights for a ${query.options[query.selectedIndex].text.toLowerCase()} query over 24 tokens. ${unique} tokens were sampled. The full weighted output is ${exact.toFixed(3)}; the sampled estimate is ${estimate.toFixed(3)}. Both outputs share the same zero-to-one scale.`);
  }

  query.addEventListener('change', render);
  budget.addEventListener('change', render);
  root.querySelector('[data-kde-resample]').addEventListener('click', () => {
    draw++;
    render();
  });
  render();
}
