/* ===== Mahir · müşteri ekranları ===== */

const SAATLER = [9, 11, 13, 15, 17, 19];
function gunler() { const a = [], b = new Date(); for (let i = 1; i <= 6; i++) a.push(new Date(b.getFullYear(), b.getMonth(), b.getDate() + i).getTime()); return a; }
const cip = (k, v, ad, secili) => `<button class="cp${String(secili) === String(v) ? ' sec' : ''}" data-act="sec" data-k="${k}" data-v="${v}" aria-pressed="${String(secili) === String(v)}">${ad}</button>`;
const sayac = (k, v, min, max, birim) => `<div class="sayac"><button data-act="adim" data-k="${k}" data-d="-1" data-min="${min}" data-max="${max}" aria-label="Azalt"${Number(v) <= min ? ' disabled' : ''}>${ikon('eksi')}</button><output>${v} <small>${birim}</small></output><button data-act="adim" data-k="${k}" data-d="1" data-min="${min}" data-max="${max}" aria-label="Artır"${Number(v) >= max ? ' disabled' : ''}>${ikon('arti')}</button></div>`;

function fiyatEtiket(s) {
  const b = bolge(S.il, S.ilce), k = b ? b.k : 1;
  if (s.tip === 'standart') return s.secenekler ? 'Başlangıç ' + tl(yuvarla(Math.min.apply(null, s.secenekler.map(x => x.iscilik)) * k)) : tl(yuvarla(s.iscilik * k)) + ' / ' + s.birim;
  if (s.tip === 'acil') return 'Tanı ' + tl(s.tani);
  return s.tip === 'proje' ? 'Keşifle teklif' : 'Ölçüye göre teklif';
}
function hizmetSatir(s) {
  return `<button class="kart hiz" data-act="git" data-ad="hizmet" data-id="${s.id}"><span class="rozet">${ikon(s.ikon)}</span>
    <span class="hiz-orta"><b>${esc(s.ad)}</b><small>${esc(s.kisa)}</small><span class="hiz-alt"><em>${fiyatEtiket(s)}</em><i>${esc(s.sure)}</i></span></span>${ikon('sag', 'ok')}</button>`;
}
function dikkatKart(o) {
  const a = adimBul(o);
  return `<button class="kart dikkat" data-act="git" data-ad="siparis" data-id="${o.id}"><span class="rozet">${ikon(hizmet(o.sid).ikon)}</span>
    <span class="sip-orta"><b>${esc(a && a.rol === 'musteri' ? a.metin : 'Yanıtını bekliyor')}</b><small>${esc(o.ad)} · ${o.code}</small></span>${ikon('sag', 'ok')}</button>`;
}
function kapaliKutu(katId) {
  const var_ = S.waitlist.some(w => w.ben && w.il === S.il && w.ilce === S.ilce && w.kat === katId);
  return `<section class="kart eylem bekle"><h2>${esc(S.ilce)} için henüz açık değil</h2>
    <p>Bir ilçeyi, o kategoride en az 3 aktif ustamız olunca ve işlerin %90’ını 24 saat içinde atayabildiğimizde açıyoruz.</p>
    ${var_ ? not('Bekleme listesindesin. Açılınca haber vereceğiz.') : `<button class="btn" data-act="bekleme" data-kat="${katId}">Açılınca haber ver</button>`}</section>`;
}

/* ---------- ana sayfa ---------- */
G.ana = () => {
  const sen = S.orders.filter(o => DURUM[o.durum].sinif === 'sen' || o.extras.some(e => e.durum === 'bekliyor'));
  const acilAcik = acikMi(S.il, S.ilce, 'acil');
  return `<section class="vitrin"><h1>Evin <span>mahir</span> ellerde.</h1><p>Ustayı Mahir seçer, fiyatı baştan söyler, paranı iş bitene kadar tutar.</p></section>
  ${sen.map(dikkatKart).join('')}
  ${S.credit > 0 ? `<p class="kredi-serit">${ikon('cuzdan')}<span><b>${tl(S.credit)}</b> Mahir kredin var; sonraki ödemende kendiliğinden düşer.</span></p>` : ''}
  <h2 class="bolum">Ne lazım?</h2>
  <button class="acil-kart" data-act="git" data-ad="kategori" data-kat="acil"><span class="rozet">${ikon('bolt')}</span><span><b>Acil mi?</b><small>${acilAcik ? 'Su kaçağı, elektrik arızası, kapıda kalma: 60 dakikada usta' : esc(S.ilce) + ' için henüz açık değil'}</small></span>${ikon('sag', 'ok')}</button>
  <div class="kat-izgara">${KATEGORILER.filter(k => k.id !== 'acil').map(k => { const a = acikMi(S.il, S.ilce, k.id); return `<button class="kat${a ? '' : ' kapali'}" data-act="git" data-ad="kategori" data-kat="${k.id}"><span class="rozet">${ikon(k.ikon)}</span><b>${k.ad}</b><small>${a ? k.acik : 'Yakında'}</small></button>`; }).join('')}</div>
  <h2 class="bolum">Sık istenenler</h2>
  <div class="liste">${['musluk', 'temizlik', 'klima', 'avize'].map(id => hizmetSatir(hizmet(id))).join('')}</div>
  <p class="dipnot">Fiyatlar örnektir, KDV dahildir; ilçeye göre değişir.</p>
  <h2 class="bolum">Nasıl çalışır</h2>
  <ol class="nasil">
    <li><b>Seç, randevunu al.</b><span>Fiyatı baştan görürsün. Ustayı Mahir atar; pazarlık ve telefon trafiği yok.</span></li>
    <li><b>Ödemen Mahir’de bloke kalır.</b><span>Kartından çekilen tutar, sen işi onaylayana kadar ustaya geçmez.</span></li>
    <li><b>Usta kapı koduyla işe başlar.</b><span>Kontrol listesi ve fotoğraflar uygulamaya düşer.</span></li>
    <li><b>“Eline sağlık” de.</b><span>Beğenmediysen sorun bildir: düzeltme, indirim ya da iade Mahir’den.</span></li>
  </ol>`;
};

G.kategori = p => {
  const k = KATEGORILER.find(x => x.id === p.kat) || KATEGORILER[0], acik = acikMi(S.il, S.ilce, k.id);
  return sayfaBas(k.ad, S.ilce + ', ' + S.il) + (acik ? '' : kapaliKutu(k.id)) +
    `<div class="liste${acik ? '' : ' soluk'}">${HIZMETLER.filter(h => h.kat === k.id).map(hizmetSatir).join('')}</div><p class="dipnot">Fiyatlar örnektir, KDV dahildir.</p>`;
};

/* ---------- hizmet ve sipariş formu ---------- */
function hizmetVarsayilan(s, f) {
  if (f._hazir) return; f._hazir = 1;
  f.adres = S.adres; f.not = ''; f.fotos = [];
  if (s.tip === 'standart') { f.adet = 1; f.secenek = s.secenekler ? s.secenekler[Math.min(1, s.secenekler.length - 1)].id : ''; f.malzeme = ''; f.gun = String(gunler()[0]); f.saat = '11'; }
  if (s.tip === 'proje') { f.m2 = s.soru.varsayilan; f.kesif = 'video'; }
  if (s.tip === 'mobilya') { f.en = s.olcu.en[2]; f.boy = s.olcu.boy[2]; f.derinlik = s.olcu.derinlik[2]; f.malzeme = 'lam'; f.kapak = 'menteseli'; f.numune = NUMUNELER[0].kod; }
}
const standartOpts = f => ({ adet: Number(f.adet) || 1, secenek: f.secenek, malzeme: f.malzeme === 'mahir' });
const mobilyaOpts = f => ({ en: Number(f.en), boy: Number(f.boy), derinlik: Number(f.derinlik), malzeme: f.malzeme, kapak: f.kapak, numune: f.numune });

