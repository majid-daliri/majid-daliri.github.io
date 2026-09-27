const GREEN = '#246653';
const MUTED = '#626f67';
const BORDER = '#dedfd7';
const OCHRE = '#a87842';
const TARGET = 0.70;

// One Gaussian draw per rollout, reused throughout its six latent steps.
function gaussianSampler(initialSeed = 42) {
  let seed = initialSeed;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return (seed + 0.5) / 4294967296;
  };
  return () => {
    const radius = Math.sqrt(-2 * Math.log(random()));
    const angle = 2 * Math.PI * random();
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  };
}

// h(t+1) = tanh(U diag(s * (1 + alpha * noise)) R^T h(t) + b).
// Both rotation matrices stay fixed: the perturbation changes only coefficients.
function trajectory(noise, alpha = 0.35) {
  const u = 0.35;
  const r = -0.45;
  const s1 = 1.12 * (1 + alpha * noise[0]);
  const s2 = 0.78 * (1 + alpha * noise[1]);
  let x = 0.12;
  let y = 0.6;
  const points = [x];
  for (let step = 0; step < 6; step++) {
    const a = s1 * (Math.cos(r) * x + Math.sin(r) * y);
    const b = s2 * (-Math.sin(r) * x + Math.cos(r) * y);
    x = Math.tanh(Math.cos(u) * a - Math.sin(u) * b + 0.2);
    y = Math.tanh(Math.sin(u) * a + Math.cos(u) * b - 0.1);
    points.push(x);
  }
  return points;
}

function rewardGroup(paths) {
  const rewards = paths.map((points) => Number(points[points.length - 1] >= TARGET));
  const successes = rewards.reduce((sum, reward) => sum + reward, 0);
  const mean = successes / rewards.length;
  return { rewards, successes, mean, advantages: rewards.map((reward) => reward - mean) };
}

