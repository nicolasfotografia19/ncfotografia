/**
 * Nicolás Fotografía — Cargador de menú con caché y detección de página activa
 */
(function () {
  const CACHE_KEY = 'ncfotografia_menu_html_v7';

  // "/contacto.html", "/contacto", "/contacto/" -> "/contacto"
  function normalize(path) {
    let p = (path || '/').replace(/\/+$/, '').replace(/\.html$/, '');
    if (p === '' || p === '/index') p = '/';
    return p;
  }

  function setupMenu(container) {
    const current = normalize(window.location.pathname);

    container.querySelectorAll('[data-path]').forEach(function (link) {
      const active = normalize(link.getAttribute('data-path')) === current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
    });

    const toggle = container.querySelector('#mobile-menu-toggle');
    const drawer = container.querySelector('#mobile-menu-drawer');
    const close  = container.querySelector('#mobile-menu-close');
    if (!toggle || !drawer) return;

    function open() {
      drawer.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (close) close.focus();
    }
    function shut() {
      drawer.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', shut); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) shut();
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (mq) {
      if (mq.matches) shut();
    });
  }

  function render(html) {
    const container = document.getElementById('menu-contenedor');
    if (!container) return;
    container.innerHTML = html;
    setupMenu(container);
  }

  async function loadMenu() {
    let cached = null;
    try { cached = sessionStorage.getItem(CACHE_KEY); } catch (e) {}
    if (cached) { render(cached); return; }

    try {
      const res = await fetch('/menu.html?v=20261116b', { cache: 'no-cache' });
      if (!res.ok) throw new Error('Menú no disponible');
      const html = await res.text();
      try { sessionStorage.setItem(CACHE_KEY, html); } catch (e) {}
      render(html);
    } catch (e) {
      console.error('Error al cargar menú:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMenu);
  } else {
    loadMenu();
  }
})();
