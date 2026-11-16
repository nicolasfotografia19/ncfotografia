/**
 * NICOLÁS FOTOGRAFÍA — Catálogo de la tienda desde Google Drive
 * ------------------------------------------------------------
 * Cómo se organiza la carpeta:
 *
 *   Tienda/                      ← CARPETA_TIENDA_ID
 *   ├── Arquitectura/            ← cada subcarpeta = una categoría
 *   │   ├── Faro de Punta Mogotes.jpg
 *   │   └── Torre Pirelli.jpg
 *   ├── Retratos/
 *   ├── Estilo de vida/
 *   ├── Vendidas/                ← mové acá lo vendido: deja de aparecer
 *   └── (fotos sueltas acá también aparecen, sin categoría)
 *
 * - El nombre del archivo es el título en la web (sin la extensión).
 *   Ej: "Faro_de_Punta_Mogotes.jpg" → "Faro de Punta Mogotes".
 * - Si le ponés una descripción al archivo en Drive (clic derecho →
 *   Información del archivo → Descripción), se muestra en la ficha.
 * - Los cambios se ven en la web en 2 minutos como máximo.
 */

const CARPETA_TIENDA_ID = 'PEGÁ_ACÁ_EL_ID_DE_LA_CARPETA';
const CARPETA_VENDIDAS  = 'Vendidas';
const CACHE_SEGUNDOS    = 120;
const ANCHO_IMAGEN      = 1600;   // px de las vistas previas

function doGet(e) {
  const params = (e && e.parameter) || {};
  const cache = CacheService.getScriptCache();

  let json = params.fresh ? null : cache.get('tienda');
  if (!json) {
    json = JSON.stringify(listarFotos());
    try { cache.put('tienda', json, CACHE_SEGUNDOS); } catch (err) { /* catálogo muy grande para caché */ }
  }

  // JSONP (lo que usa la web) o JSON normal
  if (params.callback) {
    const cb = String(params.callback).replace(/[^\w$.]/g, '');
    return ContentService
      .createTextOutput(cb + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function listarFotos() {
  const raiz = DriveApp.getFolderById(CARPETA_TIENDA_ID);
  const fotos = [];

  agregarFotos(raiz, '', fotos);

  const subcarpetas = raiz.getFolders();
  while (subcarpetas.hasNext()) {
    const sub = subcarpetas.next();
    const nombre = sub.getName().trim();
    if (nombre.toLowerCase() === CARPETA_VENDIDAS.toLowerCase()) continue;
    agregarFotos(sub, nombre, fotos);
  }

  // Lo más nuevo primero
  fotos.sort(function (a, b) { return b.fecha - a.fecha; });
  return fotos;
}

function agregarFotos(carpeta, categoria, fotos) {
  const archivos = carpeta.getFiles();
  while (archivos.hasNext()) {
    const f = archivos.next();
    if (f.isTrashed()) continue;
    if (String(f.getMimeType()).indexOf('image/') !== 0) continue;

    fotos.push({
      id: f.getId(),
      titulo: limpiarNombre(f.getName()),
      descripcion: f.getDescription() || '',
      categoria: categoria,
      imagen: 'https://drive.google.com/thumbnail?id=' + f.getId() + '&sz=w' + ANCHO_IMAGEN,
      fecha: f.getDateCreated().getTime()
    });
  }
}

function limpiarNombre(nombre) {
  return String(nombre)
    .replace(/\.[^.]+$/, '')     // saca la extensión
    .replace(/[_]+/g, ' ')       // guiones bajos → espacios
    .replace(/\s+/g, ' ')
    .trim();
}

/** Para probar desde el editor: Ejecutar → probar, y mirá el registro. */
function probar() {
  const fotos = listarFotos();
  Logger.log(fotos.length + ' fotos encontradas');
  Logger.log(JSON.stringify(fotos.slice(0, 3), null, 2));
}
