# Nicolás Fotografía — Portafolio Web

Sitio web oficial de portafolio fotográfico para [ncfotografia.com.ar](https://ncfotografia.com.ar).

## Características
- **Diseño Editorial & Minimalista**: Tipografía Playfair Display + Inter, microinteracciones y grilla Masonry fluida.
- **Atmósfera Fotográfica**: Textura de grano analógico 35mm, viñeteado óptico y fondo con iluminación ambiental de galería.
- **Integraciones en Tiempo Real**:
  - Feed de **Curator.io** sincronizado con Instagram (con filtro estricto anti-reels).
  - Selección de fotos protegida con Google Drive vía **Google Apps Script**.
  - Formulario de fotos de pista y selección integrados con **Formspree** y **WhatsApp**.
  - Monitoreo de errores con **Sentry**.
- **Resiliencia & Self-Healing**: Respaldo offline en caché local y auto-curación de imágenes.

## Desarrollo Local
```bash
npm install
npm run dev
```

## Build para Producción (Netlify)
```bash
npm run build
```
