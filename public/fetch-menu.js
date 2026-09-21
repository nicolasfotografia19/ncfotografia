/**
 * Nicolás Fotografía - Cargador de Menú con Cache y Detección de Página Activa
 */
(function () {
  const CACHE_KEY = 'ncfotografia_menu_html_v4';
  const CACHE_KEY = 'ncfotografia_menu_html_v5';
  function setupMenu(container) {
    const currentPath = window.location.pathname;
    const navLinks = container.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const dataPath = link.getAttribute('data-path');
      const isHome = (currentPath === '/' || currentPath === '/index.html' || currentPath === '') && dataPath === '/';
      const isMatch = dataPath !== '/' && currentPath.includes(dataPath.replace('/', ''));
      if (isHome || isMatch) {
        link.classList.remove('text-zinc-400');
        link.classList.add('text-white', 'font-medium');
        
        // Indicador activo sutil
        const indicator = document.createElement('span');
        indicator.className = 'absolute bottom-0 left-0 w-full h-[1.5px] bg-white rounded-full';
        link.appendChild(indicator);
      } else {
        link.classList.add('text-zinc-400');
        link.classList.remove('text-white', 'font-medium');
      }
    });
    // Control Móvil
    const toggleBtn = container.querySelector('#mobile-menu-toggle');
    const drawer = container.querySelector('#mobile-menu-drawer');
    const closeBtn = container.querySelector('#mobile-menu-close');
    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        drawer.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          drawer.classList.add('hidden');
          document.body.style.overflow = '';
        });
      }
    }
  }
  function render(html) {
    const container = document.getElementById('menu-contenedor');
    if (!container) return;
    container.innerHTML = html;
    setupMenu(container);
  }
  async function loadMenu() {
      if (!res.ok) throw new Error('Menu no disponible');
      const html = await res.text();
      sessionStorage.setItem(CACHE_KEY, html);
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
