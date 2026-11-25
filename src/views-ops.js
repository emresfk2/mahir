/* ===== Mahir · operasyon ekranları ===== */

function opsIsler() {
  const l = [];
  S.orders.forEach(o => {
    if (o.durum === 'TEKLIF_BEKLIYOR') l.push({ o, metin: 'Teklif hazırla', ad: 'o_teklif', id: o.id });
    if (o.durum === 'ATAMA' && o.atamaBekliyor) l.push({ o, metin: 'Uygun usta yok: elle ata', ad: 'o_siparis', id: o.id });
    if (o.durum === 'ATAMA' && o.offer && o.offer.bitis < Date.now()) l.push({ o, metin: 'Usta 30 dakikada yanıt vermedi', ad: 'o_siparis', id: o.id });
    o.extras.filter(e => e.durum === 'uzman').forEach(e => l.push({ o, metin: 'Ek iş incelemesi · ' + tl(e.tutar), ad: 'o_siparis', id: o.id }));
  });
  S.disputes.forEach(d => { if (d.durum === 'KARAR' || d.durum === 'ACIK') l.push({ o: bul(d.oid), metin: d.durum === 'KARAR' ? 'Şikâyet kararı bekliyor' : 'Şikâyet: usta yanıtı bekleniyor', ad: 'o_dava', id: d.id }); });
  return l;
}
const katAd = id => (KATEGORILER.find(k => k.id === id) || {}).ad || id;

G.o_ozet = () => {
  const b = bakiye(), isler = opsIsler();
  const kpi = [['Süren sipariş', S.orders.filter(o => !kapaliMi(o)).length], ['Açık şikâyet', S.disputes.filter(d => d.durum !== 'KAPANDI').length], ['Blokede', tl(b.bloke || 0)],
    ['Garanti fonu', tl(b.fon || 0)], ['Platform geliri', tl(b.gelir || 0)], ['Ustalara borç', tl((b.usta || 0) + (b.teminat || 0))]];
  const bek = {}; S.waitlist.forEach(w => { const a = w.ilce + ', ' + w.il + ' · ' + katAd(w.kat); bek[a] = (bek[a] || 0) + 1; });
  return `<h1 class="baslik">Operasyon özeti</h1>
    <div class="kpi alti">${kpi.map(k => `<div><small>${k[0]}</small><b>${k[1]}</b></div>`).join('')}</div>
    <h2 class="bolum">Senden iş bekleyenler</h2>
    ${isler.length ? `<div class="liste">${isler.map(x => `<button class="kart dikkat" data-act="git" data-ad="${x.ad}" data-id="${x.id}"><span class="rozet">${ikon(hizmet(x.o.sid).ikon)}</span><span class="sip-orta"><b>${esc(x.metin)}</b><small>${esc(x.o.ad)} · ${x.o.code} · ${esc(x.o.ilce)}</small></span>${ikon('sag', 'ok')}</button>`).join('')}</div>` : bos('Bekleyen iş yok.', 'tik')}
    <h2 class="bolum">Bekleme listesi</h2>
    <section class="kart">${Object.keys(bek).length ? `<dl class="kalemler">${Object.keys(bek).map(a => `<div><dt>${esc(a)}</dt><dd>${bek[a]} kişi</dd></div>`).join('')}</dl>` : '<p class="ipucu">Kapalı bölgelerden talep yok.</p>'}
      ${not('Bir ilçe-kategori, en az 3 aktif usta ve 24 saat içinde %90 atama oranıyla açılır. Ağ sekmesinden açıp kapatabilirsin.')}</section>`;
};

G.o_siparisler = (p, f) => {
  const sek = f.sek || 'aktif', liste = S.orders.filter(o => sek === 'tum' || (sek === 'aktif') === !kapaliMi(o));
  return `<h1 class="baslik">Siparişler</h1><div class="dilim">${cip('sek', 'aktif', 'Süren', sek)}${cip('sek', 'kapali', 'Kapanan', sek)}${cip('sek', 'tum', 'Tümü', sek)}</div>
    ${liste.length ? `<div class="liste">${liste.map(o => siparisKart(o, o.durum === 'TEKLIF_BEKLIYOR' ? 'o_teklif' : 'o_siparis', 'ops')).join('')}</div>` : bos('Bu listede sipariş yok.', 'liste')}`;
};

