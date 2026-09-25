const GITHUB_OWNER = "nicolasfotografia19";
const GITHUB_REPO = "ncfotografia";
const GITHUB_BRANCH = "main";
const GITHUB_INSTALLATION_ID = "164623831";

const TEST_FILE = "script0.js";

const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash"
];

function base64UrlEncode(data) {
  const bytes = new Uint8Array(data);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function stringToBase64Url(str) {
  return base64UrlEncode(
    new TextEncoder().encode(str)
  );
}

function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

async function createGitHubJWT(appId, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const payload = {
    iat: now - 60,
    exp: now + 540,
    iss: appId
  };

  const unsignedToken =
    `${stringToBase64Url(JSON.stringify(header))}.${stringToBase64Url(JSON.stringify(payload))}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken)
  );

  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

async function createInstallationToken(env) {
  const jwt = await createGitHubJWT(
    env.GITHUB_APP_ID,
    env.GITHUB_PRIVATE_KEY
  );

  const response = await fetch(
    `https://api.github.com/app/installations/${GITHUB_INSTALLATION_ID}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "NC-Fotografia-AI-Resolver"
      }
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `GitHub no pudo crear el installation token: ${text}`
    );
  }

  return JSON.parse(text).token;
}

async function getGitHubFile(token, filePath) {
  const url =
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "NC-Fotografia-AI-Resolver"
    }
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `GitHub no pudo leer ${filePath}: ${text}`
    );
  }

  const data = JSON.parse(text);

  if (data.encoding !== "base64") {
    throw new Error(
      `GitHub devolvió un formato inesperado para ${filePath}`
    );
  }

  const binary = atob(data.content.replace(/\s/g, ""));

  const bytes = Uint8Array.from(
    binary,
    char => char.charCodeAt(0)
  );

  const content = new TextDecoder().decode(bytes);

  return {
    path: data.path,
    sha: data.sha,
    content
  };
}

