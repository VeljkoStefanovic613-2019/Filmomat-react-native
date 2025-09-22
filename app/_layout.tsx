import { UserProvider } from '@/contexts/UserContext';
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import './globals.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar hidden={true} />
      <UserProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
        </Stack>
      </UserProvider>
    </>
  );
}