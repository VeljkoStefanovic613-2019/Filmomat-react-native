import MovieCard from '@/components/MovieCard';
import { useUser } from '@/contexts/UserContext';
import { getSavedMovies } from '@/services/appwrite';
import useFetch from '@/services/useFetch';
import React from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

const SavedScreen = () => {
  const { user } = useUser();

  const { data: savedMovies, loading, refetch } = useFetch(
    () => user ? getSavedMovies() : Promise.resolve([])
  );

  if (!user) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <Text className="text-white text-lg">Please log in to view saved movies</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <View className="flex-1 px-5 pt-5">
        <Text className="text-white text-2xl font-bold mb-4">Saved Movies</Text>
        
        {savedMovies && savedMovies.length > 0 ? (
          <FlatList 
            data={savedMovies}
            renderItem={({ item }) => (
              <MovieCard 
                id={item.movie_id} // TMDB movie ID
                title={item.title}
                poster_path={item.poster_url ? item.poster_url.replace('https://image.tmdb.org/t/p/w500', '') : ''}
                overview={item.overview}
                release_date={item.release_date}
                vote_average={item.vote_average}
              />
            )}
            keyExtractor={(item, index) => item.$id ?? index.toString()} // fallback if $id missing
            numColumns={3}
            columnWrapperStyle={{
              justifyContent: 'flex-start',
              gap: 16,
              paddingRight: 5,
              marginBottom: 10
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-light-200 text-lg">No saved movies yet</Text>
            <Text className="text-light-200 text-sm mt-2">
              Start saving movies by clicking the heart icon
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SavedScreen;