function defterSatir(k) {
  return `<li><div class="kayit-ust"><b>${esc(k.aciklama)}</b><time>${zaman(k.at)}</time></div><small>${k.code} · ${k.olay}</small>
    <dl class="kalemler mini">${k.lines.map(l => `<div><dt>${HESAP_AD[l.h] || l.h}</dt><dd class="${l.t < 0 ? 'eksi' : 'arti'}">${l.t < 0 ? '−' : '+'}${tl(Math.abs(l.t))}</dd></div>`).join('')}</dl></li>`;
}

G.o_siparis = p => {
  const o = bul(p.id); if (!o) return sayfaBas('Sipariş') + bos('Sipariş bulunamadı.');
  if (o.durum === 'TEKLIF_BEKLIYOR') return G.o_teklif(p, V.f);
  const s = hizmet(o.sid), u = ustaBul(o.ustaId), d = davaBul(o.disputeId), ip = iptalHesap(o);
  const kalan = kalanKalem(o), pay = bol(kalan, u || (o.offer && ustaBul(o.offer.ustaId)));
  const uzman = o.extras.filter(e => e.durum === 'uzman');
  const bekleyenHak = o.hakedis.some(h => !h.odendi && h.tutar > 0);
  let atama = '';
  if (o.durum === 'ATAMA') {
    const teklifli = o.offer ? ustaBul(o.offer.ustaId) : null, kalanDk = o.offer ? Math.ceil((o.offer.bitis - Date.now()) / DK) : 0;
    atama = `<section class="kart eylem${teklifli ? ' bekle' : ''}"><h2>Atama</h2>
      ${teklifli ? `<p>İş <b>${esc(teklifli.ad)}</b> için teklif edildi. ${kalanDk > 0 ? 'Yanıt için ' + kalanDk + ' dakikası var.' : 'Yanıt süresi doldu.'}</p><button class="btn ikincil" data-act="oAktar" data-id="${o.id}">Sıradaki ustaya aktar</button>` : '<p>Kendiliğinden atanabilecek usta kalmadı. Aşağıdan elle ata ya da siparişi iptal et.</p>'}
      <h3>Adaylar</h3>${adaylar(o).filter(a => !teklifli || a.id !== teklifli.id).map(a => `<div class="aday"><div><b>${esc(a.ad)}</b><small>${a.seviye} · ${a.puan ? a.puan.toLocaleString('tr-TR') + ' puan' : 'yeni'} · ${a.is} iş</small></div><button class="btn kucuk" data-act="oAta" data-id="${o.id}" data-usta="${a.id}">Teklif et</button></div>`).join('') || '<p class="ipucu">Bu meslekte uygun başka usta yok.</p>'}</section>`;
  }
  return sayfaBas(o.ad, o.code + ' · ' + TIP_AD[o.tip]) + `<div class="durum-satir">${durumCip(o, 'ops')}<span>${esc(o.ilce)}, ${esc(o.il)}</span></div>` + atama +
    uzman.map(e => `<section class="kart eylem"><h2>Ek iş incelemesi</h2><p>Usta <b>${esc(e.ad)}</b> için ${tl(e.tutar)} istedi. Ek işler toplamı ilk fiyatın (${tl(o.ilkToplam)}) %20’sini aşıyor; uygun bulursan müşteri onayına gider.</p>${e.foto ? fotoGaleri([e.foto], 'Ek iş') : ''}
      <div class="btn-sira"><button class="btn ikincil" data-act="oEkIs" data-id="${o.id}" data-ek="${e.id}" data-onay="">Uygun değil</button><button class="btn" data-act="oEkIs" data-id="${o.id}" data-ek="${e.id}" data-onay="1">Uygun</button></div></section>`).join('') +
    (d ? `<button class="kart dikkat" data-act="git" data-ad="o_dava" data-id="${d.id}"><span class="rozet">${ikon('uyari')}</span><span class="sip-orta"><b>Şikâyet · ${esc(TUR_AD(d.tur))}</b><small>${DAVA_DURUM[d.durum][0]}${d.karar ? ' · ' + esc(kararMetni(d)) : ''}</small></span>${ikon('sag', 'ok')}</button>` : '') +
    `<section class="kart"><h2>Para</h2><dl class="kalemler"><div><dt>Sipariş bedeli</dt><dd>${o.fiyat ? tl(o.fiyat.toplam) : '—'}</dd></div><div><dt>Tahsil edilen</dt><dd>${tl(o.paid)}</dd></div>${o.vade ? `<div><dt>Çekim zamanı</dt><dd>${zaman(o.vade)}</dd></div>` : ''}<div><dt>Blokede</dt><dd>${tl(blokede(o))}</dd></div><div><dt>Serbest bırakılan</dt><dd>${tl(o.rel)}</dd></div><div><dt>İade edilen</dt><dd>${tl(o.refunded)}</dd></div>${o.telafi ? `<div><dt>Fondan karşılanacak</dt><dd>${tl(o.telafi)}</dd></div>` : ''}${o.rucu ? `<div><dt>Ustadan rücu</dt><dd>${tl(o.rucu)}</dd></div>` : ''}</dl>
      ${topla(kalan) > 0 ? `<h3>Kalan ${tl(topla(kalan))} kabulde nasıl paylaşılır?</h3><dl class="kalemler mini"><div><dt>Usta hakedişi</dt><dd>${tl(pay.H - pay.teminat)}</dd></div><div><dt>Usta teminatı (30 gün)</dt><dd>${tl(pay.teminat)}</dd></div><div><dt>Tedarikçi</dt><dd>${tl(pay.M)}</dd></div><div><dt>Garanti fonu (%2)</dt><dd>${tl(pay.fon)}</dd></div><div><dt>Ödeme komisyonu (%2,5)</dt><dd>${tl(pay.odeme)}</dd></div><div><dt>KDV</dt><dd>${tl(pay.kdv)}</dd></div><div class="toplam"><dt>Platform geliri</dt><dd>${tl(pay.gelir)}</dd></div></dl>` : ''}</section>` +
    (u ? ustaKart(u, o) : '') +
    `<section class="kart"><h2>İşlemler</h2><div class="islemler">
      ${u && ['PLANLANDI', 'YOLDA', 'MONTAJ'].includes(o.durum) && (!o.duzeltme || o.rel === 0) ? `<button class="btn ikincil" data-act="sheet" data-ad="onay" data-id="${o.id}" data-baslik="Usta gelmedi olarak işaretle?" data-metin="${esc(u.ad)} için ağır ihlal yazılır, müşteriye sipariş bedelinin %10’u kadar kredi tanımlanır ve iş yedek ustaya teklif edilir." data-etiket="İşaretle" data-eylem="oGelmedi" data-tehlike="1">Usta gelmedi</button>` : ''}
      ${o.durum === 'TESLIM' ? `<button class="btn ikincil" data-act="oSure" data-id="${o.id}">Kabul süresini doldur <small>demo</small></button>` : ''}
      ${bekleyenHak && !acikDava(o) ? `<button class="btn ikincil" data-act="oHakedis" data-id="${o.id}">Hakedişi şimdi öde <small>demo</small></button>` : ''}
      ${ip.izin ? `<button class="btn ikincil tehlike" data-act="sheet" data-ad="onay" data-id="${o.id}" data-baslik="Sipariş iptal edilsin mi?" data-metin="${esc(ip.neden)} Kesinti ${tl(ip.kesinti || 0)}, iade ${tl(ip.iade || 0)}." data-etiket="İptal et" data-eylem="oIptal" data-tehlike="1">Siparişi iptal et</button>` : ''}
      <p class="ipucu">${kapaliMi(o) ? 'Sipariş kapandı.' : 'İş akışındaki olağan adımları müşteri ve usta atar; buradaki işlemler istisnalar içindir.'}</p></div></section>` +
    cetvel(o) +
    `<section class="kart"><h2>Sipariş bilgisi</h2><dl class="kalemler bilgi"><div><dt>Adres</dt><dd>${esc(o.adres)}</dd></div>${o.slotTs ? `<div><dt>Randevu</dt><dd>${zaman(o.slotTs)}</dd></div>` : ''}${o.not ? `<div><dt>Müşteri notu</dt><dd>${esc(o.not)}</dd></div>` : ''}<div><dt>Kapı kodu</dt><dd>${o.kod}</dd></div></dl>${fotoGaleri(o.fotos, 'İş yeri')}</section>` +
    (() => { const k = S.ledger.filter(x => x.oid === o.id); return k.length ? `<details class="kart iz"><summary><h2>Defter kayıtları</h2>${ikon('asagi')}</summary><ul class="defter">${k.map(defterSatir).join('')}</ul></details>` : ''; })() + izKart(o);
};

