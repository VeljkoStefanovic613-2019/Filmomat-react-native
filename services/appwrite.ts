import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client, Databases, ID, Query } from "react-native-appwrite";

// ENV
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const TRENDING_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const SAVED_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_COLLECTION_ID!;

// Appwrite client
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

// --- Helper: anonymous device ID ---
const getDeviceId = async (): Promise<string> => {
  let deviceId = await AsyncStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = ID.unique();
    await AsyncStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};

// ---------------- TRENDING MOVIES ----------------
export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, TRENDING_COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        TRENDING_COLLECTION_ID,
        existingMovie.$id,
        { count: existingMovie.count + 1 }
      );
    } else {
      await database.createDocument(DATABASE_ID, TRENDING_COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        title: movie.title,
        count: 1,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, TRENDING_COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);
    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return undefined;
  }
};



// ---------------- SAVED MOVIES ----------------
export const saveMovie = async (movie: any) => {
  try {
    const deviceId = await getDeviceId();

    const existing = await database.listDocuments(DATABASE_ID, SAVED_COLLECTION_ID, [
      Query.equal("deviceId", deviceId),
      Query.equal("movie_id", movie.id),
    ]);

    if (existing.documents.length > 0) return;

    await database.createDocument(DATABASE_ID, SAVED_COLLECTION_ID, ID.unique(), {
      deviceId,
      movie_id: movie.id,
      title: movie.title,
      poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      overview: movie.overview,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving movie:", error);
    throw error;
  }
};

export const unsaveMovie = async (movieId: number) => {
  try {
    const deviceId = await getDeviceId();

    const result = await database.listDocuments(DATABASE_ID, SAVED_COLLECTION_ID, [
      Query.equal("deviceId", deviceId),
      Query.equal("movie_id", movieId),
    ]);

    if (result.documents.length > 0) {
      await database.deleteDocument(DATABASE_ID, SAVED_COLLECTION_ID, result.documents[0].$id);
    }
  } catch (error) {
    console.error("Error unsaving movie:", error);
    throw error;
  }
};

export const getSavedMovies = async (): Promise<any[]> => {
  try {
    const deviceId = await getDeviceId();

    const result = await database.listDocuments(DATABASE_ID, SAVED_COLLECTION_ID, [
      Query.equal("deviceId", deviceId),
      Query.orderDesc("savedAt"),
    ]);

    return result.documents.map((doc) => ({
      id: doc.movie_id,
      title: doc.title,
      poster_url: doc.poster_url,
      overview: doc.overview,
      release_date: doc.release_date,
      vote_average: doc.vote_average,
      savedAt: doc.savedAt,
    }));
  } catch (error) {
    console.error("Error fetching saved movies:", error);
    throw error;
  }
};

export const isMovieSaved = async (movieId: number): Promise<boolean> => {
  try {
    const deviceId = await getDeviceId();

    const result = await database.listDocuments(DATABASE_ID, SAVED_COLLECTION_ID, [
      Query.equal("deviceId", deviceId),
      Query.equal("movie_id", movieId),
    ]);

    return result.documents.length > 0;
  } catch (error) {
    console.error("Error checking if movie is saved:", error);
    return false;
  }
};