import {
  History,
  SpotifyArtistDetails,
  SpotifyRecentlyPlayedItem,
  SpotifyTopArtist,
  SpotifyTopTimeRange,
  SpotifyTopTrack,
} from "../types/types";

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

type ResponseCacheEntry = {
  value: unknown;
  expiresAt: number;
};

const inFlightRequests = new Map<string, Promise<unknown>>();
const responseCache = new Map<string, ResponseCacheEntry>();
const MAX_RECENT_PLAYS = 50;
const TOP_ITEMS_CACHE_TTL = 5 * 60 * 1000;
const ARTIST_DETAILS_CACHE_TTL = 30 * 60 * 1000;

/**
 * Shares identical in-flight requests. Stable Spotify data can also receive a
 * short memory TTL; errors are never cached.
 */
async function cachedSpotifyRequest<T>(
  key: string,
  ttlMs: number,
  request: () => Promise<T>
): Promise<T> {
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }
  if (cached) {
    responseCache.delete(key);
  }

  const pending = inFlightRequests.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  const promise = request()
    .then((value) => {
      if (ttlMs > 0) {
        responseCache.set(key, {
          value,
          expiresAt: Date.now() + ttlMs,
        });
      }
      return value;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, promise);
  return promise;
}

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
  const normalizedLimit = Math.min(
    Math.max(Math.floor(limit), 1),
    MAX_RECENT_PLAYS
  );
  const plays = await cachedSpotifyRequest(
    `recently-played:${MAX_RECENT_PLAYS}`,
    0,
    async () => {
      const token = await getSpotifyToken();
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/recently-played?limit=${MAX_RECENT_PLAYS}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw await getSpotifyError(
          response,
          "Failed to fetch recently played"
        );
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
          trackId: item.track.id,
          artistId: item.track.artists[0]?.id,
        })
      );
    }
  );

  return plays.slice(0, normalizedLimit);
}

/**
 * Fetches the user's top artists for a Spotify time range.
 * Requires the `user-top-read` scope.
 */
export async function getMyTopArtists(
  timeRange: SpotifyTopTimeRange = "short_term",
  limit = 50
): Promise<SpotifyTopArtist[]> {
  return cachedSpotifyRequest(
    `top-artists:${timeRange}:${limit}`,
    TOP_ITEMS_CACHE_TTL,
    async () => {
      const token = await getSpotifyToken();
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw await getSpotifyError(response, "Failed to fetch top artists");
      }

      const data = (await response.json()) as {
        items: Array<{
          id: string;
          name: string;
          images: Array<{ url: string }>;
          genres: string[];
          followers: { total: number };
          external_urls: { spotify: string };
        }>;
      };

      return data.items.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.images[0]?.url ?? "",
        genres: item.genres ?? [],
        followers: item.followers.total,
        url: item.external_urls.spotify,
      }));
    }
  );
}

/**
 * Fetches the user's top tracks for a Spotify time range.
 * Requires the `user-top-read` scope.
 */
export async function getMyTopTracks(
  timeRange: SpotifyTopTimeRange = "short_term",
  limit = 50
): Promise<SpotifyTopTrack[]> {
  return cachedSpotifyRequest(
    `top-tracks:${timeRange}:${limit}`,
    TOP_ITEMS_CACHE_TTL,
    async () => {
      const token = await getSpotifyToken();
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw await getSpotifyError(response, "Failed to fetch top tracks");
      }

      const data = (await response.json()) as {
        items: Array<{
          id: string;
          name: string;
          artists: Array<{ id: string; name: string }>;
          album: { images: Array<{ url: string }> };
          external_urls: { spotify: string };
        }>;
      };

      return data.items.map((item) => ({
        id: item.id,
        name: item.name,
        artistId: item.artists[0]?.id ?? "",
        artist: item.artists[0]?.name ?? "",
        image: item.album.images[0]?.url ?? "",
        url: item.external_urls.spotify,
      }));
    }
  );
}

/**
 * Fetches artist details (genres + images) for up to any number of artist ids.
 * Spotify allows 50 ids per request; this chunks larger lists.
 */
export async function getArtistDetailsByIds(
  ids: string[]
): Promise<Map<string, SpotifyArtistDetails>> {
  const uniqueIds = [...new Set(ids)].filter(Boolean).sort();
  if (uniqueIds.length === 0) {
    return new Map();
  }

  return cachedSpotifyRequest(
    `artist-details:${uniqueIds.join(",")}`,
    ARTIST_DETAILS_CACHE_TTL,
    async () => {
      const token = await getSpotifyToken();
      const details = new Map<string, SpotifyArtistDetails>();

      for (let i = 0; i < uniqueIds.length; i += 50) {
        const chunk = uniqueIds.slice(i, i + 50);
        const response = await fetch(
          `https://api.spotify.com/v1/artists?ids=${chunk.join(",")}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw await getSpotifyError(
            response,
            "Failed to fetch artist details"
          );
        }

        const data = (await response.json()) as {
          artists: Array<{
            id: string;
            genres: string[];
            images: Array<{ url: string }>;
          }>;
        };

        for (const artist of data.artists) {
          if (!artist) continue;
          details.set(artist.id, {
            id: artist.id,
            genres: artist.genres ?? [],
            image: artist.images[0]?.url ?? "",
          });
        }
      }

      return details;
    }
  );
}

export async function getMyCurrentlyPlaying() {
  return cachedSpotifyRequest("currently-playing", 0, async () => {
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
      throw await getSpotifyError(
        response,
        "Failed to fetch currently playing"
      );
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
  });
}
