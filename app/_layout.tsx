import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { AuthProvider } from "@/context/AuthProvider";

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}></Stack>
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  }
});
