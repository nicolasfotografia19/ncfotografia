export async function onRequestPost(context) {
  return new Response(
    JSON.stringify({
      ok: true,
      message: "AI Monitor funcionando en Cloudflare",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
