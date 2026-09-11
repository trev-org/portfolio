import { History, SpotifyRecentlyPlayedItem } from "../types/types";

// Token cache to avoid unnecessary API calls
type TokenCache = {
  accessToken: string;
  expiresAt: number; // timestamp when the token expires
};

type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

let tokenCache: TokenCache | null = null;
let tokenRequest: Promise<string> | null = null;
let refreshToken = process.env.NEXT_PUBLIC_SPOTIFY_REFRESH_TOKEN;

/**
 * Gets a valid Spotify access token using the refresh token flow
 * @returns A valid access token
 */
export async function getSpotifyToken(): Promise<string> {
  // Check if we have a cached token that's still valid
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.accessToken;
  }

  // Reuse an in-flight refresh when multiple Spotify requests start together.
  if (!tokenRequest) {
    tokenRequest = refreshSpotifyToken().finally(() => {
      tokenRequest = null;
    });
  }

  return tokenRequest;
}

async function refreshSpotifyToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

  if (!clientId || !refreshToken) {
    throw new Error(
      "Missing NEXT_PUBLIC_SPOTIFY_CLIENT_ID or NEXT_PUBLIC_SPOTIFY_REFRESH_TOKEN"
    );
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    }).toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Spotify token refresh failed (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as SpotifyTokenResponse;

  if (!data.access_token || !data.expires_in) {
    throw new Error("Spotify returned an invalid token response");
  }

  // Spotify can rotate PKCE refresh tokens. Keep the newest one for this tab.
  refreshToken = data.refresh_token ?? refreshToken;

  tokenCache = {
    accessToken: data.access_token,
    // Set expiry time slightly before actual expiry to be safe.
    expiresAt: Date.now() + Math.max(data.expires_in - 60, 1) * 1000,
  };

  return data.access_token;
}

async function getSpotifyError(response: Response, action: string) {
  const errorText = await response.text();
  return new Error(
    `${action} (${response.status} ${response.statusText}): ${errorText}`
  );
}

export async function getMyRecentlyPlayed(limit = 20): Promise<History[]> {
  const token = await getSpotifyToken();

  const response = await fetch(
    `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw await getSpotifyError(response, "Failed to fetch recently played");
  }

  const data = (await response.json()) as {
    items: SpotifyRecentlyPlayedItem[];
  };

  return data.items.map(
    (item: SpotifyRecentlyPlayedItem): History => ({
      name: item.track.name,
      artist: item.track.artists[0].name,
      album: item.track.album.name,
      image: item.track.album.images[0]?.url,
      url: item.track.external_urls.spotify,
      played_at: item.played_at,
    })
  );
}

export async function getMyCurrentlyPlaying() {
  const token = await getSpotifyToken();

  const response = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw await getSpotifyError(response, "Failed to fetch currently playing");
  }

  const data = await response.json();

  if (!data.item?.album || !data.item?.artists?.length) {
    return null;
  }

  return {
    name: data.item.name,
    artist: data.item.artists[0].name,
    album: data.item.album.name,
    image: data.item.album.images[0].url,
    url: data.item.external_urls.spotify,
    progress_ms: data.progress_ms,
    duration_ms: data.item.duration_ms,
    is_playing: data.is_playing,
  };
}
