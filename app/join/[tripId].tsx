import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, Image, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  MapPin, Calendar, Users, Plane, UserPlus, Check, Home,
  Clock, DollarSign, Download,
} from 'lucide-react-native';
import { useTripsStore } from '@/store/useTripsStore';
import { mockTrips } from '@/mocks/trips';
import { Trip } from '@/types/trip';
import { getDestinationImageHQ } from '@/utils/destinationImages';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function calculateDays(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
}

export default function JoinTripByIdScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [joined, setJoined] = useState(false);

  const storeTrips = useTripsStore((s) => s.trips);
  const joinTripById = useTripsStore((s) => s.joinTripById);

  const trip: Trip | undefined = useMemo(() => {
    if (!tripId) return undefined;
    const stored = storeTrips.find((t) => t.id === tripId);
    if (stored) return stored;
    return mockTrips.find((t) => t.id === tripId);
  }, [tripId, storeTrips]);

  const handleJoin = () => {
    if (!userName.trim()) {
      Alert.alert('Enter your name', 'Please enter your name to join this trip.');
      return;
    }
    if (!tripId) return;
    const result = joinTripById(tripId, userName.trim());
    if (result) {
      setJoined(true);
      console.log('[JoinTrip] Successfully joined trip:', tripId);
    } else {
      Alert.alert('Error', 'Could not join this trip. It may no longer exist.');
    }
  };

  const handleOpenTrip = () => {
    if (tripId) {
      router.replace(`/trip/${tripId}` as any);
    }
  };

  const handleGoHome = () => {
    router.replace('/');
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
            <TouchableOpacity style={styles.darkBtn} onPress={handleGoHome}>
              <Home size={16} color="#fff" />
              <Text style={styles.darkBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (joined) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.notFoundContainer}>
          <View style={styles.notFoundContent}>
            <View style={styles.successIcon}>
              <Check size={32} color="#fff" />
            </View>
            <Text style={styles.successTitle}>You've joined this trip!</Text>
            <Text style={styles.successSub}>
              You've joined "{trip.name}". You can now view and edit this trip.
            </Text>
            <TouchableOpacity style={styles.darkBtn} onPress={handleOpenTrip}>
              <Plane size={18} color="#fff" />
              <Text style={styles.darkBtnText}>Open Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={handleGoHome}>
              <Text style={styles.ghostBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const owner = trip.collaborators.find((c) => c.role === 'owner');
  const travelerCount = trip.collaborators.length;
  const coverImage = getDestinationImageHQ(trip.destination, trip.country);
  const tripDays = calculateDays(trip.startDate, trip.endDate);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.heroSection}>
            <Image source={{ uri: coverImage }} style={styles.heroImage} />
            <View style={styles.heroOverlay} />

            <SafeAreaView style={styles.heroTopWrap} edges={['top']}>
              <View style={styles.topBar}>
                <View style={{ width: 40 }} />
                <View style={styles.logoRow}>
                  <View style={styles.logoMarkLight}>
                    <Plane size={14} color="#fff" />
                  </View>
                  <Text style={styles.logoTextLight}>TripNest</Text>
                </View>
                <View style={{ width: 40 }} />
              </View>
            </SafeAreaView>

            <View style={styles.heroBottom}>
              <View style={styles.inviteBadge}>
                <UserPlus size={11} color="#fff" />
                <Text style={styles.inviteBadgeText}>Trip Invitation</Text>
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
                  <View style={styles.summaryIconWrap}>
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
                  <View style={styles.summaryIconWrap}>
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
                      <View style={styles.summaryIconWrap}>
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

            {owner && (
              <View style={styles.organizerCard}>
                <Image source={{ uri: owner.avatar }} style={styles.organizerAvatar} />
                <View style={styles.organizerInfo}>
                  <Text style={styles.organizerLabel}>Organized by</Text>
                  <Text style={styles.organizerName}>
                    {trip.ownerName || owner.name}
                  </Text>
                </View>
              </View>
            )}

            {travelerCount > 1 && (
              <View style={styles.travelersCard}>
                <View style={styles.travelersHeader}>
                  <Users size={15} color="#1A1A1A" />
                  <Text style={styles.travelersTitle}>
                    {travelerCount} traveler{travelerCount !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.avatarRow}>
                  {trip.collaborators.slice(0, 5).map((collab) => (
                    <Image
                      key={collab.id}
                      source={{ uri: collab.avatar }}
                      style={styles.smallAvatar}
                    />
                  ))}
                  {travelerCount > 5 && (
                    <View style={styles.moreAvatars}>
                      <Text style={styles.moreAvatarsText}>+{travelerCount - 5}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {trip.itinerary.length > 0 && (
              <View style={styles.previewSection}>
                <Text style={styles.previewTitle}>Itinerary Preview</Text>
                {trip.itinerary.slice(0, 2).map((day, dayIndex) => (
                  <View key={day.id} style={styles.dayCard}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>Day {dayIndex + 1}</Text>
                    </View>
                    {day.activities.slice(0, 3).map((activity) => (
                      <View key={activity.id} style={styles.activityRow}>
                        <View style={styles.activityDot} />
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
                      <Text style={styles.moreActivities}>
                        +{day.activities.length - 3} more
                      </Text>
                    )}
                  </View>
                ))}
                {trip.itinerary.length > 2 && (
                  <Text style={styles.fadeHint}>
                    Join to see the full itinerary
                  </Text>
                )}
              </View>
            )}

            <View style={styles.joinCard}>
              <Text style={styles.joinCardTitle}>Join this trip</Text>
              <Text style={styles.joinCardSub}>
                Enter your name to join as a collaborator. You'll be able to view and edit the trip.
              </Text>
              <TextInput
                style={styles.nameInput}
                placeholder="Your name"
                placeholderTextColor="#AAA"
                value={userName}
                onChangeText={setUserName}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleJoin}
                testID="join-trip-name-input"
              />
              <TouchableOpacity
                style={[styles.joinBtn, !userName.trim() && styles.joinBtnDisabled]}
                onPress={handleJoin}
                activeOpacity={0.8}
                disabled={!userName.trim()}
                testID="join-trip-button"
              >
                <UserPlus size={18} color="#fff" />
                <Text style={styles.joinBtnText}>Join Trip</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ctaSection}>
              <TouchableOpacity
                style={styles.ctaSecondaryBtn}
                activeOpacity={0.7}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    console.log('[JoinTrip] Download tapped (web)');
                  } else {
                    handleOpenTrip();
                  }
                }}
              >
                <Download size={18} color="#1A1A1A" />
                <Text style={styles.ctaSecondaryText}>Download TripNest App</Text>
              </TouchableOpacity>
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
  logoMarkLight: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTextLight: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: -0.3,
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
  darkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    width: '100%',
    maxWidth: 320,
    marginBottom: 12,
  },
  darkBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  ghostBtn: {
    paddingVertical: 12,
  },
  ghostBtnText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500' as const,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  successSub: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  heroSection: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
  heroBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  inviteBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginBottom: 12,
  },
  inviteBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
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
    marginBottom: 14,
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
  summaryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
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
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
  },
  organizerInfo: {
    flex: 1,
  },
  organizerLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 2,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  travelersCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  travelersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  travelersTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
  },
  moreAvatars: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAvatarsText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#888',
  },
  previewSection: {
    marginBottom: 14,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  dayCard: {
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
  activityDot: {
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
  moreActivities: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginLeft: 20,
  },
  fadeHint: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic' as const,
    textAlign: 'center',
    marginTop: 8,
  },
  joinCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  joinCardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 6,
  },
  joinCardSub: {
    fontSize: 14,
    color: '#888',
    lineHeight: 21,
    marginBottom: 20,
  },
  nameInput: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
  },
  joinBtnDisabled: {
    opacity: 0.4,
  },
  joinBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  ctaSection: {
    marginBottom: 24,
  },
  ctaSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F0F0F0',
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
  },
});
