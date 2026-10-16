#!/usr/bin/env python3
"""Process Waffled brand assets: logo transparency, hero, signature, gallery, OG image."""
from PIL import Image, ImageDraw, ImageFilter
import os
from collections import deque

SRC = "/tmp/waffled-frames"
UPLOAD = "/home/z/my-project/upload"
OUT = "/home/z/my-project/public/images"
os.makedirs(f"{OUT}/gallery", exist_ok=True)

# ---------- 1. Logo: remove white background via edge flood fill ----------
logo = Image.open(f"{UPLOAD}/pasted_image_1792106166879.png").convert("RGBA")
w, h = logo.size
rgb = logo.convert("RGB")
px = rgb.load()
alpha = Image.new("L", (w, h), 255)
ap = alpha.load()
visited = Image.new("L", (w, h), 0)
vp = visited.load()

def is_white(p, tol=236):
    return p[0] >= tol and p[1] >= tol and p[2] >= tol

q = deque()
for x in range(w):
    for y in (0, h - 1):
        if is_white(px[x, y]):
            q.append((x, y))
for y in range(h):
    for x in (0, w - 1):
        if is_white(px[x, y]):
            q.append((x, y))

while q:
    x, y = q.popleft()
    if x < 0 or y < 0 or x >= w or y >= h:
        continue
    if vp[x, y]:
        continue
    vp[x, y] = 255
    ap[x, y] = 0
    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < w and 0 <= ny < h and not vp[nx, ny] and is_white(px[nx, ny]):
            q.append((nx, ny))

alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))
logo.putalpha(alpha)
bbox = alpha.getbbox()
logo = logo.crop(bbox)
logo512 = logo.copy()
logo512.thumbnail((512, 512), Image.LANCZOS)
logo512.save(f"{OUT}/logo.png", optimize=True)
logo.save(f"{OUT}/logo-full.png", optimize=True)
print("logo done", logo.size)

logo48 = logo.copy()
logo48.thumbnail((48, 48), Image.LANCZOS)
logo48.save(f"{OUT}/favicon-48.png", optimize=True)
touch = Image.new("RGBA", (180, 180), (255, 247, 236, 255))
lt = logo.copy()
lt.thumbnail((140, 140), Image.LANCZOS)
touch.paste(lt, ((180 - lt.width)//2, (180 - lt.height)//2), lt)
touch.convert("RGB").save(f"{OUT}/apple-touch-icon.png", optimize=True)
icon192 = Image.new("RGBA", (192, 192), (255, 247, 236, 255))
l192 = logo.copy()
l192.thumbnail((150, 150), Image.LANCZOS)
icon192.paste(l192, ((192 - l192.width)//2, (192 - l192.height)//2), l192)
icon192.convert("RGB").save(f"{OUT}/icon-192.png", optimize=True)
print("icons done")

def to_webp(src, dst, width=None, quality=82):
    im = Image.open(src).convert("RGB")
    if width and im.width > width:
        im = im.resize((width, int(im.height * width / im.width)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=quality, method=6)
    print("saved", dst, im.size)

# ---------- 2. Hero ----------
to_webp(f"{SRC}/pick_8.0.jpg", f"{OUT}/hero-waffle.webp", quality=86)

# ---------- 3. Signature crops ----------
to_webp(f"{SRC}/food_8.1.jpg", f"{OUT}/sig-strawberry.webp", quality=84)
to_webp(f"{SRC}/food_8.5.jpg", f"{OUT}/sig-oreo.webp", quality=84)
im = Image.open(f"{SRC}/pick_10.2.jpg").convert("RGB")
cw, ch = im.size
target_ratio = 4/5
cur_ratio = cw / ch
if cur_ratio > target_ratio:
    nw = int(ch * target_ratio)
    x0 = (cw - nw) // 2
    im = im.crop((x0, 0, x0 + nw, ch))
else:
    nh = int(cw / target_ratio)
    y0 = max(0, (ch - nh) // 3)
    im = im.crop((0, y0, cw, y0 + nh))
im.save(f"{OUT}/sig-nutella.webp", "WEBP", quality=84, method=6)
print("sig-nutella", im.size)

# ---------- 4. Gallery ----------
gallery = {
    "interior-counter": "pick_0.5.jpg",
    "counter-order": "pick_2.5.jpg",
    "ordering-experience": "pick_4.5.jpg",
    "mural-logo": "pick_8.8.jpg",
    "menu-card": "pick_9.5.jpg",
    "shop-sign": "pick_10.9.jpg",
    "waffle-spread": "pick_10.2.jpg",
    "waffle-closeup": "pick_8.0.jpg",
}
for name, f in gallery.items():
    to_webp(f"{SRC}/{f}", f"{OUT}/gallery/{name}.webp", width=720, quality=80)

# ---------- 5. OG image 1200x630 ----------
og = Image.new("RGB", (1200, 630), (255, 247, 236))
d = ImageDraw.Draw(og)
hero = Image.open(f"{SRC}/pick_8.0.jpg").convert("RGB")
hr = 600 / 630
if hero.width / hero.height > hr:
    nh = int(hero.width / hr)
    y0 = int((hero.height - nh) * 0.35)
    hero_c = hero.crop((0, y0, hero.width, y0 + nh)).resize((600, 630), Image.LANCZOS)
else:
    nw = int(hero.height * hr)
    x0 = (hero.width - nw) // 2
    hero_c = hero.crop((x0, 0, x0 + nw, hero.height)).resize((600, 630), Image.LANCZOS)
og.paste(hero_c, (600, 0))
lg = logo.copy()
lg.thumbnail((320, 320), Image.LANCZOS)
og.paste(lg, (140, 130), lg)
for cx, cy, r, col in [(80, 520, 26, (242, 76, 139)), (140, 560, 18, (255, 123, 48)), (200, 525, 14, (66, 199, 217))]:
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=col)
og.save(f"{OUT}/og-image.jpg", "JPEG", quality=88, optimize=True)
print("og done")

print("ALL ASSETS PROCESSED")
