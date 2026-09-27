#!/usr/bin/env python3
"""Create lightweight talk previews without changing the original documents.

Requires Poppler (pdftoppm) and Pillow. Run from any directory.
"""

import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

from PIL import Image


MATERIALS = {
    "aaai-2025-qjl": ("QJL_Poster.pdf", "poster"),
    "qjl-presentation": ("QJL_Presentation.pdf", "slides"),
    "qjl-lightning": ("QJL_Lightning_Talk.pdf", "slides"),
    "iclr-2026-turboquant": ("TurboQuant_Poster.pdf", "poster"),
    "icml-2023-transformers": ("ICML_Poster.png", "poster"),
    "pldi-2022-data-placement": ("PLDI_Slides.pdf", "slides"),
    "pods-2023-minhash": ("PODS_Poster.pdf", "poster"),
    "sosa-2024-prioritysampling": ("SOSA_Presentation.pdf", "slides"),
}


def main():
    root = Path(__file__).resolve().parents[1]
    renderer = shutil.which("pdftoppm")
    if not renderer:
        raise SystemExit("Install Poppler to provide pdftoppm, then try again.")

    data = {}
    for key, (filename, kind) in MATERIALS.items():
        source = root / "resources" / filename
        destination = root / "assets" / "talks" / key
        destination.mkdir(parents=True, exist_ok=True)
        url = "/assets/talks/" + key
        size = 3200 if kind == "poster" else 1800
        pages = []

        with tempfile.TemporaryDirectory(prefix="talk-preview-") as temporary:
            if source.suffix.lower() == ".pdf":
                subprocess.run([
                    renderer, "-scale-to", str(size), "-png",
                    str(source), str(Path(temporary) / "page"),
                ], check=True)
                images = sorted(
                    Path(temporary).glob("page-*.png"),
                    key=lambda p: int(p.stem.rsplit("-", 1)[1]),
                )
            else:
                images = [source]
            if not images:
                raise SystemExit("No pages rendered for " + filename)

            for index, image_path in enumerate(images, start=1):
                with Image.open(image_path) as original:
                    preview = original.convert("RGB")
                    preview.thumbnail((size, size), Image.Resampling.LANCZOS)
                    page_name = "page-{}.webp".format(index)
                    preview.save(destination / page_name, lossless=True, method=6)
                    pages.append({
                        "image": url + "/" + page_name,
                        "width": preview.width,
                        "height": preview.height,
                    })
                    if index == 1:
                        preview.thumbnail((640, 480), Image.Resampling.LANCZOS)
                        preview.save(destination / "thumbnail.webp", quality=88, method=6)

        expected = {"page-{}.webp".format(i) for i in range(1, len(pages) + 1)}
        for old in destination.glob("page-*.webp"):
            if old.name not in expected:
                old.unlink()
        data[key] = {
            "source": "/resources/" + filename,
            "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
            "format": source.suffix[1:].upper(),
            "kind": kind,
            "thumbnail": url + "/thumbnail.webp",
            "pages": pages,
        }
        print("Updated {}: {} page(s).".format(key, len(pages)), flush=True)

    (root / "_data" / "talk_previews.json").write_text(json.dumps(data, indent=2) + "\n")


if __name__ == "__main__":
    main()
