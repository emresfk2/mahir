/* ===== Mahir · iş kuralları =====
   Sipariş durum makinesi, fiyatlama, bloke ödeme defteri, şikâyet kararları.
   Tarayıcıdan bağımsızdır; gerçek bir sunucuya taşınırken bu dosya API katmanının arkasına geçer. */

const SAAT = 3600e3, GUN = 24 * SAAT, DK = 60e3;
const SURUM = 5;
const ANAHTAR = 'mahir-demo';

/* Tasarım dokümanındaki oranlar ve eşikler */
const ORAN = {
  kdv: 0.20, ustaPay: 0.80, malzemePay: 0.92, fon: 0.02, odeme: 0.025,
  teminat: 0.10, teminatUzman: 0.05, mesaiDisi: 0.15, ekIsEsik: 0.20,
  rezervasyon: 0.10, kucukOran: 0.10, kucukTutar: 1500, kesif: 600, yolBedeli: 350,
};

let S = null;                      // kalıcı durum
let _simdi = null;                 // örnek veri üretirken kullanılan sahte saat
const simdi = () => (_simdi == null ? Date.now() : _simdi);

/* ---------- küçük yardımcılar ---------- */
const yuvarla = n => Math.round(Math.round(n * 100) / 1000) * 10;      // 10 TL’ye yuvarlar; önce kuruşa yuvarlayıp kayan nokta hatasını temizler
const topla = c => c.iscilik + c.malzeme + c.yol + c.fark;
const bosKalem = () => ({ iscilik: 0, malzeme: 0, yol: 0, fark: 0 });
const KALEMLER = ['iscilik', 'malzeme', 'yol', 'fark'];
const hizmet = id => HIZMETLER.find(h => h.id === id);
const bul = id => S.orders.find(o => o.id === id);
const ustaBul = id => S.ustalar.find(u => u.id === id) || null;
const davaBul = id => S.disputes.find(d => d.id === id) || null;
const bolge = (il, ilce) => BOLGELER.find(b => b.il === il && b.ilce === ilce) || null;
const kapsamAnahtar = (il, ilce) => il + '/' + ilce;
const acikMi = (il, ilce, kat) => (S.kapsam[kapsamAnahtar(il, ilce)] || []).includes(kat);
const kapaliMi = o => ['KABUL', 'IPTAL', 'IADE'].includes(o.durum);
const acikDava = o => { const d = davaBul(o.disputeId); return d && d.durum !== 'KAPANDI' ? d : null; };

function slotUret(ts, saat) { const d = new Date(ts); d.setHours(saat, 0, 0, 0); return d.getTime(); }
function mesaiDisiMi(ts) { const d = new Date(ts), g = d.getDay(); return g === 0 || g === 6 || d.getHours() >= 18; }
function isGunuEkle(ts, n) { const d = new Date(ts); while (n > 0) { d.setDate(d.getDate() + 1); const g = d.getDay(); if (g !== 0 && g !== 6) n--; } return d.getTime(); }
function ayEkle(ts, n) { const d = new Date(ts); d.setMonth(d.getMonth() + n); return d.getTime(); }
function iz(o, metin) { o.iz.push({ at: simdi(), metin }); o.gun = simdi(); }

/* ---------- kalıcılık (yalnızca bu tarayıcıda) ---------- */
function kaydet() { try { localStorage.setItem(ANAHTAR, JSON.stringify(S)); } catch (e) { /* depolama yoksa bellekte devam */ } }
function yukle() {
  try { const r = localStorage.getItem(ANAHTAR); if (r) { const j = JSON.parse(r); if (j && j.v === SURUM) return j; } } catch (e) { /* yok say */ }
  return null;
}

/* ---------- fiyatlama (tüm tutarlar KDV dahil TL) ---------- */
function fiyatla(s, opts, il, ilce, slotTs) {
  const b = bolge(il, ilce), k = b ? b.k : 1;
  const adet = Math.max(1, Math.min(Number(opts.adet) || 1, s.maxAdet || 1));
  let birim = s.iscilik, secAd = '';
  if (s.secenekler) { const sec = s.secenekler.find(x => x.id === opts.secenek) || s.secenekler[0]; birim = sec.iscilik; secAd = sec.ad; }
  const iscilik = yuvarla(birim * adet * k);
  const fark = slotTs && mesaiDisiMi(slotTs) ? yuvarla(iscilik * ORAN.mesaiDisi) : 0;
  const malzeme = opts.malzeme && s.malzeme ? s.malzeme.fiyat * adet : 0;
  const yol = b ? b.yol : 0;
  const lines = [{ ad: 'İşçilik' + (secAd ? ' · ' + secAd : adet > 1 ? ' · ' + adet + ' ' + s.birim : ''), tutar: iscilik }];
  if (malzeme) lines.push({ ad: s.malzeme.ad + (adet > 1 ? ' · ' + adet + ' adet' : ''), tutar: malzeme });
  if (fark) lines.push({ ad: 'Mesai dışı farkı (%15)', tutar: fark });
  if (yol) lines.push({ ad: 'Yol bedeli', tutar: yol });
  return { iscilik, fark, malzeme, yol, toplam: iscilik + fark + malzeme + yol, lines };
}

function acilFiyat(s) {
  return { iscilik: s.tani, fark: 0, malzeme: 0, yol: 0, toplam: s.tani, tavan: s.tavan, lines: [{ ad: 'Tanı ve ilk 30 dakika', tutar: s.tani }] };
}

function projeFiyat(s, opts, il, ilce) {
  const b = bolge(il, ilce), k = b ? b.k : 1;
  const m2 = Math.max(s.soru.min, Math.min(Number(opts.m2) || s.soru.varsayilan, s.soru.max));
  let iscilik = 0, malzeme = 0; const lines = [];
  s.kalemler.forEach(kl => {
    const q = kl.sabit ? 1 : m2;
    const i = yuvarla(kl.iscilik * q * k), m = yuvarla(kl.malzeme * q);
    iscilik += i; malzeme += m;
    lines.push({ ad: kl.ad + (kl.sabit ? '' : ' · ' + m2 + ' ' + kl.birim), tutar: i + m, iscilik: i, malzeme: m });
  });
  const yol = b ? b.yol : 0;
  if (yol) lines.push({ ad: 'Yol bedeli', tutar: yol });
  return { iscilik, malzeme, yol, fark: 0, toplam: iscilik + malzeme + yol, lines, m2 };
}

