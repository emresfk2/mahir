/* ===== Mahir · usta ekranları ===== */

function hakedisKutu(o) {
  const u = ustaBul(o.ustaId || (o.offer && o.offer.ustaId)), b = bol(o.kalem, u);
  if (o.durum === 'IPTAL' || o.durum === 'IADE') {
    const alinan = o.hakedis.reduce((t, h) => t + h.tutar, 0) + o.teminat + (o.teminatOdenen || 0);
    return `<section class="kart"><h2>Hakediş</h2>${satirlar([{ ad: 'Bu işten hakedişin', tutar: alinan }])}</section>`;
  }
  return `<section class="kart"><h2>Hakediş</h2>
    <dl class="kalemler"><div><dt>Bu işten hakedişin <small>KDV hariç</small></dt><dd>${tl(b.H)}</dd></div>
    <div><dt>Teminat <small>%${Math.round(b.tOran * 100)}, 30 gün</small></dt><dd>−${tl(b.teminat)}</dd></div>
    <div class="toplam"><dt>Kabulden 2 iş günü sonra</dt><dd>${tl(b.H - b.teminat)}</dd></div></dl>
    ${o.tip === 'acil' ? not('Acil işte hakediş, onaylanan ek işlerle birlikte artar; toplam, tavan fiyatı aşamaz.') : ''}
    ${o.tip === 'proje' ? not('Proje işlerinde hakediş, müşteri her aşamayı onayladıkça o aşamanın payı kadar serbest kalır.') : ''}
    ${o.duzeltme && topla(kalanKalem(o)) === 0 ? not('Garanti kapsamındaki düzeltme ziyareti için ek ödeme yapılmaz.') : ''}</section>`;
}

function kapsamMetni(o, s) {
  if (o.tip === 'standart') {
    const sec = s.secenekler ? (s.secenekler.find(x => x.id === o.opts.secenek) || s.secenekler[0]).ad : (o.opts.adet || 1) + ' ' + s.birim;
    return sec + (s.malzeme ? (o.opts.malzeme ? ' · malzemeyi Mahir gönderir (' + s.malzeme.ad + ')' : ' · malzeme müşteride') : '');
  }
  if (o.tip === 'acil') return 'Tanı ve ilk 30 dakika; ek iş müşteri onayıyla';
  if (o.tip === 'proje') return o.opts.m2 + ' ' + s.soru.birim + ' · ' + s.asamalar.length + ' aşama';
  return o.opts.en + ' × ' + o.opts.boy + ' × ' + o.opts.derinlik + ' cm · ' + (MALZEMELER.find(m => m.id === o.opts.malzeme) || MALZEMELER[0]).ad;
}

function isTeklifKart(o) {
  const s = hizmet(o.sid), kalan = Math.ceil((o.offer.bitis - Date.now()) / DK), b = ustaPayi(o);
  return `<section class="kart eylem"><div class="kart-ust"><h2>${esc(o.ad)}</h2><span class="cip cip-${kalan > 0 ? 'sen' : 'sorun'}">${kalan > 0 ? kalan + ' dk kaldı' : 'Süre doldu'}</span></div>
    <ul class="ozellik dik"><li>${ikon('pin')}${esc(o.ilce)}, ${esc(o.il)}</li><li>${ikon('takvim')}${o.tip === 'mobilya' && !o.montajda ? 'Üretim süresi: ' + esc(s.sure) : zaman(o.slotTs)}</li><li>${ikon('liste')}${TIP_AD[o.tip]}${o.duzeltme ? ' · düzeltme ziyareti' : ''}</li><li>${ikon('cuzdan')}Hakediş ${tl(b.H)} <small>KDV hariç</small></li></ul>
    ${o.not ? `<p class="alinti">${esc(o.not)}</p>` : ''}
    ${not('Açık adres ve müşteriyle mesajlaşma, işi kabul edince açılır.')}
    <div class="btn-sira"><button class="btn ikincil" data-act="uRet" data-id="${o.id}">Reddet</button><button class="btn" data-act="uKabul" data-id="${o.id}">Kabul et</button></div></section>`;
}

