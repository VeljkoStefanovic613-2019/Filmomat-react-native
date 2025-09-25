import { useUser } from '@/contexts/UserContext';
import { getSavedMovies, SavedMovie, subscribeToUserSavedMovies } from '@/services/appwrite';
import { useCallback, useEffect, useState } from 'react';

export const useSavedMovies = () => {
  const { user } = useUser();
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSavedMovies = useCallback(async () => {
    if (!user) {
      setSavedMovies([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const movies = await getSavedMovies();
      setSavedMovies(movies);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch saved movies'));
      console.error('Error fetching saved movies:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Handle real-time updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserSavedMovies(user.$id, (response) => {
      // Refetch data when changes occur
      console.log('Real-time update received:', response);
      fetchSavedMovies();
    });

    return unsubscribe;
  }, [user, fetchSavedMovies]);

  // Initial fetch
  useEffect(() => {
    fetchSavedMovies();
  }, [fetchSavedMovies]);

  return {
    savedMovies,
    loading,
    error,
    refetch: fetchSavedMovies,
  };
};