// Fabian Dierl: Bettenzähler, Anfrage oben und unten, Reiter, rote Leiste, Durchstreichen. Ohne fremde Abrufe.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MIN = 1, MAX = 13; // 13 steht für „mehr als 12“
  const text = n => n >= MAX ? '12+' : String(n);
  let betten = 2;

  // Bettenzähler: alle Zähler zeigen denselben Wert
  const zeigeBetten = () => {
    $$('[data-zaehler]').forEach(z => {
      const w = $('[data-wert]', z); w.textContent = text(betten); w.title = betten >= MAX ? 'mehr als 12 Betten' : '';
      $('[data-minus]', z).disabled = betten <= MIN;
      $('[data-plus]', z).disabled = betten >= MAX;
      const versteckt = $('input[name="betten"]', z); if (versteckt) versteckt.value = betten >= MAX ? 'mehr als 12' : betten;
    });
  };
  $$('[data-zaehler]').forEach(z => {
    $('[data-minus]', z).addEventListener('click', () => { betten = Math.max(MIN, betten - 1); zeigeBetten(); });
    $('[data-plus]', z).addEventListener('click', () => { betten = Math.min(MAX, betten + 1); zeigeBetten(); });
  });
  zeigeBetten();

  // Ort: alle Auswahlfelder gleich halten
  $$('[data-ort]').forEach(s => s.addEventListener('change', () => $$('[data-ort]').forEach(t => { if (t !== s) t.value = s.value; })));

  // Anfrage oben oder unten: Werte ins Formular, dorthin springen, Name fokussieren
  const zumFormular = () => {
    const ziel = $('#anfrage');
    ziel.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => $('[data-formular] input[name="name"]').focus({ preventScroll: true }), ruhig ? 0 : 600);
  };
  $$('[data-schnell]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); zumFormular(); }));

  // Knöpfe in den Reitern setzen das passende Paket
  $$('[data-paket]').forEach(a => a.addEventListener('click', () => { $('[data-paket-feld]').value = a.dataset.paket; }));

  // Formular: einfache Prüfung vor dem Absenden
  const form = $('[data-formular]');
  form.addEventListener('submit', e => {
    const name = form.name.value.trim(), mail = form.email.value.trim();
    const ok = name && /.+@.+\..+/.test(mail);
    $('[data-fehler]', form).hidden = ok;
    if (!ok) { e.preventDefault(); (name ? form.email : form.name).focus(); }
  });

  // Reiter mit Pfeiltasten
  const reiter = $('[data-reiter]');
  if (reiter) {
    const tabs = $$('[role="tab"]', reiter);
    const waehle = t => {
      tabs.forEach(x => { const an = x === t; x.setAttribute('aria-selected', an); x.tabIndex = an ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !an; });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => waehle(t));
      t.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return; e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; waehle(n); n.focus();
      });
    });
  }

  // Rote Leiste erscheint, sobald die Anfrage oben aus dem Bild ist, und verschwindet am Formular
  const leiste = $('[data-leiste]'), oben = $('.start [data-schnell]'), unten = $('#anfrage'), schluss = $('.fuss');
  const sicht = { oben: true, unten: false, fuss: false };
  const setze = () => {
    const da = !sicht.oben && !sicht.unten && !sicht.fuss;
    leiste.classList.toggle('ist-da', da);
    document.documentElement.style.setProperty('--leiste-h', da ? leiste.offsetHeight + 'px' : '0px');
    leiste.inert = !da;
  };
  new IntersectionObserver(es => es.forEach(e => {
    if (e.target === oben) sicht.oben = e.isIntersecting;
    if (e.target === unten) sicht.unten = e.isIntersecting;
    if (e.target === schluss) sicht.fuss = e.isIntersecting;
    setze();
  })).observe(oben);
  const io2 = new IntersectionObserver(es => es.forEach(e => { sicht[e.target === unten ? 'unten' : 'fuss'] = e.isIntersecting; setze(); }), { rootMargin: '0px 0px -30% 0px' });
  io2.observe(unten); io2.observe(schluss);
  setze();

  // Kopf bekommt beim Scrollen eine Linie
  const nav = $('.nav');
  addEventListener('scroll', () => nav.classList.toggle('ist-unten', scrollY > 10), { passive: true });

  // Durchstreichen: jede Zeile, sobald sie im Bild ist, nacheinander
  const liste = $('[data-streichen]');
  if (liste && !ruhig) {
    liste.classList.add('ist-bereit');
    new IntersectionObserver((es, o) => es.forEach(e => {
      if (!e.isIntersecting) return;
      $$('li', liste).forEach((li, i) => setTimeout(() => li.classList.add('ist-weg'), 350 + i * 380));
      o.disconnect();
    }), { threshold: .5 }).observe(liste);
  }


  // Ticker: auf schmalen Schirmen läuft das Band, dafür wird es einmal verdoppelt
  const band = $('.ticker__band');
  if (band && !ruhig && matchMedia('(max-width: 1600px)').matches) band.innerHTML += band.innerHTML.replace(/<p>/g, '<p aria-hidden="true">');
})();