G.u_teklifler = () => {
  const u = ustaBul(S.ustaId);
  const teklifler = S.orders.filter(o => o.offer && o.offer.ustaId === u.id);
  const davalar = S.disputes.filter(d => d.ustaId === u.id && d.durum === 'ACIK');
  const aktif = S.orders.filter(o => o.ustaId === u.id && !kapaliMi(o));
  const biten = S.orders.filter(o => o.ustaId === u.id && kapaliMi(o)).slice(0, 6);
  return `<section class="kart usta-kart"><span class="avatar">${esc(u.ad.charAt(0))}</span><div><b>${esc(u.ad)}</b><small>${MESLEK_AD[u.meslek]} · ${u.seviye} usta</small>
      <small class="usta-olcu">${u.puan ? `${ikon('yildiz', 'dolu')} ${u.puan.toLocaleString('tr-TR')}` : 'Henüz puan yok'} · ${u.is} iş</small></div></section>
    ${u.aski ? not('Hesabın askıda. İnceleme bitene kadar yeni iş teklif edilmez; süren işlerin için operasyon seni arayacak.', 'uyari') : ''}
    ${davalar.map(d => `<button class="kart dikkat" data-act="git" data-ad="u_is" data-id="${d.oid}"><span class="rozet">${ikon('uyari')}</span><span class="sip-orta"><b>Şikâyete yanıt yaz</b><small>${esc(d.ad)} · ${d.code} · 24 saat içinde</small></span>${ikon('sag', 'ok')}</button>`).join('')}
    <h2 class="bolum">Yeni iş teklifleri</h2>
    ${teklifler.length ? teklifler.map(isTeklifKart).join('') : bos('Bekleyen teklif yok. Mahir, bölgene ve puanına göre işi sana kendisi gönderir; müşteri aramana gerek kalmaz.', 'canta')}
    <h2 class="bolum">İşlerim</h2>
    ${aktif.length ? `<div class="liste">${aktif.map(o => siparisKart(o, 'u_is', 'usta')).join('')}</div>` : bos('Süren işin yok.', 'takvim')}
    ${biten.length ? `<h2 class="bolum">Kapananlar</h2><div class="liste">${biten.map(o => siparisKart(o, 'u_is', 'usta')).join('')}</div>` : ''}`;
};

