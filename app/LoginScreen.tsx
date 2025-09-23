import { useUser } from "@/contexts/UserContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen = () => {
  const router = useRouter();
  const { login, isLoading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(email, password);
      router.replace("/(tabs)/profile");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "An error occurred during login");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleBackToHome = () => {
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-primary px-6 justify-center">
          {/* Back to Home Button */}
          <TouchableOpacity
            onPress={handleBackToHome}
            className="absolute top-12 left-6 z-10"
          >
            <Text className="text-accent text-lg font-semibold">← Back to Home</Text>
          </TouchableOpacity>

          <Text className="text-white text-3xl font-bold mb-8 text-center">
            Login
          </Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-dark-200 text-white p-4 rounded-lg mb-4 border border-dark-300"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="bg-dark-200 text-white p-4 rounded-lg mb-6 border border-dark-300"
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading || isLoggingIn}
            className="bg-accent py-4 rounded-lg mb-4"
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading || isLoggingIn ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/RegisterScreen")}
            className="mt-4"
          >
            <Text className="text-light-200 text-center text-base">
              Don&apos;t have an account?{" "}
              <Text className="text-accent font-semibold">Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
