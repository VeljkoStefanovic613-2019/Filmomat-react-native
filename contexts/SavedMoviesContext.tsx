// contexts/SavedMoviesContext.tsx
import { SavedMovie, getSavedMovies } from '@/services/appwrite';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';

interface SavedMoviesContextType {
  savedMovies: SavedMovie[];
  loading: boolean;
  refetch: () => Promise<void>;
  isMovieSaved: (movieId: number) => boolean;
}

const SavedMoviesContext = createContext<SavedMoviesContextType | undefined>(undefined);

export const SavedMoviesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedMovies = async () => {
    if (!user) {
      setSavedMovies([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const movies = await getSavedMovies();
      setSavedMovies(movies);
    } catch (error) {
      console.error('Error fetching saved movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedMovies();
  }, [user]);

  const isMovieSaved = (movieId: number) => {
    return savedMovies.some(movie => movie.movie_id === movieId);
  };

  return (
    <SavedMoviesContext.Provider value={{
      savedMovies,
      loading,
      refetch: fetchSavedMovies,
      isMovieSaved
    }}>
      {children}
    </SavedMoviesContext.Provider>
  );
};

export const useSavedMovies = () => {
  const context = useContext(SavedMoviesContext);
  if (!context) throw new Error('useSavedMovies must be used within SavedMoviesProvider');
  return context;
};