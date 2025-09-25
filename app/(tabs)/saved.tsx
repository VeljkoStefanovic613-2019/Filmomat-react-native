import MovieCard from '@/components/MovieCard';
import { useUser } from '@/contexts/UserContext';
import { useSavedMovies } from '@/services/useSavedMovies';
import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';

const SavedScreen = () => {
  const { user } = useUser();
  const { savedMovies, loading, error, refetch } = useSavedMovies();

  const handleSaveChange = (movieId: number, saved: boolean) => {
    // This callback can be used for additional actions when save state changes
    console.log(`Movie ${movieId} ${saved ? 'saved' : 'unsaved'}`);
  };

  if (!user) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <Text className="text-white text-lg">Please log in to view saved movies</Text>
      </View>
    );
  }

  if (loading && !savedMovies.length) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-2">Loading saved movies...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <Text className="text-white text-lg">Error loading saved movies</Text>
        <Text className="text-light-200 text-sm mt-2">{error.message}</Text>
        <TouchableOpacity 
          onPress={refetch}
          className="bg-secondary px-4 py-2 rounded-lg mt-4"
        >
          <Text className="text-white">Try Again</Text>
        </TouchableOpacity>
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
                id={item.movie_id}
                title={item.title}
                poster_path={item.poster_url ? item.poster_url.replace('https://image.tmdb.org/t/p/w500', '') : ''}
                overview={item.overview}
                release_date={item.release_date}
                vote_average={item.vote_average}
              />
            )}
            keyExtractor={(item) => item.$id}
            numColumns={3}
            columnWrapperStyle={{
              justifyContent: 'flex-start',
              gap: 16,
              paddingRight: 5,
              marginBottom: 10
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl 
                refreshing={loading && useSavedMovies.length > 0}
                onRefresh={refetch}
                tintColor="#fff"
                colors={["#fff"]}
              />
            }
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-light-200 text-lg">No saved movies yet</Text>
            <Text className="text-light-200 text-sm mt-2 text-center">
              Start saving movies by clicking the{'\n'}heart icon on any movie
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SavedScreen;