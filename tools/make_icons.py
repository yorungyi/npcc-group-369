"""앱 아이콘 생성 — 야디지북: 그린 바탕에 티 → 깃발 경로 (점 3개 + 주황 깃발)
실행: python tools/make_icons.py   → icons/*.png
"""
from pathlib import Path
from PIL import Image, ImageDraw

GREEN = (30, 74, 52)
WHITE = (255, 255, 255)
FLAG = (196, 84, 31)
OUT = Path(__file__).resolve().parent.parent / "icons"


def draw(size, safe=0.0, rounded=True):
    s = size * 4  # 4배로 그려서 축소(안티에일리어싱)
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=GREEN)
    else:
        d.rectangle([0, 0, s, s], fill=GREEN)
    pad = s * (0.18 + safe)
    y = s * 0.62
    r = s * 0.055
    xs = [pad + r, pad + r + (s - 2 * pad) * 0.24, pad + r + (s - 2 * pad) * 0.48]
    d.line([(xs[0], y), (xs[-1], y)], fill=WHITE, width=int(r * 0.7))
    for x in xs:
        d.ellipse([x - r, y - r, x + r, y + r], fill=WHITE)
    # 깃대 + 깃발
    px = s - pad - r
    top = s * (0.24 + safe * 0.5)
    d.line([(px, top), (px, y + r)], fill=WHITE, width=int(r * 0.55))
    d.polygon([(px, top), (px - s * 0.2, top + s * 0.09), (px, top + s * 0.18)], fill=FLAG)
    d.ellipse([px - r * 0.9, y - r * 0.9, px + r * 0.9, y + r * 0.9], outline=WHITE, width=int(r * 0.45))
    return img.resize((size, size), Image.LANCZOS)


OUT.mkdir(exist_ok=True)
draw(192).save(OUT / "icon-192.png")
draw(512).save(OUT / "icon-512.png")
draw(512, safe=0.08, rounded=False).save(OUT / "icon-maskable-512.png")
draw(180, rounded=False).save(OUT / "apple-touch-icon.png")
draw(32).save(OUT / "favicon-32.png")
print("icons written to", OUT)
