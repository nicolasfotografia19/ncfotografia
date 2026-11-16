/* ============================================================
   CONFIGURACIÓN DEL SITIO
   ------------------------------------------------------------
   EJEMPLO de un cliente ficticio (tema claro, sin la sección de autos).
   Para usarlo: copiar este contenido en /config.js.

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
    nombre: 'Lucía Herrera',                    // línea grande al lado del logo
    subtitulo: 'Fotografía',              // línea chica debajo
    nombreCompleto: 'Lucía Herrera Fotografía', // títulos de pestaña, pie, avisos
    logo: '/logo.svg',                    // SVG o PNG, preferentemente blanco
    ciudad: 'Córdoba · Argentina',  // aparece en el menú del celular
    zona: 'Bodas, familias y retratos en Córdoba y alrededores.',
    dominio: 'luciaherrera.com.ar'
  },

  /* ---------- APARIENCIA ----------
     tema: 'oscuro' o 'claro'
     acento: color de detalles (línea del menú activo, foco de campos)
     invertirLogo: true si el logo es blanco y usás tema claro (lo pasa a negro) */
  apariencia: {
    tema: 'claro',
    acento: '#9A6B4F',
    invertirLogo: true
  },

  /* ---------- CONTACTO ---------- */
  contacto: {
    whatsapp: '5493510000000',           // código de país + área + número, sin + ni espacios
    email: 'hola@luciaherrera.com.ar',
    instagram: 'https://www.instagram.com/luciaherrera.foto'
  },

  /* ---------- SECCIONES ----------
     activa: true / false para mostrarla u ocultarla del menú.
     menu: el nombre que aparece en el menú. */
  secciones: {
    portfolio: { activa: true,  menu: 'Portfolio' },
    tienda:    { activa: true,  menu: 'Tienda' },
    sobreMi:   { activa: true,  menu: 'Sobre mí' },
    seleccion: { activa: true,  menu: 'Clientes', menuLargo: 'Galería de clientes' },
    autos:     { activa: false, menu: '¿Tenés fotos de mi auto?' }
  },

  /* ---------- CONEXIONES (Google Apps Script, Formspree, Sentry) ---------- */
  integraciones: {
    instagramApi: 'https://script.google.com/macros/s/AKfycbxBM4NG4tD2KjWuDO76ml20Ln96aKPKBYJBFT4ToKNwYNRQVuEVbniImYW_9GcSuaXA2Q/exec',
    tiendaApi:    'https://script.google.com/macros/s/AKfycbzMnSw7q8h7nLTn54FCn0rIFxcFDBSq6pMetpQoijQpzLwN0nJQIH5UoaTYrBNwaYVd/exec',
    seleccionApi: 'https://script.google.com/macros/s/AKfycbwnghAiGw4rTojBX0bHsszpDxY1jibc-r25JioX8BODrh7sJwXcQMgzolbhssJE3zqD9w/exec',
    formspree:    'https://formspree.io/f/xwlkwdye',
    sentryDsn:    ''
  },

  /* ---------- PORTADA (portfolio de Instagram) ---------- */
  portfolio: {
    tituloPagina: 'Portafolio',
    descripcion: 'Fotografía documental de bodas, familias y retratos en Córdoba, Argentina.',
    etiqueta: 'Bodas · Familias · Retratos',
    titulo: 'Historias reales,',
    tituloDestacado: 'contadas con luz natural.',
    bajada: 'Fotografía documental de bodas y familias: momentos espontáneos, sin poses forzadas.',
    // Filtros: se busca esta palabra en el texto de cada publicación de Instagram
    categorias: ['Bodas', 'Familias', 'Retratos']
  },

  /* ---------- SOBRE MÍ ---------- */
  sobreMi: {
    tituloPagina: 'Sobre mí',
    descripcion: 'Quién soy, cómo trabajo y cómo contactarme. Córdoba, Argentina.',
    etiqueta: 'Biografía & trayectoria',
    titulo: 'Sobre',
    tituloDestacado: 'mí',
    foto: '',
    fotoAlt: '',
    fotoPie: '',
    frase: 'Las mejores fotos pasan cuando nadie está posando.',
    parrafos: [
      'Soy Lucía, fotógrafa de bodas y familias en Córdoba. Me gusta acompañar sin interrumpir y encontrar los momentos que pasan entre una foto posada y otra.',
      'Trabajo con luz natural y una edición cálida y atemporal, pensada para que las fotos se sigan sintiendo tuyas dentro de veinte años.'
    ],
    tarjetaEtiqueta: 'Bodas & sesiones',
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
    pie: 'Impresiones y archivos digitales. Envíos a todo el país desde Córdoba.',
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
        notas: ['Envíos a todo el país o retiro en Córdoba', 'Embalaje rígido protegido']
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
        notas: ['Envíos a todo el país o retiro en Córdoba', 'Incluye gancho para colgar']
      }
    }
  },

  /* ---------- SELECCIÓN DE CLIENTES ---------- */
  seleccion: {
    tituloPagina: 'Galería de clientes',
    descripcion: 'Galería protegida para selección de fotografías de eventos y clientes.',
    etiqueta: 'Acceso exclusivo cliente',
    titulo: 'Tu',
    tituloDestacado: 'galería',
    bajada: 'Galería protegida con marca de agua. Marcá las fotografías que quieras y enviámelas por WhatsApp o email para comenzar la edición final.',
    pie: 'Galería para elección y aprobación de imágenes de clientes.',
    // id = nombre que entiende el Apps Script de selección; nombre = lo que ve el cliente
    eventos: [
      { id: 'bodas',    nombre: 'Bodas' },
      { id: 'familias', nombre: 'Familias' },
      { id: 'sesiones', nombre: 'Sesiones' }
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