/* ---------- teklif hazırlama ---------- */
function teklifOnizle(o, s, f) {
  const fy = s.tip === 'proje' ? projeFiyat(s, { m2: f.m2 }, o.il, o.ilce) : mobilyaFiyat(s, Object.assign({}, o.opts, { en: f.en, boy: f.boy, derinlik: f.derinlik }), o.il, o.ilce);
  const pct = s.tip === 'proje' ? [30, 40, 30] : [40, 40, 20];
  return `<h2>Teklif</h2>${satirlar(fy.lines, fy.toplam)}<h3>Ödeme planı</h3><ul class="asamalar">${s.asamalar.map((ad, i) => `<li>${ikon('saat')}<span>${esc(ad)} <em>%${pct[i]}</em></span><b>${tl(yuvarla(fy.toplam * pct[i] / 100))}</b></li>`).join('')}</ul>
    ${o.onFiyat ? `<p class="ipucu">Müşteriye gösterilen ön tahmin: ${tl(yuvarla(o.onFiyat * 0.92))} – ${tl(yuvarla(o.onFiyat * 1.1))}</p>` : ''}`;
}
G.o_teklif = (p, f) => {
  const o = bul(p.id); if (!o) return sayfaBas('Teklif') + bos('Talep bulunamadı.');
  if (o.durum !== 'TEKLIF_BEKLIYOR') return G.o_siparis(p);
  const s = hizmet(o.sid);
  if (!f._hazir) { f._hazir = 1; if (s.tip === 'proje') f.m2 = o.opts.m2; else { f.en = o.opts.en; f.boy = o.opts.boy; f.derinlik = o.opts.derinlik; } }
  const sayi = (k, ad, min, max, birim) => `<label class="alan yan"><span>${ad}</span><span class="birimli"><input type="number" inputmode="numeric" data-f="${k}" data-canli="1" min="${min}" max="${max}" value="${esc(f[k])}"><i>${birim}</i></span></label>`;
  return sayfaBas('Teklif hazırla', o.ad + ' · ' + o.code) + `<div class="durum-satir">${durumCip(o, 'ops')}<span>${esc(o.ilce)}, ${esc(o.il)}</span></div>
    <section class="kart"><h2>Müşterinin talebi</h2><dl class="kalemler bilgi"><div><dt>Keşif</dt><dd>${o.kesif === 'yerinde' ? 'Yerinde · ' + tl(o.kesifBedeli) + ' alındı' : 'Görüntülü · ücretsiz'}</dd></div><div><dt>Adres</dt><dd>${esc(o.adres)}</dd></div>
      ${s.tip === 'proje' ? `<div><dt>Müşterinin tahmini</dt><dd>${o.opts.m2} ${s.soru.birim}</dd></div>` : `<div><dt>Müşterinin ölçüsü</dt><dd>${o.opts.en} × ${o.opts.boy} × ${o.opts.derinlik} cm</dd></div><div><dt>Malzeme</dt><dd>${esc((MALZEMELER.find(m => m.id === o.opts.malzeme) || MALZEMELER[0]).ad)}${s.kapakli ? ', ' + (o.opts.kapak === 'surgulu' ? 'sürgülü' : 'menteşeli') : ''} · ${esc(o.opts.numune)}</dd></div>`}
      ${o.not ? `<div><dt>Not</dt><dd>${esc(o.not)}</dd></div>` : ''}</dl>${fotoGaleri(o.fotos, 'İş yeri')}</section>
    <section class="kart"><h2>${s.tip === 'proje' ? 'Keşifte ölçülen' : 'Yerinde alınan ölçü'}</h2>
      ${s.tip === 'proje' ? sayi('m2', s.soru.ad, s.soru.min, s.soru.max, s.soru.birim) : sayi('en', 'Genişlik', s.olcu.en[0], s.olcu.en[1], 'cm') + sayi('boy', 'Yükseklik', s.olcu.boy[0], s.olcu.boy[1], 'cm') + sayi('derinlik', 'Derinlik', s.olcu.derinlik[0], s.olcu.derinlik[1], 'cm')}
      <p class="ipucu">Birim fiyatlar katalogdan ve ${esc(o.ilce)} bölge katsayısından gelir; usta fiyat veremez.</p></section>
    <section class="kart" id="canli-teklif">${teklifOnizle(o, s, f)}</section>
    <div class="alt-cubuk"><button class="btn" data-act="oTeklif" data-id="${o.id}">Teklifi müşteriye gönder</button></div>`;
};
CANLI.o_teklif = CANLI.o_siparis = (p, f) => { const o = bul(p.id), k = $('#canli-teklif'); if (o && k) k.innerHTML = teklifOnizle(o, hizmet(o.sid), f); };

