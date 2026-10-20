export interface AlbumReview {
  id: number;
  name: string;
  artist: string;
  rating: number;
  cover: string;
  created_at: string;
}

export interface History {
  name: string;
  artist: string;
  album: string;
  image: string;
  url: string;
  played_at: string;
  trackId?: string;
  artistId?: string;
}

export interface WrittenArticleMetadata {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  draft: boolean;
}

export interface CurrentlyPlaying {
  name: string;
  artist: string;
  album: string;
  image: string;
  url: string;
  is_playing: boolean;
  progress_ms: number;
  duration_ms: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAlbum {
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyRecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

export type SpotifyTopTimeRange = "short_term" | "medium_term" | "long_term";

export interface SpotifyTopArtist {
  id: string;
  name: string;
  image: string;
  genres: string[];
  url: string;
}

export interface SpotifyTopTrack {
  id: string;
  name: string;
  artistId: string;
  artist: string;
  image: string;
  url: string;
}

export interface SpotifyArtistDetails {
  id: string;
  genres: string[];
  image: string;
}

export type StatsRange = "day" | "week" | "month" | "year";

export interface GenreScore {
  genre: string;
  score: number;
}

export interface StatsTopItem {
  name: string;
  artist?: string;
  detail?: string;
  image?: string;
  plays?: number;
  url?: string;
}

export interface ListeningStats {
  range: StatsRange;
  rangeLabel: string;
  note: string;
  topArtist: StatsTopItem | null;
  topSong: StatsTopItem | null;
  genres: GenreScore[];
}
