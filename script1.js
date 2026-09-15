
    // --- NAVEGACION DE PESTAÑAS ---
    function showTab(tabName) {
      document.getElementById('tab-home').classList.toggle('hidden', tabName !== 'home');
      document.getElementById('tab-home').classList.toggle('block', tabName === 'home');
      
      document.getElementById('tab-about').classList.toggle('hidden', tabName !== 'about');
      document.getElementById('tab-about').classList.toggle('flex', tabName === 'about');

      const navHome = document.getElementById('nav-home');
      const navAbout = document.getElementById('nav-about');
      
      if (tabName === 'home') {
        navHome.className = "text-sm tracking-[0.2em] uppercase font-sans transition-all text-white font-medium";
        navAbout.className = "text-sm tracking-[0.2em] uppercase font-sans transition-all text-gray-300 hover:text-white";
      } else {
        navHome.className = "text-sm tracking-[0.2em] uppercase font-sans transition-all text-gray-300 hover:text-white";
        navAbout.className = "text-sm tracking-[0.2em] uppercase font-sans transition-all text-white font-medium";
      }
    }

    // --- INTEGRACION CON INSTAGRAM ---
    const BEHOLD_URL = "https://feeds.behold.so/B2JdcKxvJqnrHEnhiqO3"; 
    
    let mediaData = [];
    let currentCategory = 'Todas';

    function filterPosts(category) {
      currentCategory = category;
      renderFilteredGallery();
    }

    function renderFilteredGallery() {
      const container = document.getElementById('gallery-container');
      container.innerHTML = '';
      
      // Update active filter styling
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
          const caption = (post.caption || post.prunedCaption || '').toLowerCase();
          if (currentCategory === 'Arquitectura') {
              return caption.includes('arquitectura') || caption.includes('architecture');
          }
          if (currentCategory === 'Retratos') {
              return caption.includes('retrato') || caption.includes('portrait');
          }
          if (currentCategory === 'Estilo de vida') {
              return caption.includes('estilo de vida') || caption.includes('lifestyle');
          }
          return true;
      });

      if (filtered.length === 0) {
          container.innerHTML = `<div style="column-span: all;" class="py-12 text-center text-white/40 text-[11px] tracking-widest uppercase w-full">No hay publicaciones para esta categoría.</div>`;
          return;
      }

      filtered.forEach(post => {
          const img = document.createElement('img');
          img.src = post.sizes?.large?.mediaUrl || post.sizes?.medium?.mediaUrl || post.mediaUrl;
          img.alt = post.caption || 'Instagram Post';
          img.className = 'w-full h-auto object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-in-out';

          const a = document.createElement('a');
          a.href = post.permalink || '#';
          a.target = '_blank';
          a.className = 'masonry-item relative group cursor-pointer bg-[#111] overflow-hidden border border-white/5 block';
          
          a.appendChild(img);
          container.appendChild(a);
      });
    }

    async function loadInstagramFeed() {
      const container = document.getElementById('gallery-container');
      const loading = document.getElementById('loading-indicator');
      const errorMsg = document.getElementById('error-message');
      
      try {
        const res = await fetch(BEHOLD_URL);
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }
        const data = await res.json();
        console.log('Posts recibidos de Behold:', data);
        
        if (data && data.status === "error") {
          throw new Error(data.message || "Error en la API de Behold");
        }
        
        const posts = Array.isArray(data) ? data : (data.posts || data.data || []);
        
        if (!posts || posts.length === 0) return;
        
        if(loading) loading.style.display = 'none';
        if(errorMsg) errorMsg.style.display = 'none';
        
        mediaData = posts;
        renderFilteredGallery();
      } catch (err) {
        console.error('Error Behold:', err);
        if(loading) loading.style.display = 'none';
        if(errorMsg) {
          errorMsg.classList.remove('hidden');
          document.getElementById('error-text').innerText = "Error al cargar el feed: " + err.message;
        }
      }
    }

    // --- LOGICA DEL VISOR (LIGHTBOX) ---
    function openLightbox(index) {
      const item = mediaData[index];
      if (!item) return;

      const lightbox = document.getElementById('lightbox');
      const mediaContainer = document.getElementById('lightbox-media-container');
      
      const mediaType = item.mediaType || item.media_type;
      const mediaUrl = item.sizes?.full?.mediaUrl || item.sizes?.large?.mediaUrl || item.mediaUrl || item.media_url;
      const permalink = item.permalink || '#';
      const caption = item.prunedCaption || item.caption || 'Sin descripción.';
      
      if (mediaType === 'VIDEO') {
        mediaContainer.innerHTML = `<video src="${mediaUrl}" controls autoplay class="w-full h-full object-contain max-h-[90vh]"></video>`;
      } else {
        mediaContainer.innerHTML = `<img src="${mediaUrl}" alt="Portfolio view" class="w-full h-full object-contain max-h-[90vh]" />`;
      }
      
      const dateStr = new Date(item.timestamp || Date.now()).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
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
      
      document.getElementById('lightbox-media-container').innerHTML = ''; // Detiene el video si estaba sonando
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });

    document.addEventListener('DOMContentLoaded', () => {
      loadInstagramFeed();
    });
  