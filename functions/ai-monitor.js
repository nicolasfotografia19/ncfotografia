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
          message: "GEMINI_API_KEY no está disponible",
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

MENSAJE:
${errorMessage}

STACK TRACE:
${JSON.stringify(errorStack, null, 2)}

Analiza el error y responde en español.

Usa exactamente este formato:

CAUSA:
[causa raíz]

SIMPLE:
[true o false]

SOLUCIÓN:
[explicación y código corregido si corresponde]
`;

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: "gemini-3.8-flash",
          input: prompt,
        }),
      }
    );

    const aiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return new Response(
        JSON.stringify({
          status: "Error detallado de Google",
          httpStatus: geminiResponse.status,
          errorMensajeExacto:
            aiData.error?.message || JSON.stringify(aiData),
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
  aiData.output_text ||
  aiData.outputs
    ?.filter(output => output.type === "text")
    ?.map(output => output.text)
    ?.join("\n") ||
  aiData.steps
    ?.flatMap(step => step.content || [])
    ?.filter(content => content.type === "text")
    ?.map(content => content.text)
    ?.join("\n") ||
  JSON.stringify(aiData);

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
