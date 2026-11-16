/**
 * Nicolás Fotografía — Protección de imágenes
 * Una página web no puede impedir capturas del sistema operativo,
 * pero sí dificultar guardar, arrastrar, imprimir o copiar las fotos.
 */
(function () {
  // 1. Sin menú contextual, arrastre ni "guardar imagen" sobre fotos
  document.addEventListener('contextmenu', function (e) {
    if (e.target.closest('img, .tile, .product, .sel-tile, .lightbox, .pmodal, .about__photo')) e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  // 2. Bloquea atajos de guardar e imprimir (Ctrl/Cmd + S, Ctrl/Cmd + P)
  document.addEventListener('keydown', function (e) {
    const k = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (k === 's' || k === 'p')) {
      e.preventDefault();
      escudo();
    }
  });

  // 3. Tecla Impr Pant (Windows): oculta las fotos y vacía el portapapeles
  document.addEventListener('keyup', function (e) {
    if (e.key === 'PrintScreen') {
      escudo();
      try { navigator.clipboard && navigator.clipboard.writeText(''); } catch (err) {}
    }
  });

  // 4. Al imprimir o "guardar como PDF" las fotos no salen (ver styles.css)
  window.addEventListener('beforeprint', escudo);

  // Oculta las fotos un momento
  let t;
  function escudo() {
    document.documentElement.classList.add('is-shielded');
    clearTimeout(t);
    t = setTimeout(function () { document.documentElement.classList.remove('is-shielded'); }, 1500);
  }
})();
