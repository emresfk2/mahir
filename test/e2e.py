# Uçtan uca senaryolar: gerçek tarayıcıda, telefon boyutunda, arayüzden tıklayarak.
#   python3 test/e2e.py            → tüm akışlar
import os, sys, json
from playwright.sync_api import sync_playwright

URL = 'file://' + os.path.abspath('dist/index.html')
hatalar, sonuc = [], {'gecen': 0, 'kalan': 0}

def kontrol(kosul, ad):
    if kosul: sonuc['gecen'] += 1
    else:
        sonuc['kalan'] += 1; print('  ✗', ad)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, locale='tr-TR', timezone_id='Europe/Istanbul')
    pg = ctx.new_page()
    pg.on('console', lambda m: hatalar.append(m.type + ': ' + m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.on('pageerror', lambda e: hatalar.append('pageerror: ' + str(e)))
    pg.on('dialog', lambda d: (hatalar.append('dialog: ' + d.message), d.dismiss()))
    pg.goto(URL); pg.wait_for_selector('.vitrin')

    S = lambda ifade: pg.evaluate('() => (' + ifade + ')')
    AC = "() => { document.body.style.overflow='visible'; for (const e of [document.documentElement, document.body, document.getElementById('app')]) e.style.height='auto'; document.getElementById('icerik').style.overflow='visible'; }"
    KAPA = "() => { document.body.style.overflow=''; for (const e of [document.documentElement, document.body, document.getElementById('app')]) e.style.height=''; document.getElementById('icerik').style.overflow=''; }"
    def cek(ad, tam=False):
        pg.wait_for_timeout(260)
        if tam: pg.evaluate(AC)
        pg.screenshot(path=f'test/shots/e-{ad}.png', full_page=tam)
        if tam: pg.evaluate(KAPA)
    def act(a, **kw):
        sel = f'[data-act="{a}"]' + ''.join(f'[data-{k.replace("_", "-")}="{v}"]' for k, v in kw.items())
        pg.locator(sel).first.click()
    def dugme(metin): pg.locator('#app button', has_text=metin).first.click()
    def rol(r): pg.click(f'.rol [data-rol="{r}"]')
    def rehber(beklenen):
        t = pg.locator('.rehber').inner_text()
        kontrol(beklenen in t, f'rehber "{beklenen}" bekleniyordu, görünen: {t!r}')
        pg.click('.rehber')
    def metin(): return pg.locator('#icerik').inner_text()
    def toast(): return pg.locator('#toast').inner_text()
    def defter(ad):
        r = S("""(() => { let bozuk = 0; S.ledger.forEach(k => { if (k.lines.reduce((t, l) => t + l.t, 0) !== 0) bozuk++; });
            const b = bakiye(); return { bozuk, toplam: Object.values(b).reduce((t, x) => t + x, 0), bloke: b.bloke || 0, sip: S.orders.reduce((t, o) => t + blokede(o), 0),
            eksi: S.orders.filter(o => blokede(o) < 0).length, kapaliDolu: S.orders.filter(o => kapaliMi(o) && blokede(o) !== 0).length }; })()""")
        kontrol(r['bozuk'] == 0 and r['toplam'] == 0 and r['bloke'] == r['sip'] and r['eksi'] == 0 and r['kapaliDolu'] == 0, f'defter tutarlı ({ad}): {r}')
    def usta_isi_yap(tamam_metin='İşi tamamla', foto=True):
        """Usta ekranı: yola çık → kod → kontrol listesi → fotoğraf → tamamla"""
        act('uYola'); kod = S('bul(V.p.id).kod')
        pg.fill('.kod-giris', '0000' if kod != '0000' else '1111'); act('uGiris')
        kontrol('Kod eşleşmedi' in metin(), 'yanlış kod uyarısı')
        pg.fill('.kod-giris', kod); pg.press('.kod-giris', 'Enter')
        kontrol(S('bul(V.p.id).durum') == 'BASLADI', 'kod sonrası iş başladı')
        n = pg.locator('.kontrol button').count()
        for i in range(n): pg.locator('.kontrol button').nth(i).click()
        if foto: pg.locator('[data-act="ornekFoto"][data-hedef="o:fotoSonra"]').click()

    # ---------- A) Sabit fiyatlı iş: musluk ----------
    print('A) sabit fiyatlı iş')
    cek('a00-ana')
    act('git', ad='kategori', kat='tamir'); cek('a01-kategori')
    act('git', ad='hizmet', id='musluk')
    act('sec', k='malzeme', v='mahir'); act('adim', k='adet', d='1')
    pg.locator('.gunler button').nth(1).click(); act('sec', k='saat', v='19')
    pg.fill('[data-f="not"]', 'Banyo ve mutfak <b>bataryası</b>'); cek('a02-form')
    pg.evaluate("document.getElementById('icerik').scrollTo(0, 99999)"); cek('a03-form-alt')
    fiyat = S("fiyatla(hizmet('musluk'), { adet: 2, malzeme: true }, S.il, S.ilce, slotUret(Number(V.f.gun), 19))")
    kontrol(fiyat['fark'] > 0 and fiyat['toplam'] == fiyat['iscilik'] + fiyat['fark'] + fiyat['malzeme'], 'mesai dışı farkı ve toplam')
    act('odeAc', tur='standart'); cek('a04-ode')
    kontrol(pg.locator('[data-act="odeOnay"]').is_disabled(), 'onay kutusu işaretlenmeden ödeme düğmesi kapalı')
    pg.locator('.sheet .onay input').check(); act('odeOnay')
    kontrol('Sipariş' in toast() or 'alındı' in toast(), 'sipariş toast')
    oid = S('V.p.id'); kontrol(S('V.ad') == 'siparis' and S(f'bul("{oid}").durum') == 'ATAMA', 'sipariş oluştu, atama bekliyor')
    kontrol('<b>' not in pg.locator('#icerik').inner_html().split('Notun')[1][:200] or '&lt;b&gt;' in pg.locator('#icerik').inner_html(), 'kullanıcı metni kaçışlanıyor')
    kontrol(S(f'bul("{oid}").vade') is not None and S(f'bul("{oid}").paid') == 0, 'uzak randevuda çekim ertelendi')
    cek('a05-siparis-atama', True)
    rehber('İş teklifini kabul et'); kontrol(S('S.rol') == 'usta' and S('S.ustaId') == 'u1', 'rehber Uzman tesisatçıya götürdü')
    cek('a06-usta-teklif'); act('uKabul', id=oid); cek('a07-usta-is', True)
    rol('musteri'); act('sekme', ad='siparisler'); act('git', ad='siparis', id=oid); cek('a08-musteri-planlandi')
    kontrol(pg.locator('.kapi-kod span').count() == 4, 'müşteride kapı kodu görünüyor')
    rehber('Yola çık')
    usta_isi_yap(); kontrol(S(f'bul("{oid}").paid') == fiyat['toplam'], 'yola çıkınca tahsilat yapıldı')
    cek('a09-usta-basladi')
    act('sheet', ad='ekIs'); pg.fill('.sheet [data-f="ad"]', 'Ara musluk değişimi'); pg.fill('.sheet [data-f="tutar"]', '400'); cek('a10-ekis'); act('uEkIs')
    kontrol(pg.locator('[data-act="uTamam"]').is_disabled(), 'ek iş beklerken tamamlanamaz')
    rehber('Ek iş talebini yanıtla'); cek('a11-musteri-ekis')
    act('odeAc', tur='ekis'); act('odeOnay'); kontrol(S(f'bul("{oid}").paid') == fiyat['toplam'] + 400, 'ek iş tahsil edildi')
    rehber('İşi tamamla'); act('uTamam'); kontrol(S(f'bul("{oid}").durum') == 'TESLIM', 'teslim edildi')
    rehber('İşi kontrol edip onayla'); cek('a12-musteri-teslim')
    act('sheet', ad='puan'); act('sec', k='puan', v='5'); cek('a13-puan'); act('kabulOnay')
    kontrol(S(f'bul("{oid}").durum') == 'KABUL' and S(f'blokede(bul("{oid}"))') == 0 and S(f'bul("{oid}").puan') == 5, 'kabul, ödeme serbest, puan kaydedildi')
    cek('a14-musteri-tamam', True); defter('A')

    # ---------- B) Kabulden sonra şikâyet → usta yanıtı → operasyon kararı ----------
    print('B) garanti şikâyeti')
    act('git', ad='sikayet', id=oid); cek('b01-sikayet-turler')
    act('sec', k='tur', v='kusur'); pg.fill('[data-f="aciklama"]', 'Batarya dibinden su sızdırıyor.')
    act('sec', k='talep', v='indirim'); pg.fill('[data-f="tutar"]', '900'); act('ornekFoto'); cek('b02-sikayet-form')
    act('sikayetGonder'); kontrol('Şikâyetin alındı' in pg.locator('.sheet').inner_text(), 'şikâyet alındı paneli'); cek('b03-sikayet-alindi'); act('sheetKapat')
    rehber('Şikâyete yanıt yaz'); cek('b04-usta-savunma'); pg.fill('[data-f="savunma"]', 'Contayı yenileyebilirim.'); act('uSavunma')
    rehber('Şikâyet için karar ver'); cek('b05-ops-dava', True)
    kontrol(S('V.f.sonuc') == 'indirim' and S('V.f.yuk') == 'usta', 'karar formu müşterinin talebiyle açıldı')
    pg.fill('[data-f="tutar"]', '700'); pg.fill('[data-f="not"]', 'Conta kusuru usta kaynaklı; 700 TL iade.'); act('oKarar'); cek('b06-ops-karar')
    kontrol(S(f'bul("{oid}").refunded') == 700 and S('S.disputes[0].durum') == 'KAPANDI', '700 TL iade edildi, şikâyet kapandı')
    kontrol(S(f'bul("{oid}").teminat') < S(f'bol(bul("{oid}").kalem, ustaBul("u1")).teminat'), 'iade önce teminattan düşüldü')
    defter('B')

    # ---------- C) Örnek şikâyet: ücretsiz düzeltme ----------
    print('C) ücretsiz düzeltme')
    act('sekme', ad='o_davalar'); pg.locator('.sip', has_text='Klima').click()
    act('sec', k='sonuc', v='duzeltme'); act('oKarar'); klima = S('S.disputes.find(d => d.ad.indexOf("Klima") === 0).oid')
    kontrol(S(f'bul("{klima}").durum') == 'PLANLANDI' and S(f'bul("{klima}").duzeltme') is True, 'düzeltme ziyareti planlandı')
    rehber('Yola çık'); usta_isi_yap(); cek('c01-usta-duzeltme'); act('uTamam')
    rehber('İşi kontrol edip onayla'); act('sheet', ad='puan'); act('kabulOnay')
    kontrol(S(f'bul("{klima}").durum') == 'KABUL' and S(f'davaBul(bul("{klima}").disputeId).durum') == 'KAPANDI', 'düzeltme kabul edildi, şikâyet kapandı')
    defter('C')

    # ---------- D) Keşifli proje: örnek boya işinin kalan aşamaları ----------
    print('D) proje aşamaları')
    rol('usta'); pg.click('.baglam'); cek('d00-usta-sec'); pg.locator('[data-act="ustaSecildi"][data-id="u4"]').click()
    pg.locator('.sip', has_text='İç cephe boya').click(); boya = S('V.p.id')
    kontrol(pg.locator('[data-act="uTamam"]').is_disabled(), 'fotoğrafsız aşama tamamlanamaz')
    pg.locator('[data-act="ornekFoto"][data-hedef="o:fotoSonra"]').click(); cek('d01-usta-asama'); act('uTamam')
    rehber('Aşamayı kontrol edip onayla'); cek('d02-musteri-asama'); act('odeAc', tur='asama'); cek('d03-asama-ode'); act('odeOnay')
    kontrol(S(f'bul("{boya}").stages[1].accepted') and S(f'bul("{boya}").stages[2].paid') and S(f'bul("{boya}").durum') == 'BASLADI', 'ikinci aşama onaylandı, son aşama tahsil edildi')
    rehber('Aşamayı tamamla')
    for i in range(pg.locator('.kontrol button:not(.sec)').count()): pg.locator('.kontrol button:not(.sec)').first.click()
    act('uTamam'); kontrol(S(f'bul("{boya}").durum') == 'TESLIM', 'proje teslim')
    rehber('İşi kontrol edip onayla'); act('sheet', ad='puan'); act('sec', k='puan', v='4'); act('kabulOnay')
    kontrol(S(f'bul("{boya}").durum') == 'KABUL' and S(f'blokede(bul("{boya}"))') == 0 and S(f'bul("{boya}").rel') == S(f'bul("{boya}").paid'), 'proje kapandı')
    defter('D')

    # ---------- E) Ismarlama mobilya ----------
    print('E) ısmarlama mobilya')
    act('sekme', ad='ana'); act('git', ad='kategori', kat='mobilya'); act('git', ad='hizmet', id='gardirop')
    pg.evaluate("""() => { const e = document.querySelector('[data-f="en"]'); e.value = 300; e.dispatchEvent(new Event('input', { bubbles: true })); }""")
    kontrol('300 cm' in pg.locator('[data-out="en"]').inner_text() and '300 cm' in pg.locator('#canli-cizim').inner_html(), 'sürgü çizimi ve çıktıyı canlı güncelliyor')
    act('sec', k='malzeme', v='lake'); act('sec', k='kapak', v='surgulu'); act('sec', k='numune', v='A-611'); pg.evaluate("document.getElementById('icerik').scrollTo(0, 0)"); cek('e01-mobilya-form', True)
    pg.evaluate("document.getElementById('icerik').scrollTo(0, 99999)"); cek('e02-mobilya-alt')
    act('odeAc', tur='talep'); cek('e03-olcu-ode'); act('odeOnay'); mob = S('V.p.id')
    kontrol(S(f'bul("{mob}").durum') == 'TEKLIF_BEKLIYOR' and S(f'bul("{mob}").paid') == 600, 'ölçü randevusu ve bedeli')
    rehber('Teklifi hazırlayıp gönder'); pg.fill('[data-f="en"]', '296'); cek('e04-ops-teklif')
    kontrol('296' in pg.locator('#canli-teklif').inner_text(), 'teklif önizlemesi ölçüyle güncellendi'); act('oTeklif')
    rehber('Teklifi incele ve onayla'); cek('e05-musteri-teklif', True); act('odeAc', tur='teklif')
    kontrol(pg.locator('.sheet .onay input').count() == 4 and pg.locator('[data-act="odeOnay"]').is_disabled(), 'dört onay kutusu işaretlenmeden ödeme kapalı')
    for i in range(4): pg.locator('.sheet .onay input').nth(i).check()
    cek('e06-teklif-onay'); act('odeOnay')
    kontrol(S(f'bul("{mob}").paid') == S(f'bul("{mob}").stages[0].tutar') and not S(f'iptalHesap(bul("{mob}")).izin'), 'ölçü bedeli mahsup edildi; üretim onayından sonra iptal kapalı')
    rehber('İş teklifini kabul et'); act('uKabul', id=mob); cek('e07-atolye-uretim'); act('uUretim')
    rehber('Sevk öncesi ödemeyi yap'); act('odeAc', tur='sevk'); act('odeOnay')
    rehber('Ürünü sevk et'); act('uSevk')
    kontrol(S(f'bul("{mob}").durum') == 'MONTAJ' and pg.locator('.rehber').count() == 0, 'montaj adımı aynı ekranda; rehber gizli')
    usta_isi_yap(); act('uTamam')
    rehber('İşi kontrol edip onayla'); cek('e08-musteri-montaj-teslim'); act('sheet', ad='puan'); act('sec', k='puan', v='5'); act('kabulOnay')
    kontrol(S(f'bul("{mob}").durum') == 'KABUL' and S(f'bul("{mob}").paid') == S(f'bul("{mob}").fiyat.toplam') and S(f'blokede(bul("{mob}"))') == 0, 'mobilya kabul: son %20 çekildi, tamamı serbest')
    defter('E')

    # ---------- F) Acil iş ----------
    print('F) acil iş')
    act('sekme', ad='ana'); act('git', ad='kategori', kat='acil'); act('git', ad='hizmet', id='acil-su'); cek('f01-acil')
    act('odeAc', tur='acil')
    for i in range(2): pg.locator('.sheet .onay input').nth(i).check()
    act('odeOnay'); acil = S('V.p.id'); kontrol(S(f'bul("{acil}").paid') == 0 and S(f'bul("{acil}").sonradan') is True, 'acil işte ön tahsilat yok')
    rehber('İş teklifini kabul et'); act('uKabul', id=acil); usta_isi_yap()
    act('sheet', ad='ekIs'); pg.fill('.sheet [data-f="ad"]', 'Boru'); pg.fill('.sheet [data-f="tutar"]', '9000'); act('uEkIs')
    kontrol('Tavan fiyat' in toast(), 'tavan fiyat aşılamaz uyarısı'); pg.fill('.sheet [data-f="tutar"]', '1800'); act('uEkIs')
    rehber('Ek iş talebini yanıtla'); act('odeAc', tur='ekis'); act('odeOnay')
    rehber('İşi tamamla'); act('uTamam'); kontrol(S(f'bul("{acil}").paid') == 950 + 1800, 'acil tahsilat iş bitiminde')
    rehber('İşi kontrol edip onayla')
    # memnuniyet güvencesi: beğenmedim → ücretsiz tekrar
    act('git', ad='sikayet', id=acil); act('sec', k='tur', v='begenmeme'); pg.fill('[data-f="aciklama"]', 'Sıva düzgün kapatılmadı.'); cek('f02-begenmeme'); act('sikayetGonder')
    kontrol('Ücretsiz düzeltme' in pg.locator('.sheet').inner_text() and S(f'bul("{acil}").durum') == 'PLANLANDI', 'memnuniyet güvencesi: ücretsiz tekrar'); cek('f03-memnuniyet'); act('sheetKapat')
    rehber('Yola çık'); usta_isi_yap(); act('uTamam'); rehber('İşi kontrol edip onayla'); act('sheet', ad='puan'); act('kabulOnay')
    kontrol(S(f'bul("{acil}").durum') == 'KABUL', 'acil iş kapandı'); defter('F')

    # ---------- G) İptal, mesaj süzgeci, usta gelmedi, bölge ----------
    print('G) istisnalar')
    tem = S('S.orders.find(o => o.sid === "temizlik").id')
    act('sekme', ad='siparisler'); act('git', ad='siparis', id=tem)
    pg.fill('[data-f="mesaj"]', 'Beni 0532 111 22 33 numaradan ara'); pg.press('[data-f="mesaj"]', 'Enter')
    kontrol('paylaşılamaz' in toast() and S(f'bul("{tem}").mesajlar.length') == 1, 'telefon içeren mesaj engellendi')
    pg.fill('[data-f="mesaj"]', 'Kapı zili bozuk.'); pg.press('[data-f="mesaj"]', 'Enter'); kontrol(S(f'bul("{tem}").mesajlar.length') == 2, 'normal mesaj gitti'); cek('g01-mesaj')
    rol('ops'); act('sekme', ad='o_siparisler'); act('git', ad='o_siparis', id=tem); cek('g02-ops-siparis', True)
    pg.locator('[data-eylem="oGelmedi"]').click(); cek('g03-gelmedi-onay'); act('oGelmedi')
    kontrol(S('S.credit') > 0 and S(f'bul("{tem}").durum') == 'ATAMA' and S('ustaBul("u3").ihlal') == 1, 'usta gelmedi: kredi, ihlal, yeniden atama')
    rol('musteri'); act('sekme', ad='siparisler'); act('git', ad='siparis', id=tem)
    act('sheet', ad='iptal'); cek('g04-iptal'); act('iptalOnay'); kontrol(S(f'bul("{tem}").durum') == 'IPTAL', 'sipariş iptal edildi')
    pg.click('.baglam'); cek('g05-konum'); pg.locator('[data-act="konumSec"][data-il="Artvin"]').click()
    act('sekme', ad='ana'); act('git', ad='kategori', kat='tamir'); cek('g06-kapali'); act('bekleme')
    kontrol(S('S.waitlist.filter(w => w.ben).length') == 1 and 'Bekleme listesindesin' in metin(), 'bekleme listesine yazıldı')
    rol('ops'); act('sekme', ad='o_ag'); act('sec', k='sek', v='bolgeler'); cek('g07-ops-bolgeler')
    pg.locator('[data-act="oKapsam"][data-il="Artvin"][data-kat="tamir"]').click(); kontrol(S('acikMi("Artvin", "Merkez", "tamir")'), 'ilçe-kategori açıldı')
    act('sekme', ad='o_defter'); defter('G')

    # ---------- H) Kalıcılık ve sıfırlama ----------
    print('H) kalıcılık')
    n = S('S.orders.length'); pg.reload(); pg.wait_for_selector('#icerik')
    kontrol(S('S.orders.length') == n and S('S.rol') == 'ops', 'yenileme sonrası durum korunuyor')
    rol('musteri'); act('sekme', ad='hesap'); pg.locator('[data-eylem="sifirla"]').click(); act('sifirla')
    kontrol(S('S.orders.length') == 5 and S('S.credit') == 0, 'örnek veri sıfırlandı')
    b.close()

print('\n'.join(hatalar) if hatalar else 'konsol temiz')
print(f"{sonuc['gecen']} kontrol geçti" + (f", {sonuc['kalan']} HATA" if sonuc['kalan'] else ''))
sys.exit(1 if sonuc['kalan'] or hatalar else 0)