function ustaEylem(o, s, f) {
  const adres = `<p class="buyuk-zaman">${ikon('takvim')}${zaman(o.slotTs)}</p><p class="adres">${ikon('pin')}<span>${esc(o.adres)}<br>${esc(o.ilce)}, ${esc(o.il)}</span></p>`;
  switch (o.durum) {
    case 'ATAMA': return o.offer ? isTeklifKart(o) : '';
    case 'PLANLANDI': case 'MONTAJ': case 'YOLDA': {
      if (o.durum === 'YOLDA' || o.yolda) return `<section class="kart eylem"><h2>Kapıdasın</h2><p>Müşteriden uygulamasındaki 4 haneli kodu iste. Kod, adreste olduğunu ve işe başladığını doğrular.</p>
        <div class="kod-satir"><input class="kod-giris" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" data-f="kod" data-enter="uGiris" data-id="${o.id}" value="${esc(f.kod || '')}" placeholder="0000" aria-label="Kapı kodu"><button class="btn" data-act="uGiris" data-id="${o.id}">İşe başla</button></div>
        ${f.kodHata ? '<p class="hata" role="alert">Kod eşleşmedi. Müşteriden sipariş ekranındaki kodu yeniden iste.</p>' : ''}
        <p class="demo-ipucu"><b>DEMO</b><span>Kod müşteri ekranında görünür: <code>${o.kod}</code></span></p>
        ${o.durum === 'YOLDA' && !o.duzeltme && (o.tip === 'standart' || o.tip === 'acil') ? `<button class="btn metin" data-act="sheet" data-ad="onay" data-id="${o.id}" data-baslik="Müşteri adreste yok mu?" data-metin="20 dakika bekledikten ve operasyon müşteriyi iki kez aradıktan sonra iş kapatılır; yol bedeli (${tl(ORAN.yolBedeli)}) sana ödenir." data-etiket="İşi kapat" data-eylem="uMusteriYok" data-tehlike="1">Müşteri adreste yok</button>` : ''}</section>`;
      return `<section class="kart eylem"><h2>${o.duzeltme ? 'Düzeltme ziyareti' : o.durum === 'MONTAJ' ? 'Montaj randevusu' : 'Randevu'}</h2>${adres}
        <button class="btn" data-act="uYola" data-id="${o.id}">${ikon('kamyon')}Yola çıktım</button></section>`;
    }
    case 'BASLADI': {
      const proje = o.tip === 'proje', st = proje && o.stages ? o.stages.find(a => !a.done) : null, son = !proje || !st || o.stages.indexOf(st) === o.stages.length - 1;
      const bekleyen = o.extras.some(e => e.durum === 'bekliyor' || e.durum === 'uzman');
      const eksik = [];
      if (son && o.kontrol.length < s.kontrol.length) eksik.push('tüm kontrol adımlarını işaretle');
      if (!o.fotoSonra.length) eksik.push('en az bir “sonra” fotoğrafı ekle');
      if (bekleyen) eksik.push('ek iş talebinin yanıtlanmasını bekle');
      return `<section class="kart eylem"><h2>${st ? 'Aşama: ' + esc(st.ad) : o.duzeltme ? 'Düzeltme sürüyor' : 'İş sürüyor'}</h2>
        <ul class="kontrol">${s.kontrol.map((x, i) => `<li><button data-act="uKontrol" data-id="${o.id}" data-i="${i}" class="${o.kontrol.includes(i) ? 'sec' : ''}" aria-pressed="${o.kontrol.includes(i)}"><i>${ikon('tik')}</i><span>${esc(x)}</span></button></li>`).join('')}</ul>
        <h3>Önce</h3>${fotoAlan('o:fotoOnce', o.fotoOnce, 'Önce')}<h3>Sonra</h3>${fotoAlan('o:fotoSonra', o.fotoSonra, 'Sonra')}
        ${o.extras.length ? `<h3>Ek iş talepleri</h3><dl class="kalemler">${o.extras.map(e => `<div><dt>${esc(e.ad)} <small>${{ bekliyor: 'müşteri onayında', uzman: 'platform uzmanında', onay: 'onaylandı', ret: 'reddedildi' }[e.durum]}</small></dt><dd>${tl(e.tutar)}</dd></div>`).join('')}</dl>` : ''}
        <button class="btn" data-act="uTamam" data-id="${o.id}"${eksik.length ? ' disabled' : ''}>${st && !son ? 'Aşamayı tamamla' : 'İşi tamamla'}</button>
        ${eksik.length ? `<p class="ipucu">Tamamlamak için ${eksik.join(', ')}.</p>` : ''}
        <button class="btn ikincil" data-act="sheet" data-ad="ekIs" data-id="${o.id}">Ek iş gerekiyor</button></section>`;
    }
    case 'ASAMA_ONAY': return `<section class="kart eylem bekle"><h2>Müşteri onayı bekleniyor</h2><p>Müşteri aşamayı onaylayınca bu aşamanın hakedişi serbest kalır ve sonraki aşama başlar.</p></section>`;
    case 'URETIM': return `<section class="kart eylem"><h2>Üretim</h2><p>Onaylı çizim: ${o.opts.en} × ${o.opts.boy} × ${o.opts.derinlik} cm · ${esc((MALZEMELER.find(m => m.id === o.opts.malzeme) || MALZEMELER[0]).ad)} · numune ${esc(o.opts.numune)}.</p>
      <div class="cizim-kutu">${mobilyaCizim(s, o.opts)}</div><button class="btn" data-act="uUretim" data-id="${o.id}">Üretim tamamlandı</button></section>`;
    case 'SEVK_ODEME': return `<section class="kart eylem bekle"><h2>Sevk ödemesi bekleniyor</h2><p>Müşteri sevk öncesi ödemeyi yapınca ürünü yola çıkarabilirsin.</p></section>`;
    case 'SEVK': return `<section class="kart eylem"><h2>Sevke hazır</h2><p>Sevk öncesi ödeme alındı. Ürünü paketleyip yola çıkar; montaj randevusu müşteriye kendiliğinden bildirilir.</p><button class="btn" data-act="uSevk" data-id="${o.id}">${ikon('kamyon')}Ürünü sevk ettim</button></section>`;
    case 'TESLIM': return `<section class="kart eylem bekle"><h2>Müşteri kabulü bekleniyor</h2><p>Müşteri ${zaman(o.acceptBy)} tarihine kadar yanıt vermezse iş kendiliğinden kabul edilir.</p></section>`;
    case 'UYUSMAZLIK': return `<section class="kart eylem bekle"><h2>İş şikâyet nedeniyle durdu</h2><p>Karar çıkana kadar bu işin ödemesi blokede kalır.</p></section>`;
    case 'KABUL': return `<section class="kart eylem tamam"><h2>Kabul edildi</h2><p>${o.otoKabul ? 'Müşteri süresinde yanıt vermedi; iş kendiliğinden kabul edildi.' : 'Müşteri işi onayladı.'}</p>${o.puan ? `<p class="puan-satir">${yildizlar(o.puan)}<span>Müşteri puanı</span></p>` : ''}</section>`;
    default: return `<section class="kart eylem kapali"><h2>${DURUM[o.durum].ad}</h2><p>Bu iş kapandı.</p></section>`;
  }
}