/* ---------- şikâyetler ---------- */
G.o_davalar = () => `<h1 class="baslik">Şikâyetler</h1><p class="giris">Hedef: ilk yanıt 2 saat, usta yanıtı 24 saat, karar 48 saat.</p>
  ${S.disputes.length ? `<div class="liste">${S.disputes.map(d => { const dd = DAVA_DURUM[d.durum]; return `<button class="kart sip" data-act="git" data-ad="o_dava" data-id="${d.id}"><span class="rozet">${ikon('uyari')}</span><span class="sip-orta"><b>${esc(TUR_AD(d.tur))}</b><small>${esc(d.ad)} · ${d.code}</small><span class="sip-alt"><span class="cip cip-${dd[1]}">${dd[0]}</span><small>${zaman(d.at)}${d.oto ? ' · otomatik' : ''}</small></span></span></button>`; }).join('')}</div>` : bos('Şikâyet yok.', 'tik')}`;

G.o_dava = (p, f) => {
  const d = davaBul(p.id); if (!d) return sayfaBas('Şikâyet') + bos('Kayıt bulunamadı.');
  const o = bul(d.oid), t = SIKAYET_TURLERI.find(x => x.id === d.tur), u = ustaBul(d.ustaId), sonra = d.once === 'KABUL';
  let form = '';
  if (d.durum === 'ACIK' || d.durum === 'KARAR') {
    if (!f._hazir) { f._hazir = 1; f.sonuc = d.talep || 'duzeltme'; f.yuk = t.yuk; f.tutar = d.tutar || ''; f.not = ''; f.baska = false; }
    const azami = indirimTavan(o), kabulNotu = d.once === 'TESLIM' ? ' İş kabul edilmiş sayılır ve kalan ödeme serbest kalır.' : d.once === 'ASAMA_ONAY' ? ' Aşama onaylanmış sayılır ve sonraki aşama başlar.' : '';
    const etki = f.sonuc === 'ret' ? 'Şikâyet kapanır; iş kaldığı yerden devam eder.' + kabulNotu
      : f.sonuc === 'duzeltme' ? 'Müşteriden ücret alınmadan yeni ziyaret planlanır.' + (f.yuk === 'usta' ? ' Usta ek ödeme almaz.' : '')
      : (f.sonuc === 'iade' ? 'Müşteriye ' + tl(sonra ? azami : blokede(o)) + ' iade edilir ve sipariş kapanır. ' : 'Müşteriye girilen tutar iade edilir; henüz çekilmediyse çekilecek tutardan düşülür.' + kabulNotu + ' ') +
        (sonra ? (f.yuk === 'usta' ? 'Tutar önce ustanın teminatından (' + tl(o.teminat) + '), sonra bekleyen hakedişinden alınır; kalanı rücu yazılır. Ustadan alınacak tutar bu işin hakedişini aşamaz.' : 'Tutar garanti fonundan karşılanır.')
          : (f.yuk === 'usta' ? 'Para blokeden döner; ustanın hakedişi iade edilen tutar kadar küçülür.' : 'Para blokeden döner; ustanın hakedişi eksilmez, fark garanti fonundan karşılanır.'));
    form = `<section class="kart eylem"><h2>Karar</h2>${d.durum === 'ACIK' ? not('Usta henüz yanıt vermedi. 24 saat dolmadan karar verirsen yalnızca müşterinin anlattıklarına dayanırsın.', 'uyari') : ''}
      <h3>Sonuç</h3><div class="cipler">${['duzeltme', 'indirim', 'iade', 'ret'].map(x => cip('sonuc', x, x === 'ret' ? 'Reddet' : TALEP_AD[x], f.sonuc)).join('')}</div>
      ${f.sonuc === 'indirim' ? `<label class="alan yan"><span>İndirim tutarı</span><span class="birimli"><input type="number" inputmode="numeric" min="1" max="${azami}" data-f="tutar" value="${esc(f.tutar)}"><i>₺</i></span></label><p class="ipucu">En fazla ${tl(azami)}. Müşterinin talebi: ${d.tutar ? tl(d.tutar) : 'tutar belirtilmedi'}.</p>` : ''}
      ${f.sonuc === 'duzeltme' && o.rel === 0 && d.ustaId ? `<label class="onay"><input type="checkbox" data-f="baska" data-ciz="1"${f.baska ? ' checked' : ''}><span>Düzeltmeye başka usta gitsin (hakediş işi tamamlayan ustaya ödenir)</span></label>` : ''}
      ${f.sonuc !== 'ret' ? `<h3>Bedeli kim üstlenir?</h3><div class="cipler">${cip('yuk', 'usta', 'Usta kusuru', f.yuk)}${cip('yuk', 'platform', 'Platform üstlenir', f.yuk)}</div>` : ''}
      ${not(etki)}
      <label class="alan"><span>Müşteriye gidecek karar notu</span><textarea data-f="not" rows="3" maxlength="400">${esc(f.not)}</textarea></label>
      <button class="btn" data-act="oKarar" data-id="${d.id}">Kararı uygula</button></section>`;
  }
  const kayitlar = d.karar ? S.ledger.filter(x => x.oid === o.id && x.at >= d.at) : [];
  return sayfaBas('Şikâyet', d.ad + ' · ' + d.code) + davaKart(d, 'ops') + form +
    `<section class="kart"><h2>Dosya</h2><dl class="kalemler bilgi"><div><dt>Usta</dt><dd>${u ? esc(u.ad) + ' · ' + u.seviye + ' · ' + (u.kusur || 0) + ' kusurlu iş' : '—'}</dd></div><div><dt>Şikâyet anındaki durum</dt><dd>${DURUM[d.once].ad}</dd></div><div><dt>Sipariş bedeli</dt><dd>${tl(o.fiyat.toplam)}</dd></div><div><dt>Blokede</dt><dd>${tl(blokede(o))}</dd></div><div><dt>Kontrol listesi</dt><dd>${o.kontrol.length}/${hizmet(o.sid).kontrol.length}</dd></div><div><dt>Küçük tutar eşiği</dt><dd>${tl(kucukEsik(o))}</dd></div></dl>
      ${o.fotoOnce.length ? `<h3>Önce</h3>${fotoGaleri(o.fotoOnce, 'Önce')}` : ''}${o.fotoSonra.length ? `<h3>Sonra</h3>${fotoGaleri(o.fotoSonra, 'Sonra')}` : ''}
      <button class="btn ikincil" data-act="git" data-ad="o_siparis" data-id="${o.id}">Siparişi aç</button></section>` +
    (kayitlar.length ? `<section class="kart"><h2>Kararın deftere etkisi</h2><ul class="defter">${kayitlar.map(defterSatir).join('')}</ul></section>` : '');
};

