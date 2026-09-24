export async function onRequestGet(context) {
  const apiKey = context.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "GEMINI_API_KEY no configurada",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models",
    {
      method: "GET",
      headers: {
        "x-goog-api-key": apiKey,
      },
    }
  );

  const data = await response.json();

  return new Response(JSON.stringify(data, null, 2), {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
