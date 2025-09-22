export interface StreamingSource {
  name: string;
  quality: string;
  url: string;
  type: string;
}

export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
  },
};

export const fetchMovies = async ({
  query,
}: {
  query: string;
}): Promise<Movie[]> => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
};

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

// Alternative streaming APIs to try as fallbacks
const STREAMING_APIS = [

  {
    name: "VidSrc XYZ",
    url: (id: string, type: string) => `https://vidsrc.xyz/embed/${type}/${id}`,
    requiresProcessing: false
  },
  {
    name: "VidSrc TO",
    url: (id: string, type: string) => `https://vidsrc.to/embed/${type}/${id}`,
    requiresProcessing: false
  },
  {
    name: "2Embed",
    url: (id: string, type: string) => `https://www.2embed.cc/embed/${id}`,
    requiresProcessing: false
  },
  {
    name: "SuperEmbed",
    url: (id: string, type: string) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    requiresProcessing: false
  }
];

export const fetchVidSrcStreamingLinks = async (
  id: string | number, 
  type: string = 'movie'
): Promise<StreamingSource[]> => {
  try {
    // Try multiple streaming APIs with fallbacks
    const sources: StreamingSource[] = [];
    
    for (const api of STREAMING_APIS) {
      try {
        // For direct embedding sources
        sources.push({
          name: api.name,
          quality: 'HD',
          url: api.url(id.toString(), type),
          type: 'embed'
        });
      } catch (error) {
        console.warn(`Failed to process ${api.name}:`, error);
      }
    }
    
    // Add direct VidSrc as a fallback
    sources.push({
      name: 'VidSrc Default',
      quality: 'HD',
      url: `https://vidsrc.in/embed/${type}/${id}`,
      type: 'embed'
    });
    
    return sources;
  } catch (error) {
    console.error('Error fetching streaming links:', error);
    
    // Fallback to direct embedding if all APIs fail
    return [{
      name: 'VidSrc Fallback',
      quality: 'HD',
      url: `https://vidsrc.in/embed/${type}/${id}`,
      type: 'embed'
    }];
  }
};

// Function to test if a URL is accessible
const testUrlAccessibility = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};