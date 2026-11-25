/* ===== Mahir · sabit veriler (katalog, bölgeler, ustalar) =====
   Fiyatlar örnektir ve KDV dahildir. Gerçek katalog operasyon panelinden yönetilir. */

const MARKA = { ad: 'Mahir', slogan: 'Evin mahir ellerde.' };

const KATEGORILER = [
  { id: 'tamir',   ad: 'Tamir ve bakım',     ikon: 'wrench',  acik: 'Tesisat, elektrik, montaj' },
  { id: 'ev',      ad: 'Ev hizmetleri',      ikon: 'sparkle', acik: 'Temizlik ve yıkama' },
  { id: 'tadilat', ad: 'Tadilat',            ikon: 'roller',  acik: 'Boya, parke, banyo' },
  { id: 'mobilya', ad: 'Ismarlama mobilya',  ikon: 'cabinet', acik: 'Gardırop, mutfak, TV ünitesi' },
  { id: 'acil',    ad: 'Acil',               ikon: 'bolt',    acik: '60 dakikada usta' },
];

const TIP_AD = { standart: 'Sabit fiyat', acil: 'Acil iş', proje: 'Keşifli proje', mobilya: 'Ismarlama ürün' };

const HIZMETLER = [
  /* --- Tamir ve bakım: standart iş --- */
  { id: 'musluk', kat: 'tamir', tip: 'standart', meslek: 'tesisat', ikon: 'drop',
    ad: 'Musluk ve batarya değişimi', kisa: 'Eski bataryayı söker, yenisini takar, sızdırmazlığı test eder.',
    sure: '45 dk', garantiAy: 6, birim: 'adet', iscilik: 950, maxAdet: 4,
    malzeme: { ad: 'Lavabo bataryası (krom)', fiyat: 1450 },
    dahil: ['Söküm ve montaj', 'Flex hortum ve conta', 'Sızdırmazlık testi'],
    kontrol: ['Ana vana kapatıldı', 'Eski batarya söküldü', 'Yeni batarya ve flexler takıldı', 'Sızdırmazlık 5 dakika test edildi', 'Çalışma alanı temizlendi'] },
  { id: 'sifon', kat: 'tamir', tip: 'standart', meslek: 'tesisat', ikon: 'drop',
    ad: 'Tıkanıklık açma ve sifon değişimi', kisa: 'Lavabo ya da evye giderini açar, gerekiyorsa sifonu yeniler.',
    sure: '60 dk', garantiAy: 6, birim: 'adet', iscilik: 1100, maxAdet: 3,
    malzeme: { ad: 'Sifon takımı', fiyat: 380 },
    dahil: ['Gider açma', 'Sifon söküm ve montaj', 'Akış testi'],
    kontrol: ['Gider açıldı', 'Sifon bağlantıları sıkıldı', 'Akış ve sızdırmazlık test edildi', 'Çalışma alanı temizlendi'] },
  { id: 'avize', kat: 'tamir', tip: 'standart', meslek: 'elektrik', ikon: 'lamp',
    ad: 'Avize ve aydınlatma montajı', kisa: 'Avizeyi tavana sabitler, bağlantısını yapar ve dener.',
    sure: '40 dk', garantiAy: 6, birim: 'adet', iscilik: 850, maxAdet: 6,
    dahil: ['Tavan bağlantısı', 'Klemens ve dübel', 'Çalışma testi'],
    kontrol: ['Sigorta kapatıldı', 'Tavan dübeli ve askı takıldı', 'Elektrik bağlantısı yapıldı', 'Avize çalıştırılıp denendi', 'Çalışma alanı temizlendi'] },
  { id: 'priz', kat: 'tamir', tip: 'standart', meslek: 'elektrik', ikon: 'plug',
    ad: 'Priz ve anahtar değişimi', kisa: 'Eski priz ya da anahtarı söker, yenisini takar.',
    sure: '20 dk / adet', garantiAy: 6, birim: 'adet', iscilik: 420, maxAdet: 10,
    malzeme: { ad: 'Topraklı priz ya da anahtar (beyaz)', fiyat: 260 },
    dahil: ['Söküm ve montaj', 'Topraklama kontrolü'],
    kontrol: ['Sigorta kapatıldı', 'Eski priz söküldü', 'Yeni priz takıldı', 'Topraklama ve gerilim ölçüldü'] },
  { id: 'klima', kat: 'tamir', tip: 'standart', meslek: 'iklim', ikon: 'snow',
    ad: 'Klima bakımı ve temizliği', kisa: 'İç ve dış üniteyi temizler, gaz basıncını ve drenajı kontrol eder.',
    sure: '60 dk', garantiAy: 6, birim: 'cihaz', iscilik: 1650, maxAdet: 4,
    dahil: ['İç ünite filtre ve petek temizliği', 'Dış ünite temizliği', 'Gaz basıncı ve drenaj kontrolü'],
    kontrol: ['Filtreler yıkandı', 'Petekler ilaçlandı', 'Drenaj hattı açıldı', 'Gaz basıncı ölçüldü', 'Cihaz çalıştırılıp denendi'] },
  { id: 'montaj', kat: 'tamir', tip: 'standart', meslek: 'montaj', ikon: 'box',
    ad: 'Mobilya kurulumu', kisa: 'Demonte gelen dolap, yatak ya da masayı kurar ve sabitler.',
    sure: '90 dk / parça', garantiAy: 6, birim: 'parça', iscilik: 1200, maxAdet: 5,
    dahil: ['Kurulum', 'Duvara sabitleme', 'Ambalajın toplanması'],
    kontrol: ['Parçalar sayıldı', 'Kurulum tamamlandı', 'Kapak ve çekmeceler ayarlandı', 'Duvara sabitlendi', 'Ambalaj toplandı'] },
  { id: 'tv', kat: 'tamir', tip: 'standart', meslek: 'montaj', ikon: 'tv',
    ad: 'TV duvar montajı', kisa: 'Askı aparatını duvara sabitler, televizyonu asar ve terazisini alır.',
    sure: '45 dk', garantiAy: 6, birim: 'adet', iscilik: 900, maxAdet: 3,
    malzeme: { ad: 'Sabit askı aparatı', fiyat: 650 },
    dahil: ['Delme ve dübelleme', 'Terazi ayarı', 'Kablo düzeni'],
    kontrol: ['Duvar tipi kontrol edildi', 'Aparat teraziyle sabitlendi', 'TV asıldı ve kilitlendi', 'Kablolar düzenlendi'] },

  /* --- Ev hizmetleri: standart iş --- */
  { id: 'temizlik', kat: 'ev', tip: 'standart', meslek: 'temizlik', ikon: 'sparkle',
    ad: 'Ev temizliği', kisa: 'Mutfak, banyo ve odaların genel temizliği; malzemeyi ekip getirir.',
    sure: '4–6 saat', garantiAy: 0, birim: 'ev',
    secenekler: [ { id: '1+1', ad: '1+1', iscilik: 2400 }, { id: '2+1', ad: '2+1', iscilik: 2900 }, { id: '3+1', ad: '3+1', iscilik: 3400 }, { id: '4+1', ad: '4+1 ve üzeri', iscilik: 4100 } ],
    dahil: ['Toz alma ve süpürme', 'Mutfak ve banyo', 'Zemin silme', 'Temizlik malzemesi'],
    kontrol: ['Odalar süpürüldü ve silindi', 'Mutfak tezgâhı ve ocak temizlendi', 'Banyo ve tuvalet temizlendi', 'Çöpler çıkarıldı'] },
  { id: 'koltuk', kat: 'ev', tip: 'standart', meslek: 'temizlik', ikon: 'sofa',
    ad: 'Koltuk yıkama', kisa: 'Yerinde vakumlu yıkama; 6–8 saatte kurur.',
    sure: '2 saat', garantiAy: 0, birim: 'takım',
    secenekler: [ { id: 'uclu', ad: 'Üçlü koltuk', iscilik: 1100 }, { id: 'kose', ad: 'Köşe takımı', iscilik: 1900 }, { id: 'takim', ad: 'Koltuk takımı (3+2+1)', iscilik: 2100 } ],
    dahil: ['Leke ön işlemi', 'Vakumlu yıkama', 'Koku giderme'],
    kontrol: ['Leke ön işlemi yapıldı', 'Tüm yüzeyler yıkandı', 'Fazla su vakumlandı'] },

  /* --- Acil iş --- */
  { id: 'acil-su', kat: 'acil', tip: 'acil', meslek: 'tesisat', ikon: 'drop',
    ad: 'Su kaçağı', kisa: 'Tesisatçı 60 dakika içinde kapında.', sure: '60 dk içinde', garantiAy: 6, tani: 950, tavan: 4500,
    dahil: ['Kaçağın bulunması', 'İlk 30 dakikalık müdahale'],
    kontrol: ['Ana vana kapatıldı', 'Kaçak noktası bulundu', 'Onarım yapıldı', 'Sızdırmazlık test edildi'] },
  { id: 'acil-elektrik', kat: 'acil', tip: 'acil', meslek: 'elektrik', ikon: 'plug',
    ad: 'Elektrik arızası', kisa: 'Elektrikçi 60 dakika içinde kapında.', sure: '60 dk içinde', garantiAy: 6, tani: 950, tavan: 3500,
    dahil: ['Arızanın bulunması', 'İlk 30 dakikalık müdahale'],
    kontrol: ['Pano ve sigortalar kontrol edildi', 'Arıza noktası bulundu', 'Onarım yapıldı', 'Hat ölçülüp denendi'] },
  { id: 'acil-kilit', kat: 'acil', tip: 'acil', meslek: 'cilingir', ikon: 'key',
    ad: 'Kapıda kaldım', kisa: 'Çilingir 60 dakika içinde kapında.', sure: '60 dk içinde', garantiAy: 0, tani: 1250, tavan: 3000,
    dahil: ['Kapının hasarsız açılması'],
    kontrol: ['Kimlik ve adres doğrulandı', 'Kapı açıldı', 'Kilit çalışması denendi'] },

  /* --- Tadilat: keşifli proje --- */
  { id: 'boya', kat: 'tadilat', tip: 'proje', meslek: 'tadilat', ikon: 'roller',
    ad: 'İç cephe boya', kisa: 'Macun tamiri, astar ve iki kat boya. Eşya koruması ve temizlik dahil.',
    sure: '2–4 gün', garantiAy: 12,
    soru: { ad: 'Boyanacak duvar alanı', birim: 'm²', varsayilan: 180, min: 30, max: 600, ipucu: '2+1 bir evde yaklaşık 180 m² duvar olur.' },
    kalemler: [ { ad: 'Hazırlık, macun ve astar', birim: 'm²', iscilik: 55, malzeme: 22 }, { ad: 'İki kat boya uygulaması', birim: 'm²', iscilik: 110, malzeme: 48 }, { ad: 'Koruma, temizlik ve rötuş', sabit: true, iscilik: 2500, malzeme: 900 } ],
    asamalar: ['Hazırlık ve astar', 'Boya uygulaması', 'Rötuş ve teslim'],
    dahil: ['Eşya ve zemin koruması', 'Macun ve astar', 'İki kat boya', 'İlk duvar onayı'],
    kontrol: ['Eşyalar ve zemin örtüldü', 'Çatlak ve delikler macunlandı', 'Astar atıldı', 'İlk duvar müşteriye gösterildi', 'İkinci kat tamamlandı', 'Bantlar söküldü, alan temizlendi'] },
  { id: 'parke', kat: 'tadilat', tip: 'proje', meslek: 'tadilat', ikon: 'ruler',
    ad: 'Laminat parke döşeme', kisa: 'Eski zemin sökümü, şilte, 8 mm laminat ve süpürgelik.',
    sure: '1–3 gün', garantiAy: 12,
    soru: { ad: 'Döşenecek alan', birim: 'm²', varsayilan: 60, min: 10, max: 300, ipucu: 'Odaların en ve boyunu çarpıp topla.' },
    kalemler: [ { ad: 'Eski zemin sökümü ve şilte', birim: 'm²', iscilik: 70, malzeme: 45 }, { ad: 'Laminat parke (8 mm) ve döşeme', birim: 'm²', iscilik: 210, malzeme: 520 }, { ad: 'Süpürgelik ve eşik profilleri', birim: 'm²', iscilik: 35, malzeme: 60 } ],
    asamalar: ['Söküm ve zemin hazırlığı', 'Döşeme', 'Süpürgelik ve teslim'],
    dahil: ['Söküm ve moloz', 'Şilte', 'Parke ve süpürgelik', 'Kapı altı ayarı'],
    kontrol: ['Eski zemin söküldü', 'Zemin terazisi kontrol edildi', 'Şilte serildi', 'Parke döşendi', 'Süpürgelik ve eşikler takıldı'] },
  { id: 'banyo', kat: 'tadilat', tip: 'proje', meslek: 'tadilat', ikon: 'drop',
    ad: 'Banyo yenileme', kisa: 'Söküm, tesisat, su yalıtımı, seramik ve vitrifiye. Islak hacmin yeri değişmez.',
    sure: '7–12 gün', garantiAy: 12,
    soru: { ad: 'Banyo zemin alanı', birim: 'm²', varsayilan: 5, min: 2, max: 15, ipucu: 'Standart bir banyo 4–6 m² olur.' },
    kalemler: [ { ad: 'Söküm ve moloz', sabit: true, iscilik: 9500, malzeme: 1500 }, { ad: 'Sıhhi tesisat yenileme', sabit: true, iscilik: 14000, malzeme: 9000 }, { ad: 'Su yalıtımı ve seramik', birim: 'm²', iscilik: 4200, malzeme: 5200 }, { ad: 'Vitrifiye ve armatür montajı', sabit: true, iscilik: 6500, malzeme: 28000 } ],
    asamalar: ['Söküm ve tesisat', 'Yalıtım ve seramik', 'Montaj ve teslim'],
    dahil: ['Söküm ve moloz', 'Tesisat ve basınç testi', 'Su yalıtımı', 'Seramik, vitrifiye ve armatür'],
    kontrol: ['Söküm ve moloz tamamlandı', 'Tesisat kapanmadan fotoğraflandı', 'Basınç testi yapıldı', 'Su yalıtımı 24 saat test edildi', 'Seramik ve derz tamamlandı', 'Vitrifiye ve armatür takıldı'] },

  /* --- Ismarlama mobilya --- */
  { id: 'gardirop', kat: 'mobilya', tip: 'mobilya', meslek: 'mobilya', ikon: 'cabinet',
    ad: 'Özel ölçü gardırop', kisa: 'Duvarına göre üretilir. Ölçüyü Mahir alır, atölye üretir, usta kurar.',
    sure: '3–4 hafta', garantiAy: 24, metre: 14500, kapakli: true,
    olcu: { en: [120, 400, 240], boy: [200, 280, 240], derinlik: [45, 70, 60] },
    asamalar: ['Üretim', 'Sevk', 'Montaj ve teslim'],
    dahil: ['Yerinde ölçü', 'Teknik çizim', 'Üretim ve nakliye', 'Montaj ve ayar'],
    kontrol: ['Parçalar hasarsız teslim alındı', 'Gövde teraziyle kuruldu', 'Kapak ve ray ayarı yapıldı', 'Duvara sabitlendi', 'Ambalaj toplandı'] },
  { id: 'mutfak', kat: 'mobilya', tip: 'mobilya', meslek: 'mobilya', ikon: 'cabinet',
    ad: 'Mutfak dolabı', kisa: 'Alt ve üst dolap, tezgâh hariç. Ölçü ve çizim onayından sonra üretilir.',
    sure: '4–5 hafta', garantiAy: 24, metre: 19500, kapakli: false,
    olcu: { en: [180, 600, 320], boy: [210, 260, 240], derinlik: [55, 65, 60] },
    asamalar: ['Üretim', 'Sevk', 'Montaj ve teslim'],
    dahil: ['Yerinde ölçü', 'Teknik çizim', 'Üretim ve nakliye', 'Montaj ve ayar'],
    kontrol: ['Parçalar hasarsız teslim alındı', 'Alt dolaplar teraziyle kuruldu', 'Üst dolaplar askıya alındı', 'Kapak ve çekmece ayarı yapıldı', 'Ambalaj toplandı'] },
  { id: 'tvunite', kat: 'mobilya', tip: 'mobilya', meslek: 'mobilya', ikon: 'tv',
    ad: 'TV ünitesi', kisa: 'Duvar boyunca alçak ünite; kablo kanalı ve kapaklı bölmeler.',
    sure: '2–3 hafta', garantiAy: 24, metre: 8200, kapakli: false,
    olcu: { en: [120, 360, 220], boy: [35, 90, 50], derinlik: [30, 50, 40] },
    asamalar: ['Üretim', 'Sevk', 'Montaj ve teslim'],
    dahil: ['Yerinde ölçü', 'Teknik çizim', 'Üretim ve nakliye', 'Montaj ve ayar'],
    kontrol: ['Parçalar hasarsız teslim alındı', 'Ünite teraziyle kuruldu', 'Kapak ayarı yapıldı', 'Kablo kanalı açıldı', 'Ambalaj toplandı'] },
];

