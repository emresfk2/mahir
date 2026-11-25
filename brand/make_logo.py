# Mahir marka dosyalarını üretir: işaret (katlanır metreden M), uygulama ikonu, yatay logo.
import math, subprocess, sys, re
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.transformPen import TransformPen

INK   = '#0D2B26'   # koyu çam
PINE  = '#14493F'   # marka yeşili
SARI  = '#F7B51C'   # metre sarısı
AMBER = '#E39A0B'   # katlanan yüz
PAPER = '#F3F5F0'

# --- İşaret: 3-4-5 üçgeni üzerine kurulu dört eşit parçalı katlanır metre ---
L, W2, D, T = 100.0, 60.0, 80.0, 23.0     # parça boyu, yarı genişlik, vadi derinliği, kalınlık
P = [(0, L), (0, 0), (W2, D), (2*W2, 0), (2*W2, L)]

def seg(a, b, color):
    return f'<line x1="{a[0]:.2f}" y1="{a[1]:.2f}" x2="{b[0]:.2f}" y2="{b[1]:.2f}" stroke="{color}" stroke-width="{T}" stroke-linecap="round"/>'

def ticks(a, b, side, color=INK):
    out = []
    dx, dy = b[0]-a[0], b[1]-a[1]
    ln = math.hypot(dx, dy); ux, uy = dx/ln, dy/ln
    nx, ny = -uy*side, ux*side                      # kenara dik yön
    n = 10
    for i in range(2, n-1):
        t = i/n
        cx, cy = a[0]+dx*t, a[1]+dy*t
        ex, ey = cx+nx*T/2, cy+ny*T/2               # dış kenar
        k = 0.52 if i == 5 else 0.30
        ix, iy = ex-nx*T*k, ey-ny*T*k
        out.append(f'<line x1="{ex:.2f}" y1="{ey:.2f}" x2="{ix:.2f}" y2="{iy:.2f}" stroke="{color}" stroke-width="2.1" stroke-linecap="butt" opacity=".9"/>')
    return ''.join(out)

def rivet(p):
    return (f'<circle cx="{p[0]:.2f}" cy="{p[1]:.2f}" r="{T*0.21:.2f}" fill="{INK}"/>'
            f'<circle cx="{p[0]:.2f}" cy="{p[1]:.2f}" r="{T*0.075:.2f}" fill="{SARI}"/>')

def mark(detail=True):
    g = []
    # arkadan öne: D, C, B, A  (her eklem bir öncekinin üstüne katlanır)
    g.append(seg(P[3], P[4], AMBER))
    g.append(seg(P[2], P[3], SARI))
    g.append(seg(P[1], P[2], AMBER))
    g.append(seg(P[0], P[1], SARI))
    if detail:
        g.append(ticks(P[0], P[1], -1))
        g.append(ticks(P[1], P[2], -1))
        g.append(ticks(P[2], P[3], -1))
        g.append(ticks(P[3], P[4], -1))
        for p in (P[1], P[2], P[3]):
            g.append(rivet(p))
    return ''.join(g)

MW, MH = 2*W2 + T, L + T                     # işaretin kapladığı alan

def mark_svg(detail=True):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-T/2} {-T/2} {MW} {MH}" role="img" aria-label="Mahir">'
            f'{mark(detail)}</svg>')

def icon_svg(size=512, detail=True, bg=PINE):
    s = size*0.60/MW
    tx = (size - MW*s)/2 + T/2*s
    ty = (size - MH*s)/2 + T/2*s
    r = size*0.225
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" role="img" aria-label="Mahir">'
            f'<rect width="{size}" height="{size}" rx="{r}" fill="{bg}"/>'
            f'<g transform="translate({tx:.2f} {ty:.2f}) scale({s:.4f})">{mark(detail)}</g></svg>')