function kapakSayisi(s, opts) { return Math.max(2, Math.round((Number(opts.en) || s.olcu.en[2]) / 50)); }
function mobilyaFiyat(s, opts, il, ilce) {
  const b = bolge(il, ilce);
  const en = Number(opts.en) || s.olcu.en[2], boy = Number(opts.boy) || s.olcu.boy[2];
  const mlz = MALZEMELER.find(m => m.id === opts.malzeme) || MALZEMELER[0];
  const alan = (en / 100) * Math.max(0.6, boy / s.olcu.boy[2]);
  const uretim = yuvarla(s.metre * alan * mlz.k * (s.kapakli && opts.kapak === 'surgulu' ? 1.12 : 1));
  const aksesuar = yuvarla(uretim * 0.12);
  const nakliye = 1800 + (b ? b.yol : 0);
  const montaj = yuvarla(1500 + 400 * (en / 100));
  const lines = [
    { ad: 'Üretim · ' + mlz.ad + ', ' + en + '×' + boy + ' cm', tutar: uretim },
    { ad: 'Menteşe, ray ve kulp', tutar: aksesuar },
    { ad: 'Nakliye', tutar: nakliye },
    { ad: 'Montaj ve ayar', tutar: montaj },
  ];
  return { iscilik: uretim + montaj, malzeme: aksesuar, yol: nakliye, fark: 0, toplam: uretim + aksesuar + nakliye + montaj, lines };
}

/* ---------- defter: her kayıt sıfır toplamlıdır ---------- */
const HESAP_AD = {
  bloke: 'Bloke bakiye', usta: 'Usta alacağı', teminat: 'Usta teminatı', tedarikci: 'Tedarikçi alacağı', fon: 'Garanti fonu',
  gelir: 'Platform geliri', kdv: 'KDV', odeme: 'Ödeme komisyonu', kredi: 'Müşteri kredisi', rucu: 'Ustadan rücu alacağı',
  musteri: 'Müşteri kartları', banka: 'Ustalara ödenen', sermaye: 'Sermaye',
};
function kayit(o, olay, aciklama, satirlar) {
  const lines = satirlar.filter(l => l[1] !== 0).map(l => ({ h: l[0], t: l[1] }));
  if (!lines.length) return;
  S.ledger.unshift({ id: 'l' + (++S.seq), at: simdi(), oid: o ? o.id : null, code: o ? o.code : '—', olay, aciklama, lines });
}
function bakiye() {
  const b = {}; S.ledger.forEach(k => k.lines.forEach(l => { b[l.h] = (b[l.h] || 0) + l.t; })); return b;
}

/* Bir tutarın paylaşımı. c: KDV dahil bileşenler; u: işi yapan usta (yoksa usta payı platformda kalır) */
function bol(c, u) {
  const P = topla(c);
  const R = Math.round(P / (1 + ORAN.kdv)), kdv = P - R;
  const H = u ? Math.round(((c.iscilik + c.fark) * ORAN.ustaPay + c.yol) / (1 + ORAN.kdv)) : 0;
  const M = Math.round(c.malzeme * ORAN.malzemePay / (1 + ORAN.kdv));
  const fon = Math.round(R * ORAN.fon), odeme = Math.round(P * ORAN.odeme);
  const tOran = u && (u.seviye === 'Uzman' || u.seviye === 'Eksper') ? ORAN.teminatUzman : ORAN.teminat;
  return { P, R, kdv, H, M, fon, odeme, gelir: R - H - M - fon - odeme, teminat: Math.round(H * tOran), tOran };
}

function tahsil(o, tutar, aciklama) {
  if (tutar <= 0) return;
  const kr = Math.min(S.credit, tutar);
  S.credit -= kr;
  kayit(o, 'TAHSILAT', aciklama, [['musteri', -(tutar - kr)], ['kredi', -kr], ['bloke', tutar]]);
  o.paid += tutar;
  o.odemeler.push({ tutar, kredi: kr, at: simdi(), aciklama });
}

/* Blokedeki tutarı serbest bırakır. Platformun üstlendiği iade (telafi) varsa
   ustanın ve tedarikçinin payı eksilmez; eksik kalan kısım garanti fonundan karşılanır. */
function serbest(o, c, aciklama) {
  const brut = topla(c);
  if (brut <= 0) return null;
  const telafi = Math.min(o.telafi, brut), nakit = brut - telafi;
  const u = ustaBul(o.ustaId);
  const tam = bol(c, u);
  const R = Math.round(nakit / (1 + ORAN.kdv)), kdv = nakit - R;
  const fon = Math.round(R * ORAN.fon), odeme = Math.round(nakit * ORAN.odeme);
  const fonTelafi = telafi ? Math.round((tam.H + tam.M) * telafi / brut) : 0;
  const gelir = R - fon - odeme - (tam.H + tam.M - fonTelafi);
  kayit(o, 'SERBEST', aciklama, [['bloke', -nakit], ['kdv', kdv], ['usta', tam.H - tam.teminat], ['teminat', tam.teminat],
    ['tedarikci', tam.M], ['fon', fon - fonTelafi], ['odeme', odeme], ['gelir', gelir]]);
  o.telafi -= telafi; o.rel += nakit;
  KALEMLER.forEach(a => { o.relKalem[a] += c[a]; });
  o.teminat += tam.teminat;
  if (tam.H - tam.teminat > 0) o.hakedis.push({ tutar: tam.H - tam.teminat, vade: isGunuEkle(simdi(), 2), odendi: false, at: simdi() });
  if (tam.teminat > 0) o.teminatVade = simdi() + 30 * GUN;
  return { nakit, kdv, H: tam.H, M: tam.M, teminat: tam.teminat, fon: fon - fonTelafi, odeme, gelir };
}

function dus(k, X) { ['iscilik', 'fark', 'yol', 'malzeme'].forEach(a => { const d = Math.min(k[a], X); k[a] -= d; X -= d; }); }
function kalanKalem(o) { const c = bosKalem(); KALEMLER.forEach(a => { c[a] = Math.max(0, o.kalem[a] - o.relKalem[a]); }); return c; }
function payla(o, tutar) {
  const k = o.kalem, T = topla(k) || 1;
  const c = { iscilik: Math.round(k.iscilik * tutar / T), malzeme: Math.round(k.malzeme * tutar / T), yol: Math.round(k.yol * tutar / T), fark: Math.round(k.fark * tutar / T) };
  c.iscilik += tutar - topla(c);
  return c;
}
const blokede = o => o.paid - o.rel - o.refunded + (o.sonraIade || 0);   // kabulden sonraki iadeler blokeden çıkmaz
const ustaPayi = o => bol(o.kalem, ustaBul(o.ustaId || (o.offer && o.offer.ustaId)));

