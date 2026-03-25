import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Compass, Globe, MapPin, Calendar, ChevronRight, ArrowRight, Plane } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTripsStore, getUserTripCount } from '@/store/useTripsStore';
import { useSubscriptionStore, FREE_TRIP_LIMIT } from '@/store/useSubscriptionStore';
import { useUserName } from '@/hooks/useUserProfile';
import { Trip } from '@/types/trip';
import { getDestinationImageWithConfidence } from '@/utils/destinationImages';
import { hapticLight, hapticMedium } from '@/utils/haptics';
import { ThemeColors } from '@/constants/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_SPACING = 12;

const FEATURED_DESTINATIONS = [
  {
    id: '3',
    city: 'Bali',
    country: 'Indonesia',
    description: 'Tropical paradise with stunning rice terraces and ancient temples.',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&h=900&fit=crop&q=80',
  },
  {
    id: '1',
    city: 'Tokyo',
    country: 'Japan',
    description: 'Ultramodern meets traditional — neon skyscrapers to historic temples.',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&h=900&fit=crop&q=80',
  },
  {
    id: '7',
    city: 'Santorini',
    country: 'Greece',
    description: 'White-washed cliffs overlooking the deep blue Aegean Sea.',
    imageUrl: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1600&h=900&fit=crop&q=80',
  },
  {
    id: '5',
    city: 'Barcelona',
    country: 'Spain',
    description: "Gaudí's masterpieces meet Mediterranean beaches and vibrant culture.",
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1600&h=900&fit=crop&q=80',
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function AnimatedPressable({ children, onPress, style, testID }: { children: React.ReactNode; onPress: () => void; style?: any; testID?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = useCallback(() => {
    hapticLight();
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  const handlePressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} testID={testID}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { trips } = useTripsStore();
  const userName = useUserName();
  const plan = useSubscriptionStore((s) => s.plan);
  const userTripCount = getUserTripCount(trips);
  const remaining = plan === 'premium' ? Infinity : Math.max(0, FREE_TRIP_LIMIT - userTripCount);
  const showSoftLimit = plan === 'free' && remaining <= 1 && remaining >= 0 && userTripCount > 0;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onCarouselScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
    if (index >= 0 && index < FEATURED_DESTINATIONS.length) {
      setFeaturedIndex(index);
    }
  }, []);

  const futureTrips = useMemo(() => {
    return trips
      .filter(t => t.status === 'upcoming' || t.status === 'planning' || t.status === 'ongoing')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [trips]);

  const mainTrip = futureTrips[0] ?? null;
  const otherTrips = futureTrips.slice(1, 4);

  const getDaysLabel = (trip: Trip) => {
    const days = Math.ceil(
      (new Date(trip.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (days < 0) return 'In progress';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const s = createStyles(colors);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <Animated.View style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={s.greeting}>{getGreeting()}{userName && userName !== 'Traveler' ? `, ${userName}` : ''}</Text>
          <Text style={s.title}>Where to next?</Text>
        </Animated.View>

        {showSoftLimit && (
          <Pressable
            style={s.tripLimitBanner}
            onPress={() => router.push('/profile' as any)}
          >
            <Text style={s.tripLimitText}>
              {remaining === 0
                ? "You've used all free trips — upgrade for unlimited trips"
                : `You have ${remaining} free trip left — upgrade anytime for unlimited trips`}
            </Text>
            <Text style={s.tripLimitAction}>View Premium</Text>
          </Pressable>
        )}

        <View style={s.quickActions}>
          {[
            { key: 'create', label: 'New Trip', icon: Plus, bg: colors.accent },
            { key: 'explore', label: 'Explore', icon: Compass, bg: colors.text },
            { key: 'globe', label: 'Globe', icon: Globe, bg: colors.primaryLight },
          ].map((action) => (
            <AnimatedPressable
              key={action.key}
              onPress={() => router.push(action.key === 'create' ? '/create-trip' : action.key === 'explore' ? '/discover' : '/globe' as any)}
              testID={`quick-action-${action.key}`}
            >
              <View style={[s.quickActionCard, { backgroundColor: action.bg }]}>
                <action.icon size={20} color="#FFFFFF" />
                <Text style={s.quickActionLabel}>{action.label}</Text>
              </View>
            </AnimatedPressable>
          ))}
        </View>

        <View style={s.featuredSection}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Featured</Text>
            <View style={s.featuredDots}>
              {FEATURED_DESTINATIONS.map((_, i) => (
                <View
                  key={i}
                  style={[s.dot, i === featuredIndex && s.dotActive]}
                />
              ))}
            </View>
          </View>

          <FlatList
            ref={flatListRef}
            data={FEATURED_DESTINATIONS}
            horizontal
            pagingEnabled={false}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={onCarouselScroll}
            scrollEventThrottle={16}
            contentContainerStyle={s.carouselContent}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AnimatedPressable
                onPress={() => router.push({ pathname: '/destination/[id]', params: { id: item.id } } as any)}
                testID={`featured-card-${item.id}`}
              >
                <View style={s.featuredCard}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={s.featuredBgImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.78)']}
                    locations={[0, 0.35, 1]}
                    style={s.featuredGradient}
                  />
                  <View style={s.featuredContent}>
                    <View style={s.featuredTextBlock}>
                      <Text style={s.featuredCity}>{item.city}</Text>
                      <Text style={s.featuredCountry}>{item.country}</Text>
                      <Text style={s.featuredDescription} numberOfLines={2}>{item.description}</Text>
                    </View>
                    <TouchableOpacity
                      style={[s.planButton, { backgroundColor: colors.accent }]}
                      activeOpacity={0.85}
                      onPress={() => router.push('/create-trip' as any)}
                    >
                      <Text style={s.planButtonText}>Plan this trip</Text>
                      <ArrowRight size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </AnimatedPressable>
            )}
          />
        </View>

        {mainTrip ? (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Your next trip</Text>
            </View>

            <AnimatedPressable
              onPress={() => router.push(`/trip/${mainTrip.id}` as any)}
              testID="main-trip-card"
            >
              <View style={s.mainCard}>
                <Image
                  source={{ uri: getDestinationImageWithConfidence(mainTrip.destination, mainTrip.country).url }}
                  style={s.mainCardImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.8)']}
                  locations={[0, 0.35, 1]}
                  style={s.mainCardGradient}
                />
                <View style={s.mainCardBadge}>
                  <Text style={s.mainCardBadgeText}>
                    {mainTrip.status === 'planning' ? 'Planning' : getDaysLabel(mainTrip)}
                  </Text>
                </View>
                <View style={s.mainCardContent}>
                  <Text style={s.mainCardName} numberOfLines={1}>{mainTrip.name}</Text>
                  <View style={s.mainCardMeta}>
                    <MapPin size={13} color="rgba(255,255,255,0.8)" />
                    <Text style={s.mainCardLocation}>{mainTrip.destination}, {mainTrip.country}</Text>
                  </View>
                  <View style={s.mainCardMeta}>
                    <Calendar size={12} color="rgba(255,255,255,0.7)" />
                    <Text style={s.mainCardDates}>
                      {formatDate(mainTrip.startDate)} – {formatDate(mainTrip.endDate)}
                    </Text>
                  </View>
                </View>
                <View style={s.mainCardArrow}>
                  <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
                </View>
              </View>
            </AnimatedPressable>

            {otherTrips.length > 0 && (
              <View style={s.otherSection}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>Other trips</Text>
                  <TouchableOpacity onPress={() => router.push('/trips' as any)}>
                    <Text style={[s.seeAll, { color: colors.accent }]}>See all</Text>
                  </TouchableOpacity>
                </View>
                {otherTrips.map((trip) => (
                  <AnimatedPressable
                    key={trip.id}
                    onPress={() => router.push(`/trip/${trip.id}` as any)}
                    testID={`trip-card-${trip.id}`}
                  >
                    <View style={s.otherCard}>
                      <Image
                        source={{ uri: getDestinationImageWithConfidence(trip.destination, trip.country).url }}
                        style={s.otherCardImage}
                      />
                      <View style={s.otherCardContent}>
                        <Text style={s.otherCardName} numberOfLines={1}>{trip.name}</Text>
                        <Text style={s.otherCardSub}>
                          {trip.destination} · {formatDate(trip.startDate)}
                        </Text>
                      </View>
                      <ChevronRight size={18} color={colors.textMuted} />
                    </View>
                  </AnimatedPressable>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={s.emptyTripSection}>
            <View style={s.emptyTripCard}>
              <View style={s.emptyIllustration}>
                <View style={s.emptyGlobeRing}>
                  <View style={[s.emptyGlobeInner, { backgroundColor: colors.accent + '20' }]}>
                    <Plane size={28} color={colors.accent} style={{ transform: [{ rotate: '-45deg' }] }} />
                  </View>
                </View>
                <View style={s.emptyDotLeft} />
                <View style={s.emptyDotRight} />
                <View style={s.emptyDotTop} />
              </View>
              <Text style={s.emptyTripTitle}>Your next adventure starts here</Text>
              <Text style={s.emptyTripText}>Plan a trip, invite friends, and explore the world together.</Text>
              <TouchableOpacity
                style={[s.createTripBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  hapticMedium();
                  router.push('/create-trip' as any);
                }}
                activeOpacity={0.8}
                testID="create-first-trip-btn"
              >
                <Plus size={18} color="#FFFFFF" />
                <Text style={s.createTripBtnText}>Create your first trip</Text>
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.text,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 32,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  featuredSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.2,
  },
  featuredDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 18,
  },
  carouselContent: {
    paddingHorizontal: 24,
  },
  featuredCard: {
    width: CARD_WIDTH,
    height: 240,
    marginRight: CARD_SPACING,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  featuredBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredContent: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 14,
  },
  featuredTextBlock: {
    gap: 2,
  },
  featuredCity: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuredCountry: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  planButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  mainCard: {
    marginHorizontal: 24,
    borderRadius: 18,
    height: 200,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  mainCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  mainCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  mainCardBadge: {
    position: 'absolute' as const,
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  mainCardBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#111',
  },
  mainCardContent: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
    gap: 4,
  },
  mainCardName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  mainCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mainCardLocation: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500' as const,
  },
  mainCardDates: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500' as const,
  },
  mainCardArrow: {
    position: 'absolute' as const,
    right: 18,
    top: 14,
  },
  otherSection: {
    marginTop: 28,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  otherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  otherCardImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  otherCardContent: {
    flex: 1,
    marginLeft: 14,
  },
  otherCardName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 3,
  },
  otherCardSub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyTripSection: {
    paddingHorizontal: 24,
  },
  emptyTripCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 44,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyIllustration: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyGlobeRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed' as const,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyGlobeInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDotLeft: {
    position: 'absolute' as const,
    left: 4,
    top: 42,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBBF24',
  },
  emptyDotRight: {
    position: 'absolute' as const,
    right: 8,
    bottom: 18,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F87171',
  },
  emptyDotTop: {
    position: 'absolute' as const,
    right: 14,
    top: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34D399',
  },
  emptyTripTitle: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  emptyTripText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 8,
  },
  createTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  createTripBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  tripLimitBanner: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: colors.accent + '10',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.accent + '20',
  },
  tripLimitText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  tripLimitAction: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.accent,
  },
});
