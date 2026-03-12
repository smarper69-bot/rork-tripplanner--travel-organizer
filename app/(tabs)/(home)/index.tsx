import React, { useMemo, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ImageBackground, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Compass, Globe, MapPin, Calendar, Trash2, ChevronRight, ArrowRight, Plane } from 'lucide-react-native';
import { Flower2, Church, Palmtree, Mountain, Sun, Landmark, Trees, Snowflake, Tent } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTripsStore } from '@/store/useTripsStore';
import { Trip, TripIcon } from '@/types/trip';

const FEATURED_DESTINATIONS = [
  {
    id: '3',
    city: 'Bali',
    country: 'Indonesia',
    tagline: 'Temples, rice terraces & surf',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    color: '#27AE60',
  },
  {
    id: '1',
    city: 'Tokyo',
    country: 'Japan',
    tagline: 'Neon lights & ancient shrines',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    color: '#E74C3C',
  },
  {
    id: '2',
    city: 'Paris',
    country: 'France',
    tagline: 'Art, romance & croissants',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    color: '#2C3E50',
  },
];

const getIconComponent = (iconName: TripIcon) => {
  const iconMap: Record<TripIcon, React.ComponentType<{ size: number; color: string }>> = {
    'cherry-blossom': Flower2,
    'cathedral': Church,
    'palm-tree': Palmtree,
    'mountain': Mountain,
    'sun': Sun,
    'landmark': Landmark,
    'trees': Trees,
    'snowflake': Snowflake,
    'tent': Tent,
  };
  return iconMap[iconName] || Landmark;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const QUICK_ACTIONS = [
  { key: 'create', label: 'Create Trip', icon: Plus, route: '/create-trip', bg: '#1A1A1A' },
  { key: 'explore', label: 'Explore', icon: Compass, route: '/discover', bg: '#2D2D2D' },
  { key: 'globe', label: 'Globe', icon: Globe, route: '/globe', bg: '#404040' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { trips, deleteTrip } = useTripsStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const featured = FEATURED_DESTINATIONS[featuredIndex];

  const futureTrips = useMemo(() => {
    return trips
      .filter(t => t.status === 'upcoming' || t.status === 'planning' || t.status === 'ongoing')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [trips]);

  const mainTrip = futureTrips[0] ?? null;
  const otherTrips = futureTrips.slice(1);

  const handleDeleteTrip = (trip: Trip) => {
    Alert.alert(
      'Remove this trip?',
      'This will delete the trip and its related data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTrip(trip.id);
            console.log('[Home] Deleted trip:', trip.id);
          },
        },
      ]
    );
  };

  const getDaysLabel = (trip: Trip) => {
    const days = Math.ceil(
      (new Date(trip.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (days < 0) return 'In progress';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const MainTripIcon = mainTrip ? getIconComponent(mainTrip.icon) : Landmark;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.title}>Where to next?</Text>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={[styles.quickActionCard, { backgroundColor: action.bg }]}
              activeOpacity={0.8}
              onPress={() => router.push(action.route as any)}
              testID={`quick-action-${action.key}`}
            >
              <View style={styles.quickActionIconWrap}>
                <action.icon size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Destination */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <View style={styles.featuredDots}>
              {FEATURED_DESTINATIONS.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setFeaturedIndex(i)}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <View style={[styles.dot, i === featuredIndex && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.featuredCard}
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: '/destination/[id]', params: { id: featured.id } } as any)}
            testID="featured-destination-card"
          >
            <ImageBackground
              source={{ uri: featured.imageUrl }}
              style={styles.featuredImage}
              imageStyle={styles.featuredImageRadius}
            >
              <View style={styles.featuredOverlay}>
                <View style={styles.featuredContent}>
                  <View>
                    <Text style={styles.featuredCity}>{featured.city}</Text>
                    <Text style={styles.featuredCountry}>{featured.country}</Text>
                    <Text style={styles.featuredTagline}>{featured.tagline}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.planButton}
                    activeOpacity={0.85}
                    onPress={() => router.push('/create-trip' as any)}
                  >
                    <Text style={styles.planButtonText}>Plan this trip</Text>
                    <ArrowRight size={16} color="#1A1A1A" />
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* Upcoming Trip or Empty */}
        {mainTrip ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your next trip</Text>
            </View>

            <TouchableOpacity
              style={[styles.mainCard, { backgroundColor: mainTrip.iconColor + '10' }]}
              activeOpacity={0.85}
              onPress={() => router.push(`/trip/${mainTrip.id}` as any)}
              testID="main-trip-card"
            >
              <View style={styles.mainCardHeader}>
                <View style={[styles.statusPill, { backgroundColor: mainTrip.iconColor + '20' }]}>
                  <Text style={[styles.statusPillText, { color: mainTrip.iconColor }]}>
                    {mainTrip.status === 'planning' ? 'Planning' : getDaysLabel(mainTrip)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteTrip(mainTrip)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  testID="main-trip-delete"
                >
                  <Trash2 size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.mainCardIcon}>
                <MainTripIcon size={56} color={mainTrip.iconColor} />
              </View>

              <View style={styles.mainCardFooter}>
                <Text style={styles.mainCardName} numberOfLines={1}>{mainTrip.name}</Text>
                <View style={styles.mainCardMeta}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.mainCardLocation}>{mainTrip.destination}, {mainTrip.country}</Text>
                </View>
                <View style={styles.mainCardMeta}>
                  <Calendar size={14} color={Colors.textSecondary} />
                  <Text style={styles.mainCardDates}>
                    {formatDate(mainTrip.startDate)} – {formatDate(mainTrip.endDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.mainCardArrow}>
                <ChevronRight size={20} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>

            {otherTrips.length > 0 && (
              <View style={styles.otherSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Other trips</Text>
                  <TouchableOpacity onPress={() => router.push('/trips' as any)}>
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
                {otherTrips.map((trip) => {
                  const Icon = getIconComponent(trip.icon);
                  return (
                    <TouchableOpacity
                      key={trip.id}
                      style={styles.otherCard}
                      activeOpacity={0.8}
                      onPress={() => router.push(`/trip/${trip.id}` as any)}
                      testID={`trip-card-${trip.id}`}
                    >
                      <View style={[styles.otherCardIcon, { backgroundColor: trip.iconColor + '12' }]}>
                        <Icon size={28} color={trip.iconColor} />
                      </View>
                      <View style={styles.otherCardContent}>
                        <Text style={styles.otherCardName} numberOfLines={1}>{trip.name}</Text>
                        <Text style={styles.otherCardSub}>
                          {trip.destination} · {formatDate(trip.startDate)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.otherDeleteBtn}
                        onPress={() => handleDeleteTrip(trip)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      >
                        <Trash2 size={16} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyTripSection}>
            <View style={styles.emptyTripCard}>
              <Plane size={28} color={Colors.textMuted} />
              <Text style={styles.emptyTripText}>No trips planned yet</Text>
              <TouchableOpacity
                style={styles.createTripBtn}
                onPress={() => router.push('/create-trip' as any)}
                activeOpacity={0.8}
                testID="create-first-trip-btn"
              >
                <Plus size={18} color={Colors.textLight} />
                <Text style={styles.createTripBtnText}>Create your first trip</Text>
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
    lineHeight: 32,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 28,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 10,
  },
  quickActionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  featuredSection: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  featuredDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.text,
    width: 18,
  },
  featuredCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    overflow: 'hidden',
  },
  featuredImage: {
    height: 210,
    justifyContent: 'flex-end',
  },
  featuredImageRadius: {
    borderRadius: 22,
  },
  featuredOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  featuredContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  featuredCity: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    lineHeight: 28,
  },
  featuredCountry: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  featuredTagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '400' as const,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  planButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  mainCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    padding: 20,
    minHeight: 220,
    justifyContent: 'space-between',
    position: 'relative' as const,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCardIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  mainCardFooter: {
    gap: 6,
  },
  mainCardName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  mainCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mainCardLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  mainCardDates: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  mainCardArrow: {
    position: 'absolute' as const,
    right: 20,
    bottom: 20,
  },
  otherSection: {
    marginTop: 24,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  otherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  otherCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otherCardContent: {
    flex: 1,
    marginLeft: 14,
  },
  otherCardName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  otherCardSub: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  otherDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTripSection: {
    paddingHorizontal: 20,
  },
  emptyTripCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed' as const,
  },
  emptyTripText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  createTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  createTripBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
});
