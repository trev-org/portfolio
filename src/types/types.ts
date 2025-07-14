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
