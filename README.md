# Majid Daliri's website

A small Jekyll site for GitHub Pages. The template uses plain HTML and CSS, with lightweight scripts for research demos, publication filters, and slides; there is no Node installation or JavaScript build step.

## Run locally

With Ruby and Bundler installed:

```sh
bundle install
bundle exec jekyll serve --config _config.yml,_config.dev.yml
```

Open <http://localhost:4000>. Restart the server after changing either configuration file.

To check the production build:

```sh
bundle exec jekyll build --strict_front_matter
```

## Editing the site

- `_pages/`: main pages, including the single CV page at `_pages/cv.html`.
- `_data/publications.yml`: publication titles, authors, venues, and resource links, grouped by year and preprint status. `_pages/articles.html` renders the Publications page from this data.
  Use the official conference or workshop record for `url`, with free versions under `links`. For unreleased papers, omit `url` and optionally set `venue_url` to the conference page. `link_label` can identify a project or workshop link.
  The All, Preprints, and year buttons filter the page in place. Without JavaScript, every publication remains visible.
- `_data/coauthors.yml`: verified professional profile links, keyed by the exact author names in the publication data (without equal-contribution asterisks). Names without a verified profile remain plain text. Full author order and contribution markers are preserved.
- `_talks/` and `_teaching/`: individual talks and courses.
- `_data/navigation.yml`: navigation links.
- `_config.yml`: site identity, profile links, and build settings.
- `_layouts/` and `_includes/`: the shared page templates.
- `assets/css/main.css`: all template styling, including mobile and print layouts.
- `cv.pdf`, `resources/`, and `images/profile.jpg`: the CV, presentation materials, and profile photo.
- `talk_map/`: the talk map; its location data lives in `talk_map/org-locations.js`.

Build output and installed dependencies are ignored by Git.

The front page and Publications share a compact “Research in action” section: TurboQuant, latent reasoning, math olympiads, graph search, data sketching, and KDEformer. `research_gallery: true` enables the gallery; `_data/research_demos.yml` controls its order, names, captions, and panel titles. Selecting an illustration opens one inline panel with the corresponding paper name. The gallery stays available while filtering publications by year. No animation or repeated sampling runs automatically. Without JavaScript, the icons link to their papers or publication section.

The demo modules live in `assets/js/research/` and share the controller in `assets/js/research-gallery.js`. Visualizations use small examples or explicitly sourced research facts:

- Quantization: a 2D rotation followed by uniform scalar rounding, with actual rounding error. TurboQuant uses random rotations and optimized high-dimensional quantizers.
- SVP/RL: a 2D recurrent model with one Gaussian coefficient draw per trajectory and fixed singular directions. A clearly labeled toy target defines binary rewards; the bars show centered rewards, not a trained model or a promised performance gain.
- Graph search: stepwise greedy traversal of a toy graph, with cached distance-check counts. This is a general illustration, not a reproduction of the unreleased graph-search paper or a worst-case guarantee.
- Math olympiads: CombiGraph-Vis data and its published training/evaluation split, a handcrafted proof-completeness puzzle, and a separately attributed IMO 2025 milestone. Sources: the [CombiGraph-Vis paper](https://openreview.net/pdf?id=x4HkrVVVTi) and [dataset card](https://huggingface.co/datasets/combviz/inoi#data-splits), [Brains vs. Bytes](https://openreview.net/forum?id=uXR2KsA4L9), [RefGrader](https://openreview.net/forum?id=otc9Hcn3hr), and [Google DeepMind’s announcement](https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/). The announcement credits coauthor Hamed Mahdavi among data/evaluation experts; it does not establish that these datasets or Majid produced the gold-level system. The interactive puzzle is a standard elementary theorem, not an IMO problem or an AI grader.
- Sketching: coordinated weighted threshold samples and an inverse-probability inner-product estimate. Independent randomness uses the matching joint-inclusion probability. A larger sample budget does not guarantee a better individual draw.
- Attention: exact softmax weights over 24 toy tokens, followed by sampling with replacement to estimate the weighted value. KDEformer uses KDE and importance sampling to avoid full exact attention; the demo itself makes no speedup claim.

## Updating the CV

The CV is temporarily disabled. To restore it, remove `published: false` from `_pages/cv.html`, uncomment the CV entry in `_data/navigation.yml`, and remove `cv.pdf` and `assets/cv` from `_config.yml`'s exclusions. The source PDF and previews remain in the repository.

Replace `cv.pdf`, then run `python3 scripts/update_cv_preview.py` before building. This needs Poppler (`brew install poppler` on macOS) and regenerates all page images in `assets/cv/` and their index in `_data/cv_preview.yml`. Commit those generated files with the PDF.

The CV page shows these previews without depending on a browser's PDF viewer. Its Open PDF and Download PDF links always use the original `cv.pdf`.

Originally forked from the [Minimal Mistakes Jekyll Theme](https://mmistakes.github.io/minimal-mistakes/), © 2016 Michael Rose. See [LICENSE](LICENSE).

## Updating talk materials

Keep original posters and slides in `resources/`. Run `python3 scripts/update_talk_previews.py` after replacing a document. This requires Poppler and Pillow (`python3 -m pip install Pillow`) and updates the optimized previews in `assets/talks/` and their index in `_data/talk_previews.json`. Commit the previews and index with the original document.

The TurboQuant poster uses the completed April 1, 2026 `TQ-poster.pdf` revision. The QJL poster uses the February 28, 2025 `qjl_poster_print.pdf` export for AAAI 2025 in Philadelphia. Both originals are preserved as `TurboQuant_Poster.pdf` and `QJL_Poster.pdf` in `resources/`.

The full QJL presentation is the 26-slide March 4, 2025 `qjl_presentation copy 2.pdf` export, preserved as `QJL_Presentation.pdf`. The six-slide February 18, 2025 `qjl_presentation_light.pdf` export is preserved as `QJL_Lightning_Talk.pdf` for the ICERM lightning talk. The [ICERM program](https://icerm.brown.edu/program/Hot%20Topics%20Workshop/htw-25-ftpga#schedule-item-8659) confirms February 20, 2025. NYU Theory Day is included at the owner's request with the full QJL deck; its date and exact deck version have not been independently confirmed. `undated: true` omits the date and lists that talk after dated entries. Remove it and set `date` when confirmed.

For a new talk, add its resource filename and kind (`poster` or `slides`) to `MATERIALS` in that script. Set the matching `material` key in the talk's front matter. The Talks page will show a thumbnail automatically. Slide pages include navigation controls and also work as a scrolling document when JavaScript is unavailable.

## Updating teaching

Each file in `_teaching/` provides the course `title`, `role`, `institution`, `course_code` (when available), `term`, and sorting `date`. Add `instructor`, `instructor_url`, and `course_url` when known. Use `course_link_label` for links to a university listing instead of a course website. The overview and individual pages share the same role and instructor details; keep longer descriptions in the page body.

The Spring 2023 [NYU schedule](https://cs.nyu.edu/dynamic/courses/schedule/?level=UA&semester=spring_2023) lists Majid's recitation for Vladimir Podolskii's section. Majid confirmed that his separate Section Leader role under Rachit Garg was in Spring 2026. Its January 1 date is used only for semester sorting, not as a confirmed course start date.
