/* =========================================================
   Jessiel Estilo Masculino — scripts da landing page
   Sem dependências. Compatível com CSP estrita (sem inline).
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURAÇÃO — edite apenas este bloco
   --------------------------------------------------------- */
const CONFIG = {
  // WhatsApp com DDI + DDD + número, só dígitos.
  whatsapp: '5519993667940',

  // Google Ads: ID da conta (AW-XXXXXXXXX) e rótulo da conversão de lead.
  // Deixe vazio para não carregar nada.
  googleAdsId: '',            // ex.: 'AW-123456789'
  googleAdsLeadLabel: '',     // ex.: 'AbCdEfGhIjk'

  // Google Analytics 4 (opcional). Ex.: 'G-XXXXXXX'
  ga4Id: '',
};

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

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
    if (src && !session.get('jes_src')) session.set('jes_src', src.replace(/[^\w.\-]/g, '').slice(0, 40));
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
    if (CONFIG.ga4Id) gtag('event', 'generate_lead', { method: 'whatsapp', lead_origin: origin, traffic_source: session.get('jes_src') || 'direct' });
    if (CONFIG.googleAdsId && CONFIG.googleAdsLeadLabel) {
      gtag('event', 'conversion', { send_to: `${CONFIG.googleAdsId}/${CONFIG.googleAdsLeadLabel}` });
    }
  }

  let suppressClick = false; // evita abrir link ao arrastar o carrossel
  document.addEventListener('click', (e) => {
    if (suppressClick && e.target.closest('.carousel')) { e.preventDefault(); suppressClick = false; return; }
    const el = e.target.closest('[data-track]');
    if (el) trackLead(el.dataset.track);
  }, true);

  /* ---------- Consentimento LGPD ---------- */
  const consentBox = $('.consent');
  const consent = store.get('jes_consent');
  const hasTracking = Boolean(CONFIG.googleAdsId || CONFIG.ga4Id);
  if (consent === 'grant') loadGtag();
  else if (!consent && hasTracking && consentBox) consentBox.hidden = false;

  $$('[data-consent]').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.consent;
    store.set('jes_consent', v);
    consentBox.hidden = true;
    if (v === 'grant') loadGtag();
    else if (gtagLoaded) location.reload();
  }));
  $$('[data-open-consent]').forEach((b) => b.addEventListener('click', () => { if (consentBox) consentBox.hidden = false; }));

  /* ---------- Header + menu mobile ---------- */
  const header = $('.header');
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
  reveals.forEach((el) => {
    const sibs = Array.from(el.parentElement.children).filter((c) => c.hasAttribute('data-reveal'));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', `${Math.min(i * 0.1, 0.5)}s`);
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
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible', 'is-done'));
  }

  /* ---------- Scroll: header, painéis 3D e cena do hero ---------- */
  const panels = reduceMotion ? [] : $$('[data-depth]');
  const scene = $('[data-parallax]');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    header.classList.toggle('is-scrolled', y > 30);
    panels.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      const p = clamp((vh - top) / (vh * 0.55), 0, 1);
      el.style.setProperty('--p', p.toFixed(3));
    });
    if (scene && !reduceMotion && y < vh * 1.2) {
      scene.style.setProperty('--scrollX', `${(y / vh) * 18}deg`);
    }
  }
  const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  onScroll();

  /* ---------- Parallax 3D do hero (mouse) ---------- */
  if (scene && finePointer && !reduceMotion) {
    const hero = $('.hero');
    hero.addEventListener('pointermove', (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      scene.style.setProperty('--sy', `${-8 + x * 22}deg`);
      scene.style.setProperty('--sx', `${4 - y * 14}deg`);
    });
    hero.addEventListener('pointerleave', () => {
      scene.style.removeProperty('--sy');
      scene.style.removeProperty('--sx');
    });
  }

  /* ---------- Tilt 3D (mouse) ---------- */
  if (finePointer && !reduceMotion) {
    $$('[data-tilt]').forEach((el) => {
      const max = el.classList.contains('visit__card') ? 4 : 8;
      let raf = 0;
      el.addEventListener('pointermove', (e) => {
        if (el.hasAttribute('data-reveal') && !el.classList.contains('is-done')) return;
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
  }

  /* ---------- Carrossel 3D (lookbook) ---------- */
  const carousel = $('[data-carousel]');
  if (carousel) {
    const ring = $('.carousel__ring', carousel);
    const items = $$('.carousel__item', carousel);
    const n = items.length;
    const step = 360 / n;
    carousel.style.setProperty('--n', String(n));
    items.forEach((it, i) => it.style.setProperty('--i', String(i)));

    if (!reduceMotion) {
      let rot = 0;
      let target = 0;
      let auto = true;
      let dragging = false;
      let startX = 0;
      let startRot = 0;
      let moved = 0;
      let visible = false;
      let resumeTimer = 0;

      const pause = () => { auto = false; clearTimeout(resumeTimer); resumeTimer = setTimeout(() => { auto = true; }, 4000); };

      function frame() {
        if (visible) {
          if (auto && !dragging) target -= 0.08;
          rot += (target - rot) * 0.08;
          ring.style.setProperty('--rot', `${rot.toFixed(2)}deg`);
          items.forEach((it, i) => {
            let a = ((i * step + rot) % 360 + 360) % 360;
            if (a > 180) a = 360 - a;
            it.classList.toggle('is-far', a > 75);
            it.inert = a > 75;
            it.classList.toggle('is-back', a > 115);
          });
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(carousel);
      } else visible = true;

      const vp = $('.carousel__viewport', carousel);
      vp.addEventListener('pointerdown', (e) => {
        dragging = true; startX = e.clientX; startRot = target; moved = 0;
        pause();
      });
      window.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        moved = Math.max(moved, Math.abs(dx));
        target = startRot + dx * 0.35;
      });
      window.addEventListener('pointerup', () => {
        if (!dragging) return;
        dragging = false;
        if (moved > 6) suppressClick = true;
        target = Math.round(target / step) * step; // encaixa no look mais próximo
        setTimeout(() => { suppressClick = false; }, 50);
      });

      $$('.carousel__btn', carousel).forEach((b) => b.addEventListener('click', () => {
        pause();
        target = Math.round(target / step) * step - Number(b.dataset.dir) * step;
      }));
      carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          pause();
          target = Math.round(target / step) * step + (e.key === 'ArrowRight' ? -step : step);
        }
      });
      carousel.addEventListener('focusin', pause);
    }
  }

  /* ---------- Formulário -> WhatsApp ---------- */
  const form = $('#lead-form');
  if (form) {
    const errorEl = $('.form__error', form);
    const clean = (v) => String(v).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = clean(form.elements.nome.value);
      const peca = clean(form.elements.peca.value);
      const tam = clean(form.elements.tamanho.value);
      const oc = clean(form.elements.ocasiao.value);
      const ok = form.elements.consent.checked;

      $$('input, select', form).forEach((f) => f.removeAttribute('aria-invalid'));
      let err = '';
      if (nome.length < 2) { err = 'Informe seu nome.'; form.elements.nome.setAttribute('aria-invalid', 'true'); }
      else if (!peca) { err = 'Selecione o que você procura.'; form.elements.peca.setAttribute('aria-invalid', 'true'); }
      else if (!ok) { err = 'Para continuar, aceite a Política de Privacidade.'; }
      errorEl.textContent = err;
      if (err) return;

      const msg = [
        `Olá! Sou ${nome} e vim pelo site da Jessiel Estilo Masculino.`,
        `Quero reservar para provar na loja: ${peca}.`,
        `Tamanho: ${tam}.`,
        `Ocasião: ${oc}.`,
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