async function askGemini(env, filePath, code) {
  const prompt = `
Actuás como un ingeniero senior de JavaScript encargado de analizar errores
de una página web.

Analizá exclusivamente el siguiente archivo:

ARCHIVO:
${filePath}

CÓDIGO:
--------------------
${code}
--------------------

Buscá errores reales que puedan provocar fallos en producción.

No inventes errores.

Si no encontrás un problema claro, devolvé:

{
  "shouldFix": false,
  "file": "${filePath}",
  "explanation": "No se encontró un error claro que pueda corregirse automáticamente.",
  "oldCode": "",
  "newCode": ""
}

Si encontrás un error claro y seguro de corregir, devolvé:

{
  "shouldFix": true,
  "file": "${filePath}",
  "explanation": "Explicación breve del problema.",
  "oldCode": "fragmento exacto del código original",
  "newCode": "fragmento corregido"
}

REGLAS IMPORTANTES:

1. No inventes funciones, variables ni archivos.
2. oldCode debe existir exactamente dentro del código proporcionado.
3. newCode debe ser una corrección concreta.
4. No cambies código que no esté relacionado con el problema.
5. Si no estás seguro, shouldFix debe ser false.
6. Respondé exclusivamente JSON válido.
`;

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0,
              responseMimeType: "application/json"
            }
          })
        }
      );

      const text = await response.text();

      if (!response.ok) {
        lastError = new Error(
          `Gemini ${model}: ${text}`
        );

        if (
          response.status === 429 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504
        ) {
          continue;
        }

        throw lastError;
      }

      const data = JSON.parse(text);

      const resultText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!resultText) {
        throw new Error(
          `Gemini ${model} no devolvió contenido.`
        );
      }

      const fix = JSON.parse(resultText);

      if (typeof fix.shouldFix !== "boolean") {
        throw new Error(
          "Gemini devolvió un JSON sin shouldFix válido."
        );
      }

      if (fix.file !== filePath) {
        throw new Error(
          `Gemini indicó otro archivo: ${fix.file}`
        );
      }

      if (fix.shouldFix) {
        if (!fix.oldCode || !code.includes(fix.oldCode)) {
          throw new Error(
            "Gemini propuso oldCode que no existe exactamente en el archivo."
          );
        }

        if (!fix.newCode) {
          throw new Error(
            "Gemini indicó que hay que corregir pero newCode está vacío."
          );
        }
      }

      return {
        model,
        fix
      };

    } catch (error) {
      lastError = error;

      if (
        error.message.includes("429") ||
        error.message.includes("500") ||
        error.message.includes("502") ||
        error.message.includes("503") ||
        error.message.includes("504")
      ) {
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("No se pudo consultar Gemini.");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function onRequest(context) {
  try {

    // =========================
    // PÁGINA DE PRUEBA
    // =========================

    if (context.request.method === "GET") {
      return new Response(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>NC Fotografía AI Resolver</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1000px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.5;
    }

    button {
      padding: 12px 20px;
      font-size: 16px;
      cursor: pointer;
      margin-bottom: 20px;
    }

    pre {
      white-space: pre-wrap;
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
    }

    .ok {
      color: green;
    }

    .error {
      color: red;
    }
  </style>
</head>

<body>

  <h1>🤖 NC Fotografía AI Resolver</h1>

  <p>
    Esta prueba leerá:
    <strong>${TEST_FILE}</strong>
  </p>

  <p>
    Luego enviará el código a Gemini para analizarlo.
  </p>

  <p>
    <strong>⚠️ No modifica GitHub.</strong>
  </p>

  <button onclick="probarGemini()">
    🚀 Analizar ${TEST_FILE} con Gemini
  </button>

  <div id="resultado">
    Esperando prueba...
  </div>

<script>

async function probarGemini() {

  const resultado =
    document.getElementById("resultado");

  resultado.innerHTML =
    "<p>⏳ Leyendo archivo y consultando Gemini...</p>";

  try {

    const response = await fetch("", {
      method: "POST"
    });

    const data = await response.json();

    if (!data.ok) {

      resultado.innerHTML =
        '<div class="error">' +
        "<h2>❌ Error</h2>" +
        "<pre>" +
        escapeHtml(JSON.stringify(data, null, 2)) +
        "</pre>" +
        "</div>";

      return;
    }

    resultado.innerHTML =
      '<div class="ok">' +
      "<h2>✅ Análisis completado</h2>" +
      "</div>" +

      "<p><strong>Archivo:</strong> " +
      escapeHtml(data.file) +
      "</p>" +

      "<p><strong>Modelo Gemini:</strong> " +
      escapeHtml(data.model) +
      "</p>" +

      "<h3>Resultado de Gemini</h3>" +

      "<pre>" +
      escapeHtml(
        JSON.stringify(data.fix, null, 2)
      ) +
      "</pre>";

  } catch (error) {

    resultado.innerHTML =
      '<div class="error">' +
      "<h2>❌ Error del navegador</h2>" +
      "<pre>" +
      escapeHtml(error.message) +
      "</pre>" +
      "</div>";
  }
}

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

</script>

</body>
</html>
      `, {
        headers: {
          "Content-Type": "text/html; charset=UTF-8"
        }
      });
    }

    // =========================
    // PRUEBA GITHUB + GEMINI
    // =========================

    if (context.request.method === "POST") {

      // 1. Obtener token de GitHub
      const token =
        await createInstallationToken(context.env);

      // 2. Leer archivo REAL del repositorio
      const githubFile =
        await getGitHubFile(
          token,
          TEST_FILE
        );

      // 3. Enviar código real a Gemini
      const gemini =
        await askGemini(
          context.env,
          githubFile.path,
          githubFile.content
        );

      // 4. Responder resultado
      return new Response(
        JSON.stringify({
          ok: true,
          stage: "github-gemini",
          repository:
            `${GITHUB_OWNER}/${GITHUB_REPO}`,
          branch: GITHUB_BRANCH,

          file: githubFile.path,

          sha: githubFile.sha,

          contentLength:
            githubFile.content.length,

          model: gemini.model,

          fix: gemini.fix
        }),
        {
          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: false,
        error: "Método no permitido"
      }),
      {
        status: 405,
        headers: {
          "Content-Type":
            "application/json"
        }
      }
    );

  } catch (error) {

    return new Response(
      JSON.stringify({
        ok: false,
        stage: "cloudflare",
        error: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type":
            "application/json"
        }
      }
    );
  }
}
