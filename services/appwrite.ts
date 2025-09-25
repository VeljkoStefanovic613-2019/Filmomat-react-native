import * as Device from "expo-device";
import { Account, Client, Databases, ID, Models, Permission, Query } from "react-native-appwrite";

// ENV variables
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const TRENDING_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const SAVED_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_COLLECTION_ID!;

// Appwrite client
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);
const databases = new Databases(client);

// ---------------- TYPES ----------------
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
}

export interface TrendingMovie extends Models.Document {
  searchTerm: string;
  movie_id: number;
  title: string;
  count: number;
  poster_url: string | null;
}

export interface SavedMovie extends Models.Document {
  userId: string;
  movie_id: number;
  title: string;
  poster_url: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  savedAt: string;
  deviceId: string;
}

// ---------------- HELPER ----------------
const getUserId = async (): Promise<string> => {
  try {
    const user = await account.get();
    return user.$id;
  } catch (error) {
    console.error("Error getting user ID:", error);
    throw new Error("User not authenticated");
  }
};

// ---------------- REAL-TIME SUBSCRIPTIONS ----------------
interface SavedMoviePayload {
  userId: string;
  movie_id: number;
  title: string;
  poster_url: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  savedAt: string;
  deviceId: string;
}

export const subscribeToUserSavedMovies = (
  userId: string,
  callback: (payload: SavedMoviePayload) => void
): (() => void) => {
  const unsubscribe = client.subscribe(
    `databases.${DATABASE_ID}.collections.${SAVED_COLLECTION_ID}.documents`,
    (response) => {
      const payload = response.payload as SavedMoviePayload; // type assertion
      if (payload.userId === userId) {
        callback(payload);
      }
    }
  );

  return unsubscribe;
};


// ---------------- TRENDING MOVIES ----------------
export const updateSearchCount = async (query: string, movie: Movie): Promise<void> => {
  try {
    const result = await databases.listDocuments(DATABASE_ID, TRENDING_COLLECTION_ID, [
      Query.equal("searchTerm", query.toLowerCase().trim()),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await databases.updateDocument(
        DATABASE_ID,
        TRENDING_COLLECTION_ID,
        existingMovie.$id,
        { count: existingMovie.count + 1 }
      );
    } else {
      await databases.createDocument(
        DATABASE_ID,
        TRENDING_COLLECTION_ID,
        ID.unique(),
        {
          searchTerm: query.toLowerCase().trim(),
          movie_id: movie.id,
          title: movie.title,
          count: 1,
          poster_url: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
        }
      );
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[]> => {
  try {
    const result = await databases.listDocuments(DATABASE_ID, TRENDING_COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents.map(doc => ({
      $id: doc.$id,
      $collectionId: doc.$collectionId,
      $databaseId: doc.$databaseId,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
      $permissions: doc.$permissions,
      searchTerm: doc.searchTerm as string,
      movie_id: doc.movie_id as number,
      title: doc.title as string,
      count: doc.count as number,
      poster_url: doc.poster_url as string | null,
    })) as TrendingMovie[];
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};

// ---------------- SAVED MOVIES ----------------
export const saveMovie = async (movie: Movie): Promise<void> => {
  try {
    const userId = await getUserId();

    // Check if movie is already saved
    const existing = await databases.listDocuments(DATABASE_ID, SAVED_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.equal("movie_id", movie.id),
    ]);

    if (existing.documents.length > 0) {
      console.log("Movie already saved");
      return;
    }

    const deviceId = Device.osInternalBuildId || "unknown";

    await databases.createDocument(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        movie_id: movie.id,
        title: movie.title,
        poster_url: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        overview: movie.overview,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        savedAt: new Date().toISOString(),
        deviceId, // required by collection
      },
      [
        Permission.read(`user:${userId}`),
        Permission.update(`user:${userId}`),
        Permission.delete(`user:${userId}`),
      ]
    );
  } catch (error) {
    console.error("Error saving movie:", error);
    throw error;
  }
};

export const unsaveMovie = async (movieId: number): Promise<void> => {
  try {
    const userId = await getUserId();

    const result = await databases.listDocuments(DATABASE_ID, SAVED_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.equal("movie_id", movieId),
    ]);

    if (result.documents.length > 0) {
      await databases.deleteDocument(DATABASE_ID, SAVED_COLLECTION_ID, result.documents[0].$id);
    }
  } catch (error) {
    console.error("Error unsaving movie:", error);
    throw error;
  }
};

export const getSavedMovies = async (): Promise<SavedMovie[]> => {
  try {
    const userId = await getUserId();

    const result = await databases.listDocuments(DATABASE_ID, SAVED_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.orderDesc("savedAt"),
    ]);

    return result.documents.map(doc => ({
      $id: doc.$id,
      $collectionId: doc.$collectionId,
      $databaseId: doc.$databaseId,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
      $permissions: doc.$permissions,
      userId: doc.userId as string,
      movie_id: doc.movie_id as number,
      title: doc.title as string,
      poster_url: doc.poster_url as string | null,
      overview: doc.overview as string,
      release_date: doc.release_date as string,
      vote_average: doc.vote_average as number,
      savedAt: doc.savedAt as string,
      deviceId: doc.deviceId as string,
    })) as SavedMovie[];
  } catch (error) {
    console.error("Error fetching saved movies:", error);
    throw error;
  }
};

export const isMovieSaved = async (movieId: number): Promise<boolean> => {
  try {
    const userId = await getUserId();

    const result = await databases.listDocuments(DATABASE_ID, SAVED_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.equal("movie_id", movieId),
    ]);

    return result.documents.length > 0;
  } catch (error) {
    console.error("Error checking if movie is saved:", error);
    return false;
  }
};

// ---------------- AUTH FUNCTIONS ----------------
export const registerUser = async (email: string, password: string, name: string): Promise<Models.User<Models.Preferences>> => {
  try {
    const userId = ID.unique();
    const user = await account.create(userId, email, password, name);
    return user;
  } catch (error: any) {
    console.error("Error registering user:", error);
    throw new Error(error.message || "Failed to register user");
  }
};

export const loginUser = async (email: string, password: string): Promise<Models.User<Models.Preferences>> => {
  try {
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    return user;
  } catch (error: any) {
    console.error("Error logging in:", error);
    throw new Error(error.message || "Failed to login");
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await account.deleteSession("current");
  } catch (error: any) {
    console.error("Error logging out:", error);
    throw new Error(error.message || "Failed to logout");
  }
};

export const getCurrentUser = async (): Promise<Models.User<Models.Preferences> | null> => {
  try {
    return await account.get();
  } catch (error) {
    return null;
  }
};