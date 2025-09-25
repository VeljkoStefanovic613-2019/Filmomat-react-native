import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { icons } from "@/constants/icons";
import { fetchMovieDetails, fetchVidSrcStreamingLinks, StreamingSource } from "@/services/api";
import useFetch from "@/services/useFetch";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">{value || "N/A"}</Text>
  </View>
);

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [streamModalVisible, setStreamModalVisible] = useState(false);
  const [streamingLinks, setStreamingLinks] = useState<StreamingSource[]>([]);
  const [loadingStream, setLoadingStream] = useState(false);
  const [selectedSource, setSelectedSource] = useState<StreamingSource | null>(null);

  const { data: movie, loading } = useFetch(() => fetchMovieDetails(id as string));

  const handleWatchMovie = async () => {
    if (!movie?.id) return;

    setLoadingStream(true);
    try {
      const links = await fetchVidSrcStreamingLinks(movie.id, "movie");
      setStreamingLinks(links);

      if (links.length === 1) {
        openStream(links[0]);
      } else {
        setStreamModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching streaming links:", error);
      Alert.alert(
        "Streaming Error",
        "Unable to load streaming sources. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setLoadingStream(false);
    }
  };

  const openStream = (source: StreamingSource) => {
    setSelectedSource(source);
    setStreamModalVisible(false);
  };

  const closeStream = () => setSelectedSource(null);

  const openInBrowser = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Movie Poster and Play Button */}
        <View>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}` }}
            className="w-full h-[550px]"
            resizeMode="cover"
          />
          <TouchableOpacity
            className="absolute bottom-5 right-5 rounded-full size-14 bg-white flex items-center justify-center"
            onPress={handleWatchMovie}
            disabled={loadingStream}
          >
            {loadingStream ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Image source={icons.play} className="w-6 h-7 ml-1" resizeMode="stretch" />
            )}
          </TouchableOpacity>
        </View>

        {/* Movie Details */}
        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie?.title}</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">{movie?.release_date?.split("-")[0]} • </Text>
            <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />
            <Text className="text-white font-bold text-sm">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>
            <Text className="text-light-200 text-sm">({movie?.vote_count} votes)</Text>
          </View>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo label="Genres" value={movie?.genres?.map(g => g.name).join(" • ") || "N/A"} />

          <View className="flex flex-row justify-between w-1/2">
            <MovieInfo label="Budget" value={`$${(movie?.budget ?? 0) / 1_000_000} million`} />
            <MovieInfo label="Revenue" value={`$${Math.round((movie?.revenue ?? 0) / 1_000_000)} million`} />
          </View>

          <MovieInfo
            label="Production Companies"
            value={movie?.production_companies?.map(c => c.name).join(" • ") || "N/A"}
          />
        </View>
      </ScrollView>

      {/* Streaming Sources Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={streamModalVisible}
        onRequestClose={() => setStreamModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setStreamModalVisible(false)}>
          <View className="flex-1 justify-end bg-black/50">
            <TouchableWithoutFeedback>
              <SafeAreaView edges={["bottom"]} className="bg-dark-100 rounded-t-3xl p-5 max-h-1/2">
                <Text className="text-white font-bold text-lg mb-4 text-center">
                  Select Streaming Source
                </Text>
                <ScrollView>
                  {streamingLinks.length > 0 ? (
                    streamingLinks.map((source, index) => (
                      <TouchableOpacity
                        key={index}
                        className="bg-primary p-4 rounded-lg mb-2"
                        onPress={() => openStream(source)}
                      >
                        <Text className="text-white font-semibold">
                          {source.name} - {source.quality}
                        </Text>
                        <TouchableOpacity onPress={() => openInBrowser(source.url)} className="mt-2">
                          <Text className="text-light-200 text-xs">Open in browser instead</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text className="text-light-200 text-center">No streaming sources available</Text>
                  )}
                </ScrollView>
              </SafeAreaView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Video Player Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={!!selectedSource}
        onRequestClose={closeStream}
        supportedOrientations={["landscape", "portrait"]}
      >
        <SafeAreaView edges={["bottom"]} className="flex-1 bg-black">
          <TouchableOpacity
            className="absolute top-5 right-5 z-10 bg-dark-100 rounded-full p-2"
            onPress={closeStream}
          >
            <Image source={icons.close} className="size-5 rotate-90" tintColor="#fff" />
          </TouchableOpacity>

          {selectedSource && (
            <WebView
              source={{ uri: selectedSource.url }}
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
              onError={({ nativeEvent }) => {
                console.warn("WebView error: ", nativeEvent);
                Alert.alert(
                  "Playback Error",
                  "Failed to load video. Try another source or open in browser.",
                  [
                    {
                      text: "Try Another",
                      onPress: () => {
                        closeStream();
                        setStreamModalVisible(true);
                      },
                    },
                    { text: "Open in Browser", onPress: () => openInBrowser(selectedSource.url) },
                    { text: "Cancel", style: "cancel" },
                  ]
                );
              }}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Go Back Button */}
      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        style={{ marginBottom: Platform.OS === "android" ? 30 : 0 }}
        onPress={router.back}
      >
        <Image source={icons.arrow} className="size-5 mr-1 mt-0.5 rotate-180" tintColor="#fff" />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Details;
