import { History, SpotifyRecentlyPlayedItem } from "../types/types";

// Token cache to avoid unnecessary API calls
type TokenCache = {
  accessToken: string;
  expiresAt: number; // timestamp when the token expires
};

let tokenCache: TokenCache | null = null;

/**
 * Gets a valid Spotify access token using the refresh token flow
 * @returns A valid access token
 */
export async function getSpotifyToken(): Promise<string | null> {
  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
  const refresh_token = process.env.NEXT_PUBLIC_SPOTIFY_REFRESH_TOKEN;

  if (!client_id || !client_secret || !refresh_token) {
    console.error("Missing Spotify credentials or refresh token");
    return null;
  }

  // Check if we have a cached token that's still valid
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.accessToken;
  }

  // Otherwise get a new token using the refresh token
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${client_id}:${client_secret}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to refresh token: ${response.statusText}. ${errorText}`
      );
    }

    const data = await response.json();

    // Cache the token
    tokenCache = {
      accessToken: data.access_token,
      // Set expiry time slightly before actual expiry to be safe
      expiresAt: now + (data.expires_in - 60) * 1000,
    };

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing Spotify token:", error);
    return null;
  }
}

export async function getMyRecentlyPlayed() {
  try {
    const token = await getSpotifyToken();
    if (!token) return null;

    const response = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=10",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch recently played: ${response.statusText}. ${errorText}`
      );
    }

    const data = await response.json();

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
  } catch (error) {
    console.error("Error fetching recently played:", error);
    return null;
  }
}

export async function getMyCurrentlyPlaying() {
  try {
    const token = await getSpotifyToken();
    if (!token) return null;

    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch currently playing: ${response.statusText}. ${errorText}`
      );
    }

    const data = await response.json();

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
  } catch (error) {
    console.error("Error fetching currently playing:", error);
    return null;
  }
}
