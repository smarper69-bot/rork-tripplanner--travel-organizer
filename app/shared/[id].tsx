import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ArrowLeft, MapPin, Calendar, Users, Clock,
  DollarSign, Plane, ChevronRight, Download,
  Flower2, Church, Palmtree, Mountain, Sun, Landmark, Trees, Snowflake, Tent,
  Camera, ListChecks,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTripsStore } from '@/store/useTripsStore';
import { mockTrips } from '@/mocks/trips';
import { TripIcon, StoredItineraryItem } from '@/types/trip';
import { getDestinationImageHQ } from '@/utils/destinationImages';

export default function SharedTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const storeTrips = useTripsStore((s) => s.trips);
  const allItineraryItems = useTripsStore((s) => s.itineraryItems);
  const allMemories = useTripsStore((s) => s.memories);

  const trip = useMemo(() => {
    const stored = storeTrips.find((t) => t.id === id);
    if (stored) return stored;
    return mockTrips.find((t) => t.id === id);
  }, [storeTrips, id]);

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

  if (!trip) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.notFoundContainer}>
          <View style={styles.notFoundContent}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <Plane size={18} color="#fff" />
              </View>
              <Text style={styles.logoText}>TripNest</Text>
            </View>
            <Text style={styles.notFoundTitle}>Trip not found</Text>
            <Text style={styles.notFoundSub}>
              This trip may have been removed or the link is invalid.
            </Text>
            <TouchableOpacity style={styles.notFoundBtn} onPress={() => router.back()}>
              <Text style={styles.notFoundBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatShortDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDays = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
  };

  const tripDays = calculateDays();
  const IconComponent = getIconComponent(trip.icon);
  const coverImage = getDestinationImageHQ(trip.destination, trip.country);

  const allActivities = trip.itinerary.flatMap((day) => day.activities);

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
            <Image source={{ uri: coverImage }} style={styles.heroImage} />
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
              <Text style={styles.heroTitle}>{trip.name}</Text>
              <View style={styles.heroLocationRow}>
                <MapPin size={15} color="rgba(255,255,255,0.85)" />
                <Text style={styles.heroLocation}>
                  {trip.destination}, {trip.country}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIcon, { backgroundColor: '#F0F0F0' }]}>
                    <Calendar size={18} color="#1A1A1A" />
                  </View>
                  <View>
                    <Text style={styles.summaryValue}>
                      {formatDate(trip.startDate)}
                    </Text>
                    <Text style={styles.summaryLabel}>
                      {tripDays} day{tripDays !== 1 ? 's' : ''} trip
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIcon, { backgroundColor: '#F0F0F0' }]}>
                    <Clock size={18} color="#1A1A1A" />
                  </View>
                  <View>
                    <Text style={styles.summaryValue}>
                      {formatShortDate(trip.startDate)}
                    </Text>
                    <Text style={styles.summaryLabel}>
                      to {formatShortDate(trip.endDate)}
                    </Text>
                  </View>
                </View>
              </View>

              {trip.totalBudget > 0 && (
                <>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <View style={[styles.summaryIcon, { backgroundColor: '#F0F0F0' }]}>
                        <DollarSign size={18} color="#1A1A1A" />
                      </View>
                      <View>
                        <Text style={styles.summaryValue}>
                          ${trip.totalBudget.toLocaleString()}
                        </Text>
                        <Text style={styles.summaryLabel}>Total budget</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </View>

            {trip.collaborators.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Users size={16} color={Colors.text} />
                  <Text style={styles.sectionTitle}>Travelers</Text>
                  <Text style={styles.sectionCount}>{trip.collaborators.length}</Text>
                </View>
                <View style={styles.travelersCard}>
                  {trip.collaborators.map((collab) => (
                    <View key={collab.id} style={styles.travelerRow}>
                      <Image source={{ uri: collab.avatar }} style={styles.travelerAvatar} />
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

            {hasItinerary && (
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

            {hasMemories && (
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
                  <IconComponent size={40} color={trip.iconColor} />
                </View>
                <Text style={styles.ctaTitle}>Want to join this trip?</Text>
                <Text style={styles.ctaSub}>
                  Open in the TripNest app to view all details, collaborate, and start planning.
                </Text>

                <TouchableOpacity
                  style={styles.ctaPrimaryBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    router.push(`/trip/${id}` as any);
                    console.log('[SharedTrip] Open in app tapped');
                  }}
                >
                  <Plane size={18} color="#fff" />
                  <Text style={styles.ctaPrimaryText}>Open in TripNest</Text>
                  <ChevronRight size={18} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.ctaSecondaryBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      console.log('[SharedTrip] Download tapped (web)');
                    } else {
                      console.log('[SharedTrip] Download tapped (native)');
                    }
                  }}
                >
                  <Download size={18} color={Colors.text} />
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
          </View>
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
    marginTop: 32,
    marginBottom: 8,
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
    fontStyle: 'italic',
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