# --- Yazı: DM Sans (OFL) ana hatlarından "mahir"; i harfinin noktası perçin sarısı ---
FONT = '/usr/share/fonts/truetype/google-fonts/ofl/dmsans/DMSans[opsz,wght].ttf'
def wordmark(text='mahir', wght=700, opsz=40, track=-14):
    f = TTFont(FONT)
    f = instancer.instantiateVariableFont(f, {'wght': wght, 'opsz': opsz})
    gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
    x = 0; paths = []; dots = []
    for ch in text:
        gn = cmap[ord(ch)]
        rec = RecordingPen(); gs[gn].draw(rec)
        # konturlara ayır
        contours, cur = [], []
        for op, args in rec.value:
            cur.append((op, args))
            if op in ('closePath', 'endPath'):
                contours.append(cur); cur = []
        for c in contours:
            ys = [pt[1] for op, args in c for pt in args]
            xs = [pt[0] for op, args in c for pt in args]
            is_dot = (ch == 'i' and min(ys) > f['OS/2'].sxHeight * 0.95)
            if is_dot:
                cx = x + (min(xs)+max(xs))/2; cy = (min(ys)+max(ys))/2; r = (max(xs)-min(xs))/2
                dots.append((cx, cy, r))
                continue
            sp = SVGPathPen(gs)
            tp = TransformPen(sp, (1, 0, 0, -1, x, 0))
            for op, args in c:
                getattr(tp, op)(*args)
            paths.append(sp.getCommands())
        x += gs[gn].width + track
    width = x - track
    asc = f['OS/2'].sCapHeight; xh = f['OS/2'].sxHeight
    return dict(d=' '.join(paths), dots=dots, width=width, upm=upm, xh=xh, cap=asc, asc=max(asc, 760))

def lockup_svg(dark=False, wght=700):
    wm = wordmark(wght=wght)
    icon = 132.0                                    # ikon kenarı
    gap = 34.0
    sc = (icon*0.40)/wm['xh']                       # x-yüksekliği ikonun %40'ı
    asc_px = 760*sc                                 # h harfinin tepe yüksekliği
    base = icon/2 + (wm['xh']*sc)/2 + icon*0.045    # x-yüksekliği ikona göre hafif aşağıda ortalı
    wpx = wm['width']*sc
    Wt = icon + gap + wpx + 6; Ht = icon
    ink = PAPER if dark else INK
    dot = SARI if dark else AMBER
    s = icon*0.60/MW; tx = (icon - MW*s)/2 + T/2*s; ty = (icon - MH*s)/2 + T/2*s
    tile = PINE if not dark else '#1B5E52'
    dots = ''.join(f'<circle cx="{cx:.1f}" cy="{-cy:.1f}" r="{r:.1f}" fill="{dot}"/>' for cx, cy, r in wm['dots'])
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {Wt:.1f} {Ht:.1f}" role="img" aria-label="Mahir">'
            f'<rect width="{icon}" height="{icon}" rx="{icon*0.225:.1f}" fill="{tile}"/>'
            f'<g transform="translate({tx:.2f} {ty:.2f}) scale({s:.4f})">{mark(True)}</g>'
            f'<g transform="translate({icon+gap:.1f} {base:.1f}) scale({sc:.5f})"><path d="{wm["d"]}" fill="{ink}"/>{dots}</g></svg>'), (Wt, Ht)

def wordmark_inline(wght=700):
    """Uygulama başlığına gömülecek yazı (tek renk currentColor + nokta)."""
    wm = wordmark(wght=wght)
    return wm