G.u_is = (p, f) => {
  const o = bul(p.id); if (!o) return sayfaBas('İş') + bos('İş bulunamadı.');
  const benim = o.ustaId === S.ustaId || (o.offer && o.offer.ustaId === S.ustaId);
  if (!benim) return sayfaBas(o.ad, o.code) + bos('Bu iş başka bir ustada. Üstteki usta seçiciden değiştirebilirsin.', 'kisi');
  const s = hizmet(o.sid), d = davaBul(o.disputeId), atanmis = o.ustaId === S.ustaId;
  return sayfaBas(o.ad, o.code + ' · ' + TIP_AD[o.tip]) + `<div class="durum-satir">${durumCip(o, 'usta')}<span>${esc(o.ilce)}, ${esc(o.il)}</span></div>` +
    (d && d.durum === 'ACIK' && d.ustaId === S.ustaId ? davaKart(d, 'usta') + `<section class="kart eylem"><h2>Yanıtın</h2><p>24 saat içinde yanıt vermezsen karar yalnızca müşterinin anlattıklarına göre verilir.</p>
      <label class="alan"><span>Ne oldu, ne öneriyorsun?</span><textarea data-f="savunma" rows="4" maxlength="600">${esc(f.savunma || '')}</textarea></label><button class="btn" data-act="uSavunma" data-id="${d.id}">Yanıtı gönder</button></section>` : '') +
    ustaEylem(o, s, f) + (d && !(d.durum === 'ACIK' && d.ustaId === S.ustaId) ? davaKart(d, 'usta') : '') +
    (atanmis ? `<section class="kart"><h2>İş bilgisi</h2><dl class="kalemler bilgi"><div><dt>Adres</dt><dd>${esc(o.adres)}, ${esc(o.ilce)}</dd></div>${o.slotTs ? `<div><dt>Randevu</dt><dd>${zaman(o.slotTs)}</dd></div>` : ''}${o.not ? `<div><dt>Müşteri notu</dt><dd>${esc(o.not)}</dd></div>` : ''}
      <div><dt>Kapsam</dt><dd>${esc(kapsamMetni(o, s))}</dd></div></dl>${fotoGaleri(o.fotos, 'İş yeri')}</section>` : '') +
    hakedisKutu(o) + (atanmis && !kapaliMi(o) ? sohbet(o, 'usta') : '') + (atanmis ? izKart(o) : '');
};

SHEET.ekIs = (p, f) => {
  const o = bul(p.id), onceki = o.extras.filter(e => e.durum !== 'ret').reduce((t, e) => t + e.tutar, 0);
  const sinir = o.tip === 'acil' ? 'Bu işte en fazla ' + tl(o.fiyat.tavan - o.ilkToplam - onceki) + ' ek tutar girebilirsin (tavan fiyat).' : 'Ek işler toplamı ' + tl(Math.round(o.ilkToplam * ORAN.ekIsEsik)) + ' tutarını (ilk fiyatın %20’si) aşarsa önce platform uzmanı inceler.';
  return `<h2>Ek iş talebi</h2><p class="sheet-alt">Müşteri uygulamadan onaylamadan ek işe başlama; onaysız iş için ödeme yapılmaz.</p>
    <label class="alan"><span>Ne gerekiyor?</span><input type="text" data-f="ad" maxlength="120" value="${esc(f.ad || '')}" placeholder="Örn. ara musluk değişimi"></label>
    <label class="alan"><span>Ek tutar (₺, KDV dahil)</span><input type="number" inputmode="numeric" min="1" data-f="tutar" value="${esc(f.tutar || '')}"></label>
    <h3>Fotoğraf</h3>${fotoAlan('f:fotos', f.fotos, 'Ek iş')}
    ${not(sinir)}<button class="btn" data-act="uEkIs" data-id="${o.id}">Müşteri onayına gönder</button>`;
};