export function mountRL(root) {
  root.innerHTML = `
    <p class="research-demo__intro"><strong>Explore, compare, learn.</strong> Different latent paths can lead to different outcomes. RL uses their relative rewards to guide a weight update.</p>
    <div class="research-demo__controls" role="group" aria-label="Compare latent exploration">
      <button type="button" data-rl-mode="fixed" aria-pressed="false">Fixed weights</button>
      <button type="button" data-rl-mode="svp" aria-pressed="true">SVP exploration</button>
      <button type="button" data-rl-draw>New draws <span aria-hidden="true">↻</span></button>
    </div>
    <svg class="research-demo__plot" data-rl-plot viewBox="0 0 480 240" width="480" height="240" role="img" aria-label="Six toy latent paths, their outcomes, and relative learning signals"></svg>
    <p class="research-demo__legend"><span>✓ Success: reward 1</span> <span>× Failure: reward 0</span> <span>Learning signal: reward − group average</span> <span>Dashed path: clean weights</span></p>
    <p class="research-demo__status" data-rl-status aria-live="polite"></p>
    <p class="research-demo__note">Toy success means a final coordinate ≥ 0.70. This 2D recurrence illustrates exploration, not measured LLM behavior. Each path keeps one weight draw in fixed singular directions. SVP-V trains the attention Value weights; the paper evaluates without perturbations. <a href="https://jihwan1205.github.io/Singular-Value-Perturbation/#rl" target="_blank" rel="noopener">Read the method</a>.</p>
  `;

  const plot = root.querySelector('[data-rl-plot]');
  const status = root.querySelector('[data-rl-status]');
  const buttons = [...root.querySelectorAll('[data-rl-mode]')];
  const drawButton = root.querySelector('[data-rl-draw]');
  const nextGaussian = gaussianSampler();
  const baseline = trajectory([0, 0], 0);
  let draws = Array.from({ length: 6 }, nextGaussian);
  let mode = 'svp';
  let drawNumber = 1;

  function render() {
    const candidates = draws.map((noise) => trajectory(noise));
    const paths = mode === 'svp' ? candidates : candidates.map(() => baseline);
    const group = rewardGroup(paths);
    // Both modes retain exactly the same coordinate scale for the current draws.
    const values = [baseline, ...candidates].flat();
    const low = Math.min(...values) - 0.10;
    const high = Math.max(TARGET, ...values) + 0.10;
    const yPosition = (value) => 205 - 167 * (value - low) / (high - low);
    const pathData = (points) => points.map((value, step) => `${step ? 'L' : 'M'}${20 + 44 * step} ${yPosition(value).toFixed(2)}`).join('');
    const ordered = paths.map((points, index) => ({ points, index }))
      .sort((a, b) => b.points[6] - a.points[6]);
    const targetY = yPosition(TARGET);
    let drawing = `
      <text x="20" y="20" font-size="14" fill="${MUTED}">Latent paths</text>
      <text x="334" y="20" text-anchor="middle" font-size="14" fill="${MUTED}">Outcome</text>
      <text x="419" y="20" text-anchor="middle" font-size="14" fill="${MUTED}">Signal</text>
      <rect x="20" y="30" width="264" height="${Math.max(0, targetY - 30).toFixed(2)}" fill="${GREEN}" opacity="0.05" />
      <path d="M20 ${targetY.toFixed(2)}H284" fill="none" stroke="${GREEN}" stroke-width="1" stroke-dasharray="3 5" opacity="0.40" />
      <path d="M304 31V213M419 31V213" fill="none" stroke="${BORDER}" stroke-width="1" />
      <path d="${pathData(baseline)}" fill="none" stroke="${MUTED}" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6" />
    `;
    ordered.forEach(({ points, index }, row) => {
      const outcomeY = 43 + row * 32;
      const endY = yPosition(points[6]);
      const correct = group.rewards[index] === 1;
      const color = correct ? GREEN : OCHRE;
      const advantage = group.advantages[index];
      const endX = 419 + advantage * 47;
      drawing += `
        <path d="${pathData(points)}" fill="none" stroke="${color}" stroke-width="1.8" opacity="${mode === 'svp' ? '0.75' : '0.45'}" />
        <path d="M284 ${endY.toFixed(2)}L298 ${endY.toFixed(2)}L317 ${outcomeY}H326" fill="none" stroke="${BORDER}" stroke-width="1" />
        <circle cx="284" cy="${endY.toFixed(2)}" r="2.5" fill="${color}" />
        <circle cx="334" cy="${outcomeY}" r="7" fill="${correct ? GREEN : 'white'}" stroke="${color}" stroke-width="1.5" />
        ${correct
          ? `<path d="M330 ${outcomeY}l3 3 5-6" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />`
          : `<path d="M331 ${outcomeY - 3}l6 6m0-6l-6 6" fill="none" stroke="${OCHRE}" stroke-width="1.5" stroke-linecap="round" />`}
        ${advantage === 0
          ? `<circle cx="419" cy="${outcomeY}" r="2.5" fill="${MUTED}" />`
          : `<path d="M419 ${outcomeY}H${endX.toFixed(2)}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" />`}
      `;
    });
    drawing += `
      <circle cx="20" cy="${yPosition(baseline[0]).toFixed(2)}" r="3.5" fill="${GREEN}" />
      <text x="20" y="232" font-size="14" fill="${MUTED}">Same input</text>
      <text x="284" y="232" font-size="14" text-anchor="end" fill="${MUTED}">6 latent steps</text>
      <text x="381" y="232" font-size="14" text-anchor="middle" fill="${MUTED}">−</text>
      <text x="419" y="232" font-size="14" text-anchor="middle" fill="${MUTED}">0</text>
      <text x="457" y="232" font-size="14" text-anchor="middle" fill="${MUTED}">+</text>
    `;
    plot.innerHTML = drawing;
    const mixed = group.successes > 0 && group.successes < paths.length;
    const meanLabel = Number(group.mean.toFixed(2));
    status.textContent = mode === 'fixed'
      ? 'In this toy, fixed weights repeat one path: 0 of 6 successes, so every relative reward signal is zero.'
      : `Draw ${drawNumber}: ${group.successes} of 6 toy successes; average reward ${meanLabel}. ${mixed ? 'Successful outcomes get positive learning signals; the others get negative signals.' : 'Every reward matches, so this group has no relative reward signal.'}`;
    plot.setAttribute('aria-label', `${mode === 'svp' ? 'Six perturbed' : 'Six identical'} toy latent trajectories. ${group.successes} succeed by ending at or above coordinate 0.70. Bars show each reward minus the group average of ${meanLabel}${mixed ? ', positive for successes and negative for failures' : ', all zero'}.`);
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.rlMode === mode)));
    drawButton.disabled = mode === 'fixed';
  }

  function selectMode(event) {
    mode = event.currentTarget.dataset.rlMode;
    render();
  }
  function resample() {
    draws = Array.from({ length: 6 }, nextGaussian);
    drawNumber++;
    render();
  }
  buttons.forEach((button) => button.addEventListener('click', selectMode));
  drawButton.addEventListener('click', resample);
  render();
  return () => {
    buttons.forEach((button) => button.removeEventListener('click', selectMode));
    drawButton.removeEventListener('click', resample);
  };
}
