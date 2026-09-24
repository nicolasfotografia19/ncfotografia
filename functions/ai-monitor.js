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

    // 1. Crear JWT de la GitHub App
    const jwt = await createGitHubJWT(
      appId,
      privateKey
    );

    // 2. Obtener las instalaciones actuales
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

    // 3. Buscar la instalación de Nicolas
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
            "No se encontró una instalación de la GitHub App para nicolasfotografia19.",
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

    // 4. Obtener información REAL de la instalación
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

    // 5. Crear token de instalación
    const tokenResponse = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
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

    const tokenData =
      await tokenResponse.json();

    if (!tokenResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          step: "installation_token",
          githubStatus: tokenResponse.status,
          error: tokenData,
          installationId
        }),
        {
          status: tokenResponse.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const installationToken =
      tokenData.token;

    // 6. Consultar repositorios disponibles
    const repositoriesResponse = await fetch(
      "https://api.github.com/installation/repositories",
      {
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "NC-Fotografia-AI-Resolver"
        }
      }
    );

    const repositoriesData =
      await repositoriesResponse.json();

    if (!repositoriesResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          step: "installation_repositories",
          githubStatus: repositoriesResponse.status,
          error: repositoriesData,
          installationId
        }),
        {
          status: repositoriesResponse.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // 7. Buscar nuestro repositorio
    const repository =
      repositoriesData.repositories?.find(
        (repo) =>
          repo.full_name ===
          "nicolasfotografia19/ncfotografia"
      );

    if (!repository) {
      return new Response(
        JSON.stringify({
          ok: false,
          message:
            "La GitHub App está instalada, pero no encuentra el repositorio ncfotografia.",
          installationId,
          repositories:
            repositoriesData.repositories?.map(
              (repo) => repo.full_name
            )
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // 8. Devolver diagnóstico
    return new Response(
      JSON.stringify(
        {
          ok: true,

          message:
            "Diagnóstico de GitHub App completado.",

          appId: appId,

          installationId: installationId,

          account:
            installationData.account?.login,

          repositorySelection:
            installationData.repository_selection,

          installationPermissions:
            installationData.permissions,

          repository:
            repository.full_name,

          private:
            repository.private,

          defaultBranch:
            repository.default_branch,

          repositoryPermissions:
            repository.permissions,

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
