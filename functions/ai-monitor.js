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

    // =====================================================
    // 1. Crear JWT
    // =====================================================

    const jwt = await createGitHubJWT(
      appId,
      privateKey
    );

    // =====================================================
    // 2. Buscar instalación
    // =====================================================

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
          step: "find_installation",
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

    // =====================================================
    // 3. Crear token de instalación
    // =====================================================

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

    const repo =
      "nicolasfotografia19/ncfotografia";

    const branch =
      "ai-test";

    // =====================================================
    // 4. Comprobar que ai-test existe
    // =====================================================

    const branchResponse = await fetch(
      `https://api.github.com/repos/${repo}/git/ref/heads/${branch}`,
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
          step: "get_ai_test_branch",
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

    // =====================================================
    // 5. Crear archivo de prueba / commit
    // =====================================================

    const testContent = `# NC Fotografia AI Resolver

Este archivo fue creado automáticamente.

Esta es una prueba controlada de:

- GitHub App
- creación de commits
- Pull Requests

No es una corrección real del sitio.
`;

    const encodedContent =
      btoa(unescape(encodeURIComponent(testContent)));

    // Primero comprobar si el archivo ya existe
    const existingFileResponse = await fetch(
      `https://api.github.com/repos/${repo}/contents/AI-TEST.md?ref=${branch}`,
      {
        headers: githubHeaders
      }
    );

    let existingFile = null;

    if (existingFileResponse.ok) {
      existingFile =
        await existingFileResponse.json();
    }

    const fileBody = {
      message:
        "test: prueba del NC Fotografia AI Resolver",
      content: encodedContent,
      branch
    };

    // Si el archivo ya existe, GitHub exige su SHA
    if (existingFile?.sha) {
      fileBody.sha = existingFile.sha;
    }

    const fileResponse = await fetch(
      `https://api.github.com/repos/${repo}/contents/AI-TEST.md`,
      {
        method: "PUT",
        headers: {
          ...githubHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(fileBody)
      }
    );

    const fileData =
      await fileResponse.json();

    if (!fileResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          step: "create_commit",
          githubStatus: fileResponse.status,
          error: fileData
        }),
        {
          status: fileResponse.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // =====================================================
    // 6. Buscar si ya existe un PR
    // =====================================================

    const pullsResponse = await fetch(
      `https://api.github.com/repos/${repo}/pulls?state=open&head=nicolasfotografia19:${branch}&base=main`,
      {
        headers: githubHeaders
      }
    );

    const pullsData =
      await pullsResponse.json();

    if (!pullsResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          step: "find_pull_request",
          githubStatus: pullsResponse.status,
          error: pullsData
        }),
        {
          status: pullsResponse.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // =====================================================
    // 7. Si ya existe PR, devolverlo
    // =====================================================

    if (pullsData.length > 0) {
      const existingPR = pullsData[0];

      return new Response(
        JSON.stringify(
          {
            ok: true,
            message:
              "Commit creado. Ya existe un Pull Request para esta rama.",

            branch,

            commit:
              fileData.commit?.sha || null,

            pullRequest: {
              number:
                existingPR.number,
              title:
                existingPR.title,
              url:
                existingPR.html_url
            },

            repository: repo,

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
    }

    // =====================================================
    // 8. Crear Pull Request
    // =====================================================

    const pullRequestResponse = await fetch(
      `https://api.github.com/repos/${repo}/pulls`,
      {
        method: "POST",
        headers: {
          ...githubHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title:
            "test: NC Fotografia AI Resolver",

          head:
            branch,

          base:
            "main",

          body:
            "## Prueba del NC Fotografia AI Resolver\n\n" +
            "Este Pull Request fue creado automáticamente para comprobar que la GitHub App puede:\n\n" +
            "- Crear una rama\n" +
            "- Crear un commit\n" +
            "- Crear un Pull Request\n\n" +
            "No contiene ninguna corrección real."
        })
      }
    );

    const pullRequestData =
      await pullRequestResponse.json();

    if (!pullRequestResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          step: "create_pull_request",
          githubStatus:
            pullRequestResponse.status,
          error: pullRequestData
        }),
        {
          status: pullRequestResponse.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // =====================================================
    // 9. ÉXITO
    // =====================================================

    return new Response(
      JSON.stringify(
        {
          ok: true,

          message:
            "¡GitHub App puede crear commits y Pull Requests!",

          branch,

          commit:
            fileData.commit?.sha || null,

          pullRequest: {
            number:
              pullRequestData.number,
            title:
              pullRequestData.title,
            url:
              pullRequestData.html_url
          },

          repository: repo,

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
