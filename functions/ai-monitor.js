export async function onRequestGet(context) {
  try {
    const appId = context.env.GITHUB_APP_ID;
    const privateKey = context.env.GITHUB_PRIVATE_KEY;

    if (!appId || !privateKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Faltan las credenciales de GitHub"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Crear JWT de la GitHub App
    const jwt = await createGitHubJWT(
      appId,
      privateKey
    );

    // Buscar las instalaciones de la App
    const installationsResponse = await fetch(
      "https://api.github.com/app/installations",
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "NC-Fotografia-AI-Resolver"
        }
      }
    );

    const installationsData =
      await installationsResponse.json();

    if (!installationsResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          step: "list_installations",
          githubStatus: installationsResponse.status,
          error: installationsData
        }),
        {
          status: installationsResponse.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Buscar nuestra instalación
    const installation =
      installationsData.find(
        (item) =>
          item.account?.login ===
          "nicolasfotografia19"
      );

    if (!installation) {
      return new Response(
        JSON.stringify({
          ok: false,
          message:
            "No se encontró la instalación de la GitHub App.",
          installations:
            installationsData.map((item) => ({
              id: item.id,
              account: item.account?.login,
              repositorySelection:
                item.repository_selection,
              permissions: item.permissions
            }))
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const installationId = installation.id;

    // Consultar DIRECTAMENTE los permisos efectivos
    // de esta instalación
    const installationResponse = await fetch(
      `https://api.github.com/app/installations/${installationId}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "NC-Fotografia-AI-Resolver"
        }
      }
    );

    const installationData =
      await installationResponse.json();

    if (!installationResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          step: "get_installation",
          githubStatus: installationResponse.status,
          error: installationData,
          installationId
        }),
        {
          status: installationResponse.status,
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
          message:
            "Permisos efectivos de la GitHub App obtenidos.",
          installationId,
          account:
            installationData.account?.login,
          repositorySelection:
            installationData.repository_selection,
          permissions:
            installationData.permissions,
          appId:
            installationData.app_id,
          updatedAt:
            installationData.updated_at
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
    return new Response(
      JSON.stringify({
        ok: false,
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
