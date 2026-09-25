const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash"
];

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
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
    }

    textarea {
      width: 100%;
      min-height: 300px;
      font-family: monospace;
      padding: 10px;
      box-sizing: border-box;
    }

    button {
      margin-top: 15px;
      padding: 12px 20px;
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
  Esta página prueba Sentry → Cloudflare → Gemini.
</p>

<textarea id="payload">{
  "event": {
    "message": "Cannot read properties of undefined",
    "exception": {
      "values": [
        {
          "value": "Cannot read properties of undefined (reading 'media_url')",
          "stacktrace": {
            "frames": [
              {
                "filename": "components/InstagramFeed.jsx",
                "function": "fetchInstagramPosts",
                "lineno": 42,
                "colno": 18
              }
            ]
          }
        }
      ]
    }
  }
}</textarea>

<br>

<button onclick="testGemini()">
  Probar Gemini
</button>

<h2>Resultado</h2>

<pre id="result">Esperando prueba...</pre>

<script>
async function testGemini() {
  const result = document.getElementById("result");
  const payloadText = document.getElementById("payload").value;

  result.textContent = "Consultando Gemini...";

  try {
    const payload = JSON.parse(payloadText);

    const response = await fetch("/ai-fix-test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    result.textContent = JSON.stringify(data, null, 2);

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
      "Content-Type": "text/html; charset=UTF-8"
    }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

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

    const prompt = `
Sos un asistente especializado en reparar errores de código de una aplicación web.

Analizá el siguiente error.

ERROR:
${errorMessage}

EXCEPCIÓN:
${exception?.value || "No disponible"}

ARCHIVO:
${lastFrame?.filename || "No disponible"}

FUNCIÓN:
${lastFrame?.function || "No disponible"}

LÍNEA:
${lastFrame?.lineno || "No disponible"}

COLUMNA:
${lastFrame?.colno || "No disponible"}

Tu tarea es determinar si existe una corrección simple y segura.

IMPORTANTE:

- No inventes archivos.
- No inventes código que no puedas justificar.
- Si no hay suficiente información para realizar una corrección segura, shouldFix debe ser false.
- No hagas cambios destructivos.
- No propongas modificar configuraciones de producción.
- La respuesta debe ser EXCLUSIVAMENTE JSON válido.
- No uses markdown.
- No agregues explicaciones fuera del JSON.

Usá exactamente esta estructura:

{
  "shouldFix": true,
  "file": "ruta/del/archivo.js",
  "explanation": "Explicación breve del problema",
  "oldCode": "código que debería reemplazarse",
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

    let lastError = null;

    for (const model of GEMINI_MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": context.env.GEMINI_API_KEY
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

        const data = await response.json();

        if (!response.ok) {
          lastError = {
            model,
            status: response.status,
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
              status: response.status,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }

        const text =
          data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          lastError = {
            model,
            error: "Gemini no devolvió contenido"
          };

          continue;
        }

        let fix;

        try {
          fix = JSON.parse(text);
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
                "Content-Type": "application/json"
              }
            }
          );
        }

        return new Response(
          JSON.stringify(
            {
              ok: true,
              stage: "gemini",
              model,
              fix
            },
            null,
            2
          ),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

      } catch (error) {
        lastError = {
          model,
          error: error.message
        };
      }
    }

    return new Response(
      JSON.stringify({
        ok: false,
        stage: "gemini",
        error: "Todos los modelos Gemini disponibles fallaron",
        lastError
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json"
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
          "Content-Type": "application/json"
        }
      }
    );
  }
}
