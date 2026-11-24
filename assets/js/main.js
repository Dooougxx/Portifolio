/* =========================================================
   Nala Clinic — scripts da landing page
   Sem dependências. Compatível com CSP estrita (sem inline).
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURAÇÃO — edite apenas este bloco
   --------------------------------------------------------- */
const CONFIG = {
  // WhatsApp com DDI + DDD + número, só dígitos. Ex.: '5519999999999'
  whatsapp: '5519000000000',

  // Google Ads: ID da conta (AW-XXXXXXXXX) e rótulo da conversão de lead.
  // Deixe vazio para não carregar nada.
  googleAdsId: '',            // ex.: 'AW-123456789'
  googleAdsLeadLabel: '',     // ex.: 'AbCdEfGhIjk'

  // Google Analytics 4 (opcional). Ex.: 'G-XXXXXXX'
  ga4Id: '',
};

(function () {
  'use strict';

  const doc = document.documentElement;
  doc.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Armazenamento seguro ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sem storage */ } },
  };
  const session = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* sem storage */ } },
  };

  /* ---------- Origem do tráfego (UTM / gclid) ---------- */
  (function captureSource() {
    const p = new URLSearchParams(location.search);
    const src = p.get('utm_source') || (p.get('gclid') || p.get('gbraid') || p.get('wbraid') ? 'google-ads' : '');
    if (src && !session.get('nala_src')) {
      session.set('nala_src', src.replace(/[^\w.\-]/g, '').slice(0, 40));
    }
  })();

  /* ---------- WhatsApp ---------- */
  const waNumber = String(CONFIG.whatsapp).replace(/\D/g, '');
  const waUrl = (msg) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  $$('[data-wa]').forEach((a) => {
    a.href = waUrl(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- Analytics / Google Ads (só após consentimento) ---------- */
  let gtagLoaded = false;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function loadGtag() {
    const primary = CONFIG.googleAdsId || CONFIG.ga4Id;
    if (gtagLoaded || !primary) return;
    gtagLoaded = true;
    gtag('consent', 'default', {
      ad_storage: 'granted', analytics_storage: 'granted',
      ad_user_data: 'granted', ad_personalization: 'granted',
    });
    gtag('js', new Date());
    if (CONFIG.googleAdsId) gtag('config', CONFIG.googleAdsId);
    if (CONFIG.ga4Id) gtag('config', CONFIG.ga4Id, { anonymize_ip: true });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primary)}`;
    document.head.appendChild(s);
  }

  function trackLead(origin) {
    if (!gtagLoaded) return;
    if (CONFIG.ga4Id) gtag('event', 'generate_lead', { method: 'whatsapp', lead_origin: origin, traffic_source: session.get('nala_src') || 'direct' });
    if (CONFIG.googleAdsId && CONFIG.googleAdsLeadLabel) {
      gtag('event', 'conversion', { send_to: `${CONFIG.googleAdsId}/${CONFIG.googleAdsLeadLabel}` });
    }
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track]');
    if (el) trackLead(el.dataset.track);
  });

  /* ---------- Consentimento LGPD ---------- */
  const consentBox = $('.consent');
  const consent = store.get('nala_consent');
  const hasTracking = Boolean(CONFIG.googleAdsId || CONFIG.ga4Id);

  if (consent === 'grant') loadGtag();
  else if (!consent && hasTracking && consentBox) consentBox.hidden = false;

  $$('[data-consent]').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.consent;
    store.set('nala_consent', v);
    consentBox.hidden = true;
    if (v === 'grant') loadGtag();
    else if (gtagLoaded) location.reload(); // revoga: recarrega sem tags
  }));
  $$('[data-open-consent]').forEach((b) => b.addEventListener('click', () => { if (consentBox) consentBox.hidden = false; }));

  /* ---------- Header + menu mobile ---------- */
  const header = $('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = $('.menu-toggle');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('#menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Reveal 3D ao rolar ---------- */
  const reveals = $$('[data-reveal]');
  // Escalonamento: itens irmãos entram em sequência
  reveals.forEach((el) => {
    const sibs = Array.from(el.parentElement.children).filter((c) => c.hasAttribute('data-reveal'));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', `${Math.min(i * 0.12, 0.6)}s`);
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add('is-visible');
        io.unobserve(el);
        setTimeout(() => el.classList.add('is-done'), 1300 + (parseFloat(el.style.getPropertyValue('--d')) || 0) * 1000);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible', 'is-done'));
  }

  /* ---------- Tilt 3D (mouse) ---------- */
  if (finePointer && !reduceMotion) {
    $$('[data-tilt]').forEach((el) => {
      const max = el.classList.contains('spotlight__card') ? 5 : 9;
      let raf = 0;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(1000px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(0)`;
        });
      });
      el.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); el.style.transform = ''; });
    });

    /* Parallax da cena 3D do hero */
    const scene = $('[data-parallax]');
    const hero = $('.hero');
    if (scene && hero) {
      hero.addEventListener('pointermove', (e) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        scene.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 14}deg)`;
      });
      hero.addEventListener('pointerleave', () => { scene.style.transform = ''; });
    }
  }

  /* ---------- Flip cards (toque / teclado) ---------- */
  $$('.flip').forEach((card) => {
    const btn = $('.flip__btn', card);
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const on = card.classList.toggle('is-flipped');
      btn.setAttribute('aria-expanded', String(on));
    });
    if (!finePointer) {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        card.classList.toggle('is-flipped');
      });
    }
  });

  /* ---------- Formulário -> WhatsApp ---------- */
  const form = $('#lead-form');
  if (form) {
    const tel = form.elements.telefone;
    const errorEl = $('.form__error', form);

    tel.addEventListener('input', () => {
      let d = tel.value.replace(/\D/g, '').slice(0, 11);
      if (d.length > 6) d = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
      else if (d.length > 2) d = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      tel.value = d;
    });

    const clean = (v) => String(v).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = clean(form.elements.nome.value);
      const fone = tel.value.replace(/\D/g, '');
      const trat = clean(form.elements.tratamento.value);
      const periodo = clean(form.elements.periodo.value);
      const ok = form.elements.consent.checked;

      $$('input, select', form).forEach((f) => f.removeAttribute('aria-invalid'));
      let err = '';
      if (nome.length < 2) { err = 'Informe seu nome.'; form.elements.nome.setAttribute('aria-invalid', 'true'); }
      else if (fone.length < 10) { err = 'Informe um WhatsApp válido com DDD.'; tel.setAttribute('aria-invalid', 'true'); }
      else if (!trat) { err = 'Selecione o tratamento de interesse.'; form.elements.tratamento.setAttribute('aria-invalid', 'true'); }
      else if (!ok) { err = 'Para continuar, aceite a Política de Privacidade.'; }
      errorEl.textContent = err;
      if (err) return;

      const msg = [
        `Olá! Sou ${nome} e vim pelo site da Nala Clinic.`,
        `Tenho interesse em: ${trat}.`,
        `Melhor período para contato: ${periodo}.`,
        `Meu WhatsApp: ${tel.value}`,
      ].join('\n');

      trackLead('formulario');
      window.open(waUrl(msg), '_blank', 'noopener');
      form.reset();
    });
  }

  /* ---------- Ano no rodapé ---------- */
  const ano = $('#ano');
  if (ano) ano.textContent = String(new Date().getFullYear());
})();
