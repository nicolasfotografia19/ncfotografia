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
  return base64UrlEncode(new TextEncoder().encode(str));
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

    const jwt = await createGitHubJWT(
      appId,
      privateKey
    );

    // Convertir JWT de App en token de instalación
    const tokenResponse = await fetch(
      "https://api.github.com/app/installations/164618009/access_tokens",
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

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          step: "installation_token",
          githubStatus: tokenResponse.status,
          error: tokenData
        }),
        {
          status: tokenResponse.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const installationToken = tokenData.token;

    // Consultar el repositorio
    const repoResponse = await fetch(
      "https://api.github.com/repos/nicolasfotografia19/ncfotografia",
      {
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "NC-Fotografia-AI-Resolver"
        }
      }
    );

    const repoData = await repoResponse.json();

    if (!repoResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          step: "repository_access",
          githubStatus: repoResponse.status,
          error: repoData
        }),
        {
          status: repoResponse.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: "GitHub puede acceder al repositorio correctamente.",
        repository: repoData.full_name,
        private: repoData.private,
        defaultBranch: repoData.default_branch,
        permissions: {
          contents: repoData.permissions?.push,
          pullRequests: repoData.permissions?.admin
        }
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
