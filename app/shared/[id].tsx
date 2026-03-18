import React, { useMemo, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Platform, ActivityIndicator, Animated, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ArrowLeft, MapPin, Calendar, Users, Clock,
  DollarSign, Plane, ChevronRight, Download,
  Flower2, Church, Palmtree, Mountain, Sun, Landmark, Trees, Snowflake, Tent,
  Camera, ListChecks, AlertCircle, ExternalLink,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTripsStore } from '@/store/useTripsStore';
import { mockTrips } from '@/mocks/trips';
import { TripIcon, StoredItineraryItem } from '@/types/trip';
import { getDestinationImageHQ } from '@/utils/destinationImages';

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

  const isHydrated = useTripsStore((s) => s.isHydrated);
  const storeTrips = useTripsStore((s) => s.trips);
  const allItineraryItems = useTripsStore((s) => s.itineraryItems);
  const allMemories = useTripsStore((s) => s.memories);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <Plane size={18} color="#fff" />
              </View>
              <Text style={styles.logoText}>TripNest</Text>
            </View>
            <ActivityIndicator size="large" color="#1A1A1A" style={{ marginTop: 32 }} />
            <Text style={styles.loadingText}>Loading trip details...</Text>
          </View>
        </View>
      </>
    );
  }

  if (!hasLocalData && !hasPreviewData) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.notFoundContainer}>
          <Animated.View style={[styles.notFoundContent, { opacity: fadeAnim }]}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <Plane size={18} color="#fff" />
              </View>
              <Text style={styles.logoText}>TripNest</Text>
            </View>
            <View style={styles.errorIconWrap}>
              <AlertCircle size={40} color="#EF4444" />
            </View>
            <Text style={styles.notFoundTitle}>This trip link is invalid or expired</Text>
            <Text style={styles.notFoundSub}>
              The trip may have been removed, or this link is no longer active. Ask the trip owner to send a new link.
            </Text>
            <TouchableOpacity style={styles.notFoundBtn} onPress={() => router.replace('/')}>
              <Text style={styles.notFoundBtnText}>Go to TripNest</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </>
    );
  }

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const formatShortDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const calculateDays = () => {
    try {
      const startStr = trip?.startDate ?? preview?.startDate ?? '';
      const endStr = trip?.endDate ?? preview?.endDate ?? '';
      if (!startStr || !endStr) return 0;
      const start = new Date(startStr);
      const end = new Date(endStr);
      return Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
    } catch {
      return 0;
    }
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
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.heroSection}>
            <Image
              source={{ uri: coverImage }}
              style={styles.heroImage}
              defaultSource={{ uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&q=80' }}
            />
            <View style={styles.heroOverlay} />

            <SafeAreaView style={styles.heroContentWrap} edges={['top']}>
              <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                  <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <View style={styles.logoRow}>
                  <View style={styles.logoMarkSmall}>
                    <Plane size={14} color="#fff" />
                  </View>
                  <Text style={styles.logoTextSmall}>TripNest</Text>
                </View>
                <View style={{ width: 40 }} />
              </View>
            </SafeAreaView>

            <View style={styles.heroBottom}>
              <View style={styles.sharedBadge}>
                <Text style={styles.sharedBadgeText}>Shared Trip</Text>
              </View>
              <Text style={styles.heroTitle}>{displayName}</Text>
              {(displayDest || displayCountry) && (
                <View style={styles.heroLocationRow}>
                  <MapPin size={15} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.heroLocation}>
                    {[displayDest, displayCountry].filter(Boolean).join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
            {(displayStart || displayBudget > 0) && (
              <View style={styles.summaryCard}>
                {displayStart && (
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <View style={[styles.summaryIcon, { backgroundColor: '#F0F0F0' }]}>
                        <Calendar size={18} color="#1A1A1A" />
                      </View>
                      <View>
                        <Text style={styles.summaryValue}>
                          {formatDate(displayStart)}
                        </Text>
                        {tripDays > 0 && (
                          <Text style={styles.summaryLabel}>
                            {tripDays} day{tripDays !== 1 ? 's' : ''} trip
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {displayStart && displayEnd && (
                  <>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                      <View style={styles.summaryItem}>
                        <View style={[styles.summaryIcon, { backgroundColor: '#F0F0F0' }]}>
                          <Clock size={18} color="#1A1A1A" />
                        </View>
                        <View>
                          <Text style={styles.summaryValue}>
                            {formatShortDate(displayStart)}
                          </Text>
                          <Text style={styles.summaryLabel}>
                            to {formatShortDate(displayEnd)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </>
                )}

                {displayBudget > 0 && (
                  <>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                      <View style={styles.summaryItem}>
                        <View style={[styles.summaryIcon, { backgroundColor: '#F0F0F0' }]}>
                          <DollarSign size={18} color="#1A1A1A" />
                        </View>
                        <View>
                          <Text style={styles.summaryValue}>
                            ${displayBudget.toLocaleString()}
                          </Text>
                          <Text style={styles.summaryLabel}>Total budget</Text>
                        </View>
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}

            {hasLocalData && trip.collaborators.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Users size={16} color={Colors.text} />
                  <Text style={styles.sectionTitle}>Travelers</Text>
                  <Text style={styles.sectionCount}>{trip.collaborators.length}</Text>
                </View>
                <View style={styles.travelersCard}>
                  {trip.collaborators.map((collab) => (
                    <View key={collab.id} style={styles.travelerRow}>
                      {collab.avatar ? (
                        <Image source={{ uri: collab.avatar }} style={styles.travelerAvatar} />
                      ) : (
                        <View style={[styles.travelerAvatar, styles.avatarPlaceholder]}>
                          <Users size={16} color="#999" />
                        </View>
                      )}
                      <View style={styles.travelerInfo}>
                        <Text style={styles.travelerName}>{collab.name}</Text>
                        <Text style={styles.travelerRole}>
                          {collab.role === 'owner' ? 'Organizer' : collab.role === 'editor' ? 'Contributor' : 'Viewer'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {!hasLocalData && displayTravelers > 1 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Users size={16} color={Colors.text} />
                  <Text style={styles.sectionTitle}>Travelers</Text>
                  <Text style={styles.sectionCount}>{displayTravelers}</Text>
                </View>
                <View style={styles.travelersCard}>
                  <View style={styles.travelerRow}>
                    <View style={[styles.travelerAvatar, styles.avatarPlaceholder]}>
                      <Users size={16} color="#999" />
                    </View>
                    <View style={styles.travelerInfo}>
                      <Text style={styles.travelerName}>{displayTravelers} travelers on this trip</Text>
                      <Text style={styles.travelerRole}>Open in app to see details</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {hasLocalData && hasItinerary && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ListChecks size={16} color={Colors.text} />
                  <Text style={styles.sectionTitle}>Itinerary Preview</Text>
                </View>

                {trip.itinerary.slice(0, 3).map((day, dayIndex) => (
                  <View key={day.id} style={styles.itineraryDayCard}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>Day {dayIndex + 1}</Text>
                    </View>
                    {day.activities.slice(0, 3).map((activity) => (
                      <View key={activity.id} style={styles.activityRow}>
                        <View style={styles.activityTimeDot} />
                        <View style={styles.activityContent}>
                          <Text style={styles.activityTitle}>{activity.title}</Text>
                          {activity.location && (
                            <Text style={styles.activityLocation}>{activity.location}</Text>
                          )}
                        </View>
                        {activity.startTime && (
                          <Text style={styles.activityTime}>{activity.startTime}</Text>
                        )}
                      </View>
                    ))}
                    {day.activities.length > 3 && (
                      <Text style={styles.moreText}>
                        +{day.activities.length - 3} more activities
                      </Text>
                    )}
                  </View>
                ))}

                {groupedStoredItinerary.slice(0, 3).map((group) => (
                  <View key={group.date} style={styles.itineraryDayCard}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>
                        {formatShortDate(group.date)}
                      </Text>
                    </View>
                    {group.items.slice(0, 3).map((item) => (
                      <View key={item.id} style={styles.activityRow}>
                        <View style={styles.activityTimeDot} />
                        <View style={styles.activityContent}>
                          <Text style={styles.activityTitle}>{item.title}</Text>
                          {item.notes && (
                            <Text style={styles.activityLocation} numberOfLines={1}>
                              {item.notes}
                            </Text>
                          )}
                        </View>
                        {item.time && (
                          <Text style={styles.activityTime}>{item.time}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                ))}

                {(trip.itinerary.length > 3 || groupedStoredItinerary.length > 3) && (
                  <View style={styles.fadeHint}>
                    <Text style={styles.fadeHintText}>
                      Open in TripNest to see the full itinerary
                    </Text>
                  </View>
                )}
              </View>
            )}

            {hasLocalData && hasMemories && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Camera size={16} color={Colors.text} />
                  <Text style={styles.sectionTitle}>Memories</Text>
                  <Text style={styles.sectionCount}>{tripMemories.length}</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.memoriesScroll}
                >
                  {tripMemories.slice(0, 6).map((memory) => (
                    <View key={memory.id} style={styles.memoryThumb}>
                      <Image source={{ uri: memory.uri }} style={styles.memoryThumbImage} />
                    </View>
                  ))}
                  {tripMemories.length > 6 && (
                    <View style={styles.memoryMoreThumb}>
                      <Text style={styles.memoryMoreText}>
                        +{tripMemories.length - 6}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}

            <View style={styles.ctaSection}>
              <View style={styles.ctaCard}>
                <View style={styles.ctaIconContainer}>
                  <IconComponent size={40} color={trip?.iconColor ?? '#1A1A1A'} />
                </View>
                <Text style={styles.ctaTitle}>
                  {hasLocalData ? 'Want to join this trip?' : 'View full trip details'}
                </Text>
                <Text style={styles.ctaSub}>
                  {hasLocalData
                    ? 'Open in the TripNest app to view all details, collaborate, and start planning.'
                    : 'Open in the TripNest app to see the full itinerary, collaborate with travelers, and plan together.'
                  }
                </Text>

                <TouchableOpacity
                  style={styles.ctaPrimaryBtn}
                  activeOpacity={0.8}
                  onPress={handleOpenInApp}
                >
                  {hasLocalData ? (
                    <Plane size={18} color="#fff" />
                  ) : (
                    <ExternalLink size={18} color="#fff" />
                  )}
                  <Text style={styles.ctaPrimaryText}>Open in TripNest</Text>
                  <ChevronRight size={18} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.ctaSecondaryBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log('[SharedTrip] Download tapped');
                  }}
                >
                  <Download size={18} color="#1A1A1A" />
                  <Text style={styles.ctaSecondaryText}>Download the App</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.footerLogoRow}>
                <View style={styles.footerLogoMark}>
                  <Plane size={12} color="#fff" />
                </View>
                <Text style={styles.footerLogoText}>TripNest</Text>
              </View>
              <Text style={styles.footerText}>
                Plan trips together. Travel smarter.
              </Text>
              <Text style={styles.footerDisclaimer}>
                This is a read-only view of a shared trip.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 15,
    color: '#888',
    marginTop: 16,
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  notFoundSub: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  notFoundBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
  },
  notFoundBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  heroSection: {
    height: 340,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#E0E0E0',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroContentWrap: {
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMarkSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTextSmall: {
    fontSize: 17,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    marginBottom: 10,
  },
  sharedBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLocation: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.85)',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    paddingVertical: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 1,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    flex: 1,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#888',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  travelersCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  travelerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  travelerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 14,
    backgroundColor: '#F0F0F0',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECECEC',
  },
  travelerInfo: {
    flex: 1,
  },
  travelerName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  travelerRole: {
    fontSize: 13,
    color: '#999',
    marginTop: 1,
  },
  itineraryDayCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  dayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
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
    backgroundColor: '#D0D0D0',
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1A1A1A',
  },
  activityLocation: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#888',
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginLeft: 20,
  },
  fadeHint: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  fadeHintText: {
    fontSize: 13,
    color: '#999',
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
    backgroundColor: '#F0F0F0',
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
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryMoreText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#888',
  },
  ctaSection: {
    marginTop: 12,
    marginBottom: 24,
  },
  ctaCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  ctaIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSub: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  ctaPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    marginBottom: 12,
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
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
  },
  ctaSecondaryText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  footerLogoMark: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLogoText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  footerText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  footerDisclaimer: {
    fontSize: 11,
    color: '#BBB',
  },
});