function adresBolumu(f) {
  return `<section class="kart"><h2>Adres ve not</h2>
    <label class="alan"><span>Adres · ${esc(S.ilce)}, ${esc(S.il)}</span><input type="text" data-f="adres" value="${esc(f.adres)}" maxlength="120" autocomplete="street-address"></label>
    <label class="alan"><span>Ustaya not <i>isteğe bağlı</i></span><textarea data-f="not" rows="2" maxlength="300" placeholder="Örn. zil çalışmıyor, evde kedi var">${esc(f.not)}</textarea></label>
    <h3>Fotoğraf <i>isteğe bağlı</i></h3>${fotoAlan('f:fotos', f.fotos, 'İş yeri')}</section>`;
}
function fiyatKutusu(fy, slot) {
  const sonra = slot - Date.now() > 24 * SAAT;
  return `<h2>Fiyat</h2>${satirlar(fy.lines, fy.toplam)}
    ${not(sonra ? 'Kartından şimdi çekim yapılmaz. Tutar randevudan 24 saat önce çekilir ve işi onaylayana kadar Mahir’de bloke kalır.' : 'Tutar şimdi çekilir ve işi onaylayana kadar Mahir’de bloke kalır.', 'kilit')}`;
}
function tahminKutusu(s, fy) {
  const plan = s.tip === 'proje' ? '%30 iş başlarken, %40 ikinci aşamada, %30 son aşamada çekilir. Her aşamanın bedeli, sen o aşamayı onaylayınca ustaya aktarılır.' : '%40 üretim onayında, %40 sevk öncesinde, %20 montajı kabul ettiğinde çekilir. Tamamı, montajı kabul edene kadar Mahir’de bloke kalır.';
  return `<h2>Ön tahmin</h2><p class="tahmin">${tl(yuvarla(fy.toplam * 0.92))} – ${tl(yuvarla(fy.toplam * 1.1))}</p>
    <p class="ipucu">Kesin fiyat ${s.tip === 'proje' ? 'keşiften' : 'ölçüden'} sonra kalem kalem gelir ve 7 gün geçerlidir.</p>${not(plan, 'kilit')}`;
}

function mobilyaCizim(s, f) {
  const en = Number(f.en), boy = Number(f.boy), W = 340, H = 236, sol = 46, alt = 40, ust = 12, sag = 12;
  const k = Math.min((W - sol - sag) / en, (H - ust - alt) / boy);
  const w = en * k, h = boy * k, x = sol + (W - sol - sag - w) / 2, y = ust + (H - ust - alt - h);
  const renk = (NUMUNELER.find(n => n.kod === f.numune) || NUMUNELER[0]).hex;
  const cz = `stroke="var(--ink)" stroke-width="1.4" fill="${renk}"`;
  const kapaklar = (x0, y0, w0, h0, n, kulp) => {
    let t = '';
    for (let i = 0; i < n; i++) {
      const cx = x0 + (w0 / n) * i;
      t += `<rect x="${cx.toFixed(1)}" y="${y0.toFixed(1)}" width="${(w0 / n).toFixed(1)}" height="${h0.toFixed(1)}" ${cz}/>`;
      if (kulp) { const kx = i % 2 === 0 ? cx + w0 / n - 6 : cx + 6, u = Math.min(16, h0 * 0.16); t += `<line x1="${kx.toFixed(1)}" y1="${(y0 + h0 / 2 - u).toFixed(1)}" x2="${kx.toFixed(1)}" y2="${(y0 + h0 / 2 + u).toFixed(1)}" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/>`; }
    }
    return t;
  };
  let ic;
  if (s.id === 'mutfak') {
    const n = kapakSayisi(s, f) + 1, ustH = h * 0.30, altH = h * 0.36;
    ic = kapaklar(x, y, w, ustH, n, true) + kapaklar(x, y + h - altH, w, altH, n, true) + `<rect x="${(x - 3).toFixed(1)}" y="${(y + h - altH - 5).toFixed(1)}" width="${(w + 6).toFixed(1)}" height="5" fill="var(--ink)"/>`;
  } else if (s.id === 'tvunite') ic = kapaklar(x, y, w, h, Math.max(2, Math.round(en / 70)), true);
  else if (f.kapak === 'surgulu') {
    const n = en > 260 ? 3 : 2;
    ic = kapaklar(x, y, w, h, n, false) + Array.from({ length: n }, (_, i) => `<rect x="${(x + (w / n) * i + (i % 2 ? 6 : w / n - 12)).toFixed(1)}" y="${(y + h * 0.32).toFixed(1)}" width="6" height="${(h * 0.36).toFixed(1)}" rx="3" fill="var(--ink)" opacity=".7"/>`).join('');
  } else ic = kapaklar(x, y, w, h, kapakSayisi(s, f), true);
  const cent = (x1, y1, x2, y2, n, dikey) => {
    let t = '';
    for (let i = 0; i <= n; i++) { const px = x1 + (x2 - x1) * i / n, py = y1 + (y2 - y1) * i / n, u = i % 5 === 0 ? 8 : 4; t += dikey ? `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${(px + u).toFixed(1)}" y2="${py.toFixed(1)}"/>` : `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${px.toFixed(1)}" y2="${(py - u).toFixed(1)}"/>`; }
    return t;
  };
  const ry = H - alt + 8, rx = sol - 32;
  return `<svg viewBox="0 0 ${W} ${H}" class="cizim" role="img" aria-label="${esc(s.ad)} ön görünüş, ${en} × ${boy} cm">
    <line x1="${rx}" y1="${(y + h).toFixed(1)}" x2="${W - 4}" y2="${(y + h).toFixed(1)}" stroke="var(--line)" stroke-width="1.5"/>${ic}
    <rect x="${x.toFixed(1)}" y="${ry}" width="${w.toFixed(1)}" height="12" fill="var(--sari)"/><rect x="${rx}" y="${y.toFixed(1)}" width="12" height="${h.toFixed(1)}" fill="var(--sari)"/>
    <g stroke="#0D2B26" stroke-width="1">${cent(x, ry + 12, x + w, ry + 12, Math.round(en / 10), false)}${cent(rx, y, rx, y + h, Math.round(boy / 10), true)}</g>
    <text x="${(x + w / 2).toFixed(1)}" y="${H - 5}" text-anchor="middle" class="olcu">${en} cm</text>
    <text x="${rx - 6}" y="${(y + h / 2).toFixed(1)}" text-anchor="middle" class="olcu" transform="rotate(-90 ${rx - 6} ${(y + h / 2).toFixed(1)})">${boy} cm</text></svg>`;
}