Object.assign(EYLEM, {
  uKabul: d => { const o = bul(d.id); ustaKabul(o); kaydet(); kokeGit('u_is', { id: o.id }); toast('İş senin. Müşteriye haber verildi'); },
  uRet: d => { ustaRet(bul(d.id)); kaydet(); if (V.ad === 'u_is') geri(); else ciz(); toast('Teklif reddedildi; iş sıradaki ustaya gitti'); },
  uYola: d => { yolaCik(bul(d.id)); degisti('Müşteriye “usta yolda” bildirimi gitti'); },
  uGiris: d => {
    const o = bul(d.id);
    if (giris(o, V.f.kod || '')) { V.f.kod = ''; V.f.kodHata = false; degisti('Kod doğrulandı, iş başladı'); }
    else { V.f.kodHata = true; ciz(); const el = $('.kod-giris'); if (el) el.focus(); }
  },
  uKontrol: d => { const o = bul(d.id), i = Number(d.i), k = o.kontrol.indexOf(i); if (k >= 0) o.kontrol.splice(k, 1); else o.kontrol.push(i); degisti(); },
  uTamam: d => { const o = bul(d.id); if (o.tip === 'proje') asamaTamam(o); else tamamla(o); degisti(o.durum === 'ASAMA_ONAY' ? 'Aşama müşteri onayına gönderildi' : 'İş teslim edildi; müşteri kabulü bekleniyor'); },
  uEkIs: d => {
    const o = bul(d.id), f = SH.f, r = ekIsTalep(o, { ad: f.ad, tutar: f.tutar, foto: (f.fotos || [])[0] });
    if (!r.ok) return toast(r.neden, 'hata');
    SH = null; degisti(r.uzman ? 'İlk fiyatın %20’sini aştı: önce platform uzmanı inceleyecek' : 'Ek iş müşteri onayına gönderildi');
  },
  uUretim: d => { uretimTamam(bul(d.id)); degisti('Müşteriden sevk öncesi ödeme istendi'); },
  uSevk: d => { sevkEt(bul(d.id)); degisti('Ürün yolda; montaj randevusu verildi'); },
  uSavunma: d => { if (!savunmaYaz(davaBul(d.id), V.f.savunma)) return toast('Yanıtını yaz.', 'hata'); V.f.savunma = ''; degisti('Yanıtın operasyona iletildi'); },
  uMusteriYok: d => { const o = bul(d.id), h = iptalEt(o, 'musteriYok'); SH = null; degisti(h.izin ? 'İş kapatıldı; yol bedeli hakedişine eklendi' : 'Bu iş buradan kapatılamaz; operasyonu ara', h.izin ? '' : 'hata'); },
});

