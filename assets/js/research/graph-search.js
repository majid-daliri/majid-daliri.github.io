// A generic greedy walk on a small, fixed graph, not an implementation of a paper.
const points = [
  [46, 164], [66, 89], [85, 211], [114, 138], [129, 50], [159, 190],
  [178, 102], [211, 45], [226, 154], [239, 213], [264, 96], [294, 45],
  [307, 185], [337, 123], [359, 72], [393, 209], [408, 148], [430, 50],
];
const edges = [
  [0, 1], [0, 2], [0, 3], [1, 4], [1, 3], [2, 5], [3, 5], [3, 6],
  [4, 6], [4, 7], [5, 8], [5, 9], [6, 7], [6, 8], [6, 10], [7, 10],
  [7, 11], [8, 9], [8, 10], [8, 12], [9, 12], [10, 11], [10, 13],
  [11, 14], [12, 13], [12, 15], [13, 14], [13, 16], [14, 17], [15, 16], [16, 17],
];
const queries = [[439, 117], [284, 220], [215, 76], [109, 197]];
const adjacent = points.map((_, index) => edges.flatMap(([a, b]) => (
  a === index ? [b] : b === index ? [a] : []
)));

function squaredDistance(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
}

export function mountGraphSearch(root) {
  root.innerHTML = `
    <p class="research-demo__intro">Find a nearby point by following the graph. Each step checks the current point’s neighbors and moves closer to the query.</p>
    <div class="research-demo__controls">
      <button type="button" data-graph-action="step">Take a step</button>
      <button type="button" data-graph-action="reset">Reset</button>
      <button type="button" data-graph-action="query">Another query</button>
    </div>
    <svg class="research-demo__plot" viewBox="0 0 480 240" role="img" data-graph-plot></svg>
    <p class="research-demo__legend">Diamond: query · Solid dot: current point · Filled dots: checked · Green line: route</p>
    <p class="research-demo__status" aria-live="polite" data-graph-status></p>
    <p class="research-demo__note">A toy greedy search, illustrating the research area. Its result depends on the graph; this is not a benchmark or a worst-case guarantee. <a href="/articles/#publications-2026">Related research</a></p>`;

  const plot = root.querySelector('[data-graph-plot]');
  const status = root.querySelector('[data-graph-status]');
  const stepButton = root.querySelector('[data-graph-action="step"]');
  let queryIndex = 0;
  let current;
  let path;
  let checked;
  let complete;
  let rounds;

  function reset() {
    current = 0;
    path = [current];
    // A distance is computed once per point and cached, including the entry point.
    checked = new Map([[current, squaredDistance(points[current], queries[queryIndex])]]);
    complete = false;
    rounds = 0;
  }

  function render() {
    const query = queries[queryIndex];
    const pathEdges = new Set(path.slice(1).map((node, i) => [path[i], node].sort((a, b) => a - b).join('-')));
    const edgeMarkup = edges.map(([a, b]) => {
      const active = pathEdges.has([a, b].sort((x, y) => x - y).join('-'));
      return `<line class="demo-edge${active ? ' demo-active' : ''}" x1="${points[a][0]}" y1="${points[a][1]}" x2="${points[b][0]}" y2="${points[b][1]}" stroke="${active ? '#246653' : '#dedfd7'}" stroke-width="${active ? 3 : 1.2}" />`;
    }).join('');
    const nodeMarkup = points.map(([x, y], index) => {
      const active = index === current;
      const seen = checked.has(index);
      return `${active ? `<circle cx="${x}" cy="${y}" r="12" fill="white" stroke="#246653" stroke-width="1.5" />` : ''}<circle class="demo-node${active ? ' demo-active' : ''}" cx="${x}" cy="${y}" r="${active ? 7 : 5}" fill="${active ? '#246653' : seen ? '#8ca99a' : 'white'}" stroke="${seen ? '#246653' : '#aeb9b1'}" stroke-width="1.5" />`;
    }).join('');
    const labelX = query[0] > 390 ? query[0] - 14 : query[0] + 14;
    const labelAnchor = query[0] > 390 ? 'end' : 'start';
    const queryMarkup = `<path class="demo-target" d="M${query[0]} ${query[1] - 7}l7 7-7 7-7-7Z" fill="#a87842" /><text class="demo-label" x="${labelX}" y="${query[1] - 11}" text-anchor="${labelAnchor}" font-size="15" fill="#626f67">query</text>`;
    const candidateLine = `<line x1="${points[current][0]}" y1="${points[current][1]}" x2="${query[0]}" y2="${query[1]}" stroke="#a87842" stroke-width="1" stroke-dasharray="4 4" opacity="0.7" />`;
    plot.innerHTML = candidateLine + edgeMarkup + nodeMarkup + queryMarkup;
    stepButton.disabled = complete;

    let message;
    if (complete) {
      // Exhaustive verification is only for explaining the toy result. Its work is
      // deliberately excluded from the greedy walk's cached distance-check count.
      const exactDistance = Math.min(...points.map((point) => squaredDistance(point, query)));
      const foundExact = checked.get(current) === exactDistance;
      message = foundExact
        ? 'No closer neighbor. This walk found the exact nearest point.'
        : 'No closer neighbor. The walk stopped short of the exact nearest point.';
    } else {
      message = rounds === 0 ? 'Start at the entry point.' : `Step ${rounds}: moved to a closer neighbor.`;
    }
    status.textContent = `${message} ${checked.size} of ${points.length} distances checked by the walk; a full scan checks all ${points.length}.`;
    plot.setAttribute('aria-label', `Query ${queryIndex + 1}. ${status.textContent} ${path.length - 1} graph edges traversed.`);
  }

  function step() {
    if (complete) return;
    let best = current;
    for (const neighbor of adjacent[current]) {
      if (!checked.has(neighbor)) {
        checked.set(neighbor, squaredDistance(points[neighbor], queries[queryIndex]));
      }
      if (checked.get(neighbor) < checked.get(best)) best = neighbor;
    }
    rounds++;
    if (best === current) complete = true;
    else {
      current = best;
      path.push(current);
    }
    render();
  }

  function onClick(event) {
    const button = event.target.closest('button[data-graph-action]');
    if (!button || !root.contains(button)) return;
    if (button.dataset.graphAction === 'step') step();
    else {
      if (button.dataset.graphAction === 'query') queryIndex = (queryIndex + 1) % queries.length;
      reset();
      render();
    }
  }

  reset();
  render();
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