const FORM = {
  standart(s, f) {
    const slot = slotUret(Number(f.gun), Number(f.saat)), fy = fiyatla(s, standartOpts(f), S.il, S.ilce, slot);
    return `<section class="kart"><h2>${s.secenekler ? 'Seçenek' : 'Kaç ' + s.birim + '?'}</h2>
      ${s.secenekler ? `<div class="cipler">${s.secenekler.map(x => cip('secenek', x.id, esc(x.ad), f.secenek)).join('')}</div>` : sayac('adet', f.adet, 1, s.maxAdet, s.birim)}
      ${s.malzeme ? `<h3>Malzeme</h3><div class="cipler">${cip('malzeme', '', 'Malzeme bende', f.malzeme)}${cip('malzeme', 'mahir', 'Mahir getirsin · ' + tl(s.malzeme.fiyat), f.malzeme)}</div><p class="ipucu">${esc(s.malzeme.ad)}. Mahir’in getirdiği malzeme faturalı ve garantilidir.</p>` : ''}</section>
    <section class="kart"><h2>Randevu</h2>
      <div class="gunler">${gunler().map(g => { const d = new Date(g); return `<button data-act="sec" data-k="gun" data-v="${g}" class="${String(g) === String(f.gun) ? 'sec' : ''}" aria-pressed="${String(g) === String(f.gun)}"><small>${GUN_AD[d.getDay()]}</small><b>${d.getDate()}</b><small>${AY_AD[d.getMonth()]}</small></button>`; }).join('')}</div>
      <div class="saatler">${SAATLER.map(h => `<button data-act="sec" data-k="saat" data-v="${h}" class="${String(h) === String(f.saat) ? 'sec' : ''}" aria-pressed="${String(h) === String(f.saat)}"><b>${String(h).padStart(2, '0')}:00</b>${mesaiDisiMi(slotUret(Number(f.gun), h)) ? '<small>+%15</small>' : ''}</button>`).join('')}</div>
      <p class="ipucu">Hafta sonu ve 18:00 sonrası için %15 mesai dışı farkı uygulanır. Aynı gün için Acil’i kullan.</p></section>
    ${adresBolumu(f)}
    <section class="kart" id="canli-fiyat">${fiyatKutusu(fy, slot)}</section>
    <div class="alt-cubuk"><button class="btn" data-act="odeAc" data-tur="standart">Devam et · ${tl(fy.toplam)}</button></div>`;
  },
  acil(s, f) {
    return `<section class="kart"><h2>Nasıl ücretlenir?</h2>
      <dl class="kalemler"><div><dt>Tanı ve ilk 30 dakika</dt><dd>${tl(s.tani)}</dd></div><div class="toplam"><dt>Tavan fiyat <small>KDV dahil</small></dt><dd>${tl(s.tavan)}</dd></div></dl>
      ${not('Usta arızayı görünce ek tutarı uygulamadan onayına sunar; toplam, tavan fiyatı aşamaz. Ücret iş bitince çekilir.')}</section>
    ${adresBolumu(f)}
    <div class="alt-cubuk"><button class="btn" data-act="odeAc" data-tur="acil">${ikon('bolt')}Ustayı çağır</button></div>`;
  },
  proje(s, f) {
    const fy = projeFiyat(s, { m2: f.m2 }, S.il, S.ilce);
    return `<section class="kart"><h2>${esc(s.soru.ad)}</h2>
      <div class="surgu"><input type="range" data-f="m2" data-canli="1" min="${s.soru.min}" max="${s.soru.max}" step="${s.soru.max > 100 ? 5 : 1}" value="${f.m2}" aria-label="${esc(s.soru.ad)}"><output data-out="m2">${f.m2} ${s.soru.birim}</output></div>
      <p class="ipucu">${esc(s.soru.ipucu)}</p></section>
    <section class="kart"><h2>Keşif</h2><div class="secim-liste">
      <button data-act="sec" data-k="kesif" data-v="video" class="${f.kesif === 'video' ? 'sec' : ''}" aria-pressed="${f.kesif === 'video'}"><span>Görüntülü keşif · ücretsiz</span><small>15 dakikalık görüşmede telefonunla evi gösterirsin</small></button>
      <button data-act="sec" data-k="kesif" data-v="yerinde" class="${f.kesif === 'yerinde' ? 'sec' : ''}" aria-pressed="${f.kesif === 'yerinde'}"><span>Yerinde keşif · ${tl(ORAN.kesif)}</span><small>Mahir uzmanı gelip ölçer; siparişe dönüşürse bedelden düşülür</small></button></div></section>
    ${adresBolumu(f)}
    <section class="kart" id="canli-fiyat">${tahminKutusu(s, fy)}</section>
    <div class="alt-cubuk"><button class="btn" data-act="odeAc" data-tur="talep">${f.kesif === 'yerinde' ? 'Keşif iste · ' + tl(ORAN.kesif) : 'Ücretsiz keşif iste'}</button></div>`;
  },
  mobilya(s, f) {
    const fy = mobilyaFiyat(s, mobilyaOpts(f), S.il, S.ilce);
    const surgu = (k, ad) => `<label class="surgu-satir"><span>${ad}</span><input type="range" data-f="${k}" data-canli="1" min="${s.olcu[k][0]}" max="${s.olcu[k][1]}" step="5" value="${f[k]}"><output data-out="${k}">${f[k]} cm</output></label>`;
    return `<section class="kart cizim-kart"><div id="canli-cizim">${mobilyaCizim(s, f)}</div><p class="ipucu">Yaklaşık görünüm. Kesin ölçüyü Mahir uzmanı evinde alır.</p></section>
    <section class="kart"><h2>Yaklaşık ölçü</h2>${surgu('en', 'Genişlik')}${surgu('boy', 'Yükseklik')}${surgu('derinlik', 'Derinlik')}</section>
    <section class="kart"><h2>Malzeme</h2><div class="cipler">${MALZEMELER.map(m => cip('malzeme', m.id, m.ad, f.malzeme)).join('')}</div>
      ${s.kapakli ? `<h3>Kapak</h3><div class="cipler">${cip('kapak', 'menteseli', 'Menteşeli', f.kapak)}${cip('kapak', 'surgulu', 'Sürgülü', f.kapak)}</div>` : ''}
      <h3>Renk numunesi</h3><div class="numuneler">${NUMUNELER.map(n => `<button data-act="sec" data-k="numune" data-v="${n.kod}" class="${f.numune === n.kod ? 'sec' : ''}" aria-pressed="${f.numune === n.kod}"><i style="background:${n.hex}"></i><span>${n.ad}</span><small>${n.kod}</small></button>`).join('')}</div></section>
    ${adresBolumu(f)}
    <section class="kart" id="canli-fiyat">${tahminKutusu(s, fy)}</section>
    <div class="alt-cubuk"><button class="btn" data-act="odeAc" data-tur="talep">Ölçü randevusu iste · ${tl(ORAN.kesif)}</button></div>`;
  },
};