/* Kabulden önce iade: para blokedeyse karta döner; henüz çekilmediyse çekilecek tutar küçülür */
const indirimTavan = o => (o.stages ? o.paid : Math.max(o.paid, o.fiyat.toplam)) - o.refunded;
function iadeOnce(o, X, yuk, aciklama) {
  const nakit = Math.max(0, Math.min(X, blokede(o)));
  if (nakit > 0) { kayit(o, 'IADE', aciklama, [['bloke', -nakit], ['musteri', nakit]]); o.refunded += nakit; }
  let indirim = 0;
  if (!o.stages && X > nakit) {
    indirim = Math.min(X - nakit, Math.max(0, o.fiyat.toplam - o.paid));
    if (indirim > 0) { o.fiyat.toplam -= indirim; o.fiyat.lines.push({ ad: aciklama, tutar: -indirim }); }
  }
  const T = nakit + indirim;
  if (T <= 0) return 0;
  if (yuk === 'usta') dus(o.kalem, T); else o.telafi += T;
  return T;
}
/* Kabulden sonra iade: usta kusurluysa önce teminattan, sonra ödenmemiş hakedişten, kalanı rücu.
   Ustadan istenecek tutar o işin hakedişi ve teminatıyla sınırlıdır; aşan kısım garanti fonundan. */
function iadeSonra(o, X, yuk, aciklama) {
  X = Math.min(X, o.paid - o.refunded);
  if (X <= 0) return 0;
  const net = Math.round(X / (1 + ORAN.kdv)), kdv = X - net;
  const satir = [['musteri', X], ['kdv', -kdv]];
  let ustaYuk = 0;
  if (yuk === 'usta') {
    const bekleyen = o.hakedis.reduce((t, h) => t + (h.odendi ? 0 : h.tutar), 0);
    const odenen = o.hakedis.reduce((t, h) => t + (h.odendi ? h.tutar : 0), 0) + (o.teminatOdenen || 0) - (o.rucu || 0);
    ustaYuk = Math.min(net, o.teminat + bekleyen + Math.max(0, odenen));
    let kalan = ustaYuk;
    const a = Math.min(o.teminat, kalan); o.teminat -= a; kalan -= a; satir.push(['teminat', -a]);
    let bb = 0;
    o.hakedis.forEach(h => { if (h.odendi || kalan <= 0) return; const d = Math.min(h.tutar, kalan); h.tutar -= d; kalan -= d; bb += d; });
    satir.push(['usta', -bb]);
    if (kalan > 0) { satir.push(['rucu', -kalan]); o.rucu = (o.rucu || 0) + kalan; }
  }
  satir.push(['fon', -(net - ustaYuk)]);
  kayit(o, 'IADE', aciklama, satir);
  o.refunded += X; o.sonraIade = (o.sonraIade || 0) + X;
  return X;
}
function hakedisOde(o, sinir) {
  let t = 0;
  o.hakedis.forEach(h => { if (!h.odendi && h.tutar > 0 && (sinir == null || h.vade <= sinir)) { t += h.tutar; h.odendi = true; h.odemeAt = simdi(); } });
  if (t) kayit(o, 'HAKEDIS', 'Usta hakedişi ödendi', [['usta', -t], ['banka', t]]);
  return t;
}
function teminatBirak(o) {
  const t = o.teminat;
  if (t > 0) { kayit(o, 'TEMINAT', 'Teminat ustaya ödendi', [['teminat', -t], ['banka', t]]); o.teminat = 0; o.teminatOdenen = (o.teminatOdenen || 0) + t; }
  return t;
}
function krediVer(t, o, aciklama) { S.credit += t; kayit(o, 'KREDI', aciklama, [['fon', -t], ['kredi', t]]); }

/* ---------- sipariş ---------- */
function yeniSiparis(s, x) {
  const n = ++S.seq;
  const o = {
    id: 'o' + n, code: 'MHR-' + n, sid: s.id, tip: s.tip, ad: s.ad, kat: s.kat, il: S.il, ilce: S.ilce,
    adres: x.adres || '', not: x.not || '', fotos: x.fotos || [], opts: x.opts || {}, slotTs: x.slotTs || null,
    fiyat: x.fiyat || null, ilkToplam: x.fiyat ? x.fiyat.toplam : 0, kalem: x.fiyat ? { iscilik: x.fiyat.iscilik, malzeme: x.fiyat.malzeme, yol: x.fiyat.yol, fark: x.fiyat.fark } : bosKalem(),
    extras: [], stages: null, teklif: null, durum: 'ATAMA', iz: [], offer: null, reddeden: [], ustaId: null, atamaBekliyor: false,
    kod: String(1000 + Math.floor(Math.random() * 9000)), paid: 0, rel: 0, refunded: 0, telafi: 0, relKalem: bosKalem(),
    teminat: 0, hakedis: [], odemeler: [], kontrol: [], fotoOnce: [], fotoSonra: [], mesajlar: [],
    acceptBy: null, kabulAt: null, garantiBitis: null, puan: null, disputeId: null, fix: 0, sonradan: false, vade: null,
    kesif: null, kesifBedeli: 0, at: simdi(), gun: simdi(),
  };
  S.orders.unshift(o);
  return o;
}

/* Standart ve acil iş: fiyat belli, hemen sipariş.
   Standart işte tutar randevudan 24 saat önce çekilir; acil işte iş bitiminde. */
function siparisOlustur(x) {
  const s = hizmet(x.sid);
  const acil = s.tip === 'acil';
  const f = acil ? acilFiyat(s) : fiyatla(s, x.opts || {}, S.il, S.ilce, x.slotTs);
  const o = yeniSiparis(s, Object.assign({}, x, { fiyat: f, slotTs: acil ? simdi() + SAAT : x.slotTs }));
  iz(o, 'Sipariş oluşturuldu');
  if (acil) { o.sonradan = true; iz(o, 'Kart doğrulandı; ücret iş bitiminde çekilecek'); }
  else if (o.slotTs - simdi() > 24 * SAAT) { o.vade = o.slotTs - 24 * SAAT; iz(o, 'Kart doğrulandı; tutar randevudan 24 saat önce çekilecek'); }
  else { tahsil(o, f.toplam, 'Sipariş ödemesi'); iz(o, 'Ödeme alındı ve bloke edildi'); }
  ata(o);
  return o;
}
function vadeTahsil(o) {
  if (!o.vade) return false;
  o.vade = null;
  if (o.paid < o.fiyat.toplam) { tahsil(o, o.fiyat.toplam - o.paid, 'Sipariş ödemesi'); iz(o, 'Ödeme alındı ve bloke edildi'); }
  return true;
}

/* Proje ve mobilya: önce talep, sonra platform teklifi */
function talepOlustur(x) {
  const s = hizmet(x.sid);
  const o = yeniSiparis(s, x);
  o.durum = 'TEKLIF_BEKLIYOR'; o.kesif = x.kesif || 'video';
  o.onFiyat = (s.tip === 'proje' ? projeFiyat(s, o.opts, o.il, o.ilce) : mobilyaFiyat(s, o.opts, o.il, o.ilce)).toplam;
  iz(o, s.tip === 'mobilya' ? 'Ölçü randevusu istendi' : 'Keşif talebi oluşturuldu');
  if (o.kesif === 'yerinde') { o.kesifBedeli = ORAN.kesif; tahsil(o, ORAN.kesif, s.tip === 'mobilya' ? 'Yerinde ölçü bedeli' : 'Yerinde keşif bedeli'); iz(o, 'Keşif bedeli alındı; siparişe dönüşürse bedelden düşülür'); }
  return o;
}

