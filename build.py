# Kaynak dosyaları tek bir dist/index.html içinde birleştirir.
import os, sys, urllib.parse
kok = os.path.dirname(os.path.abspath(__file__))
os.chdir(kok)
sys.path.insert(0, os.path.join(kok, 'brand'))
import make_logo as L

def logo_inline():
    wm = L.wordmark(wght=700)
    icon, gap = 132.0, 34.0
    sc = (icon * 0.40) / wm['xh']
    base = icon / 2 + (wm['xh'] * sc) / 2 + icon * 0.045
    genis = icon + gap + wm['width'] * sc + 6
    s = icon * 0.60 / L.MW
    tx = (icon - L.MW * s) / 2 + L.T / 2 * s
    ty = (icon - L.MH * s) / 2 + L.T / 2 * s
    dots = ''.join(f'<circle class="lg-nokta" cx="{cx:.1f}" cy="{-cy:.1f}" r="{r:.1f}"/>' for cx, cy, r in wm['dots'])
    return (f'<svg class="lg" viewBox="0 0 {genis:.1f} {icon:.1f}" role="img" aria-label="Mahir">'
            f'<rect class="lg-kare" width="{icon}" height="{icon}" rx="{icon * 0.225:.1f}"/>'
            f'<g transform="translate({tx:.2f} {ty:.2f}) scale({s:.4f})">{L.mark(False)}</g>'
            f'<g transform="translate({icon + gap:.1f} {base:.1f}) scale({sc:.5f})"><path class="lg-yazi" d="{wm["d"]}"/>{dots}</g></svg>')

oku = lambda p: open(os.path.join('src', p), encoding='utf-8').read()
js = '\n'.join(oku(f) for f in ['data.js', 'logic.js', 'ui.js', 'views-musteri.js', 'views-usta.js', 'views-ops.js'])
assert '</script' not in js
favicon = 'data:image/svg+xml,' + urllib.parse.quote(L.icon_svg(64, detail=False))
html = oku('index.tpl.html')
for anahtar, deger in (('/*CSS*/', oku('styles.css')), ('/*LOGO*/', logo_inline()), ('/*FAVICON*/', favicon), ('/*JS*/', js)):
    assert html.count(anahtar) == 1, anahtar
    html = html.replace(anahtar, deger)
os.makedirs('dist', exist_ok=True)
open('dist/index.html', 'w', encoding='utf-8').write(html)
print('dist/index.html', round(len(html.encode('utf-8')) / 1024, 1), 'KB')
