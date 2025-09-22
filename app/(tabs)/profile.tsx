import { icons } from "@/constants/icons";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const router = useRouter();
  const { user, logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView className="bg-primary flex-1 px-10">
      <View className="flex justify-center items-center flex-1 flex-col gap-5">
        <Image source={icons.person} className="size-20" tintColor="#fff" />
        
        {user ? (
          <>
            <Text className="text-white text-xl font-bold">{user.name || user.email}</Text>
            <Text className="text-light-200 text-base">{user.email}</Text>
            
            <TouchableOpacity 
              className="bg-accent rounded-lg py-3 px-6 mt-5"
              onPress={() => router.push('/saved')}
            >
              <Text className="text-white font-semibold">View Saved Movies</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-red-500 rounded-lg py-3 px-6 mt-3"
              onPress={handleLogout}
            >
              <Text className="text-white font-semibold">Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-gray-500 text-base">Please log in</Text>
            <TouchableOpacity 
              className="bg-accent rounded-lg py-3 px-6 mt-5"
              onPress={() => router.push('/')}
            >
              <Text className="text-white font-semibold">Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Profile;