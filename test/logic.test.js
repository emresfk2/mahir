// İş kurallarını tarayıcı olmadan sınar: node test/logic.test.js
const fs = require('fs'), path = require('path');
const kok = path.join(__dirname, '..', 'src');
const kaynak = fs.readFileSync(path.join(kok, 'data.js'), 'utf8') + '\n' + fs.readFileSync(path.join(kok, 'logic.js'), 'utf8');

const govde = `
let gecen = 0, kalan = 0;
function esit(a, b, ad) { if (JSON.stringify(a) === JSON.stringify(b)) gecen++; else { kalan++; console.log('  ✗ ' + ad + ': beklenen ' + JSON.stringify(b) + ', gelen ' + JSON.stringify(a)); } }
function dogru(a, ad) { esit(!!a, true, ad); }
function defterKontrol(ad) {
  let bozuk = 0; S.ledger.forEach(k => { if (k.lines.reduce((t, l) => t + l.t, 0) !== 0) bozuk++; });
  esit(bozuk, 0, ad + ': her kayıt sıfır toplamlı');
  const b = bakiye(); esit(Object.values(b).reduce((t, x) => t + x, 0), 0, ad + ': genel toplam sıfır');
  esit(b.bloke || 0, S.orders.reduce((t, o) => t + blokede(o), 0), ad + ': bloke hesabı siparişlerle tutarlı');
  S.orders.forEach(o => { if (blokede(o) < 0) { kalan++; console.log('  ✗ ' + ad + ': ' + o.code + ' blokede eksi ' + blokede(o)); } });
  S.orders.forEach(o => { if (kapaliMi(o) && blokede(o) !== 0) { kalan++; console.log('  ✗ ' + ad + ': kapalı ' + o.code + ' blokede ' + blokede(o) + ' (' + o.durum + ')'); } });
}
function basla() { S = bosDurum(); _simdi = new Date(2026, 10, 18, 10, 0, 0).getTime(); }   // Çarşamba 10:00
function ileri(ms) { _simdi += ms; }
function standartIs(sid, opts, saatSonra) {
  const o = siparisOlustur({ sid, opts: opts || { adet: 1 }, slotTs: _simdi + (saatSonra || 5) * SAAT, adres: 'Test' });
  ustaKabul(o); yolaCik(o); giris(o, o.kod); return o;
}

// 1) Paylaşım: 3.000 TL yalnız işçilik
basla();
let b = bol({ iscilik: 3000, malzeme: 0, yol: 0, fark: 0 }, ustaBul('u2'));
esit([b.kdv, b.H, b.fon, b.odeme, b.gelir, b.teminat], [500, 2000, 50, 75, 375, 200], 'paylaşım 3000');
b = bol({ iscilik: 3000, malzeme: 0, yol: 0, fark: 0 }, ustaBul('u1'));
esit(b.teminat, 100, 'uzman teminatı %5');
b = bol({ iscilik: 1200, malzeme: 1200, yol: 240, fark: 0 }, ustaBul('u2'));
esit([b.H, b.M], [1000, 920], 'yol bedeli tamamen ustaya, malzemenin %92’si tedarikçiye');

// 2) Standart iş: yakın randevu, hemen tahsilat
basla();
let o = siparisOlustur({ sid: 'avize', opts: { adet: 1 }, slotTs: _simdi + 5 * SAAT, adres: 'Test' });
esit(o.paid, o.fiyat.toplam, 'yakın randevuda tahsilat hemen');
esit(o.durum, 'ATAMA', 'atama bekliyor'); dogru(o.offer && o.offer.ustaId === 'u2', 'ilk aday Serkan D.');
ustaKabul(o); esit(o.durum, 'PLANLANDI', 'planlandı');
yolaCik(o); esit(o.durum, 'YOLDA', 'yolda');
esit(giris(o, '0000' === o.kod ? '1111' : '0000'), false, 'yanlış kod reddedilir');
esit(giris(o, o.kod), true, 'doğru kod'); esit(o.durum, 'BASLADI', 'başladı');
tamamla(o); esit(o.durum, 'TESLIM', 'teslim');
kabul(o, { puan: 5 }); esit(o.durum, 'KABUL', 'kabul'); esit(blokede(o), 0, 'blokede kalmaz'); esit(o.rel, o.paid, 'tamamı serbest');
esit(o.hakedis.length, 1, 'hakediş oluştu'); dogru(o.teminat > 0, 'teminat tutuldu');
defterKontrol('standart');

// 3) Uzak randevu: çekim 24 saat önce; ücretsiz iptal
basla();
o = siparisOlustur({ sid: 'avize', opts: { adet: 1 }, slotTs: _simdi + 72 * SAAT, adres: 'Test' });
esit(o.paid, 0, 'uzak randevuda çekim yok'); dogru(o.vade, 'vade var');
let h = iptalHesap(o); esit([h.izin, h.kesinti, h.iade], [true, 0, 0], 'çekim yokken ücretsiz iptal');
ileri(49 * SAAT); saatKontrol(); esit(o.paid, o.fiyat.toplam, '24 saat kala çekildi');
ustaKabul(o);
h = iptalHesap(o); esit(h.kesinti, yuvarla(o.fiyat.toplam * 0.1), 'son 24 saatte %10 kesinti');
yolaCik(o); h = iptalHesap(o); esit(h.kesinti, 350, 'usta yoldayken yol bedeli');
iptalEt(o); esit(o.durum, 'IPTAL', 'iptal'); esit(o.refunded, o.paid - 350, 'kalan iade');
defterKontrol('iptal');
basla();
o = siparisOlustur({ sid: 'avize', opts: { adet: 1 }, slotTs: _simdi + 72 * SAAT, adres: 'Test' }); ustaKabul(o);
yolaCik(o); esit(o.paid, o.fiyat.toplam, 'yola çıkarken çekim (demo kısayolu)');
basla();
o = siparisOlustur({ sid: 'avize', opts: { adet: 1 }, slotTs: _simdi + 30 * SAAT, adres: 'Test' }); ustaKabul(o);
ileri(7 * SAAT); saatKontrol(); h = iptalHesap(o); esit([h.kesinti, h.iade], [yuvarla(o.fiyat.toplam * 0.1), o.paid - yuvarla(o.fiyat.toplam * 0.1)], '%10 rezervasyon bedeli');
iptalEt(o); defterKontrol('rezervasyon');

// 4) Acil iş: tavan fiyat ve iş bitiminde tahsilat
basla();
o = siparisOlustur({ sid: 'acil-su', adres: 'Test' }); esit(o.paid, 0, 'acil işte ön tahsilat yok');
h = iptalHesap(o); esit(h.iade, 0, 'acil ücretsiz iptal');
ustaKabul(o); yolaCik(o); giris(o, o.kod);
esit(ekIsTalep(o, { ad: 'Boru değişimi', tutar: 5000 }).ok, false, 'tavan aşılamaz');
let r = ekIsTalep(o, { ad: 'Boru değişimi', tutar: 2000 }); esit([r.ok, r.uzman], [true, false], 'tavan içinde ek iş');
ekIsKarar(o, o.extras[0].id, true); esit(o.paid, 0, 'acil ek işte de tahsilat sonda');
tamamla(o); esit(o.paid, 2950, 'iş bitiminde tahsilat'); kabul(o); defterKontrol('acil');
basla();
o = siparisOlustur({ sid: 'acil-su', adres: 'Test' }); ustaKabul(o); yolaCik(o);
h = iptalEt(o); esit([o.paid, o.refunded, o.rel], [350, 0, 350], 'acil yolda iptal: yol bedeli çekilir'); defterKontrol('acil iptal');

// 5) Ek iş %20 eşiği
basla();
o = standartIs('klima');
r = ekIsTalep(o, { ad: 'Gaz dolumu', tutar: Math.round(o.ilkToplam * 0.5) }); esit(r.uzman, true, '%20 üstü uzmana gider');
ekIsUzman(o, o.extras[0].id, true); esit(o.extras[0].durum, 'bekliyor', 'uzman onayı sonrası müşteriye');
const once = o.paid; ekIsKarar(o, o.extras[0].id, true); esit(o.paid, once + o.extras[0].tutar, 'ek iş tahsil edildi');
r = ekIsTalep(o, { ad: 'Küçük parça', tutar: 100 }); esit(r.uzman, true, 'eşik aşıldıktan sonra her ek iş uzmana'); ekIsUzman(o, o.extras[1].id, true); ekIsKarar(o, o.extras[1].id, false); esit(o.extras[1].durum, 'ret', 'müşteri reddi');
tamamla(o); kabul(o); defterKontrol('ek iş');

// 6) Keşifli proje: %30/%40/%30
basla();
o = talepOlustur({ sid: 'boya', opts: { m2: 180 }, kesif: 'yerinde', adres: 'Test' });
esit(o.paid, 600, 'yerinde keşif bedeli'); teklifGonder(o, { m2: 176 });
esit(o.stages.map(s => s.pct), [30, 40, 30], 'aşama yüzdeleri'); esit(o.stages.reduce((t, s) => t + s.tutar, 0), o.fiyat.toplam, 'aşamalar toplamı');
h = iptalHesap(o); esit([h.kesinti, h.iade], [600, 0], 'keşif yapıldıysa keşif bedeli kalır');
teklifOnayla(o); esit(o.paid, o.stages[0].tutar, 'keşif bedeli ilk aşamadan düşüldü');
ustaKabul(o); h = iptalHesap(o); esit(h.kesinti, 600, 'iş başlamadan iptal: keşif hariç iade');
yolaCik(o); giris(o, o.kod);
asamaTamam(o); esit(o.durum, 'ASAMA_ONAY', 'aşama onayı'); asamaOnay(o); esit(o.rel, o.stages[0].tutar, 'ilk aşama serbest');
esit(o.paid, o.stages[0].tutar + o.stages[1].tutar, 'ikinci aşama tahsil'); esit(o.durum, 'BASLADI', 'devam');
asamaTamam(o);
let d = sikayetAc(o, { tur: 'kusur', aciklama: 'Dalga var', talep: 'indirim', tutar: 9000 }); esit(o.durum, 'UYUSMAZLIK', 'aşamada şikâyet');
kararUygula(d, { sonuc: 'indirim', tutar: 9000, yuk: 'usta' }); esit(o.durum, 'BASLADI', 'indirim sonrası sonraki aşama');
esit(blokede(o), o.stages[2].tutar, 'blokede yalnız son aşama');
asamaTamam(o); esit(o.durum, 'TESLIM', 'son aşama teslim'); kabul(o); esit(blokede(o), 0, 'proje kapandı');
esit(o.rel + o.refunded, o.paid, 'proje: serbest + iade = ödenen'); defterKontrol('proje');
// aşamada düzeltme
basla();
o = talepOlustur({ sid: 'parke', opts: { m2: 40 }, kesif: 'video', adres: 'Test' }); teklifGonder(o); teklifOnayla(o); ustaKabul(o); yolaCik(o); giris(o, o.kod);
asamaTamam(o); d = sikayetAc(o, { tur: 'kusur', aciklama: 'Zemin terazide değil', talep: 'duzeltme' }); kararUygula(d, { sonuc: 'duzeltme', yuk: 'usta' });
esit([o.durum, o.stages[0].done], ['PLANLANDI', false], 'aşama yeniden yapılacak'); yolaCik(o); giris(o, o.kod); asamaTamam(o);
esit(o.durum, 'ASAMA_ONAY', 'aynı aşama yeniden onaya'); asamaOnay(o); esit(d.durum, 'KAPANDI', 'şikâyet kapandı');
asamaTamam(o); asamaOnay(o); asamaTamam(o); kabul(o); defterKontrol('proje düzeltme');

// 7) Ismarlama mobilya: %40/%40/%20, onaydan sonra cayma yok
basla();
o = talepOlustur({ sid: 'gardirop', opts: { en: 240, boy: 240, derinlik: 60, malzeme: 'lake', kapak: 'surgulu', numune: 'L-104' }, kesif: 'yerinde', adres: 'Test' });
h = iptalHesap(o); esit([h.kesinti, h.iade], [0, 600], 'ölçü alınmadan iptal: tam iade');
teklifGonder(o, { en: 236 }); esit(o.stages.map(s => s.pct), [40, 40, 20], 'mobilya yüzdeleri');
teklifOnayla(o); esit(iptalHesap(o).izin, false, 'üretim onayından sonra cayma yok');
esit(o.offer.ustaId, 'u8', 'atölyeye teklif'); ustaKabul(o); esit(o.durum, 'URETIM', 'üretim');
uretimTamam(o); esit(o.durum, 'SEVK_ODEME', 'sevk ödemesi'); sevkOde(o); sevkEt(o); esit(o.durum, 'MONTAJ', 'montaj');
yolaCik(o); esit(giris(o, o.kod), true, 'montaj girişi'); tamamla(o);
esit(o.paid, o.stages[0].tutar + o.stages[1].tutar, 'kabulden önce %80'); kabul(o); esit(o.paid, o.fiyat.toplam, 'kabulde son %20');
esit(blokede(o), 0, 'mobilya kapandı'); dogru(o.garantiBitis > _simdi + 700 * GUN, '24 ay garanti'); defterKontrol('mobilya');

// 8) Şikâyetler
basla();
o = standartIs('klima'); tamamla(o);
d = sikayetAc(o, { tur: 'hasar', aciklama: 'Duvar çizildi', talep: 'indirim', tutar: 150 });
esit([d.oto, d.durum, o.durum, o.refunded], [true, 'KAPANDI', 'KABUL', 150], 'küçük tutar incelemesiz');
dogru(o.hakedis[0].tutar + o.teminat === bol({ iscilik: o.fiyat.iscilik, malzeme: 0, yol: 0, fark: o.fiyat.fark }, ustaBul(o.ustaId)).H, 'platform üstlenince usta payı eksilmez');
defterKontrol('küçük tutar');
basla();
o = standartIs('temizlik', { secenek: '2+1' }); tamamla(o);
d = sikayetAc(o, { tur: 'begenmeme', aciklama: 'Camlar lekeli', talep: 'duzeltme' });
esit([d.oto, d.durum, o.durum, o.duzeltme], [true, 'DUZELTME', 'PLANLANDI', true], 'memnuniyet güvencesi: ücretsiz tekrar');
yolaCik(o); giris(o, o.kod); tamamla(o);
d = sikayetAc(o, { tur: 'begenmeme', aciklama: 'Yine olmadı', talep: 'duzeltme' });
esit([d.oto, o.durum, o.refunded], [true, 'KABUL', o.fiyat.iscilik + o.fiyat.fark], 'ikinci kez: işçilik iadesi');
dogru(o.hakedis.reduce((t, x) => t + x.tutar, 0) + o.teminat > 0, 'usta yine de hakedişini alır');
defterKontrol('memnuniyet');
basla();
o = standartIs('musluk'); tamamla(o);
d = sikayetAc(o, { tur: 'kusur', aciklama: 'Su damlatıyor', talep: 'duzeltme' }); esit([d.oto, o.durum], [false, 'UYUSMAZLIK'], 'kusur incelemeye gider');
esit(adimBul(o).rol, 'usta', 'önce usta yanıtı'); savunmaYaz(d, 'Düzeltirim'); esit(adimBul(o).rol, 'ops', 'sonra karar');
kararUygula(d, { sonuc: 'duzeltme', yuk: 'usta', baskaUsta: true }); esit(o.durum, 'ATAMA', 'başka usta atanıyor'); dogru(o.offer && o.offer.ustaId !== d.ustaId, 'farklı usta');
ustaKabul(o); yolaCik(o); giris(o, o.kod); tamamla(o); kabul(o); esit(d.durum, 'KAPANDI', 'düzeltme sonrası kapandı'); defterKontrol('düzeltme');
// kabulden sonra tam iade, usta kusuru
basla();
o = standartIs('klima'); tamamla(o); kabul(o);
const Hilk = o.hakedis[0].tutar + o.teminat;
d = sikayetAc(o, { tur: 'ariza', aciklama: 'Bozuldu', talep: 'duzeltme' }); esit(o.durum, 'KABUL', 'kabul sonrası şikâyette durum değişmez');
ileri(5 * GUN); saatKontrol(); esit(o.hakedis[0].odendi, false, 'açık şikâyet varken hakediş ödenmez');
kararUygula(d, { sonuc: 'iade', yuk: 'usta' }); esit([o.durum, o.refunded], ['IADE', o.paid], 'tam iade');
esit(o.hakedis[0].tutar + o.teminat, 0, 'usta payı geri alındı'); dogru((bakiye().fon || 0) < 0, 'ustayı aşan kısım fondan');
defterKontrol('kabul sonrası iade');
// hakediş ödendikten sonra rücu
basla();
o = standartIs('klima'); tamamla(o); kabul(o); ileri(5 * GUN); saatKontrol(); esit(o.hakedis[0].odendi, true, 'hakediş 2 iş günü sonra ödendi');
d = sikayetAc(o, { tur: 'kusur', aciklama: 'Kötü', talep: 'iade' }); kararUygula(d, { sonuc: 'iade', yuk: 'usta' });
esit(o.rucu, o.hakedis[0].tutar, 'ödenmiş hakediş kadar rücu'); defterKontrol('rücu');
// güvenlik
basla();
o = standartIs('klima');
d = sikayetAc(o, { tur: 'guvenlik', aciklama: 'Tehdit', talep: 'iade' });
esit([o.durum, o.refunded, ustaBul(d.ustaId).aski], ['IADE', o.paid, true], 'güvenlik: iade ve askı'); esit(o.hakedis.length, 0, 'ustaya ödeme yok'); defterKontrol('güvenlik');
// ret
basla();
o = standartIs('klima'); tamamla(o); d = sikayetAc(o, { tur: 'kusur', aciklama: 'x', talep: 'iade' }); kararUygula(d, { sonuc: 'ret', yuk: 'usta' });
esit([o.durum, blokede(o)], ['KABUL', 0], 'ret sonrası kabul'); defterKontrol('ret');

// 8b) Henüz çekilmemiş siparişte indirim; başlamış işte iptal yok
basla();
o = siparisOlustur({ sid: 'avize', opts: { adet: 1 }, slotTs: _simdi + 72 * SAAT, adres: 'Test' }); ustaKabul(o);
const ilkToplam = o.fiyat.toplam;
d = sikayetAc(o, { tur: 'gecikme', aciklama: 'Randevu ertelendi', talep: 'indirim', tutar: 60 });
esit([d.oto, o.fiyat.toplam, o.paid, o.refunded, o.durum], [true, ilkToplam - 60, 0, 0, 'PLANLANDI'], 'çekilmemiş siparişte indirim çekilecek tutarı küçültür');
yolaCik(o); esit(o.paid, ilkToplam - 60, 'indirimli tutar çekildi'); giris(o, o.kod);
esit(iptalHesap(o).izin, false, 'iş başlayınca iptal yok'); tamamla(o); kabul(o);
dogru(o.hakedis[0].tutar + o.teminat === bol({ iscilik: ilkToplam, malzeme: 0, yol: 0, fark: 0 }, ustaBul(o.ustaId)).H, 'platform indirimi ustanın payını azaltmaz'); defterKontrol('çekilmemiş indirim');
basla();
o = standartIs('klima'); tamamla(o); d = sikayetAc(o, { tur: 'begenmeme', aciklama: 'olmadı', talep: 'duzeltme' });
esit([o.durum, iptalHesap(o).izin], ['PLANLANDI', false], 'düzeltme ziyareti iptal edilemez');
basla();
o = siparisOlustur({ sid: 'acil-su', adres: 'Test' }); ustaKabul(o); yolaCik(o); giris(o, o.kod);
d = sikayetAc(o, { tur: 'hasar', aciklama: 'Fayans kırıldı', talep: 'indirim', tutar: 90 }); esit([d.oto, o.fiyat.toplam], [true, 860], 'acil işte indirim tahsilattan düşer');
tamamla(o); esit(o.paid, 860, 'indirimli tahsilat'); kabul(o); defterKontrol('acil indirim');

// 9) Usta gelmedi, otomatik kabul, mesaj süzgeci
basla();
o = siparisOlustur({ sid: 'avize', opts: { adet: 1 }, slotTs: _simdi + 5 * SAAT, adres: 'Test' }); ustaKabul(o);
const kr = gelmedi(o); esit([S.credit, o.durum, ustaBul('u2').ihlal], [kr, 'ATAMA', 1], 'gelmedi: kredi ve yeniden atama'); dogru(o.offer.ustaId === 'u10', 'yedek usta');
const o2 = siparisOlustur({ sid: 'priz', opts: { adet: 1 }, slotTs: _simdi + 5 * SAAT, adres: 'Test' }); esit(S.credit, 0, 'kredi sonraki ödemede kullanıldı');
ustaKabul(o); yolaCik(o); giris(o, o.kod); tamamla(o); ileri(49 * SAAT); saatKontrol(); esit([o.durum, o.otoKabul], ['KABUL', true], '48 saat sonra otomatik kabul');
defterKontrol('gelmedi');
esit(mesajGonder(o, 'usta', 'Beni 0532 111 22 33 ara').ok, false, 'telefon engellenir');
esit(mesajGonder(o, 'usta', 'Elden verirsen indirim yaparım').ok, false, 'elden ödeme engellenir');
esit(mesajGonder(o, 'usta', '10 dakika gecikeceğim.').ok, true, 'normal mesaj geçer');

// 10) Örnek veri
_simdi = null; tohumla(new Date(2026, 10, 19, 14, 30).getTime());
esit(S.orders.length, 5, 'beş örnek sipariş'); esit(S.orders.map(x => x.durum), ['ATAMA', 'UYUSMAZLIK', 'BASLADI', 'PLANLANDI', 'KABUL'], 'örnek durumlar');
const a = sonrakiAdim(); esit([a.rol, a.usta], ['usta', 'u2'], 'ilk rehber adımı ustada');
defterKontrol('örnek veri');
S.orders.forEach(x => { if (!kapaliMi(x)) dogru(adimBul(x), x.code + ' için sıradaki adım var'); });
[0, 3, 9, 13, 23].forEach(saat => { tohumla(new Date(2026, 10, 21, saat, 10).getTime()); defterKontrol('örnek veri ' + saat + ':10'); });

console.log(kalan ? '\\n' + kalan + ' HATA, ' + gecen + ' geçti' : gecen + ' kontrol geçti');
if (kalan) process.exitCode = 1;
`;
new Function(kaynak + govde)();
