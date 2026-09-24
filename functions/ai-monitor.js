export async function onRequestGet(context) {
  return new Response(
    JSON.stringify({
      ok: true,
      message: "Cloudflare Function funcionando",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
