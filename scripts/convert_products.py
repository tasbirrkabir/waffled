#!/usr/bin/env python3
"""Convert generated product PNGs (1024x1024) to optimized webp in public/images/products/."""
import os
import sys
from PIL import Image

SRC = os.path.join(os.path.dirname(__file__), "gen-out")
DST = os.path.join(os.path.dirname(__file__), "..", "public", "images", "products")
SIZE = 800  # rendered at ~150-400px, 800 covers 2x DPR
QUALITY = 80

os.makedirs(DST, exist_ok=True)

converted = 0
skipped = 0
for name in sorted(os.listdir(SRC)):
    if not name.endswith(".png"):
        continue
    stem = name[:-4]
    out_path = os.path.join(DST, f"{stem}.webp")
    src_path = os.path.join(SRC, name)
    if os.path.exists(out_path) and os.path.getmtime(out_path) >= os.path.getmtime(src_path):
        skipped += 1
        continue
    img = Image.open(src_path).convert("RGB")
    if img.size != (SIZE, SIZE):
        img = img.resize((SIZE, SIZE), Image.LANCZOS)
    img.save(out_path, "WEBP", quality=QUALITY, method=6)
    converted += 1
    print(f"✓ {stem}.webp ({os.path.getsize(out_path) // 1024} KB)")

print(f"\nConverted {converted}, skipped {skipped} (up to date). Output: {DST}")