const MALZEMELER = [ { id: 'lam', ad: 'MDF Lam', k: 1.00 }, { id: 'akrilik', ad: 'Akrilik', k: 1.22 }, { id: 'lake', ad: 'Lake', k: 1.38 } ];
const NUMUNELER = [
  { kod: 'L-104', ad: 'Kırık beyaz', hex: '#EDE8DC' }, { kod: 'L-212', ad: 'Kumtaşı', hex: '#C9B79C' }, { kod: 'M-330', ad: 'Meşe', hex: '#B78A52' },
  { kod: 'M-418', ad: 'Ceviz', hex: '#6B4A32' }, { kod: 'A-507', ad: 'Antrasit', hex: '#3A3F44' }, { kod: 'A-611', ad: 'Adaçayı', hex: '#8FA58E' },
];

const TUM_KAT = ['tamir', 'ev', 'tadilat', 'acil', 'mobilya'];
const BOLGELER = [
  { il: 'İstanbul', ilce: 'Kadıköy',   k: 1.15, yol: 0,   acik: TUM_KAT },
  { il: 'İstanbul', ilce: 'Üsküdar',   k: 1.10, yol: 0,   acik: TUM_KAT },
  { il: 'İstanbul', ilce: 'Beşiktaş',  k: 1.20, yol: 0,   acik: TUM_KAT },
  { il: 'İstanbul', ilce: 'Esenyurt',  k: 1.00, yol: 0,   acik: ['tamir', 'ev', 'acil', 'mobilya'] },
  { il: 'Ankara',   ilce: 'Çankaya',   k: 1.05, yol: 0,   acik: TUM_KAT },
  { il: 'Ankara',   ilce: 'Keçiören',  k: 0.95, yol: 0,   acik: ['tamir', 'ev', 'mobilya'] },
  { il: 'İzmir',    ilce: 'Karşıyaka', k: 1.05, yol: 0,   acik: TUM_KAT },
  { il: 'İzmir',    ilce: 'Bornova',   k: 1.00, yol: 0,   acik: ['tamir', 'ev', 'tadilat', 'mobilya'] },
  { il: 'Bursa',    ilce: 'Nilüfer',   k: 1.00, yol: 0,   acik: ['tamir', 'ev', 'tadilat', 'mobilya'] },
  { il: 'Kayseri',  ilce: 'Melikgazi', k: 0.90, yol: 0,   acik: ['tamir', 'ev', 'mobilya'] },
  { il: 'Trabzon',  ilce: 'Ortahisar', k: 0.90, yol: 250, acik: ['tamir', 'mobilya'] },
  { il: 'Artvin',   ilce: 'Merkez',    k: 0.90, yol: 250, acik: ['mobilya'] },
];

