// The dataset counts and split are published facts. The proof exercise is a
// handcrafted illustration of R(3,3) = 6, not a model run or benchmark result.
const green = '#246653';
const muted = '#626f67';
const border = '#dedfd7';
const gold = '#a87842';
const milestoneUrl = 'https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/';
const localEdges = [[1, 2], [1, 3], [2, 3]];

function text(x, y, content, size = 17, fill = muted, anchor = 'middle') {
  const fixedSize = size >= 25 ? ` style="font-size:${size}px"` : '';
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}"${fixedSize} fill="${fill}">${content}</text>`;
}

function arrow(x1, y1, x2, y2, color = green) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const backX = x2 - 7 * Math.cos(angle);
  const backY = y2 - 7 * Math.sin(angle);
  return `<path d="M${x1} ${y1}L${x2} ${y2}M${backX + 4 * Math.sin(angle)} ${backY - 4 * Math.cos(angle)}L${x2} ${y2}L${backX - 4 * Math.sin(angle)} ${backY + 4 * Math.cos(angle)}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
}

function dataArtwork() {
  return `<rect x="35" y="25" width="90" height="112" rx="5" fill="white" stroke="${border}" stroke-width="2" />
    <path d="M53 46H105M53 63H105M53 80H95M53 105H84M53 119H105" fill="none" stroke="${green}" stroke-width="3" stroke-linecap="round" />
    <path d="M195 100L235 33L282 96L240 125ZM195 100L282 96M235 33L240 125" fill="none" stroke="${border}" stroke-width="2" />
    ${[[195, 100], [235, 33], [282, 96], [240, 125]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="white" stroke="${green}" stroke-width="2" />`).join('')}
    <rect x="350" y="25" width="95" height="112" rx="5" fill="white" stroke="${border}" stroke-width="2" />
    <rect x="362" y="40" width="71" height="60" rx="3" fill="white" stroke="${green}" stroke-width="1.5" />
    <circle cx="415" cy="56" r="6" fill="${gold}" />
    <path d="M363 95L382 67L398 85L409 75L432 95M365 116H428" fill="none" stroke="${green}" stroke-width="2" stroke-linejoin="round" />
    ${text(80, 179, '1,135', 29, green)}${text(80, 207, 'problems')}
    ${text(240, 179, '13', 29, green)}${text(240, 207, 'domains')}
    ${text(398, 179, '406', 29, green)}${text(398, 207, 'with images')}`;
}

function splitArtwork() {
  return `<rect x="20" y="29" width="170" height="73" rx="5" fill="white" stroke="${border}" stroke-width="1.5" />
    ${text(105, 62, '908', 27, green)}${text(105, 88, 'train/development')}
    <rect x="287" y="29" width="173" height="73" rx="5" fill="white" stroke="${green}" stroke-width="1.5" />
    ${text(373, 71, 'Develop model', 18, green)}${arrow(203, 66, 274, 66)}
    <rect x="20" y="155" width="170" height="73" rx="5" fill="white" stroke="${border}" stroke-width="1.5" />
    ${text(105, 187, '227', 27, gold)}${text(105, 213, 'held-out evaluation')}
    <rect x="287" y="155" width="173" height="73" rx="5" fill="white" stroke="${gold}" stroke-width="1.5" />
    ${text(373, 198, 'Test reasoning', 18, gold)}${arrow(203, 192, 274, 192, gold)}
    ${arrow(325, 112, 325, 145, muted)}${text(343, 133, 'fixed model', 14, muted, 'start')}`;
}

function triangleFor(coloring) {
  const greenEdge = localEdges.find((_, index) => (coloring & (1 << index)) !== 0);
  return greenEdge ? { nodes: [0, ...greenEdge], color: green } : { nodes: [1, 2, 3], color: gold };
}

function proofArtwork(coloring, proofMode) {
  const points = [[64, 120], [234, 43], [399, 120], [234, 197], [57, 28], [57, 212]];
  const triangle = triangleFor(coloring);
  const highlighted = proofMode === 'complete' || coloring !== 0 ? triangle.nodes : [];
  const edges = [
    ...[1, 2, 3].map((index) => [0, index, green]),
    [0, 4, gold], [0, 5, gold],
    ...localEdges.map(([a, b], index) => [a, b, coloring & (1 << index) ? green : gold]),
  ];
  let markup = '';
  if (highlighted.length) {
    markup += `<polygon points="${highlighted.map((index) => points[index].join(',')).join(' ')}" fill="${triangle.color}" opacity="0.06" />`;
  }
  markup += edges.map(([a, b, color]) => {
    const active = highlighted.includes(a) && highlighted.includes(b);
    return `<line x1="${points[a][0]}" y1="${points[a][1]}" x2="${points[b][0]}" y2="${points[b][1]}" stroke="${color}" stroke-width="${active ? 4 : 1.6}" ${color === gold ? 'stroke-dasharray="5 4"' : ''} opacity="${active ? 1 : 0.6}" />`;
  }).join('');
  markup += points.map(([x, y], index) => `<circle cx="${x}" cy="${y}" r="13" fill="white" stroke="${highlighted.includes(index) ? triangle.color : border}" stroke-width="2" />${text(x, y + 5.5, String.fromCharCode(65 + index), 16, green)}`).join('');
  return markup + text(308, 235, `Coloring ${coloring + 1} of 8`, 14);
}

function milestoneArtwork() {
  return `<path d="M66 30L94 93L115 93L140 30L114 30L101 61L88 30Z" fill="white" stroke="${green}" stroke-width="2" stroke-linejoin="round" />
    <circle cx="102" cy="127" r="46" fill="white" stroke="${gold}" stroke-width="3" />
    <circle cx="102" cy="127" r="35" fill="white" stroke="${gold}" stroke-width="1" />
    <path d="M102 104L109 119L125 121L113 133L116 150L102 142L88 150L91 133L79 121L95 119Z" fill="${gold}" />
    ${text(316, 64, 'IMO 2025', 21, green)}
    ${text(316, 117, '35 / 42', 40, gold)}
    ${text(316, 150, 'gold-medal standard', 18, gold)}
    ${text(240, 207, 'Advanced Gemini Deep Think', 20, green)}
    ${text(240, 233, 'Google DeepMind', 16)}`;
}

export function mountOlympiad(root) {
  root.innerHTML = `
    <p class="research-demo__intro">Better mathematical reasoning starts with carefully curated problems and ends with proofs we can trust. Explore the data, the evaluation, and why both matter.</p>
    <div class="research-demo__controls olympiad-stages" role="group" aria-label="Mathematical reasoning story">
      <button type="button" data-olympiad-stage="data" aria-pressed="true">Curate data</button>
      <button type="button" data-olympiad-stage="split" aria-pressed="false">Train &amp; test</button>
      <button type="button" data-olympiad-stage="proof" aria-pressed="false">Check proofs</button>
      <button type="button" data-olympiad-stage="milestone" aria-pressed="false">Why it matters</button>
    </div>
    <p class="research-demo__intro" style="margin-top:16px" data-olympiad-problem hidden>Miniature proof puzzle: color every connection between six dots green or amber. Show that some triangle has all three connections the same color.</p>
    <div class="research-demo__controls" role="group" aria-label="Compare candidate proofs" data-olympiad-proof-controls hidden>
      <div><button type="button" data-olympiad-proof="missing" aria-pressed="true">Incomplete proof</button>
      <button type="button" data-olympiad-proof="complete" aria-pressed="false">Complete proof</button></div>
      <button type="button" data-olympiad-coloring>Change coloring</button>
    </div>
    <svg class="research-demo__plot" viewBox="0 0 480 240" role="img" data-olympiad-plot></svg>
    <p class="research-demo__legend" data-olympiad-legend></p>
    <p class="research-demo__status" aria-live="polite" data-olympiad-status></p>
    <p class="research-demo__note">Research: <a href="https://openreview.net/forum?id=uXR2KsA4L9">Brains vs. Bytes</a> · <a href="https://openreview.net/forum?id=x4HkrVVVTi">CombiGraph-Vis</a> · <a href="https://openreview.net/forum?id=otc9Hcn3hr">RefGrader</a>. <span data-olympiad-source></span></p>`;

  const plot = root.querySelector('[data-olympiad-plot]');
  const status = root.querySelector('[data-olympiad-status]');
  const legend = root.querySelector('[data-olympiad-legend]');
  const source = root.querySelector('[data-olympiad-source]');
  const problem = root.querySelector('[data-olympiad-problem]');
  const proofControls = root.querySelector('[data-olympiad-proof-controls]');
  const stageButtons = [...root.querySelectorAll('[data-olympiad-stage]')];
  const proofButtons = [...root.querySelectorAll('[data-olympiad-proof]')];
  let stage = 'data';
  let proofMode = 'missing';
  let coloring = 0;

  function render() {
    problem.hidden = stage !== 'proof';
    proofControls.hidden = stage !== 'proof';
    stageButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.olympiadStage === stage)));
    proofButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.olympiadProof === proofMode)));

    if (stage === 'data') {
      plot.innerHTML = dataArtwork();
      legend.textContent = 'Problems + diagrams + structured mathematical reasoning';
      status.textContent = 'CombiGraph-Vis curates 1,135 problems across 13 domains, including 406 problems with images. Careful data curation makes reasoning tasks usable for training and evaluation.';
      source.textContent = 'Dataset statistics from CombiGraph-Vis.';
    } else if (stage === 'split') {
      plot.innerHTML = splitArtwork();
      legend.textContent = 'Develop with one split. Evaluate on held-out problems.';
      status.textContent = 'The published CombiGraph-Vis split has 908 training/development problems and 227 evaluation problems. The diagram illustrates their separate roles, without simulating a training result.';
      source.innerHTML = '<a href="https://huggingface.co/datasets/combviz/inoi#data-splits">Official dataset split</a>.';
    } else if (stage === 'proof') {
      plot.innerHTML = proofArtwork(coloring, proofMode);
      legend.textContent = 'Solid: green · Dashed: amber · Only proof-relevant connections shown';
      const beginning = 'At least three of A’s five connections share a color; call it green. Here those neighbors are B, C, and D. ';
      if (proofMode === 'missing') {
        status.textContent = beginning + (coloring === 0
          ? 'Flawed step: “Two of B, C, D must have a green connection.” This coloring shows the gap: all three internal connections are amber.'
          : 'The incomplete argument finds a green triangle here. But assuming an internal green connection always exists leaves the all-amber case unproved. Cycle the colors to expose it.');
      } else {
        const triangle = triangleFor(coloring);
        const names = triangle.nodes.map((index) => String.fromCharCode(65 + index)).join(', ');
        status.textContent = beginning + (coloring === 0
          ? 'Complete case split: if no internal connection is green, B, C, D form an amber triangle. Otherwise, a green pair forms a green triangle with A. Both possibilities are covered.'
          : `A green internal connection makes the triangle ${names} green. If there were no green internal connection, B, C, D would instead form an amber triangle. Both possibilities are covered.`);
      }
      source.textContent = 'Interactive example of a standard Ramsey theorem, with handcrafted candidate proofs. The eight colorings concern only the three connections among B, C, and D.';
    } else {
      plot.innerHTML = milestoneArtwork();
      legend.textContent = 'A milestone in the wider field of mathematical AI';
      status.textContent = 'Google DeepMind’s advanced Gemini Deep Think reached 35/42 at IMO 2025, meeting the gold-medal standard. Its announcement credits my coauthor Hamed Mahdavi among the experts who provided data and evaluations.';
      source.innerHTML = `<a href="${milestoneUrl}">Google DeepMind’s announcement and acknowledgements</a>. This milestone provides context for the research above.`;
    }
    plot.setAttribute('aria-label', status.textContent);
  }

  function onClick(event) {
    const button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    if (button.hasAttribute('data-olympiad-stage')) stage = button.dataset.olympiadStage;
    else if (button.hasAttribute('data-olympiad-proof')) proofMode = button.dataset.olympiadProof;
    else if (button.hasAttribute('data-olympiad-coloring')) coloring = (coloring + 1) % 8;
    else return;
    render();
  }

  render();
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
