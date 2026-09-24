export async function onRequestPost(context) {
  try {
    const sentryPayload = await context.request.json();
    const errorDetails = sentryPayload.event || {};

    const errorMessage =
      errorDetails.message ||
      errorDetails.exception?.values?.[0]?.value ||
      "Error desconocido";

    const errorStack =
      errorDetails.exception?.values?.[0]?.stacktrace?.frames?.slice(-5) || [];

    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          status: "Error de configuración",
          message: "La variable GEMINI_API_KEY no está accesible",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const prompt = `
Actúa como un desarrollador frontend experto.

Ocurrió un error en mi sitio web de fotografía.

MENSAJE DEL ERROR:
${errorMessage}

STACK TRACE:
${JSON.stringify(errorStack, null, 2)}

Analiza el error y responde en español de forma concisa.

Responde exactamente con este formato:

CAUSA:
[explicación de la causa raíz en una línea]

SIMPLE:
[true o false]

SOLUCIÓN:
[si SIMPLE es true, proporciona el código corregido. Si es false, explica brevemente qué debería revisarse]
`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const aiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return new Response(
        JSON.stringify({
          status: "Error detallado de Google",
          httpStatus: geminiResponse.status,
          errorMensajeExacto: aiData.error?.message || aiData,
        }),
        {
          status: geminiResponse.status,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const analysis =
      aiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Gemini no devolvió ningún análisis.";

    return new Response(
      JSON.stringify({
        status: "Analizado con éxito",
        analysis,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        status: "Error interno",
        error: err.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
