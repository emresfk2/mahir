# Mahir Web Uygulaması

Usta ve ev hizmetlerinde müşterinin yalnızca platformla muhatap olduğu modelin web uygulaması.
Tek dosyalık, sunucusuz bir ön yüzdür: `dist/index.html` dosyasını tarayıcıda açmak yeterli.
Ödemeler benzetimdir, veriler örnektir ve yalnızca tarayıcıda (localStorage) saklanır.

## Roller

Üstteki DEMO çubuğundan geçilir; adres çubuğunda `#musteri`, `#usta`, `#operasyon` olarak görünür.

- **Müşteri:** katalog, sipariş ve keşif talebi, ödeme onayı, kapı kodu, aşama ve iş kabulü, sorun bildirme, iptal.
- **Usta:** iş teklifleri, yola çıkma, kapı koduyla giriş, kontrol listesi ve fotoğraf, ek iş talebi, şikâyete yanıt, kazanç.
- **Operasyon:** teklif hazırlama, atama, şikâyet kararı, usta ve bölge yönetimi, çift taraflı defter.

"Sıradaki adım" çubuğu, akışın kimde beklediğini gösterir ve dokununca o rolün ekranına götürür.

## Dosyalar

| Dosya | İçerik |
| --- | --- |
| `src/data.js` | Katalog, bölgeler, ustalar, şikâyet türleri, durum adları (hepsi örnek veri) |
| `src/logic.js` | İş kuralları: fiyatlama, sipariş durum makinesi, bloke ödeme defteri, iptal, şikâyet kararları. Arayüzden bağımsızdır |
| `src/ui.js` | Çatı, gezinme, ortak parçalar, olay dinleyiciler |
| `src/views-*.js` | Müşteri, usta ve operasyon ekranları |
| `src/styles.css` | Açık ve koyu tema, telefon öncelikli yerleşim |
| `build.py` | Kaynakları ve logoyu `dist/index.html` içinde birleştirir |
| `brand/` | Logo dosyaları ve onları üreten `make_logo.py` |
| `test/logic.test.js` | İş kuralı sınamaları (Node) |
| `test/e2e.py` | Tarayıcıda uçtan uca akışlar (Playwright + Chrome) |

## Çalıştırma

```
python3 build.py            # dist/index.html üretir (fontTools gerekir)
node test/logic.test.js     # iş kuralları
python3 test/e2e.py         # uçtan uca akışlar
```

## Oranlar ve eşikler

Hepsi `src/logic.js` başındaki `ORAN` nesnesindedir: KDV %20, usta payı (işçiliğin %80'i), malzemede tedarikçi payı %92,
garanti fonu %2, ödeme komisyonu %2,5, teminat %10 (Uzman %5), mesai dışı farkı %15, ek iş eşiği %20,
rezervasyon bedeli %10, küçük tutar kuralı (%10 ve en çok 1.500 TL), keşif bedeli 600 TL, yol bedeli 350 TL.
Katalog fiyatları ve bölge katsayıları `src/data.js` içindedir; hepsi örnektir.

## Gerçek ürüne giderken

- `logic.js` içindeki işlevler (ör. `siparisOlustur`, `teklifOnayla`, `giris`, `kabul`, `sikayetAc`, `kararUygula`, `iptalEt`)
  sunucu tarafına taşınır; arayüz bunları API çağrısı olarak kullanır. Kurallar istemcide kalmamalıdır.
- `tahsil`, `serbest`, `iadeOnce`, `iadeSonra` gerçek bir ödeme kuruluşunun bloke, aktarım ve iade çağrılarına bağlanır.
- Kimlik doğrulama, SMS ve bildirim, fotoğraf depolama, kayıt tutma ve yetkilendirme bu prototipte yoktur.
- Sözleşme ve ön bilgilendirme metinleri, iptal kesintileri ve cayma istisnaları hukuk danışmanıyla kesinleştirilmelidir.
