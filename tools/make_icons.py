"""앱 아이콘 생성 — 9칸 스탬프 카드 (3·6·9칸은 보상색)
실행: python tools/make_icons.py   → icons/*.png
"""
from pathlib import Path
from PIL import Image, ImageDraw

INK = (29, 39, 49)
WHITE = (255, 255, 255)
RING = (93, 105, 117)
REWARD = {3: (204, 122, 20), 6: (11, 140, 102), 9: (210, 86, 60)}
FILLED = 7  # 7칸 찍힘 → 8칸째 빈칸, 9칸째 목표(빨간 테두리)
OUT = Path(__file__).resolve().parent.parent / "icons"


def draw(size, safe=0.0, rounded=True):
    s = size * 4  # 4배로 그려서 축소(안티에일리어싱)
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=INK)
    else:
        d.rectangle([0, 0, s, s], fill=INK)
    pad = s * (0.2 + safe)
    cell = (s - 2 * pad) / 3
    r = cell * 0.34
    for i in range(9):
        n = i + 1
        cx = pad + cell * (i % 3) + cell / 2
        cy = pad + cell * (i // 3) + cell / 2
        box = [cx - r, cy - r, cx + r, cy + r]
        col = REWARD.get(n, WHITE)
        if n <= FILLED:
            d.ellipse(box, fill=col)
        else:
            d.ellipse(box, outline=col if n in REWARD else RING, width=max(2, int(r * 0.28)))
    return img.resize((size, size), Image.LANCZOS)


OUT.mkdir(exist_ok=True)
draw(192).save(OUT / "icon-192.png")
draw(512).save(OUT / "icon-512.png")
draw(512, safe=0.1, rounded=False).save(OUT / "icon-maskable-512.png")
draw(180, rounded=False).save(OUT / "apple-touch-icon.png")
draw(32).save(OUT / "favicon-32.png")
print("icons written to", OUT)
