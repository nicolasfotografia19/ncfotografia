const fs = require('fs');

try {
  const html = fs.readFileSync('index.html', 'utf8');
  
  const requiredElements = [
    'gallery-container',
    'lightbox',
    'menu-contenedor',
    'loading-indicator'
  ];

  let allFound = true;
  requiredElements.forEach(id => {
    if (html.includes(`id="${id}"`)) {
      console.log(`✅ Elemento #${id} presente`);
    } else {
      console.error(`❌ Falta el elemento crítico #${id}`);
      allFound = false;
    }
  });

  if (allFound) {
    console.log("Estructura DOM verificada exitosamente.");
    process.exit(0);
  } else {
    process.exit(1);
  }
} catch (e) {
  console.error("Error al leer index.html:", e);
  process.exit(1);
}
