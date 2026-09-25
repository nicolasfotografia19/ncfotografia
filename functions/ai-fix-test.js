const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash"
];

const GITHUB_OWNER = "nicolasfotografia19";
const GITHUB_REPO = "ncfotografia";
const GITHUB_BRANCH = "main";
const GITHUB_INSTALLATION_ID = "164623831";

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

  const encodedHeader = stringToBase64Url(
    JSON.stringify(header)
  );

  const encodedPayload = stringToBase64Url(
    JSON.stringify(payload)
  );

  const unsignedToken =
    `${encodedHeader}.${encodedPayload}`;

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

async function createInstallationToken(context) {
  const appId = context.env.GITHUB_APP_ID;
  const privateKey = context.env.GITHUB_PRIVATE_KEY;

  if (!appId) {
    throw new Error("Falta GITHUB_APP_ID en Cloudflare");
  }

  if (!privateKey) {
    throw new Error("Falta GITHUB_PRIVATE_KEY en Cloudflare");
  }

  const jwt = await createGitHubJWT(
    appId,
    privateKey
  );

  const response = await fetch(
    `https://api.github.com/app/installations/${GITHUB_INSTALLATION_ID}/access_tokens`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${jwt}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "NC-Fotografia-AI-Resolver"
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `GitHub no pudo crear el installation token: ${JSON.stringify(data)}`
    );
  }

  return data.token;
}

async function getGitHubFile(context, filePath) {
  const token = await createInstallationToken(context);

  const url =
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "NC-Fotografia-AI-Resolver"
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `GitHub no pudo leer el archivo: ${JSON.stringify(data)}`
    );
  }

  if (data.type !== "file") {
    throw new Error(
      "La ruta indicada no corresponde a un archivo"
    );
  }

  if (!data.content) {
    throw new Error(
      "GitHub no devolvió el contenido del archivo"
    );
  }

  const cleanBase64 = data.content.replace(/\s/g, "");

  const binary = atob(cleanBase64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const content = new TextDecoder().decode(bytes);

  return {
    path: data.path,
    sha: data.sha,
    content
  };
}

export async function onRequestGet(context) {
  const html = `
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <title>NC Fotografía - AI Fix Test</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1000px;
      margin: 40px auto;
      padding: 20px;
    }

    button {
      padding: 12px 20px;
      margin: 10px 0;
      cursor: pointer;
    }

    pre {
      background: #f4f4f4;
      padding: 20px;
      overflow-x: auto;
      white-space: pre-wrap;
    }
  </style>
</head>

<body>

<h1>NC Fotografía — AI Fix Test</h1>

<p>
  GitHub App → archivo real → Gemini
</p>

<button onclick="testAI()">
  Leer archivo y probar Gemini
</button>

<h2>Resultado</h2>

<pre id="result">Esperando prueba...</pre>

<script>
async function testAI() {

  const result = document.getElementById("result");

  result.textContent =
    "Leyendo archivo desde GitHub y consultando Gemini...";

  try {

    const payload = {
      event: {
        message:
          "Cannot read properties of undefined",

        exception: {
          values: [
            {
              value:
                "Cannot read properties of undefined (reading 'media_url')",

              stacktrace: {
                frames: [
                  {
                    filename:
                      "components/InstagramFeed.jsx",

                    function:
                      "fetchInstagramPosts",

                    lineno: 42,

                    colno: 18
                  }
                ]
              }
            }
          ]
        }
      }
    };

    const response = await fetch(
      "/ai-fix-test",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(payload)
      }
    );

    const data =
      await response.json();

    result.textContent =
      JSON.stringify(data, null, 2);

  } catch (error) {

    result.textContent =
      "Error: " + error.message;
  }
}
</script>

</body>
</html>
`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type":
        "text/html; charset=UTF-8"
    }
  });
}