G.hizmet = (p, f) => {
  const s = hizmet(p.id); if (!s) return sayfaBas('Hizmet') + bos('Hizmet bulunamadı.');
  hizmetVarsayilan(s, f);
  const ust = `<section class="kart hizmet-ust"><span class="rozet buyuk">${ikon(s.ikon)}</span><p>${esc(s.kisa)}</p>
    <ul class="ozellik"><li>${ikon('saat')}${esc(s.sure)}</li><li>${ikon('kalkan')}${s.garantiAy ? s.garantiAy + ' ay işçilik garantisi' : 'Memnuniyet güvencesi'}</li></ul>
    <ul class="dahil">${s.dahil.map(x => `<li>${ikon('tik')}${esc(x)}</li>`).join('')}</ul></section>`;
  return sayfaBas(s.ad, TIP_AD[s.tip] + ' · ' + S.ilce) + ust + (acikMi(S.il, S.ilce, s.kat) ? FORM[s.tip](s, f) : kapaliKutu(s.kat));
};
CANLI.hizmet = (p, f) => {
  const s = hizmet(p.id); if (!s) return;
  document.querySelectorAll('[data-out]').forEach(el => { const k = el.dataset.out; el.textContent = f[k] + (k === 'm2' ? ' ' + s.soru.birim : ' cm'); });
  const kutu = $('#canli-fiyat'), cizim = $('#canli-cizim');
  if (s.tip === 'proje' && kutu) kutu.innerHTML = tahminKutusu(s, projeFiyat(s, { m2: f.m2 }, S.il, S.ilce));
  if (s.tip === 'mobilya') { if (kutu) kutu.innerHTML = tahminKutusu(s, mobilyaFiyat(s, mobilyaOpts(f), S.il, S.ilce)); if (cizim) cizim.innerHTML = mobilyaCizim(s, f); }
};

/* ---------- ödeme paneli: her tahsilat açık onayla ---------- */
SHEET.ode = (p, f) => {
  const kr = Math.min(S.credit, p.tutar), hazir = !p.onaylar || p.onaylar.every((_, i) => f['o' + i]);
  return `<h2>${esc(p.baslik)}</h2>${p.alt ? `<p class="sheet-alt">${esc(p.alt)}</p>` : ''}
    <div class="ode-tutar"><span>${esc(p.tutarAd || 'Şimdi çekilecek')}</span><b>${tl(p.tutar)}</b></div>
    ${kr > 0 ? satirlar([{ ad: 'Mahir kredin', tutar: -kr }, { ad: 'Karttan çekilecek', tutar: p.tutar - kr }]) : ''}
    <div class="kart-satir">${ikon('kart')}<div><b>Demo kartı</b><small>Kart bilgisi istenmez, gerçek ödeme alınmaz</small></div>${ikon('tik', 'ok-yesil')}</div>
    ${p.not ? not(p.not, 'kilit') : ''}
    ${p.onaylar ? p.onaylar.map((x, i) => `<label class="onay"><input type="checkbox" data-f="o${i}" data-ciz="1"${f['o' + i] ? ' checked' : ''}><span>${x}</span></label>`).join('') : ''}
    <button class="btn" data-act="odeOnay"${hazir ? '' : ' disabled'}>${esc(p.etiket)}</button>`;
};
const ON_BILGI = 'Ön bilgilendirme formunu ve mesafeli sözleşmeyi okudum, onaylıyorum.';