/* ---------- ağ: ustalar ve bölgeler ---------- */
G.o_ag = (p, f) => {
  const sek = f.sek || 'ustalar';
  const ustalar = () => `<div class="liste">${S.ustalar.map(u => { const aktif = S.orders.filter(o => o.ustaId === u.id && !kapaliMi(o)).length; return `<section class="kart usta-satir"><span class="avatar">${esc(u.ad.charAt(0))}</span><div><b>${esc(u.ad)}</b><small>${MESLEK_AD[u.meslek]} · ${u.seviye}${u.aski ? ' · <em class="kirmizi">askıda</em>' : ''}</small><small>${u.puan ? u.puan.toLocaleString('tr-TR') + ' puan' : 'puan yok'} · ${u.is} iş · ${aktif} süren · ${u.kusur || 0} kusur · ${u.ihlal || 0}/3 ihlal</small></div>
    <button class="btn kucuk ikincil${u.aski ? '' : ' tehlike'}" data-act="oAski" data-id="${u.id}">${u.aski ? 'Askıyı kaldır' : 'Askıya al'}</button></section>`; }).join('')}</div>`;
  const bolgeler = () => `<p class="giris">Kategoriye dokunarak ilçede açıp kapatabilirsin. Kapalı kategoriyi seçen müşteri bekleme listesine yazılır.</p><div class="liste">${BOLGELER.map(b => { const acik = S.kapsam[kapsamAnahtar(b.il, b.ilce)] || []; return `<section class="kart"><div class="kart-ust"><h2>${esc(b.ilce)} <small>${esc(b.il)}</small></h2><span class="cip cip-bekle">katsayı ${b.k.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}${b.yol ? ' · yol ' + tl(b.yol) : ''}</span></div>
    <div class="cipler">${KATEGORILER.map(k => { const n = S.waitlist.filter(w => w.il === b.il && w.ilce === b.ilce && w.kat === k.id).length; return `<button class="cp${acik.includes(k.id) ? ' sec' : ''}" data-act="oKapsam" data-il="${esc(b.il)}" data-ilce="${esc(b.ilce)}" data-kat="${k.id}" aria-pressed="${acik.includes(k.id)}">${k.ad}${n ? ` <i class="sayi">${n}</i>` : ''}</button>`; }).join('')}</div></section>`; }).join('')}</div>`;
  return `<h1 class="baslik">Ağ</h1><div class="dilim">${cip('sek', 'ustalar', 'Ustalar', sek)}${cip('sek', 'bolgeler', 'Bölgeler', sek)}</div>${sek === 'ustalar' ? ustalar() : bolgeler()}`;
};

