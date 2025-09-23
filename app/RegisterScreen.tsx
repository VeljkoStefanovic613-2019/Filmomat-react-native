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

const RegisterScreen = () => {
  const router = useRouter();
  const { register, isLoading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsRegistering(true);
    try {
      await register(email, password, name);
      router.replace("/(tabs)/profile");
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.message || "An error occurred during registration"
      );
    } finally {
      setIsRegistering(false);
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
            Register
          </Text>

          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            className="bg-dark-200 text-white p-4 rounded-lg mb-4 border border-dark-300"
          />

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
            placeholder="Password (min. 6 characters)"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="bg-dark-200 text-white p-4 rounded-lg mb-6 border border-dark-300"
          />

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading || isRegistering}
            className="bg-accent py-4 rounded-lg mb-4"
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading || isRegistering
                ? "Creating Account..."
                : "Register"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/LoginScreen")}
            className="mt-4"
          >
            <Text className="text-light-200 text-center text-base">
              Already have an account?{" "}
              <Text className="text-accent font-semibold">Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