Object.assign(EYLEM, {
  bekleme: d => { S.waitlist.push({ il: S.il, ilce: S.ilce, kat: d.kat, at: Date.now(), ben: true }); degisti('Bekleme listesine eklendin'); },
  odeAc: d => {
    const o = d.id ? bul(d.id) : null;
    if (d.tur === 'standart' || d.tur === 'acil' || d.tur === 'talep') {
      const s = hizmet(V.p.id), f = V.f;
      if (String(f.adres || '').trim().length < 5) { toast('Adresini yaz ki usta seni bulabilsin.', 'hata'); const a = $('[data-f="adres"]'); if (a) a.focus(); return; }
      if (d.tur === 'standart') {
        const slot = slotUret(Number(f.gun), Number(f.saat)), fy = fiyatla(s, standartOpts(f), S.il, S.ilce, slot), sonra = slot - Date.now() > 24 * SAAT;
        return sheetAc('ode', { tur: 'standart', baslik: 'Siparişi onayla', alt: s.ad + ' · ' + zaman(slot), tutar: fy.toplam, tutarAd: sonra ? 'Randevudan 24 saat önce çekilecek' : 'Şimdi çekilecek',
          not: 'Ödemen Mahir’de bloke kalır; işi onayladığında ustaya aktarılır. Randevuya 24 saat kalana kadar ücretsiz iptal edebilirsin.', onaylar: [ON_BILGI], etiket: 'Siparişi onayla' });
      }
      if (d.tur === 'acil') return sheetAc('ode', { tur: 'acil', baslik: 'Ustayı çağır', alt: s.ad + ' · 60 dakika içinde', tutar: s.tani, tutarAd: 'İş bitince çekilecek en az tutar',
        not: 'Şimdi yalnızca kartın doğrulanır. Toplam, ' + tl(s.tavan) + ' tavan fiyatı aşamaz. Usta yola çıkmadan iptal ücretsizdir.', onaylar: [ON_BILGI, 'Hizmetin hemen başlamasını istiyorum; başladıktan sonra cayma hakkımın olmadığını biliyorum.'], etiket: 'Ustayı çağır' });
      const yerinde = s.tip === 'mobilya' || f.kesif === 'yerinde';
      return sheetAc('ode', { tur: 'talep', baslik: s.tip === 'mobilya' ? 'Ölçü randevusu' : 'Keşif talebi', alt: s.ad, tutar: yerinde ? ORAN.kesif : 0, tutarAd: yerinde ? 'Şimdi çekilecek' : 'Ücretsiz',
        not: yerinde ? 'Bu bedel, siparişe dönüşürse ilk ödemeden düşülür. Ölçü ya da keşif yapılmadan iptal edersen tamamı iade edilir.' : 'Teklif gelene kadar hiçbir ödeme alınmaz.', etiket: yerinde ? 'Onayla ve öde' : 'Talebi gönder' });
    }
    if (d.tur === 'teklif') {
      const st = o.stages[0], mahsup = Math.min(blokede(o), st.tutar), mob = o.tip === 'mobilya';
      return sheetAc('ode', { tur: 'teklif', id: o.id, baslik: 'Teklifi onayla', alt: o.ad + ' · toplam ' + tl(o.fiyat.toplam), tutar: st.tutar - mahsup, tutarAd: mob ? 'Üretim onayı ödemesi (%40)' : 'İlk aşama ödemesi (%30)',
        not: (mahsup ? tl(mahsup) + ' keşif bedeli bu ödemeden düşüldü. ' : '') + (mob ? 'Tutar, montajı kabul edene kadar Mahir’de bloke kalır.' : 'Tutar, ilk aşamayı onaylayana kadar Mahir’de bloke kalır.'),
        onaylar: mob ? ['Ölçüler doğru: ' + o.opts.en + ' × ' + o.opts.boy + ' × ' + o.opts.derinlik + ' cm.', 'Teknik çizimi onaylıyorum.', 'Numune rengi doğru: ' + esc((NUMUNELER.find(n => n.kod === o.opts.numune) || NUMUNELER[0]).ad) + ' (' + esc(o.opts.numune) + ').', 'Ürün bana özel üretilecek; üretim onayından sonra cayma hakkımın olmadığını biliyorum.'] : ['Teklif kalemlerini ve üç aşamalı ödeme planını onaylıyorum.', ON_BILGI],
        etiket: 'Onayla ve öde' });
    }
    if (d.tur === 'asama') {
      const i = o.stages.findIndex(st => st.done && !st.accepted), st = o.stages[i], nx = o.stages[i + 1];
      return sheetAc('ode', { tur: 'asama', id: o.id, baslik: '“' + st.ad + '” aşamasını onayla', alt: 'Bu aşamanın bedeli ustaya aktarılır', tutar: nx.paid ? 0 : nx.tutar, tutarAd: 'Sonraki aşama için çekilecek (%' + nx.pct + ')',
        not: '“' + nx.ad + '” aşamasının bedeli, sen o aşamayı da onaylayana kadar Mahir’de bloke kalır.', etiket: 'Aşamayı onayla' });
    }
    if (d.tur === 'sevk') return sheetAc('ode', { tur: 'sevk', id: o.id, baslik: 'Sevk öncesi ödeme', alt: o.ad, tutar: o.stages[1].tutar, tutarAd: 'Şimdi çekilecek (%40)', not: 'Ürünün üretimi tamamlandı. Bu tutar da montajı kabul edene kadar Mahir’de bloke kalır.', etiket: 'Öde ve sevki başlat' });
    if (d.tur === 'ekis') {
      const e = o.extras.find(x => x.id === d.ek);
      return sheetAc('ode', { tur: 'ekis', id: o.id, ek: e.id, baslik: 'Ek işi onayla', alt: e.ad, tutar: e.tutar, tutarAd: o.sonradan ? 'İş bitince çekilecek' : 'Şimdi çekilecek', not: 'Ek iş bedeli de işi onaylayana kadar Mahir’de bloke kalır. Onaylamadığın hiçbir ek iş için ödeme yapmazsın.', etiket: 'Ek işi onayla' });
    }
  },
  odeOnay: () => {
    const p = SH.p, o = p.id ? bul(p.id) : null;
    if (p.tur === 'standart' || p.tur === 'acil') {
      const f = V.f, y = siparisOlustur({ sid: V.p.id, opts: standartOpts(f), slotTs: p.tur === 'acil' ? null : slotUret(Number(f.gun), Number(f.saat)), adres: f.adres.trim(), not: String(f.not || '').trim(), fotos: f.fotos });
      S.adres = f.adres.trim(); kaydet(); kokeGit('siparis', { id: y.id }); return toast(p.tur === 'acil' ? 'Usta aranıyor' : 'Siparişin alındı');
    }
    if (p.tur === 'talep') {
      const f = V.f, s = hizmet(V.p.id);
      const y = talepOlustur({ sid: s.id, opts: s.tip === 'mobilya' ? mobilyaOpts(f) : { m2: Number(f.m2) }, kesif: s.tip === 'mobilya' ? 'yerinde' : f.kesif, adres: f.adres.trim(), not: String(f.not || '').trim(), fotos: f.fotos });
      S.adres = f.adres.trim(); kaydet(); kokeGit('siparis', { id: y.id }); return toast('Talebin alındı');
    }
    if (p.tur === 'teklif') teklifOnayla(o);
    else if (p.tur === 'asama') asamaOnay(o);
    else if (p.tur === 'sevk') sevkOde(o);
    else if (p.tur === 'ekis') ekIsKarar(o, p.ek, true);
    SH = null; degisti({ teklif: 'Teklif onaylandı', asama: 'Aşama onaylandı', sevk: 'Ödeme alındı', ekis: 'Ek iş onaylandı' }[p.tur]);
  },
  ekIsRet: d => { ekIsKarar(bul(d.id), d.ek, false); degisti('Ek iş reddedildi'); },
  kabulOnay: d => { const o = bul(d.id), puan = Number(SH.f.puan) || 0; kabul(o, { puan }); SH = null; degisti('Eline sağlık! Ödeme serbest bırakıldı'); },
  iptalOnay: d => { const o = bul(d.id), h = iptalEt(o); SH = null; degisti(h.izin ? (h.iade ? tl(h.iade) + ' iade edildi' : 'Sipariş iptal edildi') : h.neden, h.izin ? '' : 'hata'); },
  sikayetGonder: () => {
    const o = bul(V.p.id), f = V.f, t = SIKAYET_TURLERI.find(x => x.id === f.tur);
    const talep = t.talepler.length === 1 ? t.talepler[0] : f.talep;
    if (String(f.aciklama || '').trim().length < 5) return toast('Sorunu birkaç kelimeyle anlat.', 'hata');
    if (!talep) return toast('Ne istediğini seç.', 'hata');
    if (talep === 'indirim' && !(Number(f.tutar) > 0)) return toast('İstediğin indirim tutarını yaz.', 'hata');
    const d = sikayetAc(o, { tur: t.id, aciklama: f.aciklama, talep, tutar: talep === 'indirim' ? f.tutar : 0, fotos: f.fotos || [] });
    kaydet(); V = YIGIN.pop() || yeniV('siparis', { id: o.id });
    const k = d.karar;
    sheetAc('bilgi', d.oto ? { baslik: k.sonuc === 'duzeltme' ? 'Ücretsiz düzeltme planlandı' : k.sonuc === 'indirim' ? tl(k.tutar) + ' bedel indirimi' : 'Sipariş durduruldu', metin: esc(k.not) }
      : { baslik: 'Şikâyetin alındı', metin: 'Ustanın 24 saat içinde yanıt vermesi istenir; Mahir en geç 48 saatte karar verir. Ödemen bu sürede ustaya aktarılmaz.' });
  },
  adresKaydet: () => { const a = String(V.f.adres || '').trim(); if (a.length < 5) return toast('Adres çok kısa.', 'hata'); S.adres = a; degisti('Adres kaydedildi'); },
});

/* ---------- siparişler ---------- */
G.siparisler = (p, f) => {
  const sek = f.sek || 'aktif', liste = S.orders.filter(o => (sek === 'aktif') === !kapaliMi(o) || (sek === 'aktif' && acikDava(o)));
  return `<h1 class="baslik">Siparişlerim</h1><div class="dilim">${cip('sek', 'aktif', 'Süren', sek)}${cip('sek', 'gecmis', 'Geçmiş', sek)}</div>
    ${liste.length ? `<div class="liste">${liste.map(o => siparisKart(o, 'siparis', 'musteri')).join('')}</div>` : bos(sek === 'aktif' ? 'Süren siparişin yok.' : 'Geçmiş siparişin yok.', 'liste')}`;
};

