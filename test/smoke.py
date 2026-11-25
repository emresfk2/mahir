# Her rolün ana ekranlarını açar, ekran görüntüsü alır, konsol hatalarını raporlar.
import sys, os
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.abspath('dist/index.html')
W, H = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (390, 844)
ek = sys.argv[3] if len(sys.argv) > 3 else 'm'
tema = sys.argv[4] if len(sys.argv) > 4 else 'light'
hatalar = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2 if W < 600 else 1, color_scheme=tema, locale='tr-TR', timezone_id='Europe/Istanbul')
    pg = ctx.new_page()
    pg.on('console', lambda m: hatalar.append('console.' + m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: hatalar.append('pageerror: ' + str(e)))
    pg.goto(URL); pg.wait_for_selector('.vitrin')
    def cek(ad, tam=False):
        pg.wait_for_timeout(120)
        if tam:
            # kaydırılan alanın tamamını görmek için geçici olarak yüksekliği serbest bırak
            pg.evaluate("() => { document.body.style.overflow='visible'; document.documentElement.style.height='auto'; document.body.style.height='auto'; document.getElementById('app').style.height='auto'; document.getElementById('icerik').style.overflow='visible'; }")
            pg.screenshot(path=f'test/shots/{ek}-{ad}.png', full_page=True)
            pg.evaluate("() => { document.body.style.overflow=''; document.documentElement.style.height=''; document.body.style.height=''; document.getElementById('app').style.height=''; document.getElementById('icerik').style.overflow=''; }")
        else:
            pg.screenshot(path=f'test/shots/{ek}-{ad}.png')
    cek('01-ana'); cek('01-ana-tam', True)
    for rol, sekmeler in (('musteri', ['siparisler', 'guvence', 'hesap']), ('usta', ['u_teklifler', 'u_kazanc', 'u_profil']), ('ops', ['o_ozet', 'o_siparisler', 'o_davalar', 'o_ag', 'o_defter'])):
        pg.click(f'.rol [data-rol="{rol}"]')
        for s in sekmeler:
            pg.click(f'.sekme [data-ad="{s}"]'); cek(f'{rol}-{s}', True)
    b.close()
print('\n'.join(hatalar) if hatalar else 'konsol temiz')