const MESLEK_AD = { tesisat: 'Tesisat', elektrik: 'Elektrik', iklim: 'İklimlendirme', montaj: 'Montaj', temizlik: 'Temizlik', cilingir: 'Çilingir', tadilat: 'Boya ve tadilat', mobilya: 'Mobilya atölyesi' };
const SEVIYELER = ['Aday', 'Onaylı', 'Uzman', 'Eksper'];

const USTALAR = [
  { id: 'u1',  ad: 'Kemal A.',        meslek: 'tesisat',  seviye: 'Uzman',  puan: 4.9, is: 214, belgeler: ['Kimlik', 'Mesleki belge', 'Sigorta'] },
  { id: 'u2',  ad: 'Serkan D.',       meslek: 'elektrik', seviye: 'Onaylı', puan: 4.7, is: 38,  belgeler: ['Kimlik', 'Mesleki belge', 'Sigorta'] },
  { id: 'u3',  ad: 'Elif T.',         meslek: 'temizlik', seviye: 'Uzman',  puan: 4.8, is: 320, belgeler: ['Kimlik', 'Sigorta'] },
  { id: 'u4',  ad: 'Murat Y.',        meslek: 'tadilat',  seviye: 'Uzman',  puan: 4.8, is: 97,  belgeler: ['Kimlik', 'Mesleki belge', 'Sigorta'] },
  { id: 'u5',  ad: 'Hakan Ö.',        meslek: 'montaj',   seviye: 'Aday',   puan: 0,   is: 3,   belgeler: ['Kimlik'] },
  { id: 'u6',  ad: 'Cem K.',          meslek: 'iklim',    seviye: 'Onaylı', puan: 4.6, is: 41,  belgeler: ['Kimlik', 'Mesleki belge'] },
  { id: 'u7',  ad: 'Onur B.',         meslek: 'cilingir', seviye: 'Uzman',  puan: 4.8, is: 150, belgeler: ['Kimlik', 'Sigorta'] },
  { id: 'u8',  ad: 'İnegöl Atölye 3', meslek: 'mobilya',  seviye: 'Uzman',  puan: 4.7, is: 58,  belgeler: ['Vergi kaydı', 'Atölye denetimi', 'Sigorta'] },
  { id: 'u9',  ad: 'Yusuf E.',        meslek: 'tesisat',  seviye: 'Onaylı', puan: 4.6, is: 38,  belgeler: ['Kimlik', 'Mesleki belge'] },
  { id: 'u10', ad: 'Burak S.',        meslek: 'elektrik', seviye: 'Onaylı', puan: 4.5, is: 27,  belgeler: ['Kimlik', 'Mesleki belge'] },
  { id: 'u11', ad: 'Zeynep A.',       meslek: 'tadilat',  seviye: 'Onaylı', puan: 4.7, is: 44,  belgeler: ['Kimlik', 'Mesleki belge'] },
  { id: 'u12', ad: 'Fatma N.',        meslek: 'temizlik', seviye: 'Onaylı', puan: 4.6, is: 85,  belgeler: ['Kimlik'] },
];

