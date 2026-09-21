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
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      render(cached);
      return;
    }
    try {
      const res = await fetch('/menu.html');
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
})();})();