function teklifGonder(o, opts) {
  const s = hizmet(o.sid);
  o.opts = Object.assign({}, o.opts, opts || {});
  const f = s.tip === 'proje' ? projeFiyat(s, o.opts, o.il, o.ilce) : mobilyaFiyat(s, o.opts, o.il, o.ilce);
  o.fiyat = f; o.ilkToplam = f.toplam; o.kalem = { iscilik: f.iscilik, malzeme: f.malzeme, yol: f.yol, fark: f.fark };
  const pct = s.tip === 'proje' ? [30, 40, 30] : [40, 40, 20];
  let kalan = f.toplam;
  o.stages = s.asamalar.map((ad, i) => { const t = i < 2 ? yuvarla(f.toplam * pct[i] / 100) : kalan; kalan -= t; return { ad, pct: pct[i], tutar: t, paid: false, done: false, accepted: false, indirim: 0 }; });
  o.teklif = { at: simdi(), gecerli: simdi() + 7 * GUN };
  o.durum = 'TEKLIF_HAZIR';
  iz(o, 'Teklif gönderildi; 7 gün geçerli');
}

function teklifOnayla(o) {
  const st = o.stages[0];
  const mahsup = Math.min(blokede(o), st.tutar);
  tahsil(o, st.tutar - mahsup, '"' + st.ad + '" ödemesi');
  st.paid = true; o.onayAt = simdi(); o.mahsup = mahsup;
  iz(o, o.tip === 'mobilya' ? 'Ölçü, çizim ve numune onaylandı; üretim ödemesi alındı' : 'Teklif onaylandı; ilk aşama ödemesi alındı');
  ata(o);
}

/* ---------- atama ---------- */
const SEVIYE_SIRA = { Eksper: 3, Uzman: 2, 'Onaylı': 1, Aday: 0 };
function adaylar(o) {
  const s = hizmet(o.sid);
  return S.ustalar
    .filter(u => u.meslek === s.meslek && !u.aski && !o.reddeden.includes(u.id) && (u.seviye !== 'Aday' || s.tip === 'standart'))
    .sort((a, b) => SEVIYE_SIRA[b.seviye] - SEVIYE_SIRA[a.seviye] || b.puan - a.puan);
}
function ata(o, ustaId) {
  const a = ustaId ? ustaBul(ustaId) : adaylar(o)[0];
  o.ustaId = null; o.durum = 'ATAMA';
  if (!a) { o.offer = null; o.atamaBekliyor = true; iz(o, 'Uygun usta bulunamadı; operasyon atayacak'); return null; }
  o.offer = { ustaId: a.id, at: simdi(), bitis: simdi() + 30 * DK };
  o.atamaBekliyor = false;
  iz(o, 'İş ' + a.ad + ' için teklif edildi');
  return a;
}
function ustaKabul(o) {
  if (!o.offer) return;
  o.ustaId = o.offer.ustaId; o.offer = null;
  o.durum = o.tip === 'mobilya' && !o.montajda ? 'URETIM' : 'PLANLANDI';
  iz(o, ustaBul(o.ustaId).ad + ' işi kabul etti');
}
function ustaRet(o, sebep) {
  if (!o.offer) return;
  const u = ustaBul(o.offer.ustaId);
  o.reddeden.push(o.offer.ustaId);
  iz(o, u.ad + (sebep === 'sure' ? ' 30 dakikada yanıt vermedi' : ' işi reddetti'));
  ata(o);
}

/* ---------- işin yürütülmesi ---------- */
function yolaCik(o) {
  vadeTahsil(o);
  if (o.durum === 'PLANLANDI') { o.durum = 'YOLDA'; iz(o, 'Usta yola çıktı'); }
  else if (o.durum === 'MONTAJ') { o.yolda = true; iz(o, 'Montaj ekibi yola çıktı'); }
}
function giris(o, kod) {
  if (String(kod).trim() !== o.kod) return false;
  vadeTahsil(o);
  o.durum = 'BASLADI'; o.girisAt = simdi(); o.yolda = false;
  iz(o, 'Kapı kodu doğrulandı; iş başladı');
  return true;
}
function ekIsTalep(o, x) {
  const tutar = Math.round(Number(x.tutar) || 0), ad = String(x.ad || '').trim().slice(0, 120);
  if (tutar <= 0 || !ad) return { ok: false, neden: 'Açıklama ve tutar gerekli.' };
  const onceki = o.extras.filter(e => e.durum !== 'ret').reduce((t, e) => t + e.tutar, 0);
  if (o.tip === 'acil' && o.fiyat.tavan && o.ilkToplam + onceki + tutar > o.fiyat.tavan)
    return { ok: false, neden: 'Tavan fiyat aşılıyor. Bu iş için en fazla ₺' + (o.fiyat.tavan - o.ilkToplam - onceki) + ' ek tutar girilebilir.' };
  const uzman = o.tip !== 'acil' && onceki + tutar > o.ilkToplam * ORAN.ekIsEsik;
  o.extras.push({ id: 'e' + (++S.seq), ad, tutar, foto: x.foto || null, durum: uzman ? 'uzman' : 'bekliyor', at: simdi() });
  iz(o, 'Ek iş talebi: ' + ad + (uzman ? ' (ilk teklifin %20’sini aştığı için platform uzmanı inceleyecek)' : ''));
  return { ok: true, uzman };
}
function ekIsUzman(o, id, onay) {
  const e = o.extras.find(a => a.id === id); if (!e || e.durum !== 'uzman') return;
  e.durum = onay ? 'bekliyor' : 'ret'; e.uzmanOnay = onay;
  iz(o, onay ? 'Platform uzmanı ek işi uygun buldu; müşteri onayına gitti' : 'Platform uzmanı ek işi reddetti');
}
function ekIsKarar(o, id, onay) {
  const e = o.extras.find(a => a.id === id); if (!e || e.durum !== 'bekliyor') return;
  e.durum = onay ? 'onay' : 'ret';
  if (onay) {
    o.fiyat.toplam += e.tutar; o.kalem.iscilik += e.tutar;
    if (!o.sonradan) tahsil(o, e.tutar, 'Ek iş: ' + e.ad);
    iz(o, 'Müşteri ek işi onayladı: ' + e.ad);
  } else iz(o, 'Müşteri ek işi reddetti: ' + e.ad);
}
function tamamla(o) {
  o.durum = 'TESLIM'; o.teslimAt = simdi();
  o.acceptBy = simdi() + (o.tip === 'standart' || o.tip === 'acil' ? 48 : 72) * SAAT;
  if (o.sonradan && o.paid < o.fiyat.toplam) tahsil(o, o.fiyat.toplam - o.paid, 'İş bitiminde tahsilat');
  iz(o, o.duzeltme ? 'Düzeltme tamamlandı; kabul bekleniyor' : 'Usta işi tamamladı; kabul bekleniyor');
}
function davaKapat(o) {
  const d = davaBul(o.disputeId);
  if (d && d.durum === 'DUZELTME') { d.durum = 'KAPANDI'; d.kapanisAt = simdi(); }
  o.duzeltme = false;
}
function kabul(o, x) {
  x = x || {};
  if (o.stages) {
    const son = o.stages[o.stages.length - 1];
    if (!son.paid) { tahsil(o, son.tutar, '"' + son.ad + '" ödemesi'); son.paid = true; }
    o.stages.forEach(st => { st.done = true; st.accepted = true; });
  }
  serbest(o, kalanKalem(o), x.oto ? 'Otomatik kabul: ödeme serbest' : 'Kabul: ödeme serbest');
  o.durum = 'KABUL'; o.kabulAt = simdi(); o.otoKabul = !!x.oto; o.acceptBy = null;
  const s = hizmet(o.sid), u = ustaBul(o.ustaId);
  if (!o.garantiBitis && s.garantiAy) o.garantiBitis = ayEkle(simdi(), s.garantiAy);
  if (u && !o.sayildi) { u.is += 1; o.sayildi = true; }
  if (u && x.puan) { o.puan = x.puan; const n = Math.min(u.is, 40); u.puan = u.puan ? Math.round(((u.puan * n + x.puan) / (n + 1)) * 10) / 10 : x.puan; }
  if (u && u.seviye === 'Aday' && u.is >= 5) u.seviye = 'Onaylı';
  davaKapat(o);
  iz(o, x.oto ? 'Süre doldu; iş otomatik kabul edildi (yasal haklar saklı)' : 'Müşteri işi kabul etti');
}

