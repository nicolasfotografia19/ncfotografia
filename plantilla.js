/**
 * PLANTILLA — aplica config.js a la página.
 * No hace falta editar este archivo para un cliente nuevo: todo se cambia en config.js.
 *
 * Se carga en el <head>, después de config.js. Arma el menú, el pie,
 * los textos marcados con data-cfg, el tema y los colores.
 */
(function () {
  const S = window.SITE;
  if (!S) { console.error('Falta config.js'); return; }

  /* ---------- Utilidades (también las usan las páginas) ---------- */
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const get = (path) => String(path).split('.').reduce((o, k) => (o == null ? undefined : o[k]), S);
  const wa = (numero, texto) => 'https://wa.me/' + (numero || S.contacto.whatsapp) + (texto ? '?text=' + encodeURIComponent(texto) : '');
  S.util = { esc, get, wa };

  /* ---------- 1. Tema y colores: antes de pintar ---------- */
  const root = document.documentElement;
  const ap = S.apariencia || {};
  root.dataset.tema = ap.tema === 'claro' ? 'claro' : 'oscuro';
  if (ap.acento) root.style.setProperty('--accent', ap.acento);
  root.style.setProperty('--marca-agua', 'url("' + (S.marca.logo || '/logo.svg') + '")');
  if (ap.invertirLogo) root.classList.add('logo-invertido');
  root.classList.add('cfg-pending');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = ap.tema === 'claro' ? '#F6F5F2' : '#0C0C0D';

  /* ---------- Páginas del sitio ---------- */
  const PAGINAS = [
    { key: 'portfolio', href: '/index.html',     path: '/' },
    { key: 'tienda',    href: '/tienda.html',    path: '/tienda' },
    { key: 'sobreMi',   href: '/contacto.html',  path: '/contacto' },
    { key: 'seleccion', href: '/seleccion.html', path: '/seleccion' },
    { key: 'autos',     href: '/track.html',     path: '/track' }
  ];
  const activa = (key) => !S.secciones || !S.secciones[key] || S.secciones[key].activa !== false;
  S.util.activa = activa;

  function normalize(path) {
    let p = (path || '/').replace(/\/+$/, '').replace(/\.html$/, '');
    if (p === '' || p === '/index') p = '/';
    return p;
  }

  /* ---------- 2. Menú ---------- */
  function renderMenu(cont, actual) {
    const m = S.marca;
    const items = PAGINAS.filter((p) => activa(p.key));
    const brand = (h) => `
      <a href="/index.html" class="brand" aria-label="${esc(m.nombreCompleto)} — Inicio">
        <img src="${esc(m.logo)}" alt="" height="${h}">
        <span class="brand__text">
          <span class="brand__name">${esc(m.nombre)}</span>
          <span class="brand__sub">${esc(m.subtitulo)}</span>
        </span>
      </a>`;
    const label = (p, largo) => esc((largo && S.secciones[p.key].menuLargo) || S.secciones[p.key].menu);
    const cur = (p) => (p.key === actual ? ' is-active" aria-current="page' : '');

    cont.innerHTML = `
      <header class="site-header">
        <div class="container site-header__inner">
          ${brand(40)}
          <nav class="nav" aria-label="Navegación principal">
            ${items.map((p) => `<a href="${p.href}" class="nav-link${cur(p)}">${label(p)}</a>`).join('')}
          </nav>
          <button id="mobile-menu-toggle" class="menu-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobile-menu-drawer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg>
          </button>
        </div>
      </header>
      <div id="mobile-menu-drawer" class="drawer" role="dialog" aria-modal="true" aria-label="Menú">
        <div class="drawer__top">
          ${brand(34)}
          <button id="mobile-menu-close" class="menu-toggle" aria-label="Cerrar menú">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav class="drawer__nav" aria-label="Navegación móvil">
          ${items.map((p, i) => `<a href="${p.href}" class="drawer__link${cur(p)}"><span>${label(p, true)}</span><small>${String(i + 1).padStart(2, '0')}</small></a>`).join('')}
        </nav>
        <div class="drawer__foot">
          <span class="muted" style="font-size:.875rem">${esc(m.ciudad)}</span>
          <a href="${wa()}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm">WhatsApp</a>
        </div>
      </div>`;

    const toggle = cont.querySelector('#mobile-menu-toggle');
    const drawer = cont.querySelector('#mobile-menu-drawer');
    const close = cont.querySelector('#mobile-menu-close');
    const open = () => { drawer.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; close.focus(); };
    const shut = () => { drawer.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
    toggle.addEventListener('click', open);
    close.addEventListener('click', shut);
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', shut));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) shut(); });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (mq) => { if (mq.matches) shut(); });
  }

  /* ---------- 3. Pie ---------- */
  function renderPie(el, actual) {
    const m = S.marca, c = S.contacto;
    const texto = (S[actual] && S[actual].pie) || m.zona;
    const numero = actual === 'autos' && S.autos && S.autos.whatsapp ? S.autos.whatsapp : c.whatsapp;
    el.className = 'site-footer';
    el.innerHTML = `
      <div class="container site-footer__inner">
        <div class="site-footer__brand">
          <a href="/index.html" class="brand" aria-label="Inicio">
            <img src="${esc(m.logo)}" alt="" height="26">
            <span class="brand__name">${esc(m.nombreCompleto)}</span>
          </a>
          <p>${esc(texto)}</p>
        </div>
        <nav class="site-footer__links" aria-label="Contacto">
          ${c.instagram ? `<a href="${esc(c.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>` : ''}
          <a href="${wa(numero)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          ${c.email ? `<a href="mailto:${esc(c.email)}">Email</a>` : ''}
          <span>© ${new Date().getFullYear()} ${esc(m.nombreCompleto)}</span>
        </nav>
      </div>`;
  }

  /* ---------- 4. Textos y enlaces marcados en el HTML ----------
     data-cfg="sobreMi.frase"            → texto
     data-cfg-titulo="tienda"            → titulo + <em>tituloDestacado</em>
     data-cfg-prefijo="tarjeta"          → usa tarjetaTitulo / tarjetaTituloDestacado
     data-cfg-lista="sobreMi.parrafos"   → un <p> por elemento
     data-cfg-src / data-cfg-alt         → atributos de imágenes
     data-cfg-link="whatsapp|email|instagram|whatsappAutos" → href */
  function aplicarTextos() {
    document.querySelectorAll('[data-cfg]').forEach((el) => {
      const v = get(el.dataset.cfg);
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-cfg-titulo]').forEach((el) => {
      const o = get(el.dataset.cfgTitulo) || {};
      const pre = el.dataset.cfgPrefijo || '';
      const k = (s) => (pre ? pre + s.charAt(0).toUpperCase() + s.slice(1) : s);
      const a = o[k('titulo')], b = o[k('tituloDestacado')];
      el.innerHTML = esc(a || '') + (b ? ' <em>' + esc(b) + '</em>' : '');
    });
    document.querySelectorAll('[data-cfg-lista]').forEach((el) => {
      const arr = get(el.dataset.cfgLista) || [];
      el.innerHTML = arr.map((t) => '<p>' + esc(t) + '</p>').join('');
    });
    document.querySelectorAll('[data-cfg-src]').forEach((el) => { const v = get(el.dataset.cfgSrc); if (v) el.src = v; });
    document.querySelectorAll('[data-cfg-alt]').forEach((el) => { const v = get(el.dataset.cfgAlt); if (v != null) el.alt = v; });
    const links = {
      whatsapp: wa(),
      whatsappAutos: wa(S.autos && S.autos.whatsapp),
      email: S.contacto.email ? 'mailto:' + S.contacto.email : '',
      instagram: S.contacto.instagram || ''
    };
    document.querySelectorAll('[data-cfg-link]').forEach((el) => {
      const v = links[el.dataset.cfgLink];
      if (v) el.href = v; else el.hidden = true;
    });
  }

  /* ---------- 5. Sentry (solo si hay DSN) ---------- */
  function cargarSentry() {
    const dsn = S.integraciones && S.integraciones.sentryDsn;
    if (!dsn) return;
    window.addEventListener('load', () => {
      const s = document.createElement('script');
      s.src = 'https://browser.sentry-cdn.com/7.100.0/bundle.min.js';
      s.crossOrigin = 'anonymous';
      s.onload = () => { if (window.Sentry) Sentry.init({ dsn, environment: 'production', tracesSampleRate: 0.1 }); };
      document.head.appendChild(s);
    });
  }

  /* ---------- Inicio ---------- */
  function init() {
    const actual = document.body.dataset.page || 'portfolio';

    // Sección desactivada → a la portada
    if (actual !== 'portfolio' && !activa(actual)) { location.replace('/'); return; }

    const p = S[actual] || {};
    document.title = S.marca.nombreCompleto + (p.tituloPagina ? ' — ' + p.tituloPagina : '');
    const desc = document.querySelector('meta[name="description"]');
    if (desc && p.descripcion) desc.content = S.marca.nombreCompleto + ' - ' + p.descripcion;

    const cont = document.getElementById('menu-contenedor');
    if (cont) renderMenu(cont, actual);
    const pie = document.getElementById('pie');
    if (pie) renderPie(pie, actual);

    aplicarTextos();
    root.classList.remove('cfg-pending');
  }

  cargarSentry();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
