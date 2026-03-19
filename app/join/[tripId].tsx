import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, Image, ScrollView, Platform, Animated, Linking, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  MapPin, Calendar, Users, Plane, UserPlus, Check, Home,
  Clock, DollarSign, Download, ExternalLink, AlertCircle, Compass,
} from 'lucide-react-native';
import { useThemeColors, useIsDark } from '@/hooks/useThemeColors';
import { ThemeColors } from '@/constants/themes';
import { useTripsStore } from '@/store/useTripsStore';
import { mockTrips } from '@/mocks/trips';
import { Trip } from '@/types/trip';
import { getDestinationImageHQ } from '@/utils/destinationImages';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

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

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return date; }
}

function formatShortDate(date: string) {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  } catch { return date; }
}

function calculateDays(startDate: string, endDate: string) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
  } catch { return 1; }
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

function AnimatedPressable({ children, onPress, style, disabled, testID }: { children: React.ReactNode; onPress: () => void; style?: any; disabled?: boolean; testID?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = useCallback(() => {
    if (disabled) return;
    hapticLight();
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale, disabled]);
  const handlePressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled} testID={testID}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function JoinTripByIdScreen() {
  const params = useLocalSearchParams<{
    tripId: string;
    name?: string;
    dest?: string;
    country?: string;
    start?: string;
    end?: string;
    budget?: string;
    travelers?: string;
    owner?: string;
  }>();
  const { tripId } = params;
  const router = useRouter();
  const colors = useThemeColors();
  const isDark = useIsDark();
  const [userName, setUserName] = useState('');
  const [joined, setJoined] = useState(false);

  const isHydrated = useTripsStore((s) => s.isHydrated);
  const storeTrips = useTripsStore((s) => s.trips);
  const joinTripById = useTripsStore((s) => s.joinTripById);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const trip: Trip | undefined = useMemo(() => {
    if (!tripId || !isHydrated) return undefined;
    const stored = storeTrips.find((t) => t.id === tripId);
    if (stored) return stored;
    return mockTrips.find((t) => t.id === tripId);
  }, [tripId, storeTrips, isHydrated]);

  const preview = useMemo(() => parsePreviewFromParams(params), [params]);

  const hasLocalData = !!trip;
  const hasPreviewData = !!preview;
  const isLoading = !isHydrated;
  const s = createStyles(colors, isDark);

  const handleJoin = () => {
    if (!userName.trim()) {
      Alert.alert('Enter your name', 'Please enter your name to join this trip.');
      return;
    }
    if (!tripId) return;
    const result = joinTripById(tripId, userName.trim());
    if (result) {
      hapticSuccess();
      setJoined(true);
      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();
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

  const handleOpenInApp = () => {
    if (Platform.OS === 'web') {
      const scheme = `rork-app://join/${tripId}`;
      void Linking.canOpenURL(scheme).then((supported) => {
        if (supported) {
          void Linking.openURL(scheme);
        } else {
          console.log('[JoinTrip] App not installed, staying on web preview');
        }
      }).catch(() => {
        console.log('[JoinTrip] Could not check URL scheme');
      });
    } else {
      handleOpenTrip();
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.container}>
          <View style={s.skeletonHero}>
            <SkeletonBlock width="100%" height={340} colors={colors} style={{ borderRadius: 0 }} />
          </View>
          <View style={s.skeletonBody}>
            <SkeletonBlock width="60%" height={28} colors={colors} />
            <SkeletonBlock width="40%" height={16} colors={colors} style={{ marginTop: 12 }} />
            <View style={{ flexDirection: 'row' as const, gap: 10, marginTop: 20 }}>
              <SkeletonBlock width="32%" height={90} colors={colors} style={{ borderRadius: 16 }} />
              <SkeletonBlock width="32%" height={90} colors={colors} style={{ borderRadius: 16 }} />
              <SkeletonBlock width="32%" height={90} colors={colors} style={{ borderRadius: 16 }} />
            </View>
            <SkeletonBlock width="100%" height={180} colors={colors} style={{ marginTop: 20, borderRadius: 20 }} />
          </View>
        </View>
      </>
    );
  }

  if (joined && trip) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.container}>
          <SafeAreaView style={s.centerContainer}>
            <Animated.View style={[s.centerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Animated.View style={[s.successIconWrap, { transform: [{ scale: successScale }] }]}>
                <View style={s.successIcon}>
                  <Check size={32} color="#fff" />
                </View>
              </Animated.View>
              <Text style={[s.successTitle, { color: colors.text }]}>You're in!</Text>
              <Text style={[s.successSub, { color: colors.textSecondary }]}>
                You've joined "{trip.name}". You can now view and edit this trip.
              </Text>
              <AnimatedPressable onPress={handleOpenTrip} style={{ width: '100%' as const, maxWidth: 320 }}>
                <View style={[s.primaryBtn, { backgroundColor: colors.accent }]}>
                  <Plane size={18} color="#fff" />
                  <Text style={s.primaryBtnText}>Open Trip</Text>
                </View>
              </AnimatedPressable>
              <TouchableOpacity style={s.ghostBtn} onPress={handleGoHome} activeOpacity={0.6}>
                <Text style={[s.ghostBtnText, { color: colors.textMuted }]}>Back to Home</Text>
              </TouchableOpacity>
            </Animated.View>
          </SafeAreaView>
        </View>
      </>
    );
  }

  if (!hasLocalData && !hasPreviewData) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.container}>
          <SafeAreaView style={s.centerContainer}>
            <Animated.View style={[s.centerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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
                The trip may have been removed, or this link is no longer active. Ask the trip owner to send a new invite.
              </Text>
              <AnimatedPressable onPress={handleGoHome} style={{ width: '100%' as const, maxWidth: 320 }}>
                <View style={[s.primaryBtn, { backgroundColor: colors.accent }]}>
                  <Home size={16} color="#fff" />
                  <Text style={s.primaryBtnText}>Go to TripNest</Text>
                </View>
              </AnimatedPressable>
            </Animated.View>
          </SafeAreaView>
        </View>
      </>
    );
  }

  const displayName = trip?.name ?? preview?.name ?? 'Shared Trip';
  const displayDest = trip?.destination ?? preview?.destination ?? '';
  const displayCountry = trip?.country ?? preview?.country ?? '';
  const displayStart = trip?.startDate ?? preview?.startDate ?? '';
  const displayEnd = trip?.endDate ?? preview?.endDate ?? '';
  const displayBudget = trip?.totalBudget ?? preview?.totalBudget ?? 0;
  const displayTravelers = trip?.collaborators?.length ?? preview?.travelers ?? 1;
  const displayOwner = trip?.ownerName ?? preview?.ownerName ?? '';
  const coverImage = getDestinationImageHQ(displayDest, displayCountry);
  const tripDays = displayStart && displayEnd ? calculateDays(displayStart, displayEnd) : 0;
  const owner = trip?.collaborators?.find((c) => c.role === 'owner');

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
              colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.72)']}
              locations={[0, 0.3, 1]}
              style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={s.heroTopWrap} edges={['top']}>
              <View style={s.topBar}>
                <View style={{ width: 40 }} />
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
              <View style={s.inviteBadge}>
                <UserPlus size={11} color="#fff" />
                <Text style={s.inviteBadgeText}>Trip Invitation</Text>
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
            {(tripDays > 0 || displayTravelers > 0 || displayBudget > 0) && (
              <View style={s.statsRow}>
                {tripDays > 0 && (
                  <View style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[s.statIcon, { backgroundColor: isDark ? 'rgba(34,211,238,0.12)' : 'rgba(8,145,178,0.08)' }]}>
                      <Clock size={18} color={colors.accent} />
                    </View>
                    <Text style={[s.statValue, { color: colors.text }]}>{tripDays}</Text>
                    <Text style={[s.statLabel, { color: colors.textMuted }]}>days</Text>
                  </View>
                )}
                {displayTravelers > 0 && (
                  <View style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[s.statIcon, { backgroundColor: isDark ? 'rgba(34,211,238,0.12)' : 'rgba(8,145,178,0.08)' }]}>
                      <Users size={18} color={colors.accent} />
                    </View>
                    <Text style={[s.statValue, { color: colors.text }]}>{displayTravelers}</Text>
                    <Text style={[s.statLabel, { color: colors.textMuted }]}>travelers</Text>
                  </View>
                )}
                {displayBudget > 0 && (
                  <View style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
              <View style={[s.dateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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

            {(owner || displayOwner) && (
              <View style={[s.organizerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {owner?.avatar ? (
                  <Image source={{ uri: owner.avatar }} style={s.organizerAvatar} />
                ) : (
                  <View style={[s.organizerAvatar, { backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg, justifyContent: 'center' as const, alignItems: 'center' as const }]}>
                    <Users size={20} color={colors.textMuted} />
                  </View>
                )}
                <View style={s.organizerInfo}>
                  <Text style={[s.organizerLabel, { color: colors.textMuted }]}>Organized by</Text>
                  <Text style={[s.organizerName, { color: colors.text }]}>
                    {owner?.name ?? displayOwner}
                  </Text>
                </View>
              </View>
            )}

            {displayTravelers > 1 && trip?.collaborators && (
              <View style={[s.travelersCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={s.travelersHeader}>
                  <Users size={15} color={colors.text} />
                  <Text style={[s.travelersTitle, { color: colors.text }]}>
                    {displayTravelers} traveler{displayTravelers !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={s.avatarRow}>
                  {trip.collaborators.slice(0, 5).map((collab) =>
                    collab.avatar ? (
                      <Image key={collab.id} source={{ uri: collab.avatar }} style={s.smallAvatar} />
                    ) : (
                      <View key={collab.id} style={[s.smallAvatar, { backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg, justifyContent: 'center' as const, alignItems: 'center' as const }]}>
                        <Users size={14} color={colors.textMuted} />
                      </View>
                    )
                  )}
                  {trip.collaborators.length > 5 && (
                    <View style={[s.moreAvatars, { backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg }]}>
                      <Text style={[s.moreAvatarsText, { color: colors.textSecondary }]}>+{trip.collaborators.length - 5}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {hasLocalData && trip.itinerary.length > 0 && (
              <View style={s.previewSection}>
                <Text style={[s.previewTitle, { color: colors.text }]}>Itinerary Preview</Text>
                {trip.itinerary.slice(0, 2).map((day, dayIndex) => (
                  <View key={day.id} style={[s.dayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[s.dayBadge, { backgroundColor: colors.accent }]}>
                      <Text style={s.dayBadgeText}>Day {dayIndex + 1}</Text>
                    </View>
                    {day.activities.slice(0, 3).map((activity) => (
                      <View key={activity.id} style={s.activityRow}>
                        <View style={[s.activityDot, { backgroundColor: colors.accent }]} />
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
                      <Text style={[s.moreActivities, { color: colors.textMuted }]}>
                        +{day.activities.length - 3} more
                      </Text>
                    )}
                  </View>
                ))}
                {trip.itinerary.length > 2 && (
                  <Text style={[s.fadeHint, { color: colors.textMuted }]}>
                    Join to see the full itinerary
                  </Text>
                )}
              </View>
            )}

            {hasLocalData ? (
              <View style={[s.joinCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.joinCardTitle, { color: colors.text }]}>Join this trip</Text>
                <Text style={[s.joinCardSub, { color: colors.textSecondary }]}>
                  Enter your name to join as a collaborator. You'll be able to view and edit the trip.
                </Text>
                <TextInput
                  style={[s.nameInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                  placeholder="Your name"
                  placeholderTextColor={colors.textMuted}
                  value={userName}
                  onChangeText={setUserName}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleJoin}
                  testID="join-trip-name-input"
                />
                <AnimatedPressable
                  onPress={handleJoin}
                  disabled={!userName.trim()}
                  style={{ width: '100%' as const }}
                  testID="join-trip-button"
                >
                  <View style={[s.joinBtn, { backgroundColor: colors.accent }, !userName.trim() && s.joinBtnDisabled]}>
                    <UserPlus size={18} color="#fff" />
                    <Text style={s.joinBtnText}>Join Trip</Text>
                  </View>
                </AnimatedPressable>
              </View>
            ) : (
              <View style={[s.joinCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[s.webPreviewIcon, { backgroundColor: isDark ? 'rgba(34,211,238,0.12)' : 'rgba(8,145,178,0.08)' }]}>
                  <Compass size={28} color={colors.accent} />
                </View>
                <Text style={[s.joinCardTitle, { color: colors.text }]}>Join this trip on TripNest</Text>
                <Text style={[s.joinCardSub, { color: colors.textSecondary }]}>
                  Open this trip in the TripNest app to join as a collaborator, view the full itinerary, and start planning together.
                </Text>

                <AnimatedPressable onPress={handleOpenInApp} style={{ width: '100%' as const }} testID="open-in-app-button">
                  <View style={[s.joinBtn, { backgroundColor: colors.accent }]}>
                    <ExternalLink size={18} color="#fff" />
                    <Text style={s.joinBtnText}>Open in App</Text>
                  </View>
                </AnimatedPressable>

                <AnimatedPressable onPress={() => console.log('[JoinTrip] Download tapped')} style={{ width: '100%' as const }}>
                  <View style={[s.downloadBtn, { backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg }]}>
                    <Download size={18} color={colors.text} />
                    <Text style={[s.downloadBtnText, { color: colors.text }]}>Download TripNest</Text>
                  </View>
                </AnimatedPressable>
              </View>
            )}

            {hasLocalData && (
              <View style={s.ctaSection}>
                <AnimatedPressable
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      console.log('[JoinTrip] Download tapped (web)');
                    } else {
                      handleOpenTrip();
                    }
                  }}
                  style={{ width: '100%' as const }}
                >
                  <View style={[s.downloadBtn, { backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg }]}>
                    <Download size={18} color={colors.text} />
                    <Text style={[s.downloadBtnText, { color: colors.text }]}>Download TripNest App</Text>
                  </View>
                </AnimatedPressable>
              </View>
            )}

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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
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
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  ghostBtn: {
    paddingVertical: 12,
  },
  ghostBtnText: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  successIconWrap: {
    marginBottom: 20,
  },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  successSub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  heroSection: {
    height: 340,
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
  inviteBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    marginBottom: 12,
  },
  inviteBadgeText: {
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
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.04,
    shadowRadius: 6,
    elevation: isDark ? 0 : 1,
    borderWidth: isDark ? 1 : 0,
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
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.04,
    shadowRadius: 6,
    elevation: isDark ? 0 : 1,
    borderWidth: isDark ? 1 : 0,
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
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.04,
    shadowRadius: 6,
    elevation: isDark ? 0 : 1,
    borderWidth: isDark ? 1 : 0,
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  travelersCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.04,
    shadowRadius: 6,
    elevation: isDark ? 0 : 1,
    borderWidth: isDark ? 1 : 0,
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
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  moreAvatars: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAvatarsText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  previewSection: {
    marginBottom: 14,
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  dayCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.04,
    shadowRadius: 6,
    elevation: isDark ? 0 : 1,
    borderWidth: isDark ? 1 : 0,
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
  activityDot: {
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
  moreActivities: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 20,
  },
  fadeHint: {
    fontSize: 13,
    fontStyle: 'italic' as const,
    textAlign: 'center',
    marginTop: 8,
  },
  joinCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: isDark ? 0 : 0.06,
    shadowRadius: 12,
    elevation: isDark ? 0 : 3,
    alignItems: 'center',
    borderWidth: isDark ? 1 : 0,
  },
  webPreviewIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  joinCardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 6,
    textAlign: 'center',
  },
  joinCardSub: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
    textAlign: 'center',
  },
  nameInput: {
    width: '100%',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  joinBtnDisabled: {
    opacity: 0.4,
  },
  joinBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
  },
  downloadBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  ctaSection: {
    marginBottom: 24,
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
  },
});