/* Proje aşamaları */
function asamaTamam(o) {
  const i = o.stages ? o.stages.findIndex(st => !st.done) : -1;
  if (i < 0) { tamamla(o); return; }
  o.stages[i].done = true;
  if (i === o.stages.length - 1) { tamamla(o); return; }
  o.durum = 'ASAMA_ONAY';
  iz(o, '"' + o.stages[i].ad + '" aşaması tamamlandı; onay bekleniyor');
}
function asamaOnay(o) {
  const i = o.stages.findIndex(st => st.done && !st.accepted);
  if (i < 0 || i === o.stages.length - 1) return;
  const st = o.stages[i], nx = o.stages[i + 1];
  st.accepted = true;
  serbest(o, payla(o, st.tutar - (st.indirim || 0)), '"' + st.ad + '" aşaması kabul edildi');
  if (!nx.paid) { tahsil(o, nx.tutar, '"' + nx.ad + '" ödemesi'); nx.paid = true; }
  o.durum = 'BASLADI';
  davaKapat(o);
  iz(o, '"' + st.ad + '" onaylandı; "' + nx.ad + '" başladı');
}
/* Mobilya üretim ve sevk */
function uretimTamam(o) { o.stages[0].done = true; o.durum = 'SEVK_ODEME'; iz(o, 'Üretim tamamlandı; sevk öncesi ödeme bekleniyor'); }
function sevkOde(o) { const st = o.stages[1]; tahsil(o, st.tutar, 'Sevk öncesi ödeme'); st.paid = true; o.durum = 'SEVK'; iz(o, 'Sevk öncesi ödeme alındı'); }
function sevkEt(o) { o.stages[1].done = true; o.durum = 'MONTAJ'; o.montajda = true; o.slotTs = slotUret(simdi() + 3 * GUN, 10); iz(o, 'Ürün sevk edildi; montaj randevusu verildi'); }

/* ---------- iptal ---------- */
function iptalHesap(o) {
  const odenen = blokede(o);
  if (kapaliMi(o)) return { izin: false, neden: 'Bu sipariş kapandı.' };
  if (['UYUSMAZLIK', 'TESLIM'].includes(o.durum)) return { izin: false, neden: 'İş teslim edildi. Bir sorun varsa sorun bildir.' };
  if (o.tip === 'mobilya' && o.onayAt) return { izin: false, destek: true, neden: 'Ürün sana özel üretildiği için üretim onayından sonra cayma hakkı yok. İptal talebini operasyon değerlendirir.' };
  if (o.girisAt || o.duzeltme || ['BASLADI', 'ASAMA_ONAY'].includes(o.durum)) return { izin: false, destek: true, neden: 'İş başladıktan sonra sipariş iptal edilemez. Bir sorun varsa bildir; yapılan iş düşülerek iade için operasyon karar verir.' };
  if (o.durum === 'TEKLIF_BEKLIYOR' || o.durum === 'TEKLIF_HAZIR') {
    const k = o.kesif === 'yerinde' && o.teklif ? Math.min(odenen, o.kesifBedeli) : 0;
    return { izin: true, kesinti: k, iade: odenen - k, tur: 'kesif', neden: k ? 'Yerinde keşif yapıldığı için keşif bedeli iade edilmez.' : 'Ücretsiz iptal.' };
  }
  if (o.durum === 'YOLDA' || (o.durum === 'MONTAJ' && o.yolda)) {
    if (o.sonradan) return { izin: true, kesinti: ORAN.yolBedeli, iade: 0, tur: 'yol', tahsilGerek: true, neden: 'Usta yola çıktı: yol bedeli kartından çekilir.' };
    const k = Math.min(odenen, ORAN.yolBedeli);
    return { izin: true, kesinti: k, iade: odenen - k, tur: 'yol', neden: 'Usta yola çıktı: yol bedeli kesilir, kalanı iade edilir.' };
  }
  if (o.tip === 'acil') return { izin: true, kesinti: 0, iade: odenen, neden: 'Usta yola çıkmadan ücretsiz iptal.' };
  if (o.tip === 'proje') {
    const k = o.kesif === 'yerinde' ? Math.min(odenen, o.kesifBedeli) : 0;
    return { izin: true, kesinti: k, iade: odenen - k, tur: 'kesif', neden: k ? 'İş başlamadan iptal: yerinde keşif bedeli dışında tam iade.' : 'İş başlamadan iptal: tam iade.' };
  }
  if (o.vade) return { izin: true, kesinti: 0, iade: 0, neden: 'Kartından henüz çekim yapılmadı: ücretsiz iptal.' };
  if ((o.slotTs - simdi()) / SAAT >= 24) return { izin: true, kesinti: 0, iade: odenen, neden: 'Randevuya 24 saatten fazla var: tam iade.' };
  const k = Math.min(odenen, yuvarla(o.fiyat.toplam * ORAN.rezervasyon));
  return { izin: true, kesinti: k, iade: odenen - k, tur: 'rezervasyon', neden: 'Randevuya 24 saatten az kaldı: sipariş bedelinin %10’u rezervasyon bedeli olarak kesilir.' };
}
function iptalEt(o, sebep) {
  const h = iptalHesap(o);
  if (!h.izin) return h;
  if (h.tahsilGerek) tahsil(o, h.kesinti, 'Yol bedeli');
  if (h.iade > 0) { kayit(o, 'IADE', 'İptal iadesi', [['bloke', -h.iade], ['musteri', h.iade]]); o.refunded += h.iade; }
  if (h.kesinti > 0) {
    const c = bosKalem(); if (h.tur === 'yol') c.yol = h.kesinti; else c.iscilik = h.kesinti;
    o.kalem = c; o.relKalem = bosKalem(); o.telafi = 0;
    serbest(o, c, h.tur === 'yol' ? 'Yol bedeli' : h.tur === 'kesif' ? 'Keşif bedeli' : 'Rezervasyon bedeli');
  }
  o.durum = 'IPTAL'; o.offer = null; o.acceptBy = null; o.vade = null;
  o.iptal = { at: simdi(), kesinti: h.kesinti || 0, iade: h.iade || 0, sebep: sebep || 'musteri' };
  iz(o, (sebep === 'musteriYok' ? 'Müşteri adreste bulunamadı; sipariş kapatıldı' : sebep === 'ops' ? 'Sipariş operasyon tarafından iptal edildi' : 'Sipariş iptal edildi') + (h.kesinti ? ' · kesinti ₺' + h.kesinti : ''));
  return h;
}