export async function onRequestPost(context) {

  try {

    const body =
      await context.request.json();

    const errorMessage =
      body?.event?.message ||
      "Error desconocido";

    const exception =
      body?.event?.exception?.values?.[0];

    const stacktrace =
      exception?.stacktrace?.frames || [];

    const lastFrame =
      stacktrace.length > 0
        ? stacktrace[stacktrace.length - 1]
        : null;

    let filePath =
      lastFrame?.filename || "";

    filePath =
      filePath
        .replace(/^\/+/, "")
        .split("?")[0];

    if (!filePath) {
      return new Response(
        JSON.stringify({
          ok: false,
          stage: "github",
          error:
            "Sentry no indicó qué archivo produjo el error"
        }),
        {
          status: 400,
          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );
    }

    /*
     * Por seguridad, solamente permitimos
     * archivos dentro del repositorio.
     */
    if (
      filePath.includes("..") ||
      filePath.startsWith(".git/")
    ) {
      return new Response(
        JSON.stringify({
          ok: false,
          stage: "security",
          error:
            "Ruta de archivo no permitida"
        }),
        {
          status: 400,
          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );
    }

    /*
     * 1. GitHub App lee el archivo real.
     */

    const githubFile =
      await getGitHubFile(
        context,
        filePath
      );

    /*
     * 2. Construimos el prompt con
     *    el código REAL del repositorio.
     */

    const prompt = `
Sos un asistente especializado en reparar errores de código de una aplicación web.

Analizá el error y el código REAL del archivo proporcionado.

ERROR:
${errorMessage}

EXCEPCIÓN:
${exception?.value || "No disponible"}

ARCHIVO:
${filePath}

FUNCIÓN:
${lastFrame?.function || "No disponible"}

LÍNEA:
${lastFrame?.lineno || "No disponible"}

COLUMNA:
${lastFrame?.colno || "No disponible"}

CÓDIGO REAL DEL ARCHIVO:

--- INICIO DEL ARCHIVO ---
${githubFile.content}
--- FIN DEL ARCHIVO ---

Tu tarea es determinar si existe una corrección simple y segura.

IMPORTANTE:

- El archivo proporcionado es el código real del repositorio.
- No inventes archivos.
- No inventes código que no aparezca en el contexto.
- No modifiques archivos distintos al indicado.
- Si no podés determinar una corrección segura, shouldFix debe ser false.
- oldCode debe coincidir EXACTAMENTE con una parte existente del archivo.
- newCode debe ser una modificación mínima y justificada.
- No hagas cambios destructivos.
- No modifiques configuraciones de producción.
- No cambies dependencias.
- No cambies package.json.
- No cambies variables de entorno.
- No cambies secretos.
- No cambies archivos fuera del archivo indicado.
- La respuesta debe ser EXCLUSIVAMENTE JSON válido.
- No uses markdown.
- No agregues explicaciones fuera del JSON.

Usá exactamente esta estructura:

{
  "shouldFix": true,
  "file": "${filePath}",
  "explanation": "Explicación breve del problema",
  "oldCode": "código exacto que debería reemplazarse",
  "newCode": "código corregido"
}

Si no podés determinar una corrección segura:

{
  "shouldFix": false,
  "file": "",
  "explanation": "Motivo por el cual no se puede corregir automáticamente",
  "oldCode": "",
  "newCode": ""
}
`;

    /*
     * 3. Gemini analiza el código.
     */

    let lastError = null;

    for (const model of GEMINI_MODELS) {

      try {

        const response =
          await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                "x-goog-api-key":
                  context.env.GEMINI_API_KEY
              },

              body:
                JSON.stringify({
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

                    responseMimeType:
                      "application/json"
                  }
                })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          lastError = {
            model,
            status:
              response.status,
            error: data
          };

          if (
            response.status === 429 ||
            response.status === 500 ||
            response.status === 502 ||
            response.status === 503 ||
            response.status === 504
          ) {
            continue;
          }

          return new Response(
            JSON.stringify({
              ok: false,
              stage: "gemini",
              model,
              error: data
            }),
            {
              status:
                response.status,

              headers: {
                "Content-Type":
                  "application/json"
              }
            }
          );
        }

        const text =
          data?.candidates?.[0]
            ?.content?.parts?.[0]
            ?.text;

        if (!text) {

          lastError = {
            model,

            error:
              "Gemini no devolvió contenido"
          };

          continue;
        }

        let fix;

        try {

          fix =
            JSON.parse(text);

        } catch (error) {

          return new Response(
            JSON.stringify({
              ok: false,
              stage: "parse",
              model,
              rawResponse: text
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

        /*
         * 4. Validación básica.
         *
         * Todavía NO escribimos nada en GitHub.
         */

        if (
          typeof fix.shouldFix !==
          "boolean"
        ) {
          return new Response(
            JSON.stringify({
              ok: false,
              stage: "validation",
              error:
                "Gemini devolvió un shouldFix inválido",
              fix
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

        if (fix.shouldFix) {

          if (fix.file !== filePath) {

            return new Response(
              JSON.stringify({
                ok: false,
                stage: "validation",
                error:
                  "Gemini intentó modificar un archivo diferente al reportado por Sentry",
                expectedFile:
                  filePath,
                returnedFile:
                  fix.file,
                fix
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

          if (
            !fix.oldCode ||
            !githubFile.content.includes(
              fix.oldCode
            )
          ) {

            return new Response(
              JSON.stringify({
                ok: false,
                stage: "validation",
                error:
                  "oldCode no coincide con el código real del repositorio",
                fix
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

          if (!fix.newCode) {

            return new Response(
              JSON.stringify({
                ok: false,
                stage: "validation",
                error:
                  "Gemini no proporcionó newCode",
                fix
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

        return new Response(
          JSON.stringify(
            {
              ok: true,

              stage:
                "github-read-gemini",

              model,

              github: {
                repository:
                  `${GITHUB_OWNER}/${GITHUB_REPO}`,

                branch:
                  GITHUB_BRANCH,

                file:
                  githubFile.path,

                sha:
                  githubFile.sha,

                contentLength:
                  githubFile.content.length
              },

              fix
            },
            null,
            2
          ),
          {
            status: 200,

            headers: {
              "Content-Type":
                "application/json"
            }
          }
        );

      } catch (error) {

        lastError = {
          model,
          error:
            error.message
        };
      }
    }

    return new Response(
      JSON.stringify({
        ok: false,
        stage: "gemini",
        error:
          "Todos los modelos Gemini disponibles fallaron",
        lastError
      }),
      {
        status: 503,

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
        error:
          error.message
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
