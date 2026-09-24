export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      ok: true,
      message: "ai-fix-test funcionando",
      next: "La función está lista para recibir errores mediante POST"
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
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
      return new Response(
        JSON.stringify({
          ok: false,
          stage: "gemini",
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
      return new Response(
        JSON.stringify({
          ok: false,
          stage: "gemini",
          error: "Gemini no devolvió contenido"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    let fix;

    try {
      fix = JSON.parse(text);
    } catch (error) {
      return new Response(
        JSON.stringify({
          ok: false,
          stage: "parse",
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
      JSON.stringify({
        ok: true,
        stage: "gemini",
        fix
      }),
      {
        status: 200,
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
