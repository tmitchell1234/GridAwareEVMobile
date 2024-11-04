import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons for better reporting icon options
import { LinearGradient } from 'expo-linear-gradient';

export default function BottomTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let IconComponent = Ionicons; // Default to Ionicons

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Reports') { // Change 'Notifications' to 'Reports'
            IconComponent = MaterialIcons; // Use MaterialIcons for report-related icons
            iconName = focused ? 'insert-chart' : 'insert-chart-outlined';
          } else if (route.name === 'Bluetooth') {
            iconName = focused ? 'bluetooth' : 'bluetooth-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <IconComponent name={iconName} size={size - 4} color={'white'} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: 'transparent',
          position: 'absolute',
          bottom: 0,
          left: 10,
          right: 10,
          elevation: 0,
          borderRadius: 12,
          height: 70, 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25,
          shadowRadius: 4.65,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#1c3faa', '#226bdf']}
            style={{
              borderRadius: 12,
              height: '100%',
              width: '100%',
            }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 4,
          color: 'white',
        },
      })}
    >
      <Tabs.Screen name="Dashboard" />
      <Tabs.Screen name="Reports" />
      <Tabs.Screen name="Bluetooth" />
      <Tabs.Screen name="Profile" />
    </Tabs>
  );
}
