import { Tabs } from 'expo-router';

export default function BottomTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false}}>
      <Tabs.Screen name = "Dashboard" />
      <Tabs.Screen name = "Notifications" />
      <Tabs.Screen name = "Profile" />
    </Tabs>
  );
}