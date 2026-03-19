import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Platform, Animated, Linking, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ArrowLeft, MapPin, Calendar, Users, Clock,
  DollarSign, Plane, ChevronRight, Download,
  Flower2, Church, Palmtree, Mountain, Sun, Landmark, Trees, Snowflake, Tent,
  AlertCircle, ExternalLink, Compass,
} from 'lucide-react-native';
import { useThemeColors, useIsDark } from '@/hooks/useThemeColors';
import { ThemeColors } from '@/constants/themes';
import { useTripsStore } from '@/store/useTripsStore';
import { mockTrips } from '@/mocks/trips';
import { TripIcon, StoredItineraryItem } from '@/types/trip';
import { getDestinationImageHQ } from '@/utils/destinationImages';
import { hapticLight } from '@/utils/haptics';


interface TripPreview {
  name: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  travelers: number;
  ownerName: string;
}

function parsePreviewFromParams(params: Record<string, string | string[] | undefined>): TripPreview | null {
  const name = typeof params.name === 'string' ? params.name : '';
  const dest = typeof params.dest === 'string' ? params.dest : '';
  if (!name && !dest) return null;

  return {
    name: name || 'Shared Trip',
    destination: dest || 'Unknown',
    country: typeof params.country === 'string' ? params.country : '',
    startDate: typeof params.start === 'string' ? params.start : '',
    endDate: typeof params.end === 'string' ? params.end : '',
    totalBudget: typeof params.budget === 'string' ? parseInt(params.budget, 10) || 0 : 0,
    travelers: typeof params.travelers === 'string' ? parseInt(params.travelers, 10) || 1 : 1,
    ownerName: typeof params.owner === 'string' ? params.owner : '',
  };
}

function SkeletonBlock({ width, height, colors, style }: { width: number | string; height: number; colors: ThemeColors; style?: any }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmer]);
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });
  return (
    <Animated.View style={[{ width, height, borderRadius: 10, backgroundColor: colors.border, opacity }, style]} />
  );
}

