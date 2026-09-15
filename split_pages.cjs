const fs = require('fs');

const createPage = (title, content, extraScript = '') => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nicolás Fotografía - ${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet">
  <style>
    body { background-color: #000000; color: #ffffff; font-family: 'Inter', sans-serif; }
    .font-serif { font-family: 'Playfair Display', serif; }
    .masonry-grid { column-count: 1; column-gap: 1.5rem; }
    @media (min-width: 640px) { .masonry-grid { column-count: 2; } }
    @media (min-width: 1024px) { .masonry-grid { column-count: 3; } }
    .masonry-item { break-inside: avoid; margin-bottom: 1.5rem; }
    #lightbox { transition: opacity 0.3s ease; }
    #lightbox.hidden { opacity: 0; pointer-events: none; }
    #lightbox.visible { opacity: 1; pointer-events: auto; }
    .no-select { -webkit-user-select: none; user-select: none; }
    .img-overlay { position: absolute; inset: 0; z-index: 10; background: transparent; }
    @keyframes fadeUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
    @keyframes splashOut { 0% { opacity: 1; pointer-events: auto; } 100% { opacity: 0; pointer-events: none; visibility: hidden; } }
    .splash-hidden { animation: splashOut 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes progressBar { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    .animate-progress { animation: progressBar 1.5s ease-in-out infinite; }
    .masonry-item img { transition: filter 0.3s ease-out, transform 0.3s ease-out, opacity 0.3s ease-out; opacity: 0.9; will-change: filter, transform; transform: translateZ(0); }
    .masonry-grid:hover .masonry-item img { filter: blur(5px) brightness(0.5); }
    .masonry-grid .masonry-item:hover img { filter: blur(0px) brightness(1.1); transform: scale(1.05) translateZ(0); opacity: 1; }
    .watermark-wrapper { position: relative; display: block; overflow: hidden; background: #111; }
    .watermark-wrapper::after {
      content: 'MUESTRA NO COMERCIAL';
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      color: rgba(255, 255, 255, 0.2); font-size: 1.5rem; font-weight: 700;
      letter-spacing: 0.2em; white-space: nowrap; z-index: 10;
      pointer-events: auto; width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
    }
    .watermark-wrapper img { pointer-events: none; user-select: none; -webkit-user-drag: none; }
  </style>
</head>
<body class="min-h-screen flex flex-col selection:bg-white/20">
  
  <div id="menu-contenedor"></div>

  <main class="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12">
${content}
  </main>
  
  <script src="/fetch-menu.js"></script>
${extraScript}
</body>
</html>`;

const fetchMenuJs = `document.addEventListener('DOMContentLoaded', () => {
  fetch('/menu.html')
    .then(response => {
      if(!response.ok) throw new Error('Menu no encontrado');
      return response.text();
    })
    .then(data => {
      document.getElementById('menu-contenedor').innerHTML = data;
      const scripts = document.getElementById('menu-contenedor').querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
        document.body.removeChild(newScript);
      });
    })
    .catch(error => console.error('Error al cargar el menú:', error));
});
`;
fs.writeFileSync('public/fetch-menu.js', fetchMenuJs);

// index.html
const indexContent = `
    <!-- Splash Screen -->
    <div id="splash-screen" class="fixed inset-0 z-[100] bg-[#111] flex flex-col items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148.07 60.7" class="h-20 md:h-24 text-white opacity-80">
        <style>.cls-1 { fill: currentColor; }</style>
        <path class="cls-1" d="M71.25,60.15c-4.52,0-8.12-1.88-10.77-5.03l-25.49-30.34-14.14,35.42-20.13-.09L19.97,11.22c2.44-6.2,7.93-9.91,14.39-10.62,1.78-.14,3.38-.16,5.11.12l36.21,43.02,58.31.16-14.94,16.25h-47.79Z"/>
        <path class="cls-1" d="M88.93,21.44l-7.78,19.81-13.71-16.03,4.41-11.56c3.98-9.09,12.26-13.16,21.89-13.13l53.19.16-14.95,16.19-36.38.06c-3.11-.24-5.52,1.55-6.68,4.51Z"/>
      </svg>
      <div class="mt-8 overflow-hidden h-[1px] w-32 bg-white/10 relative">
        <div class="absolute inset-y-0 left-0 bg-white/60 w-full animate-progress"></div>
      </div>
    </div>

    <!-- Seccion: Portafolio (Home) -->
    <div id="tab-home" class="block h-full">
      <header class="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h2 class="text-[42px] font-serif font-light leading-none text-white italic">Últimas Capturas</h2>
          <p class="text-[11px] uppercase tracking-[0.4em] opacity-40 mt-4">Directo de Instagram</p>
        </div>
        <div class="flex flex-wrap gap-6 text-[11px] uppercase tracking-widest">
          <button onclick="filterPosts('Todas')" data-category="Todas" class="filter-btn text-white border-b border-white pb-1 transition-colors">Todas</button>
          <button onclick="filterPosts('Arquitectura')" data-category="Arquitectura" class="filter-btn text-white/40 hover:text-white pb-1 transition-colors">Arquitectura</button>
          <button onclick="filterPosts('Retratos')" data-category="Retratos" class="filter-btn text-white/40 hover:text-white pb-1 transition-colors">Retratos</button>
          <button onclick="filterPosts('Estilo de vida')" data-category="Estilo de vida" class="filter-btn text-white/40 hover:text-white pb-1 transition-colors">Estilo de vida</button>
        </div>
      </header>
      <div id="gallery-container" class="masonry-grid">
        <!-- Las imagenes de Instagram se cargaran aqui via JS -->
      </div>
      
      <div id="loading-indicator" class="flex flex-col items-center justify-center text-white/40 border border-white/5 bg-[#111] py-20 mt-8">
        <p class="font-sans text-[11px] tracking-[0.3em] uppercase">Cargando portafolio...</p>
      </div>
    </div>
    
  <!-- Lightbox (Visor de Imagenes) -->
  <div id="lightbox" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8" onclick="closeLightbox()">
    <button onclick="closeLightbox()" class="absolute top-6 right-6 text-white/70 hover:text-white transition-colors" aria-label="Cerrar visor">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>
    
    <div class="flex flex-col md:flex-row bg-[#111] border border-white/10 overflow-hidden max-w-6xl w-full max-h-[90vh]" onclick="event.stopPropagation()">
      <div id="lightbox-media-container" class="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
        <!-- Imagen/Video se inyectara aqui por JS -->
      </div>
      
      <div class="w-full md:w-96 p-8 flex flex-col bg-[#0A0A0A] overflow-y-auto max-h-[40vh] md:max-h-[90vh] border-t md:border-t-0 md:border-l border-white/10">
        <div class="flex items-center text-white/40 text-[10px] uppercase tracking-widest mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
          <span id="lightbox-date"></span>
        </div>
        
        <div id="lightbox-caption" class="text-white/80 flex-1 whitespace-pre-wrap font-sans text-sm font-light leading-loose">
        </div>

        <a id="lightbox-link" href="#" target="_blank" rel="noopener noreferrer" class="mt-8 text-center w-full py-3 px-4 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#E5E5E5] transition-colors">
          Ver en Instagram
        </a>
      </div>
    </div>
  </div>`;

const indexScript = `  <script>
    // --- INTEGRACION CON INSTAGRAM ---
    const CURATOR_URL = "https://api.curator.io/v1/feeds/37230ef3-81f2-4eec-a62c-16b64abf7a6b/posts?limit=50";
    let mediaData = [];
    let currentCategory = 'Todas';

    function filterPosts(category) {
      currentCategory = category;
      renderFilteredGallery();
    }

    function renderFilteredGallery() {
      const container = document.getElementById('gallery-container');
      container.innerHTML = '';
      
      document.querySelectorAll('.filter-btn').forEach(btn => {
          if(btn.dataset.category === currentCategory) {
              btn.classList.add('text-white', 'border-b', 'border-white');
              btn.classList.remove('text-white/40');
          } else {
              btn.classList.add('text-white/40');
              btn.classList.remove('text-white', 'border-b', 'border-white');
          }
      });

      const filtered = mediaData.filter(post => {
          if (currentCategory === 'Todas') return true;
          const caption = (post.text || '').toLowerCase();
          if (currentCategory === 'Arquitectura') {
              return caption.includes('#arquitectura') || caption.includes('#architecture');
          }
          if (currentCategory === 'Retratos') {
              return caption.includes('#retrato') || caption.includes('#portrait');
          }
          if (currentCategory === 'Estilo de vida') {
              return caption.includes('#estilodevida') || caption.includes('#lifestyle') || caption.includes('#estilo');
          }
          return true;
      });

      if (filtered.length === 0) {
          container.innerHTML = \`<div style="column-span: all;" class="py-12 text-center text-white/40 text-[11px] tracking-widest uppercase w-full">No hay publicaciones para esta categoría.</div>\`;
          return;
      }

      filtered.forEach((post, index) => {
          const img = document.createElement('img');
          img.src = post.image_large || post.image;
          img.alt = post.text || 'Instagram Post';
          img.className = 'w-full h-auto object-cover no-download';
          img.draggable = false;
          img.oncontextmenu = () => false;

          const a = document.createElement('a');
          a.onclick = (e) => { e.preventDefault(); openLightbox(mediaData.indexOf(post)); };
          a.href = "#";
          a.className = 'masonry-item relative group cursor-pointer bg-[#111] overflow-hidden border border-white/5 block no-select animate-fade-up shadow-md shadow-white/5 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-2 transition-all duration-500 ease-out';
          a.style.animationDelay = \`\${index * 50}ms\`;
          
          const overlay = document.createElement('div');
          overlay.className = 'img-overlay';
          overlay.oncontextmenu = (e) => { e.preventDefault(); return false; };

          a.appendChild(img);
          a.appendChild(overlay);
          container.appendChild(a);
      });
    }

    async function loadInstagramFeed() {
      const container = document.getElementById('gallery-container');
      const loading = document.getElementById('loading-indicator');
      
      try {
        const res = await fetch(CURATOR_URL);
        if (!res.ok) throw new Error(\`Error HTTP: \${res.status}\`);
        const data = await res.json();
        
        if (data && data.success === false) throw new Error("Error en la API de Curator");
        
        const posts = Array.isArray(data) ? data : (data.posts || []);
        if (!posts || posts.length === 0) return;
        
        if(loading) loading.style.display = 'none';
        
        mediaData = posts;
        renderFilteredGallery();
        
        setTimeout(() => {
          document.getElementById('splash-screen').classList.add('splash-hidden');
        }, 800);

      } catch (err) {
        console.error('Error Curator:', err);
        if(loading) loading.style.display = 'none';
        setTimeout(() => {
          document.getElementById('splash-screen').classList.add('splash-hidden');
        }, 500);
        container.innerHTML = \`
          <div class="col-span-full max-w-2xl mx-auto py-12 px-8 bg-[#111] border border-white/10 mt-8 text-center">
            <h2 class="text-[28px] font-serif font-light italic text-white mb-4">Portafolio no disponible</h2>
            <p class="text-[#E5E5E5] opacity-60 mb-8 leading-relaxed font-light text-sm">
              Error al conectar con Instagram: \${err.message}
            </p>
          </div>
        \`;
      }
    }

    function openLightbox(index) {
      const item = mediaData[index];
      if (!item) return;
      const lightbox = document.getElementById('lightbox');
      const mediaContainer = document.getElementById('lightbox-media-container');
      
      const isVideo = item.has_video === 1;
      const mediaUrl = isVideo && item.video ? item.video : (item.image_xlarge || item.image_large || item.image);
      const permalink = item.url || '#';
      const caption = item.text || 'Sin descripción.';
      
      if (isVideo) {
        mediaContainer.innerHTML = \`<video src="\${mediaUrl}" controls autoplay class="w-full h-full object-contain max-h-[90vh] no-download"></video>\`;
      } else {
        mediaContainer.innerHTML = \`
          <img src="\${mediaUrl}" alt="Portfolio view" class="w-full h-full object-contain max-h-[90vh] no-download" draggable="false" oncontextmenu="return false;" />
          <div class="img-overlay" oncontextmenu="event.preventDefault(); return false;"></div>
        \`;
      }
      
      const dateStr = new Date(item.source_created_at || Date.now()).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      document.getElementById('lightbox-date').innerText = dateStr;
      document.getElementById('lightbox-caption').innerText = caption;
      document.getElementById('lightbox-link').href = permalink;
      
      lightbox.classList.remove('hidden');
      lightbox.classList.add('visible');
    }

    function closeLightbox() {
      const lightbox = document.getElementById('lightbox');
      lightbox.classList.remove('visible');
      lightbox.classList.add('hidden');
      document.getElementById('lightbox-media-container').innerHTML = ''; 
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });

    document.addEventListener('DOMContentLoaded', () => {
      loadInstagramFeed();
    });
  </script>`;

fs.writeFileSync('index.html', createPage('Work', indexContent, indexScript));


const contactoContent = `    <div id="tab-about" class="block h-full flex-col">
      <header class="flex justify-between items-end mb-16">
        <div>
          <h2 class="text-[42px] font-serif font-light leading-none text-white italic">Sobre Mí</h2>
          <p class="text-[11px] uppercase tracking-[0.4em] opacity-40 mt-4">Biografía & Contacto</p>
        </div>
      </header>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
        <div class="space-y-12">
          <div>
            <h1 class="text-2xl font-serif text-white mb-8 leading-relaxed font-light italic">
              Capturando la esencia de lo cotidiano, con una mirada minimalista y sofisticada.
            </h1>
            <div class="space-y-6 text-[#E5E5E5] opacity-70 font-sans text-sm font-light leading-loose">
              <p>
                Soy Nicolás, fotógrafo enfocado en la arquitectura, el estilo de vida y el retrato documental. 
                Creo firmemente en el poder de los espacios en blanco, la luz natural y los contrastes sutiles.
              </p>
              <p>
                Este espacio sirve como una ventana a mi trabajo más reciente, sincronizado directamente con 
                mi diario visual en Instagram, para mantener siempre una colección viva y en movimiento.
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-8">
            <a href="https://www.instagram.com/nicolas_calderon_fotografia" class="text-white/40 hover:text-white transition-colors" aria-label="Instagram" target="_blank">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://wa.me/+5492235468630" target="_blank" rel="noopener noreferrer" class="text-white/40 hover:text-white transition-colors" aria-label="WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </a>
            <a href="mailto:nicolascalderonfotografia@gmail.com" class="text-white/40 hover:text-white transition-colors" aria-label="Email">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
          </div>
        </div>
        <div class="bg-[#111] p-10 border border-white/5 flex flex-col justify-center">
          <h2 class="text-[11px] uppercase tracking-[0.3em] text-white/50 mb-8">Trabajemos juntos</h2>
          <div class="space-y-4">
            <a href="https://wa.me/+5492235468630" target="_blank" rel="noopener noreferrer" class="w-full flex items-center justify-center py-4 px-6 border border-white/10 hover:border-white/40 text-white text-[10px] uppercase tracking-[0.3em] font-bold transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Enviar WhatsApp
            </a>
            <a href="https://www.instagram.com/nicolas_calderon_fotografia" target="_blank" rel="noopener noreferrer" class="w-full flex items-center justify-center py-4 px-6 border border-white/10 hover:border-white/40 text-white text-[10px] uppercase tracking-[0.3em] font-bold transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram mr-3"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              Mensaje Directo
            </a>
            <a href="mailto:nicolascalderonfotografia@gmail.com" class="w-full flex items-center justify-center py-4 px-6 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#E5E5E5] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail mr-3"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Enviar Email
            </a>
          </div>
        </div>
      </div>
    </div>`;

fs.writeFileSync('contacto.html', createPage('Sobre Mí', contactoContent));


const trackContent = `    <div id="tab-track" class="block h-full flex-col">
      <header class="mb-16">
        <h2 class="text-[42px] font-serif font-light leading-none text-white italic">Solicitar Fotos de Pista</h2>
        <p class="text-[11px] uppercase tracking-[0.4em] opacity-40 mt-4">Encuentra tus fotos del track day</p>
      </header>
      <div class="max-w-2xl bg-[#111] border border-white/10 p-8 md:p-12">
        <form action="https://formspree.io/f/xwlkwdye" method="POST" class="space-y-8">
          <div>
            <label for="name" class="block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-3">Nombre Completo</label>
            <input type="text" id="name" name="name" required class="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:outline-none focus:border-white transition-colors" placeholder="Tu nombre">
          </div>
          
          <div>
            <label for="email" class="block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-3">Email</label>
            <input type="email" id="email" name="email" required class="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:outline-none focus:border-white transition-colors" placeholder="tu@email.com">
          </div>
          
          <div>
            <label for="event" class="block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-3">Evento</label>
            <select id="event" name="event" required class="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer">
              <option value="" disabled selected class="text-black">Selecciona un evento</option>
              <option value="Track Day San Nicolás" class="text-black">Track Day San Nicolás</option>
              <option value="Track Day Buenos Aires" class="text-black">Track Day Buenos Aires</option>
              <option value="Otro" class="text-black">Otro (especificar en mensaje)</option>
            </select>
          </div>
          
          <div>
            <label for="car_details" class="block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-3">Modelo de Auto o Número de Puerta</label>
            <input type="text" id="car_details" name="car_details" required class="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:outline-none focus:border-white transition-colors" placeholder="Ej: VW Golf GTI / #45">
          </div>
          
          <button type="submit" class="mt-8 w-full py-4 px-6 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#E5E5E5] transition-colors">
            Enviar Solicitud
          </button>
        </form>
      </div>
    </div>`;

fs.writeFileSync('track.html', createPage('Fotos de Pista', trackContent));


const seleccionContent = `    <div id="tab-selection" class="block h-full flex-col">
      <header class="mb-16">
        <h2 class="text-[42px] font-serif font-light leading-none text-white italic">Selección Cliente</h2>
        <p class="text-[11px] uppercase tracking-[0.4em] opacity-40 mt-4">Galería protegida con marca de agua para selección</p>
      </header>
      
      <div class="mb-12 flex flex-wrap gap-4" id="event-categories">
        <button data-category="trackday" class="event-btn bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold py-3 px-6 border border-white/20 transition-colors">Trackday Argentina</button>
        <button data-category="speedclub" class="event-btn text-white hover:bg-white/10 text-[10px] uppercase tracking-[0.3em] font-bold py-3 px-6 border border-white/20 transition-colors">Speed Club</button>
        <button data-category="drift" class="event-btn text-white hover:bg-white/10 text-[10px] uppercase tracking-[0.3em] font-bold py-3 px-6 border border-white/20 transition-colors">Drift</button>
      </div>
      
      <div id="selection-gallery-container" class="masonry-grid relative pb-32">
      </div>
      
      <div id="selection-action-bar" class="fixed bottom-0 left-0 w-full bg-[#111]/90 backdrop-blur-md border-t border-white/10 p-4 md:p-6 flex justify-between items-center z-50 transform translate-y-full transition-transform duration-300">
         <div class="text-[11px] uppercase tracking-widest text-white/60"><span id="selection-count" class="text-white font-bold">0</span> seleccionadas</div>
         <div class="flex gap-2">
           <button id="submit-whatsapp-btn" onclick="submitViaWhatsApp()" class="py-3 px-6 bg-[#25D366] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#128C7E] transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
              WhatsApp
           </button>
           <button id="submit-selection-btn" onclick="submitSelection()" class="py-3 px-6 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#E5E5E5] transition-colors">
              Enviar Email
           </button>
         </div>
      </div>
    </div>`;

const seleccionScript = `  <script>
    function updateSelectionCount() {
      const selected = document.querySelectorAll('.selection-checkbox:checked');
      const count = selected.length;
      document.getElementById('selection-count').innerText = count;
      const actionBar = document.getElementById('selection-action-bar');
      if (count > 0) {
        actionBar.classList.remove('translate-y-full');
      } else {
        actionBar.classList.add('translate-y-full');
      }
    }

    function submitViaWhatsApp() {
      const selected = document.querySelectorAll('.selection-checkbox:checked');
      if (selected.length === 0) return;
      const selectedNames = Array.from(selected).map(cb => cb.value);
      const textList = selectedNames.join(', ');
      
      const message = \`Hola Nicolás, mi selección de fotografías es:\n\n\${textList}\`;
      const phoneNumber = '5492235468630'; 
      const whatsappUrl = \`https://wa.me/\${phoneNumber}?text=\${encodeURIComponent(message)}\`;
      
      window.open(whatsappUrl, '_blank');
    }

    async function submitSelection() {
      const selected = document.querySelectorAll('.selection-checkbox:checked');
      if (selected.length === 0) return;
      const button = document.getElementById('submit-selection-btn');
      const originalText = button.innerText;
      button.innerText = 'ENVIANDO...';
      button.disabled = true;
      const selectedNames = Array.from(selected).map(cb => cb.value);
      const textList = selectedNames.join('\\n');
      try {
        const response = await fetch(\`https://formspree.io/f/xwlkwdye\`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: 'Nueva Selección de Cliente',
            message: \`El cliente ha seleccionado \${selectedNames.length} fotografías:\n\n\${textList}\`
          })
        });
        if (response.ok) {
          alert('¡Selección enviada con éxito!');
          selected.forEach(cb => { cb.checked = false; cb.dispatchEvent(new Event('change')); });
        } else {
          alert('Hubo un error al enviar la selección. Por favor intenta nuevamente.');
        }
      } catch (error) {
        alert('Hubo un error de conexión al enviar la selección.');
      } finally {
        button.innerText = originalText;
        button.disabled = false;
      }
    }

    function renderSelectionGallery(photos) {
      const container = document.getElementById('selection-gallery-container');
      if(!container) return;
      container.innerHTML = '';
      
      photos.forEach((photo, index) => {
          const imgUrl = photo.id ? \`https://drive.google.com/thumbnail?id=\${photo.id}&sz=w1000\` : photo.url;
          const name = photo.name || \`Foto \${index + 1}\`;
          
          const label = document.createElement('label');
          label.className = 'masonry-item relative group border border-white/5 block no-select animate-fade-up watermark-wrapper shadow-md shadow-white/5 cursor-pointer transition-all duration-300';
          label.style.animationDelay = \`\${(index % 10) * 50}ms\`;
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'hidden selection-checkbox';
          checkbox.value = name;
          checkbox.dataset.url = imgUrl;
          const checkIcon = document.createElement('div');
          checkIcon.className = 'absolute top-4 right-4 w-6 h-6 rounded-full border border-white flex items-center justify-center opacity-0 transition-all z-20 bg-black/50 text-white';
          checkIcon.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>\`;
          
          checkbox.addEventListener('change', (e) => {
             if(e.target.checked) {
                label.classList.add('ring-2', 'ring-white');
                checkIcon.classList.remove('opacity-0', 'bg-black/50');
                checkIcon.classList.add('opacity-100', 'bg-white', 'text-black');
             } else {
                label.classList.remove('ring-2', 'ring-white');
                checkIcon.classList.add('opacity-0', 'bg-black/50');
                checkIcon.classList.remove('opacity-100', 'bg-white', 'text-black');
             }
             updateSelectionCount();
          });
          label.addEventListener('contextmenu', e => { e.preventDefault(); return false; });
          label.addEventListener('dragstart', e => { e.preventDefault(); return false; });
          
          const img = document.createElement('img');
          img.src = imgUrl;
          img.alt = 'Protected Image';
          img.className = 'w-full h-auto object-cover opacity-80';
          
          label.appendChild(checkbox);
          label.appendChild(img);
          label.appendChild(checkIcon);
          container.appendChild(label);
      });
    }

    async function loadDrivePhotos(category) {
      const container = document.getElementById('selection-gallery-container');
      if(container) {
        container.innerHTML = '<div class="col-span-full py-12 text-center text-white/50 text-[11px] uppercase tracking-widest">Cargando fotos del evento...</div>';
      }
      
      try {
        const url = \`https://script.google.com/macros/s/AKfycbwC09kyKLd_1PynIgtOHRpMy9c6B_7M7UPfJQXvfocZpOnEo_z1V4ENg1fKuZg_hN6t3Q/exec?categoria=\${category}\`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        
        const actionBar = document.getElementById('selection-action-bar');
        const countSpan = document.getElementById('selection-count');
        if (actionBar && countSpan) {
           countSpan.innerText = '0';
           actionBar.classList.add('translate-y-full');
        }
        
        renderSelectionGallery(data);
      } catch (err) {
        console.error('Error fetching drive photos:', err);
        if(container) {
          container.innerHTML = '<div class="col-span-full py-12 text-center text-red-500/50 text-[11px] uppercase tracking-widest">Error al cargar las fotos del evento.</div>';
        }
      }
    }

    function setupEventCategories() {
      const buttons = document.querySelectorAll('.event-btn');
      if(buttons.length === 0) return;
      
      buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          buttons.forEach(b => {
            b.classList.remove('bg-white', 'text-black');
            b.classList.add('text-white', 'hover:bg-white/10');
          });
          
          const clickedBtn = e.currentTarget;
          clickedBtn.classList.remove('text-white', 'hover:bg-white/10');
          clickedBtn.classList.add('bg-white', 'text-black');
          
          const category = clickedBtn.dataset.category;
          if (category) {
            loadDrivePhotos(category);
          }
        });
      });
      
      const defaultButton = buttons[0];
      if (defaultButton && defaultButton.dataset.category) {
        loadDrivePhotos(defaultButton.dataset.category);
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      setupEventCategories();
    });
  </script>`;
fs.writeFileSync('seleccion.html', createPage('Selección Cliente', seleccionContent, seleccionScript));

