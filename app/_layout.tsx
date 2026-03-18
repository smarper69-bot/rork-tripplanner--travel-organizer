import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useTripsStore } from "@/store/useTripsStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { StatusBar } from "expo-status-bar";
import { useIsDark } from "@/hooks/useThemeColors";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function useOnboardingRedirect() {
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const isLoading = useOnboardingStore((s) => s.isLoading);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === 'onboarding';
    const isPublicRoute = segments[0] === 'join' || segments[0] === 'shared' || segments[0] === 'invite';

    if (isPublicRoute) return;

    if (!hasOnboarded && !inOnboarding) {
      console.log('[Layout] Redirecting to onboarding');
      router.replace('/onboarding');
    } else if (hasOnboarded && inOnboarding) {
      console.log('[Layout] Onboarding done, redirecting to home');
      router.replace('/');
    }
  }, [hasOnboarded, isLoading, segments, router]);
}

function RootLayoutNav() {
  useOnboardingRedirect();
  const colors = useThemeColors();
  const isDark = useIsDark();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="create-trip" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="trip/[id]" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="budget/[id]" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="packing/[id]" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="booking" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="collaboration/[id]" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="hotels/[city]" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="destination/[id]" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="edit-trip" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="personal-info" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="payment-methods" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="privacy-security" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="help-center" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="app-settings" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="shared/[id]" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="invite/[id]" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="join/[tripId]" 
          options={{ 
            headerShown: false,
          }} 
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const hydrateTrips = useTripsStore((s) => s.hydrate);
  const hydrateOnboarding = useOnboardingStore((s) => s.hydrate);
  const hydratePreferences = usePreferencesStore((s) => s.hydrate);
  const hydrateSubscription = useSubscriptionStore((s) => s.hydrate);

  useEffect(() => {
    void Promise.all([hydrateTrips(), hydrateOnboarding(), hydratePreferences(), hydrateSubscription()]).then(() => {
      void SplashScreen.hideAsync();
    });
  }, [hydrateTrips, hydrateOnboarding, hydratePreferences, hydrateSubscription]);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
