import { Stack } from 'expo-router';

export default function DashOptionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="graphsec" />
      <Stack.Screen name="frequencygraph" />
      <Stack.Screen name="voltage" />
      <Stack.Screen name="gridstatus" />
    </Stack>
  );
}