function ekIsKart(o, e) {
  return `<section class="kart eylem"><h2>Usta ek iş istiyor</h2><p><b>${esc(e.ad)}</b></p>${e.foto ? fotoGaleri([e.foto], 'Ek iş fotoğrafı') : ''}
    ${satirlar([{ ad: 'Ek tutar', tutar: e.tutar }])}${e.uzmanOnay ? not('İlk fiyatın %20’sini aştığı için Mahir uzmanı inceledi ve uygun buldu.') : ''}
    <div class="btn-sira"><button class="btn ikincil" data-act="ekIsRet" data-id="${o.id}" data-ek="${e.id}">Reddet</button><button class="btn" data-act="odeAc" data-tur="ekis" data-id="${o.id}" data-ek="${e.id}">Onayla · ${tl(e.tutar)}</button></div></section>`;
}
function teklifKart(o, s) {
  const gun = Math.max(0, Math.ceil((o.teklif.gecerli - Date.now()) / GUN));
  return `<section class="kart eylem"><div class="kart-ust"><h2>Teklifin hazır</h2><span class="cip cip-bekle">${gun} gün geçerli</span></div>
    ${o.tip === 'mobilya' ? `<div class="cizim-kutu">${mobilyaCizim(s, o.opts)}</div><p class="ipucu">Teknik çizim · ${o.opts.en} × ${o.opts.boy} × ${o.opts.derinlik} cm · ${esc((MALZEMELER.find(m => m.id === o.opts.malzeme) || MALZEMELER[0]).ad)}${s.kapakli ? ', ' + (o.opts.kapak === 'surgulu' ? 'sürgülü' : 'menteşeli') + ' kapak' : ''}</p>` : ''}
    ${satirlar(o.fiyat.lines, o.fiyat.toplam)}
    <h3>Ödeme planı</h3><ul class="asamalar">${o.stages.map(st => `<li>${ikon('saat')}<span>${esc(st.ad)} <em>%${st.pct}</em></span><b>${tl(st.tutar)}</b></li>`).join('')}</ul>
    <button class="btn" data-act="odeAc" data-tur="teklif" data-id="${o.id}">Teklifi incele ve onayla</button></section>`;
}
function musteriEylem(o, s, u) {
  const onde = o.durum === 'TESLIM' || o.durum === 'ASAMA_ONAY';
  const sorun = sikayetTurleri(o).length ? `<button class="btn ${onde ? 'ikincil' : 'metin'}" data-act="git" data-ad="sikayet" data-id="${o.id}">Sorun bildir</button>` : '';
  const kod = `<div class="kapi"><div class="kapi-kod" aria-label="Kapı kodu ${o.kod.split('').join(' ')}">${o.kod.split('').map(c => `<span>${c}</span>`).join('')}</div><p>Usta kapıya gelince bu kodu söyle. Kod girilmeden iş başlamış sayılmaz.</p></div>`;
  const ek = o.extras.filter(e => e.durum === 'bekliyor').map(e => ekIsKart(o, e)).join('') +
    o.extras.filter(e => e.durum === 'uzman').map(e => `<section class="kart eylem bekle"><h2>Ek iş inceleniyor</h2><p>Usta <b>${esc(e.ad)}</b> için ${tl(e.tutar)} istedi. İlk fiyatın %20’sini aştığı için önce Mahir uzmanı bakıyor; uygun bulursa onayına gelecek.</p></section>`).join('');
  switch (o.durum) {
    case 'TEKLIF_BEKLIYOR': return `<section class="kart eylem bekle"><h2>Teklifin hazırlanıyor</h2><p>${o.kesif === 'yerinde' ? 'Mahir uzmanı ' + (o.tip === 'mobilya' ? 'ölçü' : 'keşif') + ' için seni arayıp randevu verecek.' : 'Görüntülü keşif için seni arayacağız.'} Kalem kalem teklif bu ekrana düşecek.</p></section>`;
    case 'TEKLIF_HAZIR': return teklifKart(o, s);
    case 'ATAMA': return `<section class="kart eylem bekle"><h2>${o.duzeltme ? 'Düzeltme için usta atanıyor' : 'Ustan atanıyor'}</h2><p>${o.atamaBekliyor ? 'Operasyon ekibi sana uygun ustayı arıyor.' : 'İşi bölgendeki en uygun ustaya teklif ettik; 30 dakika içinde yanıt verir.'}</p></section>`;
    case 'PLANLANDI': case 'YOLDA': case 'MONTAJ': {
      const yolda = o.durum === 'YOLDA' || o.yolda;
      return `<section class="kart eylem${yolda ? '' : ' bekle'}"><h2>${yolda ? (o.durum === 'MONTAJ' ? 'Montaj ekibi yolda' : 'Ustan yolda') : o.duzeltme ? 'Düzeltme ziyareti planlandı' : o.durum === 'MONTAJ' ? 'Montaj randevun hazır' : 'Randevun hazır'}</h2><p class="buyuk-zaman">${ikon('takvim')}${zaman(o.slotTs)}</p>${kod}${sorun ? `<div class="btn-sira tek">${sorun}</div>` : ''}</section>`;
    }
    case 'BASLADI': {
      const n = s.kontrol.length, t = o.kontrol.length, st = o.stages && o.tip === 'proje' ? o.stages.find(a => !a.done) : null;
      return `<section class="kart eylem bekle"><h2>İş sürüyor</h2>${st ? `<p>Şu anki aşama: <b>${esc(st.ad)}</b></p>` : ''}
        <div class="ilerleme" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${t}"><i style="width:${Math.round(t / n * 100)}%"></i></div><p class="ipucu">${t}/${n} kontrol adımı tamam</p>${sorun ? `<div class="btn-sira tek">${sorun}</div>` : ''}</section>${ek}`;
    }
    case 'ASAMA_ONAY': {
      const i = o.stages.findIndex(a => a.done && !a.accepted), st = o.stages[i], nx = o.stages[i + 1];
      return `<section class="kart eylem"><h2>“${esc(st.ad)}” tamamlandı</h2><p>Kontrol et. Onaylarsan bu aşamanın bedeli (${tl(st.tutar)}) ustaya aktarılır${nx && !nx.paid ? ' ve “' + esc(nx.ad) + '” için ' + tl(nx.tutar) + ' kartından çekilir' : ''}.</p>${fotoGaleri(o.fotoSonra, 'Aşama fotoğrafı')}
        <div class="btn-sira">${sorun}<button class="btn" data-act="odeAc" data-tur="asama" data-id="${o.id}">Aşamayı onayla</button></div></section>`;
    }
    case 'URETIM': return `<section class="kart eylem bekle"><h2>Ürünün üretimde</h2><p>Atölye, onayladığın çizime göre üretiyor. Tahmini süre: ${esc(s.sure)}. Tamamlanınca sevk öncesi ödeme için haber vereceğiz.</p>${sorun ? `<div class="btn-sira tek">${sorun}</div>` : ''}</section>`;
    case 'SEVK_ODEME': return `<section class="kart eylem"><h2>Üretim tamamlandı</h2><p>Ürünün sevke hazır. Sevk öncesi ödemeyi yapınca nakliye ve montaj randevun planlanır.</p><button class="btn" data-act="odeAc" data-tur="sevk" data-id="${o.id}">Sevk ödemesini yap · ${tl(o.stages[1].tutar)}</button></section>`;
    case 'SEVK': return `<section class="kart eylem bekle"><h2>Sevke hazırlanıyor</h2><p>Ürün yola çıkınca montaj randevun burada görünecek.</p></section>`;
    case 'TESLIM': {
      const son = o.stages && !o.stages[o.stages.length - 1].paid ? o.stages[o.stages.length - 1].tutar : 0;
      return `<section class="kart eylem"><h2>${o.duzeltme ? 'Düzeltme tamamlandı' : 'İş tamamlandı'}</h2><p>Kontrol et; her şey yolundaysa onayla. ${zaman(o.acceptBy)} tarihine kadar yanıt vermezsen iş kendiliğinden kabul edilir; yasal hakların saklı kalır.</p>
        ${o.fotoOnce.length ? `<h3>Önce</h3>${fotoGaleri(o.fotoOnce, 'Önce')}` : ''}${o.fotoSonra.length ? `<h3>Sonra</h3>${fotoGaleri(o.fotoSonra, 'Sonra')}` : ''}
        <ul class="dahil">${s.kontrol.map((x, i) => `<li class="${o.kontrol.includes(i) ? '' : 'yok'}">${ikon(o.kontrol.includes(i) ? 'tik' : 'eksi')}${esc(x)}</li>`).join('')}</ul>
        ${son ? not('Onaylayınca son ödeme (' + tl(son) + ') kartından çekilir ve tamamı serbest bırakılır.') : ''}
        <button class="btn" data-act="sheet" data-ad="puan" data-id="${o.id}">Eline sağlık · Onayla</button><div class="btn-sira tek">${sorun}</div></section>`;
    }
    case 'KABUL': return `<section class="kart eylem tamam"><h2>Tamamlandı</h2><p>${o.otoKabul ? 'Süre dolduğu için iş kendiliğinden kabul edildi.' : 'Eline sağlık dedin; ödeme serbest bırakıldı.'} ${o.garantiBitis ? 'İşçilik garantin ' + tarih(o.garantiBitis) + ' tarihine kadar sürüyor.' : 'İlk 30 gün içinde kusur bildirebilirsin.'}</p>
      ${o.puan ? `<p class="puan-satir">${yildizlar(o.puan)}<span>Puanın</span></p>` : ''}${sorun ? `<div class="btn-sira tek">${sorun}</div>` : ''}</section>`;
    case 'IPTAL': return `<section class="kart eylem kapali"><h2>${o.iptal && o.iptal.sebep === 'musteriYok' ? 'Adreste bulunamadın' : 'Sipariş iptal edildi'}</h2>${satirlar([{ ad: 'Kesinti', tutar: o.iptal ? o.iptal.kesinti : 0 }, { ad: 'İade edilen', tutar: o.refunded }])}</section>`;
    case 'IADE': return `<section class="kart eylem kapali"><h2>Sipariş kapatıldı</h2><p>${o.refunded ? tl(o.refunded) + ' kartına iade edildi. Bankana göre 1–7 iş günü içinde hesabına geçer.' : 'Kartından çekim yapılmadı.'}</p></section>`;
  }
  return '';
}