def sheet_svg():
    a,(aw,ah)=lockup_svg(False); b,(bw,bh)=lockup_svg(True)
    inner=lambda svg: re.sub(r'^<svg[^>]*>|</svg>$','',svg)
    W,H=1600,1000
    sw=[(PINE,'Çam yeşili','#14493F','#F3F5F0'),(INK,'Mürekkep','#0D2B26','#F3F5F0'),(SARI,'Metre sarısı','#F7B51C','#0D2B26'),(AMBER,'Kehribar','#E39A0B','#0D2B26'),(PAPER,'Kâğıt','#F3F5F0','#0D2B26')]
    out=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" font-family="DM Sans, sans-serif">',
         f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>']
    # sol: büyük ikon
    out.append(f'<g transform="translate(80 80) scale({440/512})">{inner(icon_svg())}</g>')
    # sağ üst: açık zemin logo
    k=560/aw
    out.append(f'<rect x="600" y="80" width="920" height="200" rx="24" fill="{PAPER}"/>')
    out.append(f'<g transform="translate({600+(920-aw*k)/2:.1f} {80+(200-ah*k)/2:.1f}) scale({k:.4f})">{inner(a)}</g>')
    # sağ alt: koyu zemin logo
    out.append(f'<rect x="600" y="320" width="920" height="200" rx="24" fill="{INK}"/>')
    out.append(f'<g transform="translate({600+(920-bw*k)/2:.1f} {320+(200-bh*k)/2:.1f}) scale({k:.4f})">{inner(b)}</g>')
    # slogan
    out.append(f'<text x="80" y="640" font-size="54" font-weight="700" fill="{INK}" letter-spacing="-1">Evin mahir ellerde.</text>')
    out.append(f'<text x="80" y="690" font-size="26" fill="#5A6B66">Dört eşit parçalı katlanır metre, ustaların gönye için kullandığı 3-4-5 üçgeniyle M harfini kurar.</text>')
    # küçük boyutlar
    x=80
    for sz,det in ((120,True),(72,True),(44,False),(28,False)):
        out.append(f'<g transform="translate({x} {760}) scale({sz/512})">{inner(icon_svg(detail=det))}</g>')
        out.append(f'<text x="{x+sz/2}" y="{760+sz+30}" font-size="20" fill="#5A6B66" text-anchor="middle">{sz} px</text>')
        x+=sz+40
    # renkler
    x=600; wsw=(920-4*20)/5
    for col,name,hx,tc in sw:
        out.append(f'<rect x="{x:.1f}" y="760" width="{wsw:.1f}" height="150" rx="18" fill="{col}" stroke="#DDE3DA"/>')
        out.append(f'<text x="{x+18:.1f}" y="800" font-size="22" font-weight="600" fill="{tc}">{name}</text>')
        out.append(f'<text x="{x+18:.1f}" y="890" font-size="20" fill="{tc}" opacity=".85">{hx}</text>')
        x+=wsw+20
    out.append('</svg>')
    return ''.join(out)

if __name__ == '__main__':
    open('brand/mahir-isaret.svg', 'w').write(mark_svg())
    open('brand/mahir-ikon.svg', 'w').write(icon_svg())
    open('brand/mahir-ikon-sade.svg', 'w').write(icon_svg(detail=False))
    a, _ = lockup_svg(False); open('brand/mahir-logo.svg', 'w').write(a)
    b, _ = lockup_svg(True);  open('brand/mahir-logo-koyu-zemin.svg', 'w').write(b)
    for n, w in (('mahir-ikon', 1024), ('mahir-ikon-sade', 256), ('mahir-logo', 1600), ('mahir-isaret', 800)):
        subprocess.run(['rsvg-convert', '-w', str(w), f'brand/{n}.svg', '-o', f'brand/{n}.png'], check=True)
    subprocess.run(['rsvg-convert', '-w', '1600', '-b', '#0D2B26', 'brand/mahir-logo-koyu-zemin.svg', '-o', 'brand/mahir-logo-koyu-zemin.png'], check=True)
    open('brand/mahir-marka-ozeti.svg','w').write(sheet_svg())
    subprocess.run(['rsvg-convert','-w','1600','brand/mahir-marka-ozeti.svg','-o','brand/mahir-marka-ozeti.png'],check=True)
    print('ok')
