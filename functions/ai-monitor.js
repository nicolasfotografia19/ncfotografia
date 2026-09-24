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

    // 2. Buscar la instalación actual
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
          error:
            "No se encontró la instalación de la GitHub App."
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

    // 3. Crear token de instalación
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

    const githubHeaders = {
      Authorization: `Bearer ${installationToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "NC-Fotografia-AI-Resolver"
    };

    // 4. Obtener información de main
    const branchResponse = await fetch(
      "https://api.github.com/repos/nicolasfotografia19/ncfotografia/git/ref/heads/main",
      {
        headers: githubHeaders
      }
    );

    const branchData =
      await branchResponse.json();

    if (!branchResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          step: "get_main_ref",
          githubStatus: branchResponse.status,
          error: branchData
        }),
        {
          status: branchResponse.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const mainSha = branchData.object.sha;

    // 5. Crear rama de prueba
    const createBranchResponse = await fetch(
      "https://api.github.com/repos/nicolasfotografia19/ncfotografia/git/refs",
      {
        method: "POST",
        headers: {
          ...githubHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ref: "refs/heads/ai-test",
          sha: mainSha
        })
      }
    );

    const createBranchData =
      await createBranchResponse.json();

    // 6. Resultado
    if (!createBranchResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          step: "create_branch",
          githubStatus: createBranchResponse.status,
          error: createBranchData,
          installationId,
          mainSha
        }),
        {
          status: createBranchResponse.status,
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
            "¡La GitHub App puede escribir en el repositorio!",
          test: "create_branch",
          branch: "ai-test",
          baseBranch: "main",
          sha: mainSha,
          repository:
            "nicolasfotografia19/ncfotografia",
          installationId
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
        step: "unexpected_error",
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
