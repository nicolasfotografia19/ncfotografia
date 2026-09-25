const GITHUB_OWNER = "nicolasfotografia19";
const GITHUB_REPO = "ncfotografia";
const GITHUB_BRANCH = "main";
const GITHUB_INSTALLATION_ID = "164623831";

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

  const unsignedToken =
    `${stringToBase64Url(JSON.stringify(header))}.${stringToBase64Url(JSON.stringify(payload))}`;

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

async function createInstallationToken(env) {
  const jwt = await createGitHubJWT(
    env.GITHUB_APP_ID,
    env.GITHUB_PRIVATE_KEY
  );

  const response = await fetch(
    `https://api.github.com/app/installations/${GITHUB_INSTALLATION_ID}/access_tokens`,
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

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `GitHub no pudo crear el installation token: ${text}`
    );
  }

  const data = JSON.parse(text);

  return data.token;
}

async function listGitHubContents(token) {
  const url =
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/?ref=${GITHUB_BRANCH}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "NC-Fotografia-AI-Resolver"
    }
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `GitHub no pudo listar el repositorio: ${text}`
    );
  }

  return JSON.parse(text);
}

function renderFiles(items) {
  if (!Array.isArray(items)) {
    return "<p>No se recibieron archivos.</p>";
  }

  const files = items
    .map(item => {
      const icon = item.type === "dir" ? "📁" : "📄";

      return `
        <li>
          ${icon}
          <strong>${escapeHtml(item.path)}</strong>
          <small> (${escapeHtml(item.type)})</small>
        </li>
      `;
    })
    .join("");

  return `<ul>${files}</ul>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function onRequest(context) {
  try {
    if (context.request.method === "GET") {
      return new Response(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>NC Fotografía - GitHub Test</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 900px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.5;
            }

            button {
              padding: 12px 20px;
              font-size: 16px;
              cursor: pointer;
            }

            #resultado {
              margin-top: 25px;
              padding: 20px;
              background: #f5f5f5;
              border-radius: 8px;
              overflow-x: auto;
            }

            ul {
              padding-left: 25px;
            }

            li {
              margin: 8px 0;
            }

            .ok {
              color: green;
            }

            .error {
              color: red;
            }
          </style>
        </head>

        <body>
          <h1>NC Fotografía AI Resolver</h1>

          <p>
            Esta prueba solamente va a leer los archivos de
            <strong>${GITHUB_OWNER}/${GITHUB_REPO}</strong>.
          </p>

          <p>
            No crea ramas, commits ni Pull Requests.
          </p>

          <button onclick="probarGitHub()">
            🔍 Buscar archivos del repositorio
          </button>

          <div id="resultado">
            Esperando prueba...
          </div>

          <script>
            async function probarGitHub() {
              const resultado = document.getElementById("resultado");

              resultado.innerHTML = "⏳ Consultando GitHub...";

              try {
                const response = await fetch("", {
                  method: "POST"
                });

                const data = await response.json();

                if (!data.ok) {
                  resultado.innerHTML =
                    '<div class="error">❌ ' +
                    JSON.stringify(data, null, 2) +
                    '</div>';

                  return;
                }

                resultado.innerHTML =
                  '<div class="ok"><h2>✅ GitHub respondió correctamente</h2></div>' +
                  '<p><strong>Repositorio:</strong> ' +
                  data.repository +
                  '</p>' +
                  '<p><strong>Branch:</strong> ' +
                  data.branch +
                  '</p>' +
                  '<p><strong>Elementos encontrados:</strong> ' +
                  data.count +
                  '</p>' +
                  data.html;

              } catch (error) {
                resultado.innerHTML =
                  '<div class="error">❌ Error del navegador: ' +
                  error.message +
                  '</div>';
              }
            }
          </script>
        </body>
        </html>
      `, {
        headers: {
          "Content-Type": "text/html; charset=UTF-8"
        }
      });
    }

    if (context.request.method === "POST") {
      const token = await createInstallationToken(context.env);

      const items = await listGitHubContents(token);

      return new Response(
        JSON.stringify({
          ok: true,
          stage: "github-list",
          repository: `${GITHUB_OWNER}/${GITHUB_REPO}`,
          branch: GITHUB_BRANCH,
          count: items.length,
          files: items.map(item => ({
            name: item.name,
            path: item.path,
            type: item.type
          })),
          html: renderFiles(items)
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: false,
        error: "Método no permitido"
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        stage: "cloudflare",
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
