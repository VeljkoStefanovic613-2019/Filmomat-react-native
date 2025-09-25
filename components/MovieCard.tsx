import { icons } from '@/constants/icons';
import { useUser } from '@/contexts/UserContext';
import { isMovieSaved, saveMovie, unsaveMovie } from '@/services/appwrite';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';


interface MovieCardProps {
  id: number;
  title: string;
  poster_path: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  id, 
  title, 
  poster_path, 
  overview = '',
  release_date = '',
  vote_average = 0
}) => {
  const router = useRouter();
  const { user } = useUser();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [id, user]);

  const checkIfSaved = async () => {
    if (!user) {
      setSaved(false);
      return;
    }

    try {
      const isSaved = await isMovieSaved(id);
      setSaved(isSaved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSavePress = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to save movies');
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        await unsaveMovie(id);
        setSaved(false);
      } else {
        await saveMovie({
          id,
          title,
          poster_path,
          overview,
          release_date,
          vote_average,
          
        });
        setSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      Alert.alert('Error', 'Failed to save movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-[100px] mb-4">
      <TouchableOpacity 
        onPress={() => router.push(`/movies/${id}`)} 
        className="relative"
      >
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${poster_path}` }}
          className="w-full h-[150px] rounded-lg"
          resizeMode="cover"
        />
        <TouchableOpacity
          onPress={handleSavePress}
          disabled={loading}
          className="absolute -top-1 right-1 bg-dark-100/80 rounded-full p-1"
        >
          <Image
            source={saved ? icons.heartFilled : icons.heartOutline}
            className="w-6 h-6"
            tintColor={saved ? "#ff0000" : "#ffffff"}
          />
        </TouchableOpacity>
      </TouchableOpacity>
      <Text 
        className="text-white text-xs mt-2 font-semibold" 
        numberOfLines={2}
      >
        {title}
      </Text>
    </View>
  );
};

export default MovieCard;