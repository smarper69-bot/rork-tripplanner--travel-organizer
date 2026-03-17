import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Plane, Clock, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import TripCard from '@/components/TripCard';
import { useTripsStore } from '@/store/useTripsStore';

const tabs = [
  { id: 'upcoming', label: 'Upcoming', icon: Plane },
  { id: 'planning', label: 'Planning', icon: Clock },
  { id: 'completed', label: 'Past', icon: CheckCircle },
];

export default function TripsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const { trips } = useTripsStore();

  const filteredTrips = trips.filter((trip) => {
    if (activeTab === 'upcoming') return trip.status === 'upcoming' || trip.status === 'ongoing';
    if (activeTab === 'planning') return trip.status === 'planning';
    if (activeTab === 'completed') return trip.status === 'completed';
    return true;
  });

  const addBtnScale = useRef(new Animated.Value(1)).current;
  const onAddPressIn = useCallback(() => {
    Animated.spring(addBtnScale, { toValue: 0.92, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [addBtnScale]);
  const onAddPressOut = useCallback(() => {
    Animated.spring(addBtnScale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [addBtnScale]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Trips</Text>
          <Text style={styles.subtitle}>{trips.length} trip{trips.length !== 1 ? 's' : ''}</Text>
        </View>
        <Pressable
          onPress={() => router.push('/create-trip' as any)}
          onPressIn={onAddPressIn}
          onPressOut={onAddPressOut}
        >
          <Animated.View style={[styles.addButton, { transform: [{ scale: addBtnScale }] }]}>
            <Plus size={22} color={Colors.textLight} />
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <tab.icon
              size={16}
              color={activeTab === tab.id ? '#FFFFFF' : Colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onPress={() => router.push(`/trip/${trip.id}` as any)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Plane size={32} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptyText}>
              Start planning your next adventure
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/create-trip' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>Create a Trip</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: Colors.text,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
});