G.u_kazanc = () => {
  const u = ustaBul(S.ustaId), isler = S.orders.filter(o => o.ustaId === u.id);
  let bekleyen = 0, odenen = 0, teminat = 0, beklenen = 0, rucu = 0; const satir = [];
  isler.forEach(o => {
    o.hakedis.forEach(h => { if (h.tutar <= 0) return; if (h.odendi) odenen += h.tutar; else bekleyen += h.tutar; satir.push({ o, h }); });
    teminat += o.teminat; odenen += o.teminatOdenen || 0; rucu += o.rucu || 0;
    if (!kapaliMi(o)) beklenen += bol(kalanKalem(o), u).H;
  });
  satir.sort((a, b) => b.h.at - a.h.at);
  const tem = isler.filter(o => o.teminat > 0);
  return `<h1 class="baslik">Kazanç</h1><p class="giris">Tutarlar KDV hariç hakedişindir. Ödemeyi müşteriden değil Mahir’den alırsın.</p>
    <div class="kpi"><div><small>Ödeme yolunda</small><b>${tl(bekleyen)}</b></div><div><small>Ödenen</small><b>${tl(odenen)}</b></div><div><small>Teminatta</small><b>${tl(teminat)}</b></div><div><small>Süren işlerden</small><b>${tl(beklenen)}</b></div></div>
    ${rucu ? not('Kusurlu bulunan işler nedeniyle ' + tl(rucu) + ' tutarında rücu borcun var; sonraki hakedişlerinden düşülür.', 'uyari') : ''}
    <section class="kart"><h2>Hakedişler</h2>${satir.length ? `<ul class="hareket">${satir.map(x => `<li><div><b>${esc(x.o.ad)}</b><small>${x.o.code} · ${x.h.odendi ? 'Ödendi · ' + gunAd(x.h.odemeAt) : 'Ödeme günü: ' + gunAd(x.h.vade)}</small></div><span class="para">${tl(x.h.tutar)}</span></li>`).join('')}</ul>` : '<p class="ipucu">Henüz serbest kalan hakediş yok.</p>'}</section>
    ${tem.length ? `<section class="kart"><h2>Teminatlar</h2><ul class="hareket">${tem.map(o => `<li><div><b>${esc(o.ad)}</b><small>${o.code} · ${tarih(o.teminatVade)} tarihinde serbest kalır</small></div><span class="para">${tl(o.teminat)}</span></li>`).join('')}</ul></section>` : ''}
    ${not('Hakediş, müşteri kabulünden 2 iş günü sonra hesabına geçer. Her işin %10’u (Uzman ustalarda %5) kusur ihtimaline karşı 30 gün teminatta tutulur.')}`;
};

G.u_profil = () => {
  const u = ustaBul(S.ustaId), i = SEVIYELER.indexOf(u.seviye);
  const sonraki = [`İlk 5 işini tamamla (${u.is}/5). Bu dönemde yalnızca sabit fiyatlı işler gelir ve ilk işlerin örneklemeyle denetlenir.`,
    `Uzman olmak için 50 iş (${u.is}/50), 5 üzerinden 4,7 puan ve %3’ün altında şikâyet oranı gerekir. Uzmanlarda teminat %5’e iner, proje işleri öncelikle onlara gider.`,
    'Eksper ustalar, uyuşmazlıklarda yerinde inceleme yapar ve ekspertiz ücreti alır. Operasyon davetiyle seçilir.', 'En üst seviyedesin.'][i];
  return `<h1 class="baslik">Profil</h1>
    <section class="kart usta-kart"><span class="avatar">${esc(u.ad.charAt(0))}</span><div><b>${esc(u.ad)}</b><small>${MESLEK_AD[u.meslek]}</small></div></section>
    <section class="kart"><h2>Seviye</h2><ol class="seviye">${SEVIYELER.map((x, k) => `<li class="${k < i ? 'gecti' : k === i ? 'simdi' : ''}"><b>${x}</b></li>`).join('')}</ol><p>${sonraki}</p></section>
    <div class="kpi"><div><small>Puan</small><b>${u.puan ? u.puan.toLocaleString('tr-TR') : '—'}</b></div><div><small>Tamamlanan iş</small><b>${u.is}</b></div><div><small>Kusurlu bulunan</small><b>${u.kusur || 0}</b></div><div><small>Ağır ihlal</small><b>${u.ihlal || 0} / 3</b></div></div>
    <section class="kart"><h2>Doğrulanan belgeler</h2><ul class="dahil">${u.belgeler.map(b => `<li>${ikon('tik')}${esc(b)}</li>`).join('')}</ul></section>
    <section class="kart"><h2>Mahir’de çalışmanın kuralları</h2><ul class="dahil">
      <li>${ikon('kilit')}Müşteriden elden para alma; ödeme yalnızca Mahir üzerinden.</li><li>${ikon('mesaj')}Telefon ve IBAN paylaşma; yazışma uygulamada kalır.</li>
      <li>${ikon('key')}Kapı kodunu girmeden işe başlama.</li><li>${ikon('kamera')}Önce ve sonra fotoğrafı çek; kusur tartışmasında seni korur.</li>
      <li>${ikon('arti')}Ek işi uygulamadan iste; onaysız iş ödenmez.</li><li>${ikon('uyari')}12 ayda 3 ağır ihlal (gelmeme, elden ödeme, güvenlik) ağdan çıkarılma nedenidir.</li></ul></section>`;
};