/* ---------- şikâyet ve uyuşmazlık ---------- */
function kucukEsik(o) { return Math.min(ORAN.kucukTutar, Math.round(o.fiyat.toplam * ORAN.kucukOran)); }
function sikayetTurleri(o) {
  let ids = [];
  if (acikDava(o) || !o.ustaId) return [];
  if (o.durum === 'KABUL') {
    const sure = Math.max(o.garantiBitis || 0, o.kabulAt + 30 * GUN);
    if (simdi() < sure) ids = ['ariza', 'kusur', 'guvenlik'];
    if (simdi() < o.kabulAt + 72 * SAAT) ids.splice(2, 0, 'hasar');
  } else if (o.durum === 'TESLIM' || o.durum === 'ASAMA_ONAY') ids = ['kusur', 'aykiri', 'begenmeme', 'yarim', 'gecikme', 'hasar', 'fiyat', 'guvenlik'];
  else if (o.durum === 'BASLADI') ids = ['yarim', 'hasar', 'fiyat', 'gecikme', 'guvenlik'];
  else if (['PLANLANDI', 'YOLDA', 'MONTAJ', 'URETIM', 'SEVK', 'SEVK_ODEME'].includes(o.durum)) ids = ['gecikme', 'guvenlik'];
  return ids.map(id => SIKAYET_TURLERI.find(t => t.id === id));
}
function sikayetAc(o, x) {
  const t = SIKAYET_TURLERI.find(a => a.id === x.tur);
  const d = { id: 'd' + (++S.seq), oid: o.id, code: o.code, ad: o.ad, tur: x.tur, aciklama: String(x.aciklama || '').trim().slice(0, 600), talep: x.talep,
    tutar: Math.max(0, Math.round(Number(x.tutar) || 0)), fotos: x.fotos || [], at: simdi(), durum: 'ACIK', savunma: null, karar: null, oto: false, once: o.durum, ustaId: o.ustaId };
  S.disputes.unshift(d); o.disputeId = d.id;
  iz(o, 'Şikâyet açıldı: ' + t.ad);
  if (t.acil) {                                             // güvenlik: iş durur, usta askıya alınır, ödeme iade edilir
    const u = ustaBul(o.ustaId); if (u) { u.aski = true; u.ihlal = (u.ihlal || 0) + 1; }
    kararUygula(d, { sonuc: 'iade', yuk: o.durum === 'KABUL' ? 'platform' : 'usta', oto: true, not: 'Güvenlik bildirimi: iş durduruldu, usta askıya alındı, ödemen iade edildi. Güvenlik ekibi 15 dakika içinde seni arar.' });
    return d;
  }
  if (x.talep === 'indirim' && d.tutar > 0 && d.tutar <= kucukEsik(o)) {   // küçük tutar beklemez
    kararUygula(d, { sonuc: 'indirim', tutar: d.tutar, yuk: 'platform', oto: true, not: 'Küçük tutar kuralı: talebin inceleme beklemeden karşılandı.' });
    return d;
  }
  if (x.tur === 'begenmeme') {                              // memnuniyet güvencesi: yılda iki kullanım
    if (!o.memnuniyet && (S.mg || 0) < 2) {
      o.memnuniyet = 1; S.mg = (S.mg || 0) + 1;
      kararUygula(d, { sonuc: 'duzeltme', yuk: 'platform', oto: true, not: 'Memnuniyet güvencesi: bir kez ücretsiz ' + (o.tip === 'proje' ? 'rötuş turu' : o.tip === 'mobilya' ? 'ayar ziyareti' : 'tekrar') + ' planlandı.' });
      return d;
    }
    if (o.memnuniyet === 1 && (o.tip === 'standart' || o.tip === 'acil')) {
      o.memnuniyet = 2;
      kararUygula(d, { sonuc: 'indirim', tutar: o.kalem.iscilik + o.kalem.fark, yuk: 'platform', oto: true, not: 'Memnuniyet güvencesi: tekrardan sonra da memnun kalmadığın için işçilik bedeli iade edildi.' });
      return d;
    }
  }
  if (o.durum !== 'KABUL') { o.durum = 'UYUSMAZLIK'; o.acceptBy = null; }
  return d;
}
function savunmaYaz(d, metin) {
  metin = String(metin || '').trim().slice(0, 600);
  if (!metin) return false;
  d.savunma = { metin, at: simdi() }; d.durum = 'KARAR';
  const o = bul(d.oid); if (o) iz(o, 'Usta şikâyete yanıt verdi');
  return true;
}

