/**
 * Test automatizado de APIs y Endpoints externos
 */
const https = require('https');

function testUrl(url, name) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`✅ [${name}] Respuesta exitosa (Status: ${res.statusCode})`);
          resolve(true);
        } else {
          console.error(`❌ [${name}] Error HTTP: ${res.statusCode}`);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      console.error(`❌ [${name}] Error de red:`, err.message);
      reject(err);
    });
  });
}

async function runHealthCheck() {
  console.log("Iniciando monitoreo de endpoints de producción...");
  try {
    // 1. Curator.io Feed
    await testUrl("https://api.curator.io/v1/feeds/37230ef3-81f2-4eec-a62c-16b64abf7a6b/posts?limit=10", "Curator.io Feed");

    // 2. Google Apps Script
    await testUrl("https://script.google.com/macros/s/AKfycbwnghAiGw4rTojBX0bHsszpDxY1jibc-r25JioX8BODrh7sJwXcQMgzolbhssJE3zqD9w/exec?categoria=trackday", "Google Apps Script");

    console.log("\nTodos los servicios están respondiendo correctamente.");
    process.exit(0);
  } catch (error) {
    console.error("\nAlerta: Uno o más servicios fallaron el chequeo.");
    process.exit(1);
  }
}

runHealthCheck();
