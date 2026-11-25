/* ===== Mahir · arayüz çatısı: yardımcılar, gezinme, ortak parçalar ===== */

const $ = (s, k) => (k || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tl = n => '₺' + Math.round(n).toLocaleString('tr-TR');
const GUN_AD = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'], AY_AD = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
function gunAd(ts) {
  const d = new Date(ts), b = new Date(); b.setHours(0, 0, 0, 0);
  const g = new Date(ts); g.setHours(0, 0, 0, 0);
  const f = Math.round((g - b) / GUN);
  return f === 0 ? 'Bugün' : f === 1 ? 'Yarın' : f === -1 ? 'Dün' : d.getDate() + ' ' + AY_AD[d.getMonth()] + ' ' + GUN_AD[d.getDay()];
}
const saatAd = ts => { const d = new Date(ts); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const zaman = ts => gunAd(ts) + ' ' + saatAd(ts);
const tarih = ts => { const d = new Date(ts); return d.getDate() + ' ' + AY_AD[d.getMonth()] + ' ' + d.getFullYear(); };

/* ---------- ikonlar (24 birimlik çizgi ikonlar) ---------- */
const IKON = {
  home: 'M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z',
  liste: 'M7 4h10a2 2 0 0 1 2 2v14l-3-2-2 2-2-2-2 2-2-2-3 2V6a2 2 0 0 1 2-2zM9 9h6M9 13h6',
  kalkan: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zM9 12l2 2 4-4',
  kisi: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1.2-3.4 4.3-5 8-5s6.8 1.6 8 5',
  canta: 'M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18',
  cuzdan: 'M4 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 7V6a2 2 0 0 1 2-2h10v3M16 13h1.5',
  ozet: 'M4 20V10M10 20V4M16 20v-7M21 20H3',
  uyari: 'M12 4l9 15H3zM12 10v4M12 17h.01',
  ag: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.8-3 3.3-4.5 6.5-4.5s5.7 1.5 6.5 4.5M16 4.3a3.5 3.5 0 0 1 0 6.4M18.5 15.8c1.6.6 2.6 2 3 4.2',
  defter: 'M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h12M9 8h6',
  wrench: 'M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.6 2.6-2.4-.6-.6-2.4z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  roller: 'M5 4h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM18 6.5h2v5h-8v3M11 14.5h2V20h-2z',
  cabinet: 'M5 3h14a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM12 3v17M9.5 11v2M14.5 11v2M6 20v1.5M18 20v1.5',
  bolt: 'M13 3L5 13.5h6L10 21l9-11h-6z',
  drop: 'M12 3.5c3.2 3.8 6 6.9 6 10.2a6 6 0 0 1-12 0c0-3.3 2.8-6.4 6-10.2z',
  lamp: 'M9 17h6M10 20h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6V17h5.4v-1.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z',
  plug: 'M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4',
  snow: 'M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M12 6l-2-2M12 6l2-2M12 18l-2 2M12 18l2 2',
  box: 'M3.5 8L12 3.5 20.5 8v8L12 20.5 3.5 16zM3.5 8L12 12.5 20.5 8M12 12.5v8',
  tv: 'M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 20.5h8',
  sofa: 'M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3zM6 18v2M18 18v2',
  key: 'M15 13a4.5 4.5 0 1 0-4.2-2.9L4 17v3h3l1-1v-2h2l1.9-1.9A4.5 4.5 0 0 0 15 13zM16 8h.01',
  ruler: 'M3 16.5L16.5 3 21 7.5 7.5 21zM7 12.5l2 2M10 9.5l2 2M13 6.5l2 2',
  sag: 'M9 5l7 7-7 7', sol: 'M15 5l-7 7 7 7', asagi: 'M5 9l7 7 7-7',
  tik: 'M5 12.5l4.5 4.5L19 7.5', carpi: 'M6 6l12 12M18 6L6 18', arti: 'M12 5v14M5 12h14', eksi: 'M5 12h14',
  pin: 'M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  saat: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
  kamera: 'M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  mesaj: 'M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  yildiz: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z',
  bilgi: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 7.8h.01',
  takvim: 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4',
  kart: 'M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM2 10h20M6 15h4',
  kilit: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V8a4 4 0 0 1 8 0v3',
  kamyon: 'M2 6h11v10H2zM13 9h4l4 4v3h-8zM6.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  yenile: 'M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9M18.5 3.5v4h-4M5.5 20.5v-4h4',
  gonder: 'M4 12l16-8-6 16-3-6.5z',
};
const ikon = (ad, cls) => `<svg class="ik${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${IKON[ad] || IKON.bilgi}"/></svg>`;

/* ---------- fotoğraflar ---------- */
function ornekFoto(etiket) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#DCE3D8"/><path d="M0 76l32-28 24 18 26-32 38 36v50H0z" fill="#9FB3A8"/><circle cx="88" cy="26" r="10" fill="#F7B51C"/><rect y="92" width="120" height="28" fill="#0D2B26"/><text x="60" y="104" text-anchor="middle" font-family="monospace" font-size="9" letter-spacing="1" fill="#F7B51C">ÖRNEK</text><text x="60" y="115" text-anchor="middle" font-family="monospace" font-size="9" fill="#F3F5F0">' + esc(etiket) + '</text></svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
const fotoSrc = x => (String(x).indexOf('ornek:') === 0 ? ornekFoto(x.slice(6)) : x);
function fotoOku(file, cb) {
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    const k = Math.min(1, 720 / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); cb(c.toDataURL('image/jpeg', 0.7));
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast('Fotoğraf okunamadı.', 'hata'); };
  img.src = url;
}
function fotoListe(hedef) {
  const i = hedef.indexOf(':'), t = hedef.slice(0, i), k = hedef.slice(i + 1);
  if (t === 'f') { const f = SH ? SH.f : V.f; return f[k] || (f[k] = []); }
  const o = bul(V.p.id); return o[k] || (o[k] = []);
}
function fotoAlan(hedef, liste, ad) {
  liste = liste || [];
  return `<div class="foto-alan">${liste.map((x, i) => `<span class="foto"><img src="${fotoSrc(x)}" alt="${esc(ad)} ${i + 1}"><button data-act="fotoSil" data-hedef="${hedef}" data-i="${i}" aria-label="Fotoğrafı kaldır">${ikon('carpi')}</button></span>`).join('')}${liste.length < 4 ? `<label class="foto-ekle">${ikon('kamera')}<span>Fotoğraf ekle</span><input type="file" accept="image/*" data-foto="${hedef}" hidden></label><button class="foto-ekle ornek" data-act="ornekFoto" data-hedef="${hedef}" data-ad="${esc(ad)}">${ikon('arti')}<span>Örnek ekle</span></button>` : ''}</div>`;
}
const fotoGaleri = (liste, ad) => (liste && liste.length ? `<div class="foto-alan">${liste.map((x, i) => `<span class="foto"><img src="${fotoSrc(x)}" alt="${esc(ad)} ${i + 1}"></span>`).join('')}</div>` : '');

/* ---------- gezinme ---------- */
let V = { ad: 'ana', p: {}, f: {} };       // açık görünüm, parametreleri ve form taslağı
let YIGIN = [];                             // geri yığını
let SH = null, SH_YENI = false;             // açık alt panel
const G = {};                               // görünümler: ad → html
const SHEET = {};                           // alt paneller
const EYLEM = {};                           // data-act işleyicileri
const CANLI = {};                           // sürükleme sırasında yalnızca değişen parçayı güncelleyenler

const KOK = { musteri: 'ana', usta: 'u_teklifler', ops: 'o_ozet' };
const ROL_AD = { musteri: 'Müşteri', usta: 'Usta', ops: 'Operasyon' };
const ROL_HASH = { musteri: 'musteri', usta: 'usta', ops: 'operasyon' };
const SEKMELER = {
  musteri: [['ana', 'Ana sayfa', 'home'], ['siparisler', 'Siparişler', 'liste'], ['guvence', 'Güvence', 'kalkan'], ['hesap', 'Hesap', 'kisi']],
  usta: [['u_teklifler', 'İşler', 'canta'], ['u_kazanc', 'Kazanç', 'cuzdan'], ['u_profil', 'Profil', 'kisi']],
  ops: [['o_ozet', 'Özet', 'ozet'], ['o_siparisler', 'Siparişler', 'liste'], ['o_davalar', 'Şikâyetler', 'uyari'], ['o_ag', 'Ağ', 'ag'], ['o_defter', 'Defter', 'defter']],
};
const SEKME_KOKU = { kategori: 'ana', hizmet: 'ana', siparis: 'siparisler', sikayet: 'siparisler', u_is: 'u_teklifler', o_siparis: 'o_siparisler', o_teklif: 'o_siparisler', o_dava: 'o_davalar' };
const yeniV = (ad, p) => ({ ad, p: p || {}, f: {} });

function git(ad, p) { YIGIN.push(V); V = yeniV(ad, p); SH = null; ciz(true); }
function kokeGit(ad, p) {           // bir sekmenin altındaki sayfaya doğrudan gider; geri tuşu sekmeye döner
  const kok = SEKME_KOKU[ad];
  YIGIN = kok ? [yeniV(kok)] : []; V = yeniV(ad, p); SH = null; ciz(true);
}
function geri() { V = YIGIN.pop() || yeniV(SEKME_KOKU[V.ad] || KOK[S.rol]); SH = null; ciz(true); }
function hashYaz() { try { history.replaceState(null, '', '#' + ROL_HASH[S.rol]); } catch (e) { /* gömülü çerçevede olmayabilir */ } }
function rolDegis(rol, ad, p) {
  S.rol = rol; kaydet(); hashYaz();
  if (ad) kokeGit(ad, p); else { YIGIN = []; V = yeniV(KOK[rol]); SH = null; ciz(true); }
}
function sheetAc(ad, p) { SH = { ad, p: p || {}, f: {} }; SH_YENI = true; ciz(); }
function sheetKapat() { SH = null; ciz(); }
function degisti(mesaj, tip) { kaydet(); if (mesaj) toast(mesaj, tip); ciz(); }

let toastZ = null;
function toast(metin, tip) {
  const el = $('#toast'); if (!el) return;
  el.className = 'toast goster' + (tip ? ' ' + tip : ''); el.textContent = metin;
  clearTimeout(toastZ); toastZ = setTimeout(() => { el.className = 'toast'; }, tip === 'hata' ? 5200 : 3200);
}

/* ---------- ortak parçalar ---------- */
function durumBilgi(o, bakis) {
  const d = DURUM[o.durum]; let ad = d.ad, sinif = d.sinif;
  if (o.durum === 'KABUL' && acikDava(o)) { ad = 'Şikâyet inceleniyor'; sinif = 'sorun'; }
  else if (o.duzeltme && !kapaliMi(o) && o.durum !== 'UYUSMAZLIK') ad = 'Düzeltme · ' + ad.toLocaleLowerCase('tr-TR');
  if (o.durum === 'MONTAJ' && o.yolda) ad = 'Montaj ekibi yolda';
  if (o.durum === 'IPTAL' && o.iptal && o.iptal.sebep === 'musteriYok') ad = 'Müşteri bulunamadı';
  if (bakis !== 'musteri' && sinif === 'sen') { sinif = 'bekle'; ad = { TEKLIF_HAZIR: 'Müşteri onayı bekleniyor', ASAMA_ONAY: 'Aşama onayı bekleniyor', SEVK_ODEME: 'Sevk ödemesi bekleniyor', TESLIM: 'Müşteri kabulü bekleniyor' }[o.durum] || ad; }
  if (bakis === 'usta' && o.durum === 'ATAMA') { ad = 'Yanıtın bekleniyor'; sinif = 'sen'; }
  return { ad, sinif };
}
const durumCip = (o, bakis) => { const d = durumBilgi(o, bakis); return `<span class="cip cip-${d.sinif}">${d.ad}</span>`; };
const sayfaBas = (baslik, alt) => `<div class="sayfa-bas"><button class="geri" data-act="geri" aria-label="Geri">${ikon('sol')}</button><div><h1>${esc(baslik)}</h1>${alt ? `<p>${esc(alt)}</p>` : ''}</div></div>`;
const bos = (metin, ik) => `<div class="bos">${ikon(ik || 'bilgi')}<p>${metin}</p></div>`;
const not = (metin, tip) => `<p class="not${tip ? ' not-' + tip : ''}">${ikon(tip === 'uyari' ? 'uyari' : tip === 'kilit' ? 'kilit' : 'bilgi')}<span>${metin}</span></p>`;
const satirlar = (lines, toplam, toplamAd) => `<dl class="kalemler">${lines.map(l => `<div><dt>${esc(l.ad)}</dt><dd>${l.tutar < 0 ? '−' + tl(-l.tutar) : tl(l.tutar)}</dd></div>`).join('')}${toplam != null ? `<div class="toplam"><dt>${toplamAd || 'Toplam'} <small>KDV dahil</small></dt><dd>${tl(toplam)}</dd></div>` : ''}</dl>`;
const yildizlar = n => `<span class="yildiz" aria-label="${n} yıldız">${[1, 2, 3, 4, 5].map(i => ikon('yildiz', i <= n ? 'dolu' : '')).join('')}</span>`;

function siparisKart(o, hedef, bakis) {
  const s = hizmet(o.sid), u = ustaBul(o.ustaId);
  const alt = [o.code, o.slotTs && !kapaliMi(o) ? zaman(o.slotTs) : gunAd(o.gun)];
  if (bakis === 'ops') alt.push(o.ilce); else if (bakis === 'usta') alt.push(o.ilce);
  const tutar = bakis === 'usta' ? ustaPayi(o).H : o.fiyat ? o.fiyat.toplam : o.onFiyat;
  return `<button class="kart sip" data-act="git" data-ad="${hedef}" data-id="${o.id}">
    <span class="rozet">${ikon(s.ikon)}</span>
    <span class="sip-orta"><b>${esc(o.ad)}</b><small>${alt.map(esc).join(' · ')}</small>${bakis === 'ops' && u ? `<small>${esc(u.ad)}</small>` : ''}
      <span class="sip-alt">${durumCip(o, bakis)}<span class="para">${o.fiyat ? '' : '≈'}${tl(tutar)}</span></span></span></button>`;
}

function ustaKart(u, o) {
  return `<section class="kart usta-kart"><span class="avatar">${esc(u.ad.charAt(0))}</span>
    <div><b>${esc(u.ad)}</b><small>${MESLEK_AD[u.meslek]} · ${u.seviye} usta</small>
    <small class="usta-olcu">${u.puan ? `${ikon('yildiz', 'dolu')} ${u.puan.toLocaleString('tr-TR')}` : 'Yeni'} · ${u.is} iş</small><small>${ikon('kalkan', 'mini')} ${u.belgeler.map(esc).join(', ')} doğrulandı</small></div></section>`;
}

/* Sipariş yolculuğu: sarı metre üzerinde adımlar */
function adimAlt(o, i) {
  const u = ustaBul(o.ustaId), s = hizmet(o.sid);
  switch (i) {
    case 0: return zaman(o.at);
    case 1: return o.tip === 'proje' || o.tip === 'mobilya' ? (o.teklif ? 'Gönderildi · ' + gunAd(o.teklif.at) : 'Hazırlanıyor') : o.tip === 'acil' ? 'Tanı ücreti ve tavan fiyat' : 'Sabit fiyat';
    case 2: return o.vade ? 'Çekim: ' + zaman(o.vade) : o.sonradan && !o.paid ? 'Ücret iş bitiminde çekilir' : o.paid ? tl(o.paid) + ' alındı' : '';
    case 3: return u ? u.ad : o.offer ? 'Usta yanıtı bekleniyor' : '';
    case 4: return o.girisAt ? 'Başladı · ' + zaman(o.girisAt) : o.slotTs ? zaman(o.slotTs) : '';
    case 5: return o.teslimAt ? zaman(o.teslimAt) : '';
    case 6: return o.kabulAt ? zaman(o.kabulAt) + (o.otoKabul ? ' · otomatik' : '') : o.acceptBy ? 'Son onay: ' + zaman(o.acceptBy) : '';
    default: return o.garantiBitis ? tarih(o.garantiBitis) + ' tarihine kadar' : s.garantiAy ? s.garantiAy + ' ay işçilik garantisi' : 'İlk 30 gün kusur bildirimi';
  }
}
function cetvel(o) {
  const a = DURUM[o.durum].adim;
  if (a < 0) return '';
  return `<section class="kart"><h2>Yolculuk</h2><ol class="cetvel">${ADIMLAR.map((ad, i) => {
    const sinif = i < a || o.durum === 'KABUL' ? 'gecti' : i === a ? 'simdi' : 'sonra';
    let ek = '';
    if (i === 4 && o.stages && a >= 3) ek = `<ul class="asamalar">${o.stages.map(st => `<li class="${st.accepted ? 'tamam' : st.done ? 'bekler' : ''}">${ikon(st.accepted ? 'tik' : 'saat')}<span>${esc(st.ad)} <em>%${st.pct}</em></span><b>${tl(st.tutar)}</b></li>`).join('')}</ul>`;
    return `<li class="${sinif}"><b>${ad}</b><small>${sinif === 'sonra' && i !== 7 && i !== 4 ? '' : esc(adimAlt(o, i))}</small>${ek}</li>`;
  }).join('')}</ol></section>`;
}

function odemeOzet(o, bakis) {
  if (!o.fiyat) return `<section class="kart"><h2>Fiyat</h2>${satirlar([{ ad: 'Ön tahmin (kesin fiyat keşiften sonra)', tutar: o.onFiyat }])}${o.paid ? satirlar([{ ad: 'Alınan keşif bedeli', tutar: o.paid }]) : ''}</section>`;
  const lines = o.durum === 'TEKLIF_HAZIR' && bakis === 'musteri' ? [] : o.fiyat.lines.slice();      // teklif kartı kalemleri zaten gösteriyor
  o.extras.filter(e => e.durum === 'onay').forEach(e => lines.push({ ad: 'Ek iş · ' + e.ad, tutar: e.tutar }));
  const b = blokede(o), para = [];
  if (o.vade) para.push(['Kartından çekilecek', zaman(o.vade)]);
  else if (o.sonradan && !o.paid && !kapaliMi(o)) para.push(['Kartından çekilecek', 'iş bitiminde']);
  if (o.paid) para.push(['Kartından çekilen', tl(o.paid)]);
  if (b > 0) para.push(['Mahir’de blokede', tl(b)]);
  if (o.rel) para.push([bakis === 'ops' ? 'Serbest bırakılan' : 'Ustaya ve tedarikçiye aktarılan', tl(o.rel)]);
  if (o.refunded) para.push(['Sana iade edilen', tl(o.refunded)]);
  if (!lines.length && !para.length) return '';
  return `<section class="kart"><h2>Ödeme</h2>${lines.length ? satirlar(lines, o.fiyat.toplam) : ''}
    ${o.fiyat.tavan ? not('Tavan fiyat ' + tl(o.fiyat.tavan) + ': toplam bu tutarı aşamaz.') : ''}
    ${para.length ? `<dl class="kalemler para-durum">${para.map(x => `<div><dt>${x[0]}</dt><dd>${x[1]}</dd></div>`).join('')}</dl>` : ''}
    ${b > 0 ? not('Blokedeki tutar, sen işi onaylayana kadar ustaya aktarılmaz.', 'kilit') : ''}</section>`;
}

function sohbet(o, kim) {
  const diger = kim === 'musteri' ? 'usta' : 'musteri';
  return `<section class="kart sohbet"><h2>Mesajlar</h2>
    <div class="mesajlar">${o.mesajlar.length ? o.mesajlar.map(m => `<p class="msj ${m.kim === kim ? 'ben' : 'o'}"><span>${esc(m.metin)}</span><time>${saatAd(m.at)}</time></p>`).join('') : `<p class="msj-bos">Henüz mesaj yok. ${kim === 'musteri' ? 'Ustana' : 'Müşteriye'} buradan yazabilirsin; telefon numarası paylaşılmaz.</p>`}</div>
    <div class="hazir">${HAZIR_MESAJ[kim].map(m => `<button data-act="mesaj" data-kim="${kim}" data-metin="${esc(m)}">${esc(m)}</button>`).join('')}</div>
    <div class="msj-yaz"><input type="text" data-f="mesaj" data-enter="mesaj" data-kim="${kim}" maxlength="300" placeholder="${diger === 'usta' ? 'Ustana yaz' : 'Müşteriye yaz'}" aria-label="Mesaj" value="${esc(V.f.mesaj || '')}"><button class="ikon-btn" data-act="mesaj" data-kim="${kim}" aria-label="Gönder">${ikon('gonder')}</button></div></section>`;
}

function izKart(o) {
  return `<details class="kart iz"><summary><h2>İşlem geçmişi</h2>${ikon('asagi')}</summary><ol>${o.iz.slice().reverse().map(x => `<li><time>${zaman(x.at)}</time><span>${esc(x.metin)}</span></li>`).join('')}</ol></details>`;
}

const TUR_AD = id => (SIKAYET_TURLERI.find(t => t.id === id) || {}).ad || id;
const DAVA_DURUM = { ACIK: ['Usta yanıtı bekleniyor', 'bekle'], KARAR: ['Karar bekliyor', 'sen'], DUZELTME: ['Düzeltme planlandı', 'aktif'], KAPANDI: ['Kapandı', 'kapali'] };
function kararMetni(d) {
  const k = d.karar; if (!k) return '';
  if (k.sonuc === 'duzeltme') return 'Ücretsiz düzeltme' + (k.baskaUsta ? ' (başka usta)' : '');
  if (k.sonuc === 'indirim') return tl(k.tutar) + ' bedel indirimi';
  if (k.sonuc === 'iade') return tl(k.tutar) + ' iade, sipariş kapatıldı';
  return 'Şikâyet reddedildi';
}
function davaKart(d, bakis) {
  const dd = DAVA_DURUM[d.durum];
  return `<section class="kart dava"><div class="kart-ust"><h2>Şikâyet · ${esc(TUR_AD(d.tur))}</h2><span class="cip cip-${bakis === 'ops' ? dd[1] : dd[1] === 'sen' ? 'bekle' : dd[1]}">${dd[0]}</span></div>
    <p class="alinti">${esc(d.aciklama || 'Açıklama yok.')}</p>${fotoGaleri(d.fotos, 'Şikâyet fotoğrafı')}
    <dl class="kalemler bilgi"><div><dt>Talep</dt><dd>${TALEP_AD[d.talep] || '—'}${d.talep === 'indirim' && d.tutar ? ' · ' + tl(d.tutar) : ''}</dd></div><div><dt>Açıldı</dt><dd>${zaman(d.at)}</dd></div></dl>
    ${d.savunma ? `<h3>Usta yanıtı</h3><p class="alinti usta">${esc(d.savunma.metin)}</p>` : ''}
    ${d.karar ? `<h3>Karar</h3><p class="karar">${ikon('tik')}<span><b>${kararMetni(d)}</b>${d.karar.not ? '<br>' + esc(d.karar.not) : ''}${bakis !== 'musteri' ? `<br><small>${d.karar.yuk === 'usta' ? 'Usta kusuru: bedel ustanın hakedişinden' : 'Platform üstlendi: garanti fonundan'}${d.oto ? ' · otomatik' : ''}</small>` : ''}</span></p>` : bakis === 'musteri' ? not('İlk yanıt 2 saat içinde, karar en geç 48 saatte. Ödemen bu sürede ustaya aktarılmaz.', 'kilit') : ''}</section>`;
}

/* ---------- çatı ---------- */
function rozetSayisi(rol, ad) {
  if (rol === 'musteri' && ad === 'siparisler') return S.orders.filter(o => DURUM[o.durum].sinif === 'sen' || o.extras.some(e => e.durum === 'bekliyor')).length;
  if (rol === 'usta' && ad === 'u_teklifler') return S.orders.filter(o => o.offer && o.offer.ustaId === S.ustaId).length + S.disputes.filter(d => d.ustaId === S.ustaId && d.durum === 'ACIK').length;
  if (rol === 'ops' && ad === 'o_davalar') return S.disputes.filter(d => d.durum === 'KARAR').length;
  if (rol === 'ops' && ad === 'o_siparisler') return S.orders.filter(o => o.durum === 'TEKLIF_BEKLIYOR' || o.atamaBekliyor || o.extras.some(e => e.durum === 'uzman')).length;
  return 0;
}
function baglam() {
  if (S.rol === 'musteri') return `<button class="baglam" data-act="sheet" data-ad="konum">${ikon('pin')}<span>${esc(S.ilce)}, ${esc(S.il)}</span>${ikon('asagi')}</button>`;
  if (S.rol === 'usta') { const u = ustaBul(S.ustaId); return `<button class="baglam" data-act="sheet" data-ad="ustaSec">${ikon('kisi')}<span>${esc(u.ad)}</span>${ikon('asagi')}</button>`; }
  return `<span class="baglam sabit">${ikon('ozet')}<span>Operasyon paneli</span></span>`;
}
function rehberHtml() {
  const a = sonrakiAdim();
  if (!a) return `<button class="rehber" data-act="rehberYeni"><span class="rehber-et">Demo</span><span class="rehber-metin"><b>Bekleyen adım kalmadı.</b> Yeni bir sipariş ver</span>${ikon('sag')}</button>`;
  const burada = a.rol === S.rol && a.git[0] === V.ad && (a.git[1].id || '') === (V.p.id || '') && (a.rol !== 'usta' || a.usta === S.ustaId);
  if (burada) return '';
  const kim = a.rol === 'usta' ? ustaBul(a.usta).ad : ROL_AD[a.rol];
  return `<button class="rehber" data-act="rehber"><span class="rehber-et">Sıradaki adım</span><span class="rehber-metin"><b>${esc(kim)}:</b> ${esc(a.metin)} <small>${esc(a.ad)}</small></span>${ikon('sag')}</button>`;
}
function cati(govde) {
  const rol = S.rol, aktif = SEKME_KOKU[V.ad] || V.ad;
  return `<div class="demo"><span class="demo-et"><b>DEMO</b><i>örnek veri<u> · gerçek ödeme alınmaz</u></i></span>
    <div class="rol" role="group" aria-label="Rol seç">${Object.keys(ROL_AD).map(r => `<button data-act="rol" data-rol="${r}" class="${r === rol ? 'sec' : ''}" aria-pressed="${r === rol}">${ROL_AD[r]}</button>`).join('')}</div></div>
  <header class="bas"><button class="logo" data-act="kok" aria-label="Mahir · ana sayfa">${LOGO}</button>${baglam()}</header>
  <div class="govde">
    <nav class="sekme" aria-label="Bölümler">${SEKMELER[rol].map(s => { const n = rozetSayisi(rol, s[0]); return `<button data-act="sekme" data-ad="${s[0]}" class="${s[0] === aktif ? 'sec' : ''}"${s[0] === aktif ? ' aria-current="page"' : ''}>${ikon(s[2])}<span>${s[1]}</span>${n ? `<i class="sayi">${n}</i>` : ''}</button>`; }).join('')}</nav>
    <div class="orta"><main id="icerik" class="rol-${rol} g-${V.ad}" tabindex="-1"><div class="sayfa">${govde}</div></main>${rehberHtml()}</div>
  </div>
  ${SH ? `<div class="perde${SH_YENI ? ' giris' : ''}" data-act="sheetKapat"></div><div class="sheet${SH_YENI ? ' giris' : ''}" role="dialog" aria-modal="true" aria-label="${esc(SH.p.baslik || 'Panel')}"><span class="tutamak"></span><button class="sheet-kapat" data-act="sheetKapat" aria-label="Kapat">${ikon('carpi')}</button><div class="sheet-ic">${SHEET[SH.ad](SH.p, SH.f)}</div></div>` : ''}`;
}
function ciz(basa) {
  const eski = $('#icerik'), y = eski && !basa ? eski.scrollTop : 0;
  const sEski = $('.sheet-ic'), sy = sEski && !SH_YENI ? sEski.scrollTop : 0;
  if (!G[V.ad]) V = yeniV(KOK[S.rol]);
  if (SH && !SHEET[SH.ad]) SH = null;
  let govde;
  try { govde = G[V.ad](V.p, V.f); } catch (e) { console.error(e); govde = bos('Bu ekran açılamadı. Hesap sekmesinden örnek veriyi sıfırlayabilirsin.', 'uyari'); }
  $('#app').innerHTML = cati(govde);
  $('#icerik').scrollTop = y;
  if ($('.sheet-ic')) $('.sheet-ic').scrollTop = sy;
  if (SH_YENI && $('.sheet')) $('.sheet').setAttribute('tabindex', '-1');
  SH_YENI = false;
}

/* ---------- genel eylemler ---------- */
Object.assign(EYLEM, {
  rol: d => rolDegis(d.rol),
  git: d => git(d.ad, d.id ? { id: d.id } : d.kat ? { kat: d.kat } : {}),
  sekme: d => { YIGIN = []; V = yeniV(d.ad); SH = null; ciz(true); },
  geri: () => geri(),
  kok: () => { YIGIN = []; V = yeniV(KOK[S.rol]); SH = null; ciz(true); },
  sheet: d => sheetAc(d.ad, Object.assign({}, d)),
  sheetKapat: () => sheetKapat(),
  sec: (d, el) => { const f = el.closest('.sheet') && SH ? SH.f : V.f; f[d.k] = f[d.k] === d.v && d.kapat ? '' : d.v; ciz(); },
  adim: (d, el) => { const f = el.closest('.sheet') && SH ? SH.f : V.f; f[d.k] = Math.max(Number(d.min), Math.min(Number(d.max), (Number(f[d.k]) || 0) + Number(d.d))); ciz(); },
  rehber: () => { const a = sonrakiAdim(); if (!a) return; if (a.rol === 'usta') S.ustaId = a.usta; rolDegis(a.rol, a.git[0], a.git[1]); },
  rehberYeni: () => rolDegis('musteri'),
  konumSec: d => { S.il = d.il; S.ilce = d.ilce; SH = null; degisti(d.ilce + ', ' + d.il + ' seçildi'); },
  ustaSecildi: d => { S.ustaId = d.id; YIGIN = []; V = yeniV('u_teklifler'); SH = null; degisti(); },
  sifirla: () => { tohumla(); saatKontrol(); kaydet(); YIGIN = []; V = yeniV(KOK[S.rol]); SH = null; ciz(true); toast('Örnek veri sıfırlandı'); },
  fotoSil: d => { fotoListe(d.hedef).splice(Number(d.i), 1); degisti(); },
  ornekFoto: d => { const l = fotoListe(d.hedef); if (l.length < 4) l.push('ornek:' + (d.ad || 'Fotoğraf')); degisti(); },
  mesaj: (d, el) => {
    const o = bul(V.p.id); if (!o) return;
    const metin = d.metin || V.f.mesaj || '';
    const r = mesajGonder(o, d.kim, metin);
    if (!r.ok) { if (r.neden) toast(r.neden, 'hata'); return; }
    V.f.mesaj = ''; degisti();
    const m = $('.mesajlar'); if (m) m.scrollTop = m.scrollHeight;
  },
});

SHEET.konum = () => {
  const iller = []; BOLGELER.forEach(b => { if (!iller.includes(b.il)) iller.push(b.il); });
  return `<h2>Hizmet bölgesi</h2><p class="sheet-alt">Fiyatlar ve açık kategoriler ilçeye göre değişir.</p>
    ${iller.map(il => `<h3>${esc(il)}</h3><div class="secim-liste">${BOLGELER.filter(b => b.il === il).map(b => { const n = (S.kapsam[kapsamAnahtar(b.il, b.ilce)] || []).length; return `<button data-act="konumSec" data-il="${esc(b.il)}" data-ilce="${esc(b.ilce)}" class="${b.il === S.il && b.ilce === S.ilce ? 'sec' : ''}"><span>${esc(b.ilce)}</span><small>${n === KATEGORILER.length ? 'Tüm kategoriler açık' : n + '/' + KATEGORILER.length + ' kategori açık'}</small></button>`; }).join('')}</div>`).join('')}
    ${not('Listede olmayan ilçeler için bekleme listesi açılır: bir ilçe, kategoride en az 3 aktif usta olunca hizmete girer.')}`;
};
SHEET.ustaSec = () => `<h2>Hangi usta olarak bakıyorsun?</h2><p class="sheet-alt">Demoda her ustanın ekranını görebilirsin.</p>
  <div class="secim-liste">${S.ustalar.map(u => { const n = S.orders.filter(o => o.offer && o.offer.ustaId === u.id).length, a = S.orders.filter(o => o.ustaId === u.id && !kapaliMi(o)).length; return `<button data-act="ustaSecildi" data-id="${u.id}" class="${u.id === S.ustaId ? 'sec' : ''}"><span>${esc(u.ad)} <em>${MESLEK_AD[u.meslek]}</em></span><small>${u.seviye}${u.aski ? ' · askıda' : ''}${n ? ' · ' + n + ' teklif' : ''}${a ? ' · ' + a + ' aktif iş' : ''}</small></button>`; }).join('')}</div>`;
SHEET.bilgi = p => `<h2>${esc(p.baslik)}</h2><p class="sheet-metin">${p.metin}</p><button class="btn" data-act="sheetKapat">Tamam</button>`;
SHEET.onay = p => `<h2>${esc(p.baslik)}</h2><p class="sheet-metin">${esc(p.metin)}</p>
  <div class="btn-sira"><button class="btn ikincil" data-act="sheetKapat">Vazgeç</button><button class="btn${p.tehlike ? ' tehlike' : ''}" data-act="${p.eylem}" data-id="${p.id || ''}" data-ek="${esc(p.ek || '')}">${esc(p.etiket)}</button></div>`;

/* ---------- olay dinleyiciler ---------- */
function olaylar() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
    const fn = EYLEM[el.dataset.act]; if (!fn) return;
    e.preventDefault(); fn(el.dataset, el, e);
  });
  document.addEventListener('input', e => {
    const el = e.target, k = el.dataset && el.dataset.f; if (!k) return;
    const f = el.closest('.sheet') && SH ? SH.f : V.f;
    f[k] = el.type === 'checkbox' ? el.checked : el.value;
    if (el.dataset.canli && CANLI[V.ad]) CANLI[V.ad](V.p, V.f);
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset && el.dataset.foto && el.files && el.files[0]) { const hedef = el.dataset.foto; fotoOku(el.files[0], url => { const l = fotoListe(hedef); if (l.length < 4) l.push(url); degisti(); }); return; }
    if (el.dataset && el.dataset.ciz) ciz();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && SH) { sheetKapat(); return; }
    const el = e.target;
    if (e.key === 'Enter' && el.dataset && el.dataset.enter && EYLEM[el.dataset.enter]) { e.preventDefault(); EYLEM[el.dataset.enter](el.dataset, el, e); }
  });
  window.addEventListener('hashchange', () => { const r = Object.keys(ROL_HASH).find(x => ROL_HASH[x] === location.hash.slice(1)); if (r && r !== S.rol) rolDegis(r); });
  setInterval(() => { if (saatKontrol()) { kaydet(); const el = document.activeElement; if (!SH && !(el && el.matches && el.matches('input, textarea'))) ciz(); } }, 30000);
}

let LOGO = '', OLAY_HAZIR = false;
function basla() {
  LOGO = $('#logo-tpl').innerHTML;
  baslat();
  const r = Object.keys(ROL_HASH).find(x => ROL_HASH[x] === location.hash.slice(1));
  if (r) S.rol = r;
  V = yeniV(KOK[S.rol]); YIGIN = []; SH = null;
  if (!OLAY_HAZIR) { olaylar(); OLAY_HAZIR = true; }      // bozuk kayıttan kurtulurken dinleyiciler iki kez bağlanmasın
  ciz(true);
}
