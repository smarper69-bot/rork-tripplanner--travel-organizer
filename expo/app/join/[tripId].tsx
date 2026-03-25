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
  Clock, DollarSign, Download, ExternalLink, AlertCircle,
  ChevronRight, Globe, Sparkles, Shield,
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

function formatShortDate(date: string) {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
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

function SkeletonPulse({ width, height, colors, style }: { width: number | string; height: number; colors: ThemeColors; style?: any }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmer]);
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] });
  return (
    <Animated.View style={[{ width, height, borderRadius: 12, backgroundColor: colors.border, opacity }, style]} />
  );
}

function PressableScale({ children, onPress, style, disabled, testID }: { children: React.ReactNode; onPress: () => void; style?: any; disabled?: boolean; testID?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = useCallback(() => {
    if (disabled) return;
    hapticLight();
    Animated.spring(scale, { toValue: 0.965, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
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
  const slideAnim = useRef(new Animated.Value(30)).current;
  const heroFade = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successFade = useRef(new Animated.Value(0)).current;
  const inputFocus = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(heroFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 4 }),
      ]),
    ]).start();
  }, [heroFade, fadeAnim, slideAnim]);

  const trip: Trip | undefined = useMemo(() => {
    if (!tripId || !isHydrated) return undefined;
    const stored = storeTrips.find((t) => t.id === tripId);
    if (stored) return stored;
    return mockTrips.find((t) => t.id === tripId);
  }, [tripId, storeTrips, isHydrated]);

  const preview = useMemo(() => parsePreviewFromParams(params), [params]);

  const hasLocalData = !!trip;
  const hasPreviewData = !!preview;
  const isLoading = !isHydrated && !hasPreviewData;
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
      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }),
        Animated.timing(successFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
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

  const handleInputFocus = useCallback(() => {
    Animated.timing(inputFocus, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  }, [inputFocus]);

  const handleInputBlur = useCallback(() => {
    Animated.timing(inputFocus, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  }, [inputFocus]);

  const inputBorderColor = inputFocus.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.accent],
  });

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.container}>
          <View style={s.skeletonHero}>
            <SkeletonPulse width="100%" height={380} colors={colors} style={{ borderRadius: 0 }} />
          </View>
          <View style={s.skeletonBody}>
            <SkeletonPulse width="70%" height={26} colors={colors} />
            <SkeletonPulse width="45%" height={16} colors={colors} style={{ marginTop: 10 }} />
            <View style={{ flexDirection: 'row' as const, gap: 10, marginTop: 24 }}>
              <SkeletonPulse width="31%" height={96} colors={colors} style={{ borderRadius: 16 }} />
              <SkeletonPulse width="31%" height={96} colors={colors} style={{ borderRadius: 16 }} />
              <SkeletonPulse width="31%" height={96} colors={colors} style={{ borderRadius: 16 }} />
            </View>
            <SkeletonPulse width="100%" height={72} colors={colors} style={{ marginTop: 18, borderRadius: 16 }} />
            <SkeletonPulse width="100%" height={200} colors={colors} style={{ marginTop: 18, borderRadius: 20 }} />
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
          <LinearGradient
            colors={isDark ? ['#0F0F0F', '#1A2A2F', '#0F0F0F'] : ['#F0FDFA', '#E0F7FA', '#F8F8F8']}
            style={StyleSheet.absoluteFillObject}
          />
          <SafeAreaView style={s.centerContainer}>
            <Animated.View style={[s.centerContent, { opacity: successFade }]}>
              <Animated.View style={[s.successCheckWrap, { transform: [{ scale: successScale }] }]}>
                <LinearGradient
                  colors={['#059669', '#10B981']}
                  style={s.successCheckGradient}
                >
                  <Check size={36} color="#fff" strokeWidth={3} />
                </LinearGradient>
              </Animated.View>
              <Text style={[s.successTitle, { color: colors.text }]}>You're in!</Text>
              <Text style={[s.successSub, { color: colors.textSecondary }]}>
                You've joined "{trip.name}". Start exploring the itinerary and collaborate with your group.
              </Text>
              <PressableScale onPress={handleOpenTrip} style={s.fullWidthBtn}>
                <LinearGradient
                  colors={isDark ? ['#0891B2', '#0E7490'] : ['#0891B2', '#0891B2']}
                  style={s.gradientBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Plane size={18} color="#fff" />
                  <Text style={s.gradientBtnText}>Open Trip</Text>
                  <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              </PressableScale>
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
          <LinearGradient
            colors={isDark ? ['#0F0F0F', '#1A1A1A'] : ['#F8F8F8', '#FFFFFF']}
            style={StyleSheet.absoluteFillObject}
          />
          <SafeAreaView style={s.centerContainer}>
            <Animated.View style={[s.centerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={s.brandRow}>
                <View style={[s.brandMark, { backgroundColor: colors.accent }]}>
                  <Plane size={16} color="#fff" />
                </View>
                <Text style={[s.brandText, { color: colors.text }]}>TripNest</Text>
              </View>
              <View style={[s.errorIconCircle, { backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#FEE2E2' }]}>
                <AlertCircle size={32} color={colors.error} />
              </View>
              <Text style={[s.errorTitle, { color: colors.text }]}>
                This trip link is no longer available
              </Text>
              <Text style={[s.errorSub, { color: colors.textSecondary }]}>
                The trip may have been removed or the link has expired. Ask the organizer to send a new invite.
              </Text>
              <PressableScale onPress={handleGoHome} style={s.fullWidthBtn}>
                <View style={[s.solidBtn, { backgroundColor: colors.accent }]}>
                  <Home size={16} color="#fff" />
                  <Text style={s.solidBtnText}>Go to TripNest</Text>
                </View>
              </PressableScale>
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
  const locationStr = [displayDest, displayCountry].filter(Boolean).join(', ');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={s.container}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <Animated.View style={{ opacity: heroFade }}>
            <View style={s.heroSection}>
              <Image
                source={{ uri: coverImage }}
                style={s.heroImage}
                defaultSource={{ uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&q=80' }}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.02)', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.85)']}
                locations={[0, 0.25, 0.7, 1]}
                style={StyleSheet.absoluteFillObject}
              />

              <SafeAreaView style={s.heroTopWrap} edges={['top']}>
                <View style={s.topBar}>
                  <View style={{ width: 40 }} />
                  <View style={s.topBarBrand}>
                    <View style={s.topBarBrandMark}>
                      <Plane size={12} color="#fff" />
                    </View>
                    <Text style={s.topBarBrandText}>TripNest</Text>
                  </View>
                  <View style={{ width: 40 }} />
                </View>
              </SafeAreaView>

              <View style={s.heroBottom}>
                <View style={s.inviteChip}>
                  <UserPlus size={10} color="#fff" />
                  <Text style={s.inviteChipText}>Trip Invitation</Text>
                </View>
                <Text style={s.heroTitle} numberOfLines={2}>{displayName}</Text>
                {locationStr ? (
                  <View style={s.heroLocationRow}>
                    <MapPin size={13} color="rgba(255,255,255,0.85)" />
                    <Text style={s.heroLocation}>{locationStr}</Text>
                  </View>
                ) : null}
                {displayStart ? (
                  <View style={s.heroDateRow}>
                    <Calendar size={13} color="rgba(255,255,255,0.7)" />
                    <Text style={s.heroDate}>
                      {formatShortDate(displayStart)}{displayEnd ? ` – ${formatShortDate(displayEnd)}` : ''}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[s.body, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {(tripDays > 0 || displayTravelers > 0 || displayBudget > 0) && (
              <View style={s.statsRow}>
                {tripDays > 0 && (
                  <View style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[s.statIconWrap, { backgroundColor: isDark ? 'rgba(34,211,238,0.1)' : 'rgba(8,145,178,0.06)' }]}>
                      <Clock size={16} color={colors.accent} />
                    </View>
                    <Text style={[s.statValue, { color: colors.text }]}>{tripDays}</Text>
                    <Text style={[s.statLabel, { color: colors.textMuted }]}>days</Text>
                  </View>
                )}
                {displayTravelers > 0 && (
                  <View style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[s.statIconWrap, { backgroundColor: isDark ? 'rgba(34,211,238,0.1)' : 'rgba(8,145,178,0.06)' }]}>
                      <Users size={16} color={colors.accent} />
                    </View>
                    <Text style={[s.statValue, { color: colors.text }]}>{displayTravelers}</Text>
                    <Text style={[s.statLabel, { color: colors.textMuted }]}>travelers</Text>
                  </View>
                )}
                {displayBudget > 0 && (
                  <View style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[s.statIconWrap, { backgroundColor: isDark ? 'rgba(34,211,238,0.1)' : 'rgba(8,145,178,0.06)' }]}>
                      <DollarSign size={16} color={colors.accent} />
                    </View>
                    <Text style={[s.statValue, { color: colors.text }]}>${displayBudget.toLocaleString()}</Text>
                    <Text style={[s.statLabel, { color: colors.textMuted }]}>budget</Text>
                  </View>
                )}
              </View>
            )}

            {(owner || displayOwner) && (
              <View style={[s.organizerRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {owner?.avatar ? (
                  <Image source={{ uri: owner.avatar }} style={s.organizerAvatar} />
                ) : (
                  <View style={[s.organizerAvatar, { backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg, justifyContent: 'center' as const, alignItems: 'center' as const }]}>
                    <Users size={18} color={colors.textMuted} />
                  </View>
                )}
                <View style={s.organizerInfo}>
                  <Text style={[s.organizerLabel, { color: colors.textMuted }]}>Organized by</Text>
                  <Text style={[s.organizerName, { color: colors.text }]}>{owner?.name ?? displayOwner}</Text>
                </View>
              </View>
            )}

            {hasLocalData && trip.itinerary.length > 0 && (
              <View style={s.previewSection}>
                <View style={s.previewHeader}>
                  <Sparkles size={15} color={colors.accent} />
                  <Text style={[s.previewTitle, { color: colors.text }]}>Itinerary Preview</Text>
                </View>
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

            {hasLocalData && displayTravelers > 1 && trip.collaborators && (
              <View style={[s.travelersRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={s.travelersAvatarStack}>
                  {trip.collaborators.slice(0, 4).map((collab, i) =>
                    collab.avatar ? (
                      <Image
                        key={collab.id}
                        source={{ uri: collab.avatar }}
                        style={[s.stackedAvatar, { marginLeft: i > 0 ? -10 : 0, zIndex: 10 - i }]}
                      />
                    ) : (
                      <View
                        key={collab.id}
                        style={[s.stackedAvatar, s.stackedAvatarPlaceholder, {
                          marginLeft: i > 0 ? -10 : 0,
                          zIndex: 10 - i,
                          backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg,
                        }]}
                      >
                        <Users size={12} color={colors.textMuted} />
                      </View>
                    )
                  )}
                  {trip.collaborators.length > 4 && (
                    <View style={[s.stackedAvatar, s.stackedAvatarMore, { marginLeft: -10, backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg }]}>
                      <Text style={[s.stackedAvatarMoreText, { color: colors.textSecondary }]}>+{trip.collaborators.length - 4}</Text>
                    </View>
                  )}
                </View>
                <Text style={[s.travelersText, { color: colors.textSecondary }]}>
                  {displayTravelers} traveler{displayTravelers !== 1 ? 's' : ''} going
                </Text>
              </View>
            )}

            {hasLocalData ? (
              <View style={[s.joinSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.joinTitle, { color: colors.text }]}>Join this trip</Text>
                <Text style={[s.joinSub, { color: colors.textSecondary }]}>
                  Enter your name to join as a collaborator and start planning together.
                </Text>
                <Animated.View style={[s.inputWrap, { borderColor: inputBorderColor }]}>
                  <TextInput
                    style={[s.nameInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                    placeholder="Your name"
                    placeholderTextColor={colors.textMuted}
                    value={userName}
                    onChangeText={setUserName}
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={handleJoin}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    testID="join-trip-name-input"
                  />
                </Animated.View>
                <PressableScale
                  onPress={handleJoin}
                  disabled={!userName.trim()}
                  style={s.fullWidthBtn}
                  testID="join-trip-button"
                >
                  <LinearGradient
                    colors={userName.trim() ? (isDark ? ['#0891B2', '#0E7490'] : ['#0891B2', '#0891B2']) : [colors.border, colors.border]}
                    style={[s.gradientBtn, !userName.trim() && { opacity: 0.5 }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <UserPlus size={18} color={userName.trim() ? '#fff' : colors.textMuted} />
                    <Text style={[s.gradientBtnText, !userName.trim() && { color: colors.textMuted }]}>Join Trip</Text>
                  </LinearGradient>
                </PressableScale>

                <View style={s.trustRow}>
                  <Shield size={12} color={colors.textMuted} />
                  <Text style={[s.trustText, { color: colors.textMuted }]}>You can leave anytime</Text>
                </View>
              </View>
            ) : (
              <View style={[s.joinSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[s.webIconWrap, { backgroundColor: isDark ? 'rgba(34,211,238,0.1)' : 'rgba(8,145,178,0.06)' }]}>
                  <Globe size={28} color={colors.accent} />
                </View>
                <Text style={[s.joinTitle, { color: colors.text }]}>Continue in TripNest</Text>
                <Text style={[s.joinSub, { color: colors.textSecondary }]}>
                  Open this trip in the TripNest app to join, view the full itinerary, and plan together.
                </Text>

                <PressableScale onPress={handleOpenInApp} style={s.fullWidthBtn} testID="open-in-app-button">
                  <LinearGradient
                    colors={isDark ? ['#0891B2', '#0E7490'] : ['#0891B2', '#0891B2']}
                    style={s.gradientBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <ExternalLink size={18} color="#fff" />
                    <Text style={s.gradientBtnText}>Open in App</Text>
                    <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                  </LinearGradient>
                </PressableScale>

                <PressableScale onPress={() => console.log('[JoinTrip] Download tapped')} style={s.fullWidthBtn}>
                  <View style={[s.outlineBtn, { backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg }]}>
                    <Download size={16} color={colors.text} />
                    <Text style={[s.outlineBtnText, { color: colors.text }]}>Download TripNest</Text>
                  </View>
                </PressableScale>
              </View>
            )}

            {hasLocalData && (
              <PressableScale
                onPress={() => {
                  if (Platform.OS === 'web') {
                    console.log('[JoinTrip] Download tapped (web)');
                  } else {
                    handleOpenTrip();
                  }
                }}
                style={s.fullWidthBtn}
              >
                <View style={[s.outlineBtn, { backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg }]}>
                  <Download size={16} color={colors.text} />
                  <Text style={[s.outlineBtnText, { color: colors.text }]}>Get the TripNest App</Text>
                </View>
              </PressableScale>
            )}

            <View style={[s.footer, { borderTopColor: colors.border }]}>
              <View style={s.footerBrandRow}>
                <View style={[s.footerBrandMark, { backgroundColor: colors.accent }]}>
                  <Plane size={10} color="#fff" />
                </View>
                <Text style={[s.footerBrandText, { color: colors.text }]}>TripNest</Text>
              </View>
              <Text style={[s.footerText, { color: colors.textMuted }]}>
                Plan trips together · Travel smarter
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
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: 36,
    maxWidth: 400,
    width: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  errorIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
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
    letterSpacing: -0.3,
  },
  errorSub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  fullWidthBtn: {
    width: '100%',
    maxWidth: 400,
  },
  solidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
  },
  solidBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
  },
  gradientBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  ghostBtn: {
    paddingVertical: 14,
  },
  ghostBtnText: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  successCheckWrap: {
    marginBottom: 24,
  },
  successCheckGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  successSub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  heroSection: {
    height: 380,
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
    paddingTop: 6,
  },
  topBarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  topBarBrandMark: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarBrandText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: -0.3,
  },
  heroBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  inviteChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    marginBottom: 10,
  },
  inviteChipText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#fff',
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  heroLocation: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.88)',
  },
  heroDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  heroDate: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.7)',
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 36,
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
    borderWidth: isDark ? 1 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.04,
    shadowRadius: 8,
    elevation: isDark ? 0 : 1,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: isDark ? 1 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.03,
    shadowRadius: 6,
    elevation: isDark ? 0 : 1,
  },
  organizerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  organizerName: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  previewSection: {
    marginBottom: 14,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  dayCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: isDark ? 1 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.03,
    shadowRadius: 6,
    elevation: isDark ? 0 : 1,
  },
  dayBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 12,
  },
  dayBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#fff',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  activityDot: {
    width: 7,
    height: 7,
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
    marginTop: 1,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  moreActivities: {
    fontSize: 12,
    marginTop: 2,
    marginLeft: 17,
  },
  fadeHint: {
    fontSize: 13,
    fontStyle: 'italic' as const,
    textAlign: 'center',
    marginTop: 6,
  },
  travelersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: isDark ? 1 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.03,
    shadowRadius: 6,
    elevation: isDark ? 0 : 1,
  },
  travelersAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  stackedAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackedAvatarMore: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackedAvatarMoreText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  travelersText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  joinSection: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: isDark ? 1 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0 : 0.06,
    shadowRadius: 14,
    elevation: isDark ? 0 : 3,
  },
  webIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  joinTitle: {
    fontSize: 19,
    fontWeight: '700' as const,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  joinSub: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
    textAlign: 'center',
  },
  inputWrap: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 14,
    overflow: 'hidden',
  },
  nameInput: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 12,
    borderTopWidth: 1,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  footerBrandMark: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBrandText: {
    fontSize: 13,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
  footerText: {
    fontSize: 12,
  },
});
