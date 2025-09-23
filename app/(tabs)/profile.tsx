import { icons } from "@/constants/icons";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const router = useRouter();
  const { user, isLoading, logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/LoginScreen");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-8">
          <Image 
            source={icons.person} 
            className="w-24 h-24 mb-4" 
            tintColor="#fff" 
          />
          
          {user ? (
            <>
              <Text className="text-white text-2xl font-bold mb-2">
                {user.name}
              </Text>
              <Text className="text-light-200 text-base">
                {user.email}
              </Text>
            </>
          ) : (
            <Text className="text-gray-400 text-lg">Please log in to continue</Text>
          )}
        </View>

        <View className="space-y-4 gap-5">
          {user ? (
            <>
              <TouchableOpacity
                className="bg-accent rounded-lg py-4 px-6"
                onPress={() => router.push("/saved")}
              >
                <Text className="text-white font-semibold text-center text-lg">
                  View Saved Movies
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-red-600 rounded-lg py-4 px-6"
                onPress={handleLogout}
              >
                <Text className="text-white font-semibold text-center text-lg">
                  Logout
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                className="bg-accent rounded-lg py-4 px-6"
                onPress={() => router.push("/LoginScreen")}
              >
                <Text className="text-white font-semibold text-center text-lg">
                  Login
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-dark-200 rounded-lg py-4 px-6 border border-dark-300"
                onPress={() => router.push("/RegisterScreen")}
              >
                <Text className="text-white font-semibold text-center text-lg">
                  Create Account
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;