/* ---------- defter ---------- */
G.o_defter = () => {
  const b = bakiye(), sira = ['bloke', 'usta', 'teminat', 'tedarikci', 'fon', 'gelir', 'kdv', 'odeme', 'kredi', 'rucu'];
  const toplam = Object.keys(b).reduce((t, k) => t + b[k], 0);
  return `<h1 class="baslik">Defter</h1><p class="giris">Her hareket çift taraflı yazılır; bir kaydın satırları toplamı sıfırdır. Müşteri parası, kabul edilene kadar bloke hesapta durur.</p>
    <section class="kart"><h2>Hesap bakiyeleri</h2><dl class="kalemler">${sira.map(k => `<div><dt>${HESAP_AD[k]}</dt><dd>${(b[k] || 0) < 0 ? '−' : ''}${tl(Math.abs(b[k] || 0))}</dd></div>`).join('')}</dl>
      <h3>Karşı hesaplar</h3><dl class="kalemler">${['musteri', 'banka', 'sermaye'].map(k => `<div><dt>${HESAP_AD[k]}</dt><dd>${(b[k] || 0) < 0 ? '−' : ''}${tl(Math.abs(b[k] || 0))}</dd></div>`).join('')}<div class="toplam"><dt>Denge kontrolü</dt><dd>${toplam === 0 ? ikon('tik', 'ok-yesil') + ' 0' : tl(toplam)}</dd></div></dl></section>
    <section class="kart"><h2>Son hareketler</h2><ul class="defter">${S.ledger.slice(0, 40).map(defterSatir).join('')}</ul></section>`;
};