const SIKAYET_TURLERI = [
  { id: 'kusur',     ad: 'İş kusurlu',               ornek: 'Sızdırıyor, bozuk işçilik, çalışmıyor', talepler: ['duzeltme', 'indirim', 'iade'], yuk: 'usta' },
  { id: 'aykiri',    ad: 'Anlaştığımızdan farklı',   ornek: 'Ölçü, renk ya da malzeme farklı',       talepler: ['duzeltme', 'indirim', 'iade'], yuk: 'usta' },
  { id: 'begenmeme', ad: 'Uygun ama beğenmedim',     ornek: 'İş doğru yapıldı, sonuç hoşuma gitmedi', talepler: ['duzeltme'],                    yuk: 'platform' },
  { id: 'yarim',     ad: 'İş yarım kaldı',           ornek: 'Usta işi bıraktı ya da tamamlamadı',     talepler: ['duzeltme', 'iade'],            yuk: 'usta' },
  { id: 'gecikme',   ad: 'Gecikme',                  ornek: 'Randevu ya da teslim tarihi kaçtı',      talepler: ['indirim', 'iade'],             yuk: 'usta' },
  { id: 'hasar',     ad: 'Eve ya da eşyaya zarar',   ornek: 'Parke çizildi, eşya kırıldı',            talepler: ['indirim'],                     yuk: 'usta' },
  { id: 'fiyat',     ad: 'Fazla para istendi',       ornek: 'Elden para ya da onaysız ek iş',         talepler: ['indirim'],                     yuk: 'usta' },
  { id: 'guvenlik',  ad: 'Davranış ve güvenlik',     ornek: 'Kaba davranış, taciz, hırsızlık şüphesi', talepler: ['iade'],                       yuk: 'platform', acil: true },
  { id: 'ariza',     ad: 'Sonradan arıza çıktı',     ornek: 'Garanti süresinde bozuldu',              talepler: ['duzeltme'],                    yuk: 'usta', garanti: true },
];
const TALEP_AD = { duzeltme: 'Ücretsiz düzeltme', indirim: 'Bedel indirimi', iade: 'Tam iade', ret: 'Şikâyet reddedildi' };

