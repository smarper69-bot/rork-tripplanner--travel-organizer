import { Tabs } from 'expo-router';
import { Home, Compass, Briefcase, User, Sparkles, Globe } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { hapticLight } from '@/utils/haptics';

export default function TabLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabInactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          minHeight: 56,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600' as const,
          marginTop: 2,
          paddingBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
      screenListeners={{
        tabPress: () => {
          hapticLight();
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Compass size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'My Trips',
          tabBarIcon: ({ color, size }) => <Briefcase size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="concierge"
        options={{
          title: 'Guide',
          tabBarIcon: ({ color, size }) => <Sparkles size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="globe"
        options={{
          title: 'Globe',
          tabBarIcon: ({ color, size }) => <Globe size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}
