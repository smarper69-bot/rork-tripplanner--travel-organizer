import React, { useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Plane } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTripsStore } from '@/store/useTripsStore';

export default function LegacyInviteRedirectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const getTripByInviteId = useTripsStore((s) => s.getTripByInviteId);

  const trip = useMemo(() => {
    if (!id) return undefined;
    return getTripByInviteId(id);
  }, [id, getTripByInviteId]);

  useEffect(() => {
    if (trip) {
      console.log('[LegacyInvite] Redirecting old invite link to join page, tripId:', trip.id);
      router.replace(`/join/${trip.id}` as any);
    }
  }, [trip, router]);

  if (!trip) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.centerContent}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <Plane size={18} color="#fff" />
              </View>
              <Text style={styles.logoText}>TripNest</Text>
            </View>
            <Text style={styles.errorTitle}>Invite not found</Text>
            <Text style={styles.errorSub}>
              This invite link may have expired or the trip no longer exists.
            </Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
              <Text style={styles.backBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.text} />
          <Text style={styles.redirectText}>Redirecting to trip...</Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 28,
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  redirectText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 16,
  },
});
