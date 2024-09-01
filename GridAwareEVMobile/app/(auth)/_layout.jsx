import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="log-in" />
      <Stack.Screen name="register" />
      <Stack.Screen name = "forgot" />
    </Stack>
  );
}