function AnimatedPressable({ children, onPress, style }: { children: React.ReactNode; onPress: () => void; style?: any }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = useCallback(() => {
    hapticLight();
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  const handlePressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function SharedTripScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    dest?: string;
    country?: string;
    start?: string;
    end?: string;
    budget?: string;
    travelers?: string;
    owner?: string;
  }>();
  const { id } = params;
  const router = useRouter();
  const colors = useThemeColors();
  const isDark = useIsDark();

  const isHydrated = useTripsStore((s) => s.isHydrated);
  const storeTrips = useTripsStore((s) => s.trips);
  const allItineraryItems = useTripsStore((s) => s.itineraryItems);
  const allMemories = useTripsStore((s) => s.memories);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const trip = useMemo(() => {
    if (!isHydrated) return undefined;
    const stored = storeTrips.find((t) => t.id === id);
    if (stored) return stored;
    return mockTrips.find((t) => t.id === id);
  }, [storeTrips, id, isHydrated]);

  const preview = useMemo(() => parsePreviewFromParams(params), [params]);

  const itineraryItems = useMemo(
    () => allItineraryItems.filter((i) => i.tripId === id),
    [allItineraryItems, id]
  );

  const tripMemories = useMemo(
    () => allMemories.filter((m) => m.tripId === id),
    [allMemories, id]
  );

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

  const hasLocalData = !!trip;
  const hasPreviewData = !!preview;
  const isLoading = !isHydrated;
  const s = createStyles(colors, isDark);

  const handleOpenInApp = () => {
    if (Platform.OS === 'web') {
      const scheme = `rork-app://shared/${id}`;
      void Linking.canOpenURL(scheme).then((supported) => {
        if (supported) {
          void Linking.openURL(scheme);
        } else {
          console.log('[SharedTrip] App not installed, staying on web preview');
        }
      }).catch(() => {
        console.log('[SharedTrip] Could not check URL scheme');
      });
    } else {
      router.push(`/trip/${id}` as any);
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.container}>
          <View style={s.skeletonHero}>
            <SkeletonBlock width="100%" height={360} colors={colors} style={{ borderRadius: 0 }} />
          </View>
          <View style={s.skeletonBody}>
            <SkeletonBlock width="60%" height={28} colors={colors} />
            <SkeletonBlock width="40%" height={16} colors={colors} style={{ marginTop: 12 }} />
            <SkeletonBlock width="100%" height={120} colors={colors} style={{ marginTop: 24, borderRadius: 16 }} />
            <SkeletonBlock width="100%" height={80} colors={colors} style={{ marginTop: 16, borderRadius: 16 }} />
            <SkeletonBlock width="100%" height={160} colors={colors} style={{ marginTop: 16, borderRadius: 20 }} />
          </View>
        </View>
      </>
    );
  }

  if (!hasLocalData && !hasPreviewData) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.container}>
          <SafeAreaView style={s.errorContainer}>
            <Animated.View style={[s.errorContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={s.logoRow}>
                <View style={[s.logoMark, { backgroundColor: colors.accent }]}>
                  <Plane size={18} color="#fff" />
                </View>
                <Text style={[s.logoText, { color: colors.text }]}>TripNest</Text>
              </View>
              <View style={[s.errorIconWrap, { backgroundColor: colors.errorBg }]}>
                <AlertCircle size={36} color={colors.error} />
              </View>
              <Text style={[s.errorTitle, { color: colors.text }]}>
                This trip link is no longer available
              </Text>
              <Text style={[s.errorSub, { color: colors.textSecondary }]}>
                The trip may have been removed or this link has expired. Ask the trip owner to send a new link.
              </Text>
              <AnimatedPressable onPress={() => router.replace('/')}>
                <View style={[s.errorBtn, { backgroundColor: colors.accent }]}>
                  <Text style={s.errorBtnText}>Go to TripNest</Text>
                </View>
              </AnimatedPressable>
            </Animated.View>
          </SafeAreaView>
        </View>
      </>
    );
  }

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch { return date; }
  };

  const formatShortDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
      });
    } catch { return date; }
  };

  const calculateDays = () => {
    try {
      const startStr = trip?.startDate ?? preview?.startDate ?? '';
      const endStr = trip?.endDate ?? preview?.endDate ?? '';
      if (!startStr || !endStr) return 0;
      const start = new Date(startStr);
      const end = new Date(endStr);
      return Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
    } catch { return 0; }
  };

  const displayName = trip?.name ?? preview?.name ?? 'Shared Trip';
  const displayDest = trip?.destination ?? preview?.destination ?? '';
  const displayCountry = trip?.country ?? preview?.country ?? '';
  const displayStart = trip?.startDate ?? preview?.startDate ?? '';
  const displayEnd = trip?.endDate ?? preview?.endDate ?? '';
  const displayBudget = trip?.totalBudget ?? preview?.totalBudget ?? 0;
  const displayTravelers = trip?.collaborators?.length ?? preview?.travelers ?? 1;
  const tripDays = calculateDays();
  const IconComponent = trip ? getIconComponent(trip.icon) : Landmark;
  const coverImage = getDestinationImageHQ(displayDest, displayCountry);
  const allActivities = trip ? trip.itinerary.flatMap((day) => day.activities) : [];

  const groupedStoredItinerary = useMemo(() => {
    const groups: Record<string, StoredItineraryItem[]> = {};
    for (const item of itineraryItems) {
      const dateKey = item.date.split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')),
      }));
  }, [itineraryItems]);

  const hasItinerary = allActivities.length > 0 || groupedStoredItinerary.length > 0;
  const hasMemories = tripMemories.length > 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={s.container}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <View style={s.heroSection}>
            <Image
              source={{ uri: coverImage }}
              style={s.heroImage}
              defaultSource={{ uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&q=80' }}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.7)']}
              locations={[0, 0.3, 1]}
              style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={s.heroTopWrap} edges={['top']}>
              <View style={s.topBar}>
                <TouchableOpacity style={s.topBarBtn} onPress={() => router.back()} activeOpacity={0.7}>
                  <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <View style={s.topBarLogoRow}>
                  <View style={s.topBarLogoMark}>
                    <Plane size={13} color="#fff" />
                  </View>
                  <Text style={s.topBarLogoText}>TripNest</Text>
                </View>
                <View style={{ width: 40 }} />
              </View>
            </SafeAreaView>

            <View style={s.heroBottom}>
              <View style={s.sharedBadge}>
                <Compass size={11} color="#fff" />
                <Text style={s.sharedBadgeText}>Shared Trip</Text>
              </View>
              <Text style={s.heroTitle}>{displayName}</Text>
              {(displayDest || displayCountry) && (
                <View style={s.heroLocationRow}>
                  <MapPin size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={s.heroLocation}>
                    {[displayDest, displayCountry].filter(Boolean).join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Animated.View style={[s.body, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {(displayStart || displayBudget > 0 || tripDays > 0) && (
              <View style={s.statsRow}>
                {tripDays > 0 && (
                  <View style={s.statCard}>
                    <View style={[s.statIcon, { backgroundColor: isDark ? 'rgba(34,211,238,0.12)' : 'rgba(8,145,178,0.08)' }]}>
                      <Clock size={18} color={colors.accent} />
                    </View>
                    <Text style={[s.statValue, { color: colors.text }]}>{tripDays}</Text>
                    <Text style={[s.statLabel, { color: colors.textMuted }]}>days</Text>
                  </View>
                )}
                {displayTravelers > 0 && (
                  <View style={s.statCard}>
                    <View style={[s.statIcon, { backgroundColor: isDark ? 'rgba(34,211,238,0.12)' : 'rgba(8,145,178,0.08)' }]}>
                      <Users size={18} color={colors.accent} />
                    </View>
                    <Text style={[s.statValue, { color: colors.text }]}>{displayTravelers}</Text>
                    <Text style={[s.statLabel, { color: colors.textMuted }]}>travelers</Text>
                  </View>
                )}
                {displayBudget > 0 && (
                  <View style={s.statCard}>
                    <View style={[s.statIcon, { backgroundColor: isDark ? 'rgba(34,211,238,0.12)' : 'rgba(8,145,178,0.08)' }]}>
                      <DollarSign size={18} color={colors.accent} />
                    </View>
                    <Text style={[s.statValue, { color: colors.text }]}>${displayBudget.toLocaleString()}</Text>
                    <Text style={[s.statLabel, { color: colors.textMuted }]}>budget</Text>
                  </View>
                )}
              </View>
            )}

            {displayStart && (
              <View style={[s.dateCard, { backgroundColor: colors.surface }]}>
                <View style={[s.dateIconWrap, { backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg }]}>
                  <Calendar size={20} color={colors.accent} />
                </View>
                <View style={s.dateInfo}>
                  <Text style={[s.dateRange, { color: colors.text }]}>
                    {formatShortDate(displayStart)}{displayEnd ? ` — ${formatShortDate(displayEnd)}` : ''}
                  </Text>
                  <Text style={[s.dateSub, { color: colors.textMuted }]}>
                    {formatDate(displayStart)}{displayEnd ? ` to ${formatDate(displayEnd)}` : ''}
                  </Text>
                </View>
              </View>
            )}

            {hasLocalData && trip.collaborators.length > 0 && (
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: colors.text }]}>Travelers</Text>
                <View style={[s.travelersCard, { backgroundColor: colors.surface }]}>
                  {trip.collaborators.map((collab) => (
                    <View key={collab.id} style={[s.travelerRow, { borderBottomColor: colors.borderLight }]}>
                      {collab.avatar ? (
                        <Image source={{ uri: collab.avatar }} style={s.travelerAvatar} />
                      ) : (
                        <View style={[s.travelerAvatar, { backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg, justifyContent: 'center' as const, alignItems: 'center' as const }]}>
                          <Users size={16} color={colors.textMuted} />
                        </View>
                      )}
                      <View style={s.travelerInfo}>
                        <Text style={[s.travelerName, { color: colors.text }]}>{collab.name}</Text>
                        <Text style={[s.travelerRole, { color: colors.textMuted }]}>
                          {collab.role === 'owner' ? 'Organizer' : collab.role === 'editor' ? 'Contributor' : 'Viewer'}
                        </Text>
                      </View>
                      {collab.role === 'owner' && (
                        <View style={[s.ownerBadge, { backgroundColor: isDark ? 'rgba(34,211,238,0.12)' : 'rgba(8,145,178,0.08)' }]}>
                          <Text style={[s.ownerBadgeText, { color: colors.accent }]}>Owner</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {hasLocalData && hasItinerary && (
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: colors.text }]}>Itinerary Preview</Text>

                {trip.itinerary.slice(0, 3).map((day, dayIndex) => (
                  <View key={day.id} style={[s.itineraryDayCard, { backgroundColor: colors.surface }]}>
                    <View style={[s.dayBadge, { backgroundColor: colors.accent }]}>
                      <Text style={s.dayBadgeText}>Day {dayIndex + 1}</Text>
                    </View>
                    {day.activities.slice(0, 3).map((activity) => (
                      <View key={activity.id} style={s.activityRow}>
                        <View style={[s.activityTimeDot, { backgroundColor: colors.accent }]} />
                        <View style={s.activityContent}>
                          <Text style={[s.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                          {activity.location && (
                            <Text style={[s.activityLocation, { color: colors.textMuted }]}>{activity.location}</Text>
                          )}
                        </View>
                        {activity.startTime && (
                          <Text style={[s.activityTime, { color: colors.textSecondary }]}>{activity.startTime}</Text>
                        )}
                      </View>
                    ))}
                    {day.activities.length > 3 && (
                      <Text style={[s.moreText, { color: colors.textMuted }]}>
                        +{day.activities.length - 3} more activities
                      </Text>
                    )}
                  </View>
                ))}

                {groupedStoredItinerary.slice(0, 3).map((group) => (
                  <View key={group.date} style={[s.itineraryDayCard, { backgroundColor: colors.surface }]}>
                    <View style={[s.dayBadge, { backgroundColor: colors.accent }]}>
                      <Text style={s.dayBadgeText}>{formatShortDate(group.date)}</Text>
                    </View>
                    {group.items.slice(0, 3).map((item) => (
                      <View key={item.id} style={s.activityRow}>
                        <View style={[s.activityTimeDot, { backgroundColor: colors.accent }]} />
                        <View style={s.activityContent}>
                          <Text style={[s.activityTitle, { color: colors.text }]}>{item.title}</Text>
                          {item.notes && (
                            <Text style={[s.activityLocation, { color: colors.textMuted }]} numberOfLines={1}>
                              {item.notes}
                            </Text>
                          )}
                        </View>
                        {item.time && (
                          <Text style={[s.activityTime, { color: colors.textSecondary }]}>{item.time}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                ))}

                {(trip.itinerary.length > 3 || groupedStoredItinerary.length > 3) && (
                  <View style={s.fadeHint}>
                    <Text style={[s.fadeHintText, { color: colors.textMuted }]}>
                      Open in TripNest to see the full itinerary
                    </Text>
                  </View>
                )}
              </View>
            )}

            {hasLocalData && hasMemories && (
              <View style={s.section}>
                <View style={s.sectionHeaderRow}>
                  <Text style={[s.sectionTitle, { color: colors.text }]}>Memories</Text>
                  <View style={[s.countBadge, { backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg }]}>
                    <Text style={[s.countBadgeText, { color: colors.textSecondary }]}>{tripMemories.length}</Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.memoriesScroll}
                >
                  {tripMemories.slice(0, 6).map((memory) => (
                    <View key={memory.id} style={s.memoryThumb}>
                      <Image source={{ uri: memory.uri }} style={s.memoryThumbImage} />
                    </View>
                  ))}
                  {tripMemories.length > 6 && (
                    <View style={[s.memoryMoreThumb, { backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg }]}>
                      <Text style={[s.memoryMoreText, { color: colors.textSecondary }]}>
                        +{tripMemories.length - 6}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}

            <View style={[s.ctaCard, { backgroundColor: colors.surface }]}>
              <View style={[s.ctaIconWrap, { backgroundColor: isDark ? 'rgba(34,211,238,0.12)' : 'rgba(8,145,178,0.08)' }]}>
                <IconComponent size={32} color={colors.accent} />
              </View>
              <Text style={[s.ctaTitle, { color: colors.text }]}>
                {hasLocalData ? 'Want to join this trip?' : 'View full trip details'}
              </Text>
              <Text style={[s.ctaSub, { color: colors.textSecondary }]}>
                {hasLocalData
                  ? 'Open in the TripNest app to view all details, collaborate, and start planning.'
                  : 'Open in the TripNest app to see the full itinerary, collaborate with travelers, and plan together.'
                }
              </Text>

              <AnimatedPressable onPress={handleOpenInApp} style={{ width: '100%' as const }}>
                <View style={[s.ctaPrimaryBtn, { backgroundColor: colors.accent }]}>
                  {hasLocalData ? (
                    <Plane size={18} color="#fff" />
                  ) : (
                    <ExternalLink size={18} color="#fff" />
                  )}
                  <Text style={s.ctaPrimaryText}>Open in TripNest</Text>
                  <ChevronRight size={18} color="#fff" />
                </View>
              </AnimatedPressable>

              <AnimatedPressable onPress={() => console.log('[SharedTrip] Download tapped')} style={{ width: '100%' as const }}>
                <View style={[s.ctaSecondaryBtn, { backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg }]}>
                  <Download size={18} color={colors.text} />
                  <Text style={[s.ctaSecondaryText, { color: colors.text }]}>Download the App</Text>
                </View>
              </AnimatedPressable>
            </View>

            <View style={[s.footer, { borderTopColor: colors.border }]}>
              <View style={s.footerLogoRow}>
                <View style={[s.footerLogoMark, { backgroundColor: colors.accent }]}>
                  <Plane size={11} color="#fff" />
                </View>
                <Text style={[s.footerLogoText, { color: colors.text }]}>TripNest</Text>
              </View>
              <Text style={[s.footerText, { color: colors.textMuted }]}>
                Plan trips together. Travel smarter.
              </Text>
              <Text style={[s.footerDisclaimer, { color: colors.textMuted, opacity: 0.6 }]}>
                This is a read-only view of a shared trip.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeletonHero: {
    width: '100%',
  },
  skeletonBody: {
    padding: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  errorBtn: {
    paddingHorizontal: 32,
    paddingVertical: 15,
    borderRadius: 14,
  },
  errorBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  heroSection: {
    height: 360,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: colors.border,
  },
  heroTopWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBarLogoMark: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarLogoText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: -0.3,
  },
  heroBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  sharedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    marginBottom: 10,
  },
  sharedBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#fff',
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroLocation: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.9)',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.04,
    shadowRadius: 6,
    elevation: isDark ? 0 : 1,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.04,
    shadowRadius: 6,
    elevation: isDark ? 0 : 1,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  dateIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateInfo: {
    flex: 1,
  },
  dateRange: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  dateSub: {
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 12,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  travelersCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.04,
    shadowRadius: 6,
    elevation: isDark ? 0 : 1,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  travelerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  travelerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 14,
  },
  travelerInfo: {
    flex: 1,
  },
  travelerName: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  travelerRole: {
    fontSize: 13,
    marginTop: 1,
  },
  ownerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ownerBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  itineraryDayCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.04,
    shadowRadius: 6,
    elevation: isDark ? 0 : 1,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  dayBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 14,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#fff',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  activityTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  activityLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  moreText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 20,
  },
  fadeHint: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  fadeHintText: {
    fontSize: 13,
    fontStyle: 'italic' as const,
  },
  memoriesScroll: {
    gap: 10,
  },
  memoryThumb: {
    width: 110,
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  memoryThumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  memoryMoreThumb: {
    width: 110,
    height: 110,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryMoreText: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  ctaCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: isDark ? 0 : 0.06,
    shadowRadius: 12,
    elevation: isDark ? 0 : 3,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  ctaIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  ctaPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    marginBottom: 10,
  },
  ctaPrimaryText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  ctaSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
  },
  ctaSecondaryText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  footerLogoMark: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLogoText: {
    fontSize: 14,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
  footerText: {
    fontSize: 13,
    marginBottom: 4,
  },
  footerDisclaimer: {
    fontSize: 11,
  },
});