const DURUM = {
  TEKLIF_BEKLIYOR: { ad: 'Teklif hazırlanıyor',      sinif: 'bekle', adim: 1 },
  TEKLIF_HAZIR:    { ad: 'Onayını bekliyor',         sinif: 'sen',   adim: 2 },
  ATAMA:           { ad: 'Usta atanıyor',            sinif: 'bekle', adim: 3 },
  PLANLANDI:       { ad: 'Planlandı',                sinif: 'aktif', adim: 4 },
  YOLDA:           { ad: 'Usta yolda',               sinif: 'aktif', adim: 4 },
  BASLADI:         { ad: 'İş sürüyor',               sinif: 'aktif', adim: 4 },
  ASAMA_ONAY:      { ad: 'Aşama onayını bekliyor',   sinif: 'sen',   adim: 4 },
  URETIM:          { ad: 'Üretimde',                 sinif: 'aktif', adim: 4 },
  SEVK_ODEME:      { ad: 'Sevk ödemesini bekliyor',  sinif: 'sen',   adim: 4 },
  SEVK:            { ad: 'Sevke hazırlanıyor',       sinif: 'aktif', adim: 4 },
  MONTAJ:          { ad: 'Montaj planlandı',         sinif: 'aktif', adim: 4 },
  TESLIM:          { ad: 'Kabulünü bekliyor',        sinif: 'sen',   adim: 6 },
  KABUL:           { ad: 'Tamamlandı',               sinif: 'tamam', adim: 7 },
  UYUSMAZLIK:      { ad: 'Şikâyet inceleniyor',      sinif: 'sorun', adim: 6 },
  IPTAL:           { ad: 'İptal edildi',             sinif: 'kapali', adim: -1 },
  IADE:            { ad: 'İade edildi',              sinif: 'kapali', adim: -1 },
};
const ADIMLAR = ['Talep', 'Teklif', 'Onay ve ödeme', 'Atama', 'İş', 'Teslim', 'Kabul', 'Garanti'];
const AKTIF_DURUMLAR = ['TEKLIF_BEKLIYOR', 'TEKLIF_HAZIR', 'ATAMA', 'PLANLANDI', 'YOLDA', 'BASLADI', 'ASAMA_ONAY', 'URETIM', 'SEVK_ODEME', 'SEVK', 'MONTAJ', 'TESLIM', 'UYUSMAZLIK'];

const HAZIR_MESAJ = {
  musteri: ['Tamam, bekliyorum.', 'Kapı zili çalışmıyor, gelince mesaj at.', 'Otopark girişi arka sokakta.'],
  usta: ['Yoldayım.', '10 dakika gecikeceğim.', 'Kapıdayım.'],
};
