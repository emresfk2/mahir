# Masaüstü ve koyu tema görünümleri
import os
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.abspath('dist/index.html')
hatalar = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for ad, w, h, tema, olcek in (('masaustu', 1280, 800, 'light', 1), ('koyu', 390, 844, 'dark', 2), ('dar', 320, 640, 'light', 2)):
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=olcek, color_scheme=tema, locale='tr-TR', timezone_id='Europe/Istanbul')
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: hatalar.append(str(e)))
        pg.goto(URL); pg.wait_for_selector('.vitrin'); pg.wait_for_timeout(200)
        pg.screenshot(path=f'test/shots/g-{ad}-ana.png')
        pg.click('.sekme [data-ad="siparisler"]'); pg.locator('.sip', has_text='İç cephe boya').click(); pg.wait_for_timeout(200)
        pg.screenshot(path=f'test/shots/g-{ad}-siparis.png')
        if ad == 'masaustu':
            pg.click('.rol [data-rol="ops"]'); pg.click('.sekme [data-ad="o_davalar"]'); pg.locator('.sip').first.click(); pg.wait_for_timeout(200)
            pg.screenshot(path=f'test/shots/g-{ad}-dava.png')
            pg.click('.rol [data-rol="musteri"]'); pg.locator('[data-kat="mobilya"]').click(); pg.locator('[data-id="mutfak"]').click(); pg.wait_for_timeout(200)
            pg.locator('[data-act="odeAc"]').click(); pg.wait_for_timeout(300); pg.screenshot(path=f'test/shots/g-{ad}-sheet.png')
        # yatay taşma kontrolü
        tasma = pg.evaluate("() => document.documentElement.scrollWidth > window.innerWidth + 1")
        if tasma: hatalar.append(f'{ad}: yatay taşma')
        ctx.close()
    b.close()
print('\n'.join(hatalar) if hatalar else 'tamam')
