/* ============================================================
   CONFIGURACIÓN DEL SITIO
   ------------------------------------------------------------
   Este es el ÚNICO archivo que hay que editar para cada cliente.
   Cambiá los valores entre comillas; no cambies los nombres de
   la izquierda (marca:, contacto:, etc.).

   Además de este archivo, cada cliente necesita:
   - su logo en /logo.svg (o la ruta que pongas en marca.logo)
   - su foto en /img/ (la que pongas en sobreMi.foto)
   Ver INSTALACION.md para el paso a paso completo.
   ============================================================ */

window.SITE = {

  /* ---------- MARCA ---------- */
  marca: {
    nombre: 'Nicolás',                    // línea grande al lado del logo
    subtitulo: 'Fotografía',              // línea chica debajo
    nombreCompleto: 'Nicolás Fotografía', // títulos de pestaña, pie, avisos
    logo: '/logo.svg',                    // SVG o PNG, preferentemente blanco
    ciudad: 'Mar del Plata · Argentina',  // aparece en el menú del celular
    zona: 'Mar del Plata · Buenos Aires · Coberturas nacionales e internacionales.',
    dominio: 'ncfotografia.com.ar'
  },

  /* ---------- APARIENCIA ----------
     tema: 'oscuro' o 'claro'
     acento: color de detalles (línea del menú activo, foco de campos)
     invertirLogo: true si el logo es blanco y usás tema claro (lo pasa a negro) */
  apariencia: {
    tema: 'oscuro',
    acento: '#D9C7A3',
    invertirLogo: false
  },

  /* ---------- CONTACTO ---------- */
  contacto: {
    whatsapp: '5492236666629',           // código de país + área + número, sin + ni espacios
    email: 'nicolascalderonfotografia@gmail.com',
    instagram: 'https://www.instagram.com/nicolas_calderon_fotografia'
  },

  /* ---------- SECCIONES ----------
     activa: true / false para mostrarla u ocultarla del menú.
     menu: el nombre que aparece en el menú. */
  secciones: {
    portfolio: { activa: true,  menu: 'Work' },
    tienda:    { activa: true,  menu: 'Tienda' },
    sobreMi:   { activa: true,  menu: 'Sobre mí' },
    seleccion: { activa: true,  menu: 'Selección', menuLargo: 'Selección cliente' },
    autos:     { activa: true,  menu: '¿Tenés fotos de mi auto?' }
  },

  /* ---------- CONEXIONES (Google Apps Script, Formspree, Sentry) ---------- */
  integraciones: {
    instagramApi: 'https://script.google.com/macros/s/AKfycbxBM4NG4tD2KjWuDO76ml20Ln96aKPKBYJBFT4ToKNwYNRQVuEVbniImYW_9GcSuaXA2Q/exec',
    tiendaApi:    'https://script.google.com/macros/s/AKfycbzMnSw7q8h7nLTn54FCn0rIFxcFDBSq6pMetpQoijQpzLwN0nJQIH5UoaTYrBNwaYVd/exec',
    seleccionApi: 'https://script.google.com/macros/s/AKfycbwnghAiGw4rTojBX0bHsszpDxY1jibc-r25JioX8BODrh7sJwXcQMgzolbhssJE3zqD9w/exec',
    formspree:    'https://formspree.io/f/xwlkwdye',
    sentryDsn:    'https://aa1a112752bd8b5e25dfec3fd75b0eb8@o4512092368142336.ingest.us.sentry.io/4512096924860416' // dejar '' para clientes
  },

  /* ---------- PORTADA (portfolio de Instagram) ---------- */
  portfolio: {
    tituloPagina: 'Portafolio',
    descripcion: 'Portafolio de fotografía editorial, arquitectura, retratos y estilo de vida. Mar del Plata, Argentina.',
    etiqueta: 'Diario visual · Portafolio',
    titulo: 'Arquitectura, retratos y',
    tituloDestacado: 'atmósferas visuales.',
    bajada: 'Una colección fotográfica pura basada en la luz natural, los contrastes honestos y la estética documental.',
    // Filtros: se busca esta palabra en el texto de cada publicación de Instagram
    categorias: ['Arquitectura', 'Retratos', 'Estilo de vida']
  },

  /* ---------- SOBRE MÍ ---------- */
  sobreMi: {
    tituloPagina: 'Sobre mí',
    descripcion: 'Biografía, filosofía visual y canales de contacto directo. Mar del Plata, Argentina.',
    etiqueta: 'Biografía & trayectoria',
    titulo: 'Sobre',
    tituloDestacado: 'mí',
    foto: '/img/nicolas.jpg',
    fotoAlt: 'Nicolás fotografiando junto a la pista en un autódromo',
    fotoPie: 'Nicolás Calderón · en pista',
    frase: 'Capturando la esencia de lo cotidiano, con una mirada minimalista y sofisticada.',
    parrafos: [
      'Soy Nicolás, fotógrafo enfocado en la arquitectura, el estilo de vida y el retrato documental. Creo firmemente en el poder de los espacios en blanco, la luz natural y los contrastes sutiles.',
      'Este espacio sirve como una ventana a mi trabajo más reciente, sincronizado directamente con mi diario visual en Instagram, para mantener siempre una colección viva y en movimiento.'
    ],
    tarjetaEtiqueta: 'Comisiones & coberturas',
    tarjetaTitulo: 'Trabajemos',
    tarjetaTituloDestacado: 'juntos',
    tarjetaTexto: 'Contame qué tenés en mente y te respondo con disponibilidad y propuesta.'
  },

  /* ---------- TIENDA ---------- */
  tienda: {
    tituloPagina: 'Tienda',
    descripcion: 'Tienda de fotografías: archivos digitales, impresiones y cuadros con marco.',
    etiqueta: 'Tienda · Prints & digitales',
    titulo: 'Llevate una',
    tituloDestacado: 'fotografía.',
    bajada: 'Cada imagen está disponible como archivo digital, impresión o cuadro con marco listo para colgar. Elegí la foto, el formato y el tamaño.',
    pie: 'Impresiones y archivos digitales. Envíos a todo el país desde Mar del Plata.',
    moneda: 'ARS',
    formatos: {
      digital: {
        nombre: 'Digital',
        desc: 'Archivo JPG en alta resolución, sin marca de agua. Uso personal.',
        tamanos: { 'Alta resolución': 17000 },
        notas: ['Entrega por email', 'Sin costo de envío']
      },
      impresa: {
        nombre: 'Impresa',
        desc: 'Impresión profesional en papel fotográfico premium, lista para enmarcar.',
        tamanos: { '20 × 30 cm': 28500, '30 × 45 cm': 45500, '40 × 60 cm': 68000 },
        notas: ['Envíos a todo el país o retiro en Mar del Plata', 'Embalaje rígido protegido']
      },
      marco: {
        nombre: 'Impresa con marco',
        desc: 'Impresión profesional con marco de madera y vidrio, lista para colgar.',
        tamanos: { '20 × 30 cm': 51000, '30 × 45 cm': 79500, '40 × 60 cm': 113500 },
        colores: [
          { nombre: 'Negro',          hex: '#151515' },
          { nombre: 'Blanco',         hex: '#EDEBE6' },
          { nombre: 'Madera natural', hex: '#B38A5E' }
        ],
        notas: ['Envíos a todo el país o retiro en Mar del Plata', 'Incluye gancho para colgar']
      }
    }
  },

  /* ---------- SELECCIÓN DE CLIENTES ---------- */
  seleccion: {
    tituloPagina: 'Selección cliente',
    descripcion: 'Galería protegida para selección de fotografías de eventos y clientes.',
    etiqueta: 'Acceso exclusivo cliente',
    titulo: 'Selección',
    tituloDestacado: 'cliente',
    bajada: 'Galería protegida con marca de agua. Marcá las fotografías que quieras y enviámelas por WhatsApp o email para comenzar la edición final.',
    pie: 'Galería para elección y aprobación de imágenes de clientes.',
    // id = nombre que entiende el Apps Script de selección; nombre = lo que ve el cliente
    eventos: [
      { id: 'trackday',  nombre: 'Trackday Argentina' },
      { id: 'speedclub', nombre: 'Speed Club' },
      { id: 'drift',     nombre: 'Drift' },
      { id: 'autos',     nombre: 'Autos' },
      { id: 'otras',     nombre: 'Otras fotos' }
    ]
  },

  /* ---------- ¿TENÉS FOTOS DE MI AUTO? (sección de nicho) ---------- */
  autos: {
    tituloPagina: '¿Tenés fotos de mi auto?',
    descripcion: 'Solicitá tus fotografías de Track Days y jornadas en pista.',
    etiqueta: 'Automovilismo & track days',
    titulo: '¿Tenés fotos de',
    tituloDestacado: 'mi auto?',
    bajada: 'Si participaste en una tanda en San Nicolás, Buenos Aires, Speed Club o Drift, ingresá los datos de tu auto y número para rastrear todas tus tomas en pista.',
    pie: 'Coberturas fotográficas automotrices y jornadas en autódromos nacionales.',
    whatsapp: '5492235468630', // número propio de esta sección ('' = usa contacto.whatsapp)
    eventos: ['Track Day San Nicolás', 'Track Day Buenos Aires', 'Speed Club', 'Drift', 'Otro evento']
  }
};
