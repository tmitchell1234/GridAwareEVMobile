import { Stack } from 'expo-router';

export default function DashOptionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="graphsec" />
      <Stack.Screen name="statusspeed" />
      <Stack.Screen name="timedisplay" />
      <Stack.Screen name="gridstatus" />
    </Stack>
  );
}
