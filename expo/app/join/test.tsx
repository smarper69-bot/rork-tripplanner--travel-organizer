import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, Link } from 'expo-router';
import { useThemeColors, useIsDark } from '@/hooks/useThemeColors';
import { Check } from 'lucide-react-native';

export default function JoinTestScreen() {
  const colors = useThemeColors();
  const isDark = useIsDark();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.center}>
          <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : '#D1FAE5' }]}>
            <Check size={32} color="#10B981" strokeWidth={3} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Web Routing Works</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            This page confirms that the /join/ route is reachable in the browser.
          </Text>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Platform</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{Platform.OS}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Route</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>/join/test</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Status</Text>
              <Text style={[styles.infoValue, { color: '#10B981' }]}>OK</Text>
            </View>
          </View>
          <Link href="/" style={[styles.link, { color: colors.accent }]}>
            Go to Home
          </Link>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  infoCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  link: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
