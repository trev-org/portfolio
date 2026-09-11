import { createHash, randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { createInterface } from "node:readline/promises";

const clientId =
  process.argv[2] ||
  process.env.SPOTIFY_CLIENT_ID ||
  process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const host = "127.0.0.1";
const port = 4381;
const redirectUri = `http://${host}:${port}/callback`;
const scopes = [
  "user-read-currently-playing",
  "user-read-recently-played",
];

if (!clientId) {
  console.error(
    "Add NEXT_PUBLIC_SPOTIFY_CLIENT_ID to .env.local or pass it to this command."
  );
  process.exit(1);
}

const codeVerifier = randomBytes(64).toString("base64url");
const codeChallenge = createHash("sha256")
  .update(codeVerifier)
  .digest("base64url");
const state = randomBytes(16).toString("hex");

const authorizationUrl = new URL("https://accounts.spotify.com/authorize");
authorizationUrl.search = new URLSearchParams({
  client_id: clientId,
  response_type: "code",
  redirect_uri: redirectUri,
  scope: scopes.join(" "),
  code_challenge_method: "S256",
  code_challenge: codeChallenge,
  state,
  show_dialog: "true",
}).toString();

const server = createServer(async (request, response) => {
  const callbackUrl = new URL(request.url ?? "/", redirectUri);

  if (callbackUrl.pathname !== "/callback") {
    response.writeHead(404).end("Not found");
    return;
  }

  const returnedState = callbackUrl.searchParams.get("state");
  const authorizationCode = callbackUrl.searchParams.get("code");
  const authorizationError = callbackUrl.searchParams.get("error");

  if (authorizationError || returnedState !== state || !authorizationCode) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end(
      authorizationError
        ? `Spotify authorization failed: ${authorizationError}`
        : "Spotify authorization returned an invalid callback."
    );
    server.close();
    return;
  }

  try {
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: "authorization_code",
          code: authorizationCode,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      }
    );
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.refresh_token) {
      throw new Error(
        tokenData.error_description ??
          tokenData.error ??
          "Spotify did not return a refresh token."
      );
    }

    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(
      "<h1>Spotify connected</h1><p>You can close this tab and return to the terminal.</p>"
    );

    console.log("\nAdd these values to .env.local:\n");
    console.log(`NEXT_PUBLIC_SPOTIFY_CLIENT_ID=${clientId}`);
    console.log(
      `NEXT_PUBLIC_SPOTIFY_REFRESH_TOKEN=${tokenData.refresh_token}\n`
    );
    console.log("Then restart the dev server.");
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.end("Could not exchange the Spotify authorization code.");
    console.error(
      error instanceof Error ? error.message : "Spotify authorization failed."
    );
  } finally {
    server.close();
  }
});

server.on("error", (error) => {
  console.error(`Could not start the callback server: ${error.message}`);
  process.exit(1);
});

server.listen(port, host, async () => {
  const terminal = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\nIn your Spotify app settings, add this redirect URI:");
  console.log(`  ${redirectUri}\n`);
  await terminal.question("Press Enter after saving the redirect URI...");
  terminal.close();

  execFile("open", [authorizationUrl.toString()], (error) => {
    if (error) {
      console.log("\nOpen this URL manually:\n");
      console.log(authorizationUrl.toString());
    }
  });
});