function devamEt(o, d) {
  if (d.once === 'TESLIM') kabul(o, {});
  else if (d.once === 'ASAMA_ONAY') { o.durum = 'ASAMA_ONAY'; asamaOnay(o); }
  else if (d.once !== 'KABUL') o.durum = d.once;
}
function kararUygula(d, k) {
  const o = bul(d.oid), yuk = k.yuk || 'usta', sonra = d.once === 'KABUL';
  d.karar = Object.assign({ at: simdi() }, k); d.oto = !!k.oto;
  if (k.sonuc === 'duzeltme') {
    d.durum = 'DUZELTME'; o.fix = (o.fix || 0) + 1; o.duzeltme = true; o.acceptBy = null; o.kontrol = []; o.fotoSonra = [];
    if (o.stages && o.tip === 'proje') { const st = o.stages.slice().reverse().find(a => a.done && !a.accepted); if (st) st.done = false; }
    o.slotTs = slotUret(simdi() + GUN, 10);
    if (k.baskaUsta && o.rel === 0) { if (o.ustaId) o.reddeden.push(o.ustaId); ata(o); }      // ödeme serbest kalmadıysa hakediş işi bitiren ustaya gider
    else o.durum = o.tip === 'mobilya' ? 'MONTAJ' : 'PLANLANDI';
    iz(o, 'Karar: ücretsiz düzeltme planlandı');
  } else if (k.sonuc === 'indirim') {
    let X = Math.max(0, Math.min(Math.round(Number(k.tutar) || 0), indirimTavan(o)));
    if (sonra) X = iadeSonra(o, X, yuk, 'Bedel indirimi');
    else {
      X = iadeOnce(o, X, yuk, 'Bedel indirimi');
      if (yuk === 'usta' && o.stages && d.once === 'ASAMA_ONAY') { const st = o.stages.find(a => a.done && !a.accepted); if (st) st.indirim = (st.indirim || 0) + X; }
    }
    d.karar.tutar = X; d.durum = 'KAPANDI'; d.kapanisAt = simdi();
    iz(o, 'Karar: ₺' + X + ' bedel indirimi');
    if (!sonra) devamEt(o, d);
  } else if (k.sonuc === 'iade') {
    let X;
    if (sonra) X = iadeSonra(o, o.paid - o.refunded, yuk, 'Tam iade');
    else {
      X = iadeOnce(o, blokede(o), yuk, 'Tam iade');
      if (yuk === 'platform' && o.girisAt && o.ustaId) serbest(o, kalanKalem(o), 'Usta hakedişi garanti fonundan');
      else o.telafi = 0;
    }
    d.karar.tutar = X; d.durum = 'KAPANDI'; d.kapanisAt = simdi();
    o.durum = 'IADE'; o.offer = null; o.acceptBy = null; o.vade = null; o.duzeltme = false;
    iz(o, 'Karar: ₺' + X + ' iade edildi, sipariş kapatıldı');
  } else {                                                  // ret
    d.durum = 'KAPANDI'; d.kapanisAt = simdi();
    iz(o, 'Karar: şikâyet reddedildi');
    devamEt(o, d);
  }
  if (yuk === 'usta' && k.sonuc !== 'ret') { const u = ustaBul(d.ustaId); if (u) u.kusur = (u.kusur || 0) + 1; }
}

/* ---------- operasyon ---------- */
function gelmedi(o) {
  const u = ustaBul(o.ustaId);
  if (u) { u.ihlal = (u.ihlal || 0) + 1; if (u.ihlal >= 3) u.aski = true; }
  const kr = Math.max(100, yuvarla(o.fiyat.toplam * 0.10));
  krediVer(kr, o, 'Usta gelmedi telafisi');
  if (o.ustaId) o.reddeden.push(o.ustaId);
  iz(o, 'Usta gelmedi: ' + (u ? u.ad + ' için ağır ihlal yazıldı, ' : '') + '₺' + kr + ' kredi tanımlandı');
  ata(o);
  return kr;
}
function kapsamDegis(il, ilce, kat) {
  const a = kapsamAnahtar(il, ilce), l = S.kapsam[a] || (S.kapsam[a] = []);
  const i = l.indexOf(kat);
  if (i >= 0) l.splice(i, 1); else l.push(kat);
}
function saatKontrol() {
  let degisti = false; const t = simdi();
  S.orders.forEach(o => {
    if (o.vade && t >= o.vade && !kapaliMi(o)) { const g = o.gun; vadeTahsil(o); o.gun = g; degisti = true; }
    if (o.durum === 'TESLIM' && o.acceptBy && t > o.acceptBy) { kabul(o, { oto: true }); degisti = true; }
    if (!acikDava(o)) {
      if (hakedisOde(o, t)) degisti = true;
      if (o.teminat > 0 && o.teminatVade && o.teminatVade <= t && teminatBirak(o)) degisti = true;
    }
  });
  return degisti;
}

/* ---------- mesajlar: platform dışına çıkışı engelleyen süzgeç ---------- */
const YASAK = [/(\+?\d[\s().-]?){10,}/, /\bTR\s?\d{2}[\s\d]{10,}/i, /\biban\b/i, /whats\s?app/i, /\bnakit\b/i, /\belden\b/i, /telegram/i];
function mesajGonder(o, kim, metin) {
  metin = String(metin || '').trim().slice(0, 300);
  if (!metin) return { ok: false };
  if (YASAK.some(r => r.test(metin))) return { ok: false, neden: 'Telefon, IBAN ve platform dışı ödeme bilgisi paylaşılamaz. Güvence yalnızca Mahir üzerinden yapılan işlerde geçerli.' };
  o.mesajlar.push({ kim, metin, at: simdi() }); o.gun = simdi();
  return { ok: true };
}

/* ---------- demo rehberi: sıradaki adım kimde ---------- */
function adimBul(o) {
  const d = acikDava(o), bekleyenDava = d && d.durum !== 'DUZELTME' ? d : null;
  switch (o.durum) {
    case 'TEKLIF_BEKLIYOR': return { rol: 'ops', metin: 'Teklifi hazırlayıp gönder', git: ['o_teklif', { id: o.id }] };
    case 'TEKLIF_HAZIR': return { rol: 'musteri', metin: 'Teklifi incele ve onayla', git: ['siparis', { id: o.id }] };
    case 'ATAMA': return o.offer ? { rol: 'usta', usta: o.offer.ustaId, metin: 'İş teklifini kabul et', git: ['u_teklifler', {}] } : { rol: 'ops', metin: 'Siparişe usta ata', git: ['o_siparis', { id: o.id }] };
    case 'PLANLANDI': return { rol: 'usta', usta: o.ustaId, metin: 'Yola çık', git: ['u_is', { id: o.id }] };
    case 'MONTAJ': return { rol: 'usta', usta: o.ustaId, metin: o.yolda ? 'Kapı kodunu girip montaja başla' : 'Montaj için yola çık', git: ['u_is', { id: o.id }] };
    case 'YOLDA': return { rol: 'usta', usta: o.ustaId, metin: 'Kapı kodunu girip işe başla', git: ['u_is', { id: o.id }] };
    case 'BASLADI': {
      if (bekleyenDava) break;
      if (o.extras.some(e => e.durum === 'bekliyor')) return { rol: 'musteri', metin: 'Ek iş talebini yanıtla', git: ['siparis', { id: o.id }] };
      if (o.extras.some(e => e.durum === 'uzman')) return { rol: 'ops', metin: 'Ek iş talebini incele', git: ['o_siparis', { id: o.id }] };
      return { rol: 'usta', usta: o.ustaId, metin: o.tip === 'proje' ? 'Aşamayı tamamla' : 'İşi tamamla', git: ['u_is', { id: o.id }] };
    }
    case 'ASAMA_ONAY': return { rol: 'musteri', metin: 'Aşamayı kontrol edip onayla', git: ['siparis', { id: o.id }] };
    case 'URETIM': return { rol: 'usta', usta: o.ustaId, metin: 'Üretimi tamamla', git: ['u_is', { id: o.id }] };
    case 'SEVK_ODEME': return { rol: 'musteri', metin: 'Sevk öncesi ödemeyi yap', git: ['siparis', { id: o.id }] };
    case 'SEVK': return { rol: 'usta', usta: o.ustaId, metin: 'Ürünü sevk et', git: ['u_is', { id: o.id }] };
    case 'TESLIM': return { rol: 'musteri', metin: 'İşi kontrol edip onayla', git: ['siparis', { id: o.id }] };
  }
  if (!bekleyenDava) return null;
  return bekleyenDava.durum === 'ACIK'
    ? { rol: 'usta', usta: bekleyenDava.ustaId, metin: 'Şikâyete yanıt yaz', git: ['u_is', { id: o.id }] }
    : { rol: 'ops', metin: 'Şikâyet için karar ver', git: ['o_dava', { id: bekleyenDava.id }] };
}
function sonrakiAdim() {
  const sirali = S.orders.slice().sort((a, b) => b.gun - a.gun);
  for (const o of sirali) { const a = adimBul(o); if (a) return Object.assign({ oid: o.id, code: o.code, ad: o.ad }, a); }
  return null;
}