Object.assign(EYLEM, {
  oAta: d => { const o = bul(d.id); if (o.offer) { o.reddeden.push(o.offer.ustaId); } ata(o, d.usta); degisti('İş ' + ustaBul(d.usta).ad + ' için teklif edildi'); },
  oAktar: d => { ustaRet(bul(d.id), 'sure'); degisti('İş sıradaki ustaya aktarıldı'); },
  oGelmedi: d => { const kr = gelmedi(bul(d.id)); SH = null; degisti('Müşteriye ' + tl(kr) + ' kredi tanımlandı; yedek usta aranıyor'); },
  oEkIs: d => { ekIsUzman(bul(d.id), d.ek, !!d.onay); degisti(d.onay ? 'Ek iş müşteri onayına gönderildi' : 'Ek iş reddedildi'); },
  oSure: d => { const o = bul(d.id); o.acceptBy = Date.now() - 1; saatKontrol(); degisti('Süre doldu: iş kendiliğinden kabul edildi'); },
  oHakedis: d => { const t = hakedisOde(bul(d.id)); degisti(tl(t) + ' ustaya ödendi'); },
  oIptal: d => { const h = iptalEt(bul(d.id), 'ops'); SH = null; degisti(h.izin ? 'Sipariş iptal edildi' : h.neden, h.izin ? '' : 'hata'); },
  oTeklif: d => {
    const o = bul(d.id), s = hizmet(o.sid), f = V.f, sinir = (v, a) => Math.max(a[0], Math.min(a[1], Math.round(Number(v) || a[2])));
    teklifGonder(o, s.tip === 'proje' ? { m2: Number(f.m2) } : { en: sinir(f.en, s.olcu.en), boy: sinir(f.boy, s.olcu.boy), derinlik: sinir(f.derinlik, s.olcu.derinlik) });
    kaydet(); kokeGit('o_siparis', { id: o.id }); toast('Teklif müşteriye gönderildi');
  },
  oKarar: d => {
    const dv = davaBul(d.id), f = V.f;
    if (f.sonuc === 'indirim' && !(Number(f.tutar) > 0)) return toast('İndirim tutarını gir.', 'hata');
    kararUygula(dv, { sonuc: f.sonuc, yuk: f.sonuc === 'ret' ? 'usta' : f.yuk, tutar: f.tutar, baskaUsta: !!f.baska, not: String(f.not || '').trim() });
    V.f = {}; degisti('Karar uygulandı');
  },
  oAski: d => { const u = ustaBul(d.id); u.aski = !u.aski; degisti(u.aski ? u.ad + ' askıya alındı' : u.ad + ' yeniden aktif'); },
  oKapsam: d => { kapsamDegis(d.il, d.ilce, d.kat); degisti(); },
});