G.siparis = p => {
  const o = bul(p.id); if (!o) return sayfaBas('Sipariş') + bos('Sipariş bulunamadı.');
  const s = hizmet(o.sid), u = ustaBul(o.ustaId), d = davaBul(o.disputeId), ip = iptalHesap(o);
  return sayfaBas(o.ad, o.code + ' · ' + TIP_AD[o.tip]) +
    `<div class="durum-satir">${durumCip(o, 'musteri')}<span>${esc(o.ilce)}, ${esc(o.il)}</span></div>` +
    musteriEylem(o, s, u) + (d ? davaKart(d, 'musteri') : '') + (u ? ustaKart(u, o) : '') + cetvel(o) + odemeOzet(o, 'musteri') +
    (o.ustaId && !kapaliMi(o) ? sohbet(o, 'musteri') : '') +
    `<section class="kart"><h2>Sipariş bilgisi</h2><dl class="kalemler bilgi"><div><dt>Adres</dt><dd>${esc(o.adres)}</dd></div>${o.not ? `<div><dt>Notun</dt><dd>${esc(o.not)}</dd></div>` : ''}</dl>${fotoGaleri(o.fotos, 'İş yeri')}</section>` +
    izKart(o) +
    (ip.izin ? `<button class="btn metin tehlike" data-act="sheet" data-ad="iptal" data-id="${o.id}">Siparişi iptal et</button>` : ip.destek ? `<p class="dipnot">${esc(ip.neden)}</p>` : '');
};

SHEET.puan = (p, f) => {
  const o = bul(p.id), u = ustaBul(o.ustaId), son = o.stages && !o.stages[o.stages.length - 1].paid ? o.stages[o.stages.length - 1].tutar : 0, n = Number(f.puan) || 0;
  return `<h2>Eline sağlık</h2><p class="sheet-alt">${esc(u.ad)} için puanın, sonraki işlerin kime verileceğini belirler.</p>
    <div class="puanla" role="group" aria-label="Puan">${[1, 2, 3, 4, 5].map(i => `<button data-act="sec" data-k="puan" data-v="${i}" class="${i <= n ? 'dolu' : ''}" aria-label="${i} yıldız" aria-pressed="${i === n}">${ikon('yildiz')}</button>`).join('')}</div>
    ${not((son ? 'Son ödeme (' + tl(son) + ') kartından çekilir. ' : '') + 'Onayınla blokedeki ' + tl(blokede(o) + son) + ' serbest kalır; usta hakedişini 2 iş günü içinde alır. Garanti ve yasal hakların sürer.', 'kilit')}
    <button class="btn" data-act="kabulOnay" data-id="${o.id}">Onayla ve ödemeyi serbest bırak</button>`;
};
SHEET.iptal = p => {
  const o = bul(p.id), h = iptalHesap(o);
  return `<h2>Siparişi iptal et</h2><p class="sheet-metin">${esc(h.neden)}</p>${h.izin ? satirlar([{ ad: 'Kesinti', tutar: h.kesinti || 0 }, { ad: 'Sana iade', tutar: h.iade || 0 }]) : ''}
    <div class="btn-sira"><button class="btn ikincil" data-act="sheetKapat">Vazgeç</button>${h.izin ? `<button class="btn tehlike" data-act="iptalOnay" data-id="${o.id}">İptal et</button>` : ''}</div>`;
};