/* ---------- başlangıç durumu ve örnek veri ---------- */
function bosDurum() {
  const kapsam = {}; BOLGELER.forEach(b => { kapsam[kapsamAnahtar(b.il, b.ilce)] = b.acik.slice(); });
  return { v: SURUM, rol: 'musteri', il: 'İstanbul', ilce: 'Kadıköy', adres: 'Örnek Sokak 12, Daire 4', ustaId: 'u2', credit: 0, mg: 0, seq: 1040,
    orders: [], disputes: [], ledger: [], waitlist: [], kapsam, ustalar: USTALAR.map(u => Object.assign({ ihlal: 0, kusur: 0, aski: false }, u, { belgeler: u.belgeler.slice() })) };
}
function tohumla(t0) {
  S = bosDurum();
  t0 = t0 || Date.now();
  const adres = S.adres;
  _simdi = t0 - 30 * GUN;
  kayit(null, 'ACILIS', 'Garanti fonu açılış bakiyesi', [['sermaye', -50000], ['fon', 50000]]);

  // 1) Tamamlanmış ve hakedişi ödenmiş musluk işi
  _simdi = t0 - 9 * GUN;
  let slot = slotUret(t0 - 7 * GUN, 11);
  let o = siparisOlustur({ sid: 'musluk', opts: { adet: 1, malzeme: true }, slotTs: slot, adres, not: 'Mutfak bataryası damlatıyor.' });
  _simdi += 8 * DK; ustaKabul(o);
  _simdi = slot - 24 * SAAT; saatKontrol();
  _simdi = slot - 25 * DK; yolaCik(o);
  _simdi = slot + 2 * DK; giris(o, o.kod); o.kontrol = hizmet('musluk').kontrol.map((_, i) => i);
  o.fotoOnce = ['ornek:Önce']; o.fotoSonra = ['ornek:Sonra'];
  _simdi = slot + 50 * DK; tamamla(o);
  _simdi = slot + 3 * SAAT; kabul(o, { puan: 5 });
  _simdi = isGunuEkle(_simdi, 2); hakedisOde(o);

  // 2) İki gün sonrası için planlanmış ev temizliği: kart doğrulandı, çekim randevudan 24 saat önce
  _simdi = t0 - 20 * SAAT;
  o = siparisOlustur({ sid: 'temizlik', opts: { secenek: '2+1' }, slotTs: slotUret(t0 + 2 * GUN, 10), adres, not: 'Evde kedi var, balkon kapısı kapalı kalsın.' });
  _simdi += 12 * DK; ustaKabul(o);
  _simdi += 5 * DK; mesajGonder(o, 'usta', 'Merhaba, randevu saatinde ekibimle oradayım.');

  // 3) Boya projesi: ilk aşama onaylandı, ikinci aşama sürüyor
  _simdi = t0 - 6 * GUN;
  o = talepOlustur({ sid: 'boya', opts: { m2: 180 }, kesif: 'video', adres, not: 'Salon ve iki oda. Tavanlar hariç.' });
  _simdi += 5 * SAAT; teklifGonder(o, { m2: 176 });
  _simdi += 3 * SAAT; teklifOnayla(o);
  _simdi += 20 * DK; ustaKabul(o);
  slot = slotUret(t0 - 3 * GUN, 9); o.slotTs = slot;
  _simdi = slot - 20 * DK; yolaCik(o);
  _simdi = slot; giris(o, o.kod); o.kontrol = [0, 1, 2, 3];
  _simdi = slot + 30 * SAAT; asamaTamam(o);
  _simdi += 3 * SAAT; asamaOnay(o);

  // 4) Şikâyetli klima bakımı: usta yanıtladı, karar bekleniyor
  slot = slotUret(t0 - GUN, 15);
  if (slot > t0 - 8 * SAAT) slot = slotUret(t0 - GUN, 9);
  _simdi = slot - 20 * SAAT;
  o = siparisOlustur({ sid: 'klima', opts: { adet: 1 }, slotTs: slot, adres, not: '' });
  _simdi += 15 * DK; ustaKabul(o);
  _simdi = slot - 15 * DK; yolaCik(o);
  _simdi = slot + 3 * DK; giris(o, o.kod); o.kontrol = hizmet('klima').kontrol.map((_, i) => i);
  o.fotoSonra = ['ornek:Sonra'];
  _simdi = slot + 65 * DK; tamamla(o);
  _simdi = slot + 5 * SAAT;
  const d = sikayetAc(o, { tur: 'kusur', aciklama: 'Bakımdan sonra iç ünite su damlatmaya başladı.', talep: 'duzeltme' });
  _simdi += 2 * SAAT; savunmaYaz(d, 'Drenaj hortumu yerinden çıkmış olabilir. Yarın uğrayıp ücretsiz düzeltirim.');

  // 5) Usta ekranında yanıt bekleyen iş teklifi
  _simdi = t0 - 6 * DK;
  o = siparisOlustur({ sid: 'avize', opts: { adet: 2 }, slotTs: slotUret(t0 + 2 * GUN, 13), adres, not: 'Tavan yüksekliği 2,80 m.' });

  S.waitlist.push({ il: 'Artvin', ilce: 'Merkez', kat: 'tamir', at: t0 - 2 * GUN }, { il: 'Trabzon', ilce: 'Ortahisar', kat: 'ev', at: t0 - GUN }, { il: 'Ankara', ilce: 'Keçiören', kat: 'tadilat', at: t0 - 3 * GUN });
  _simdi = null;
  return S;
}
function baslat() { S = yukle() || tohumla(); saatKontrol(); kaydet(); return S; }
