import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Plane, Clock, CheckCircle, MapPin, Compass } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import TripCard from '@/components/TripCard';
import { useTripsStore, getUserTripCount } from '@/store/useTripsStore';
import { useSubscriptionStore, FREE_TRIP_LIMIT } from '@/store/useSubscriptionStore';
import { hapticLight, hapticMedium, hapticSelection } from '@/utils/haptics';
import { ThemeColors } from '@/constants/themes';

const tabs = [
  { id: 'upcoming', label: 'Upcoming', icon: Plane },
  { id: 'planning', label: 'Planning', icon: Clock },
  { id: 'completed', label: 'Past', icon: CheckCircle },
];

function AnimatedTripCard({ children, index }: { children: React.ReactNode; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
}

export default function TripsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState('upcoming');
  const { trips } = useTripsStore();
  const plan = useSubscriptionStore((s) => s.plan);
  const canCreateTrip = useSubscriptionStore((s) => s.canCreateTrip);
  const userTripCount = getUserTripCount(trips);
  const isAtLimit = !canCreateTrip(userTripCount);

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

  const s = createStyles(colors);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>My Trips</Text>
          <Text style={s.subtitle}>
            {plan === 'free' ? `${userTripCount}/${FREE_TRIP_LIMIT} trips used` : `${userTripCount} trip${userTripCount !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            hapticMedium();
            if (isAtLimit) {
              Alert.alert(
                'Trip Limit Reached',
                `You've used all ${FREE_TRIP_LIMIT} free trips. Upgrade to Premium for unlimited trips.`,
                [
                  { text: 'Later', style: 'cancel' },
                  { text: 'View Premium', onPress: () => router.push('/profile' as any) },
                ],
              );
              return;
            }
            router.push('/create-trip' as any);
          }}
          onPressIn={onAddPressIn}
          onPressOut={onAddPressOut}
        >
          <Animated.View style={[s.addButton, { transform: [{ scale: addBtnScale }] }]}>
            <Plus size={22} color="#FFFFFF" />
          </Animated.View>
        </Pressable>
      </View>

      <View style={s.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[s.tab, activeTab === tab.id && s.tabActive]}
            onPress={() => {
              hapticSelection();
              setActiveTab(tab.id);
            }}
            activeOpacity={0.7}
          >
            <tab.icon
              size={16}
              color={activeTab === tab.id ? '#FFFFFF' : colors.textSecondary}
            />
            <Text style={[s.tabText, activeTab === tab.id && s.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {plan === 'free' && userTripCount >= 2 && userTripCount < FREE_TRIP_LIMIT && (
          <TouchableOpacity style={s.softLimitBanner} onPress={() => router.push('/profile' as any)} activeOpacity={0.7}>
            <Text style={s.softLimitText}>
              You have {FREE_TRIP_LIMIT - userTripCount} free trip{FREE_TRIP_LIMIT - userTripCount === 1 ? '' : 's'} left — upgrade anytime for unlimited trips
            </Text>
            <Text style={s.softLimitUpgrade}>Upgrade</Text>
          </TouchableOpacity>
        )}
        {filteredTrips.length > 0 ? (
          filteredTrips.map((trip, index) => (
            <AnimatedTripCard key={trip.id} index={index}>
              <TripCard
                trip={trip}
                onPress={() => router.push(`/trip/${trip.id}` as any)}
              />
            </AnimatedTripCard>
          ))
        ) : (
          <View style={s.emptyState}>
            <View style={s.emptyIllustration}>
              <View style={s.emptyMapCard}>
                <MapPin size={20} color={colors.accent} />
              </View>
              <View style={s.emptyCompassCard}>
                <Compass size={16} color="#F59E0B" />
              </View>
              <View style={s.emptyPlaneWrap}>
                <Plane size={32} color={colors.text} style={{ transform: [{ rotate: '-30deg' }] }} />
              </View>
            </View>
            <Text style={s.emptyTitle}>
              {activeTab === 'upcoming' ? 'No upcoming trips' : activeTab === 'planning' ? 'Nothing in the works yet' : 'No past trips'}
            </Text>
            <Text style={s.emptyText}>
              {activeTab === 'upcoming'
                ? 'Your upcoming adventures will appear here.\nTime to plan something exciting!'
                : activeTab === 'planning'
                ? 'Start dreaming up your next getaway.\nWe\'ll help you plan every detail.'
                : 'Your travel memories will live here.\nEvery journey starts with a single step.'}
            </Text>
            <TouchableOpacity
              style={s.emptyButton}
              onPress={() => {
                hapticMedium();
                router.push('/create-trip' as any);
              }}
              activeOpacity={0.8}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text style={s.emptyButtonText}>Create your first trip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.emptySecondaryButton}
              onPress={() => {
                hapticLight();
                router.push('/discover' as any);
              }}
              activeOpacity={0.7}
            >
              <Text style={s.emptySecondaryText}>Explore destinations</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
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
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: colors.text,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
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
    paddingTop: 48,
    paddingHorizontal: 32,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  emptyPlaneWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMapCard: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyCompassCard: {
    position: 'absolute' as const,
    bottom: 8,
    left: 2,
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center' as const,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 21,
    marginBottom: 28,
  },
  emptyButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  emptySecondaryButton: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  emptySecondaryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.accent,
  },
  softLimitBanner: {
    marginBottom: 16,
    backgroundColor: colors.accent + '10',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  softLimitText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  softLimitUpgrade: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.accent,
  },
});