/* ---------- sorun bildir ---------- */
G.sikayet = (p, f) => {
  const o = bul(p.id); if (!o) return sayfaBas('Sorun bildir') + bos('Sipariş bulunamadı.');
  const turler = sikayetTurleri(o);
  if (!turler.length) return sayfaBas('Sorun bildir', o.ad) + bos('Bu sipariş için şu anda yeni bir bildirim açılamıyor.');
  const t = turler.find(x => x.id === f.tur);
  if (!t) return sayfaBas('Sorun bildir', o.ad + ' · ' + o.code) + `<p class="giris">Ne oldu? Seçimine göre en hızlı çözümü öneririz. Ödemen, karar çıkana kadar ustaya aktarılmaz.</p>
    <div class="secim-liste">${turler.map(x => `<button data-act="sec" data-k="tur" data-v="${x.id}"><span>${x.ad}</span><small>${x.ornek}</small></button>`).join('')}</div>`;
  const talep = t.talepler.length === 1 ? t.talepler[0] : f.talep, esik = kucukEsik(o);
  const tekrar = o.tip === 'proje' ? 'rötuş turu' : o.tip === 'mobilya' ? 'ayar ziyareti' : 'tekrar';
  const tutarAlan = `<label class="alan yan"><span>${t.id === 'hasar' ? 'Zararın tutarı' : t.id === 'fiyat' ? 'Fazladan istenen tutar' : 'İstediğin indirim'}</span><span class="birimli"><input type="number" inputmode="numeric" min="1" max="${indirimTavan(o)}" data-f="tutar" value="${esc(f.tutar || '')}"><i>₺</i></span></label><p class="ipucu">${tl(esik)} tutarına kadar olan talepler inceleme beklemeden karşılanır.</p>`;
  return sayfaBas(t.ad, o.ad + ' · ' + o.code) +
    (t.id === 'begenmeme' ? not(!o.memnuniyet ? 'Memnuniyet güvencesi: iş kurallara uygun olsa da bir kez ücretsiz ' + tekrar + ' hakkın var.' : o.tip === 'standart' || o.tip === 'acil' ? 'Ücretsiz tekrarı kullandın. Yine memnun değilsen işçilik bedeli iade edilir.' : 'Ücretsiz ' + tekrar + ' hakkını kullandın; talebini Mahir uzmanı değerlendirecek.') : '') +
    (t.acil ? not('Güvenlik bildirimi anında işleme alınır: iş durdurulur, usta askıya alınır, ödemen iade edilir. Tehlike sürüyorsa önce 112’yi ara.', 'uyari') : '') +
    `<section class="kart"><label class="alan"><span>Ne oldu?</span><textarea data-f="aciklama" rows="4" maxlength="600" placeholder="${esc(t.ornek)}">${esc(f.aciklama || '')}</textarea></label>
      <h3>Fotoğraf <i>karar süresini kısaltır</i></h3>${fotoAlan('f:fotos', f.fotos, 'Sorun')}</section>
    ${t.talepler.length > 1 ? `<section class="kart"><h2>Ne istiyorsun?</h2><div class="cipler">${t.talepler.map(x => cip('talep', x, TALEP_AD[x], f.talep)).join('')}</div>${talep === 'indirim' ? tutarAlan : ''}</section>` : talep === 'indirim' ? `<section class="kart">${tutarAlan}</section>` : ''}
    <p class="dipnot">Bu güvenceler, tüketici mevzuatından doğan haklarına ek olarak sunulur.</p>
    <div class="alt-cubuk"><button class="btn" data-act="sikayetGonder">Bildirimi gönder</button><button class="btn metin" data-act="sec" data-k="tur" data-v="">Başka bir sorun seç</button></div>`;
};

/* ---------- güvence ve hesap ---------- */
G.guvence = () => `<h1 class="baslik">Mahir güvencesi</h1><p class="giris">Sözleşmen ustayla değil Mahir’le. Bir şey ters giderse muhatabın biziz.</p>
  <div class="guvenceler">
    <section class="kart"><span class="rozet">${ikon('kilit')}</span><h2>Paran bloke kalır</h2><p>Kartından çekilen tutar, sen “Eline sağlık” diyene kadar ustaya geçmez. Proje işlerinde her aşama ayrı onaylanır.</p></section>
    <section class="kart"><span class="rozet">${ikon('yenile')}</span><h2>Memnuniyet güvencesi</h2><p>Sabit fiyatlı işlerde iş kurallara uygun olsa bile beğenmezsen 48 saat içinde bildir: bir kez ücretsiz tekrar, yine olmazsa işçilik iadesi. Yılda iki kez kullanılabilir.</p></section>
    <section class="kart"><span class="rozet">${ikon('kalkan')}</span><h2>İşçilik garantisi</h2><dl class="kalemler"><div><dt>Sabit fiyatlı iş</dt><dd>6 ay</dd></div><div><dt>Keşifli proje</dt><dd>12 ay</dd></div><div><dt>Ismarlama mobilya</dt><dd>24 ay</dd></div></dl></section>
    <section class="kart"><span class="rozet">${ikon('uyari')}</span><h2>Hasar ve gecikme</h2><p>Usta evine ya da eşyana zarar verirse 72 saat içinde bildir. Usta gelmezse yedek usta göndeririz; gönderemezsek siparişin %10’u kadar kredi ya da tam iade senin seçimin.</p></section>
    <section class="kart"><span class="rozet">${ikon('saat')}</span><h2>Şikâyet süreleri</h2><dl class="kalemler"><div><dt>İlk yanıt</dt><dd>2 saat</dd></div><div><dt>Güvenlik bildirimi</dt><dd>15 dakika</dd></div><div><dt>Karar</dt><dd>48 saat</dd></div><div><dt>Düzeltme hedefi</dt><dd>7 gün</dd></div></dl></section>
    <section class="kart"><span class="rozet">${ikon('takvim')}</span><h2>İptal koşulları</h2><dl class="kalemler uzun"><div><dt>Randevuya 24 saatten fazla var</dt><dd>Ücretsiz</dd></div><div><dt>Son 24 saat</dt><dd>%10 rezervasyon bedeli</dd></div><div><dt>Usta yola çıktı</dt><dd>${tl(ORAN.yolBedeli)} yol bedeli</dd></div><div><dt>Proje, iş başlamadan</dt><dd>Yerinde keşif bedeli hariç iade</dd></div><div><dt>Ismarlama ürün, üretim onayından sonra</dt><dd>Cayma hakkı yok</dd></div></dl></section>
  </div>
  ${not('Ustaya elden ödeme yapma, telefon numarası paylaşma. Mahir dışında yapılan iş ve ödemelerde hiçbir güvence geçerli olmaz.', 'uyari')}
  <p class="dipnot">Bu güvenceler, tüketici mevzuatından doğan yasal haklarına ek olarak sunulur.</p>`;

G.hesap = (p, f) => {
  if (f.adres == null) f.adres = S.adres;
  const bekleyen = S.waitlist.filter(w => w.ben);
  return `<h1 class="baslik">Hesap</h1>
  <section class="kart usta-kart"><span class="avatar">D</span><div><b>Demo müşteri</b><small>${esc(S.ilce)}, ${esc(S.il)}</small></div></section>
  <section class="kart"><h2>Adres</h2><label class="alan"><span>Açık adres</span><input type="text" data-f="adres" value="${esc(f.adres)}" maxlength="120"></label><button class="btn ikincil" data-act="adresKaydet">Kaydet</button></section>
  <section class="kart"><h2>Ödeme</h2><div class="kart-satir">${ikon('kart')}<div><b>Demo kartı</b><small>Kart bilgisi istenmez, gerçek ödeme alınmaz</small></div></div>
    <dl class="kalemler"><div><dt>Mahir kredisi</dt><dd>${tl(S.credit)}</dd></div><div><dt>Memnuniyet güvencesi kullanımı</dt><dd>${S.mg || 0} / 2</dd></div></dl></section>
  ${bekleyen.length ? `<section class="kart"><h2>Bekleme listem</h2><dl class="kalemler">${bekleyen.map(w => `<div><dt>${esc(w.ilce)}, ${esc(w.il)}</dt><dd>${esc((KATEGORILER.find(k => k.id === w.kat) || {}).ad)}</dd></div>`).join('')}</dl></section>` : ''}
  <section class="kart"><h2>Bu bir demo</h2><p>Gördüğün siparişler, ustalar ve fiyatlar örnektir. Yaptığın değişiklikler yalnızca bu tarayıcıda saklanır; gerçek ödeme alınmaz, kimseye bildirim gitmez.</p>
    <button class="btn ikincil" data-act="sheet" data-ad="onay" data-baslik="Örnek veri sıfırlansın mı?" data-metin="Verdiğin siparişler silinir, demo ilk haline döner." data-etiket="Sıfırla" data-eylem="sifirla" data-tehlike="1">Örnek veriyi sıfırla</button></section>
  <p class="dipnot marka-dip">${LOGO}<span>${MARKA.slogan}</span></p>`;
};
