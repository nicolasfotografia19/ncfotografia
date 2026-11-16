# Instalar la web para un cliente nuevo

Toda la web se adapta desde **un solo archivo: `config.js`**. Las páginas, el menú, el pie, los colores, los textos, los precios y las conexiones salen de ahí. No hace falta tocar el HTML.

Tiempo estimado por cliente: 1 a 2 horas, la mayor parte en Google y en el dominio.

---

## Qué pedirle al cliente

- Nombre como quiere que aparezca (ej. "Lucía Herrera" + "Fotografía")
- Logo (SVG o PNG con fondo transparente, idealmente blanco)
- Una foto suya para "Sobre mí" (opcional)
- WhatsApp, email e Instagram
- Textos: frase, bio (2 párrafos), ciudad o zona
- Qué secciones quiere: Tienda, Selección de clientes, la sección de autos (solo si es de nicho automotor)
- Precios de la tienda (digital, impresa y con marco, por tamaño)
- Tema claro u oscuro y un color de acento
- Dominio (si ya tiene uno, o comprarlo en nic.ar)

---

## 1. Copiar el repositorio

1. En GitHub, creá un repositorio nuevo para el cliente (ej. `web-luciaherrera`) y subí una copia de este.
   - Lo más cómodo: en este repositorio, **Settings → General → Template repository** (activarlo una sola vez). Después, para cada cliente: botón **Use this template → Create a new repository**.
2. Reemplazá en la copia:
   - `logo.svg` → el logo del cliente (mismo nombre, o cambiá `marca.logo` en `config.js`)
   - `img/` → la foto del cliente (y poné su ruta en `sobreMi.foto`)
3. Borrá `img/nicolas.jpg` de la copia.

## 2. Completar `config.js`

Abrí `config.js` y cambiá los valores entre comillas. Cada bloque está comentado.

- **Punto de partida:** `ejemplos/config-cliente-ejemplo.js` es un cliente ficticio con tema claro y sin la sección de autos. Podés copiar su contenido y editar desde ahí.
- **`apariencia.tema`:** `'oscuro'` o `'claro'`. Con tema claro y logo blanco, poné `invertirLogo: true`.
- **`secciones`:** `activa: false` saca la sección del menú, y si alguien entra a esa página lo manda a la portada.
- **`integraciones.sentryDsn`:** dejalo en `''` para los clientes. Si no, sus errores te llegan a vos.
- **Precios:** en `tienda.formatos`, en pesos y sin puntos (ej. `28500`).

Cuidado con las comas y las comillas: cada valor va entre comillas simples `'...'` y cada línea termina en coma. Si la página queda en blanco, casi siempre es una coma o una comilla de más o de menos.

## 3. Conexiones de Google y formularios (con la cuenta del cliente)

Cada cliente usa **su propia cuenta de Google**, así las fotos y los pedidos son suyos.

### Tienda (carpeta de Drive)
1. En el Drive del cliente: carpeta "Tienda", con subcarpetas por categoría y una llamada "Vendidas". Compartirla como **Cualquier persona con el enlace — Lector**.
2. En script.google.com: proyecto nuevo, pegar `apps-script/tienda.gs`, poner el ID de la carpeta en `CARPETA_TIENDA_ID`.
3. **Implementar → Nueva implementación → Aplicación web.** Ejecutar como: **Yo**. Acceso: **Cualquier persona**.
4. Copiar la URL en `integraciones.tiendaApi`.

### Selección de clientes
- Mismo procedimiento con el script de Selección. Los `id` de `seleccion.eventos` tienen que coincidir con lo que espera ese script (nombres de carpeta).
- **Pendiente:** el código de este script todavía no está en el repositorio. Hay que copiarlo desde tu cuenta de Google a `apps-script/seleccion.gs`.

### Portfolio de Instagram
- Necesita un script que lea el Instagram del cliente (requiere un token de Instagram de su cuenta).
- **Pendiente:** el código de tu script de Instagram tampoco está en el repositorio. Hay que copiarlo a `apps-script/instagram.gs` y documentar cómo sacar el token.

### Formspree (pedidos por email y formularios)
1. Crear una cuenta en formspree.io **con el email del cliente** y un formulario nuevo.
2. Copiar la URL (`https://formspree.io/f/xxxxxx`) en `integraciones.formspree`.
3. Hacer un envío de prueba y que el cliente confirme el mail de activación (revisar Spam).
4. En el formulario: **Settings → reCAPTCHA desactivado** (si no, la tienda no puede enviar).

## 4. Publicar en Cloudflare Pages

1. En Cloudflare: **Workers & Pages → Create → Pages → Connect to Git** y elegir el repositorio del cliente.
2. Configuración de build: **Framework: None**, **Build command: vacío**, **Output directory: `/`**.
3. Deploy. Queda en `nombre.pages.dev`.
4. **Custom domains → Set up a domain** para conectar el dominio del cliente.

## 5. Revisar antes de entregar

- [ ] Portada: aparecen las fotos de Instagram y los filtros
- [ ] Tienda: aparecen las fotos de Drive; un pedido de prueba por WhatsApp y otro por email
- [ ] Selección: cargan las fotos de cada evento; envío de prueba
- [ ] Sobre mí: foto, textos y botones de contacto
- [ ] Menú en celular
- [ ] Ventana de incógnito: todo se ve sin sesión de Google

---

## Mantenimiento

- **Cambiar textos, precios o datos:** editar `config.js` del cliente y guardar. Se ve en 1 o 2 minutos.
- **Mejoras para todos los clientes:** se hacen en este repositorio (la plantilla) y se copian los archivos cambiados (`styles.css`, `plantilla.js`, las páginas) a cada cliente. Nunca se pisa su `config.js`, su logo ni sus fotos.
- **Al cambiar `styles.css` o `plantilla.js`:** subir el número `?v=` en las páginas, así los navegadores descargan la versión nueva.
