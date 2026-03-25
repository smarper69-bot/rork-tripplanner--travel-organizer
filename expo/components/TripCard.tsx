import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Animated, Pressable } from 'react-native';
import { MapPin, Calendar, User, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trip } from '@/types/trip';
import { getDestinationImageWithConfidence, DEFAULT_FALLBACK_IMAGE } from '@/utils/destinationImages';
import { hapticLight } from '@/utils/haptics';
import { DEMO_TRIP_ID } from '@/mocks/demoTrip';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useUserAvatar } from '@/hooks/useUserProfile';
import { ThemeColors } from '@/constants/themes';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  variant?: 'large' | 'compact';
}

export default function TripCard({ trip, onPress, variant = 'large' }: TripCardProps) {
  const colors = useThemeColors();
  const userAvatar = useUserAvatar();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const daysUntil = Math.ceil(
    (new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const onPressIn = useCallback(() => {
    hapticLight();
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const onPressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const [imageUrl, setImageUrl] = React.useState(() => {
    const result = getDestinationImageWithConfidence(trip.destination, trip.country);
    console.log('[TripCard] Image for', trip.destination, ':', result.confidence);
    return result.url;
  });
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const isDemo = trip.id === DEMO_TRIP_ID;
  const isShared = trip.collaborators.length > 1;

  const onImageLoad = useCallback(() => {
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [imageOpacity]);

  const onImageError = useCallback(() => {
    console.log('[TripCard] Image failed for:', trip.destination, '- switching to fallback');
    setImageUrl(DEFAULT_FALLBACK_IMAGE);
  }, [trip.destination]);

  const getBadgeText = () => {
    if (trip.status === 'ongoing') return 'In progress';
    if (trip.status === 'planning') return 'Planning';
    if (trip.status === 'completed') return 'Completed';
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil > 0 && daysUntil <= 30) return `${daysUntil}d away`;
    return null;
  };

  const badgeText = getBadgeText();
  const s = createStyles(colors);

  const getCollabAvatar = (collab: Trip['collaborators'][0]) => {
    if (collab.id === 'self' && userAvatar) return userAvatar;
    return collab.avatar;
  };

  if (variant === 'compact') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={s.compactCard}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Image
            source={{ uri: imageUrl }}
            style={s.compactImage}
            onLoad={onImageLoad}
            onError={onImageError}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={s.compactGradient}
          />
          <View style={s.compactContent}>
            <Text style={s.compactTitle} numberOfLines={1}>{trip.destination}</Text>
            <Text style={s.compactCountry} numberOfLines={1}>{trip.country}</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[s.cardOuter, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={s.card}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Image
          source={{ uri: imageUrl }}
          style={s.cardImage}
          onLoad={onImageLoad}
          onError={onImageError}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
          locations={[0, 0.4, 1]}
          style={s.cardGradient}
        />

        {isDemo && (
          <View style={[s.demoBadge, { backgroundColor: colors.accent }]}>
            <Text style={s.demoBadgeText}>DEMO</Text>
          </View>
        )}

        {badgeText && (
          <View style={[s.badge, isDemo && s.badgeWithDemo]}>
            <Text style={s.badgeText}>{badgeText}</Text>
          </View>
        )}

        {isShared && (
          <View style={s.sharedBadge}>
            <Users size={10} color="#fff" />
            <Text style={s.sharedBadgeText}>Shared Trip</Text>
          </View>
        )}

        <View style={s.cardContent}>
          <Text style={s.cardTitle}>{trip.name}</Text>
          <View style={s.cardLocationRow}>
            <MapPin size={13} color="rgba(255,255,255,0.8)" />
            <Text style={s.cardLocation}>{trip.destination}, {trip.country}</Text>
          </View>

          <View style={s.cardFooter}>
            <View style={s.cardDateRow}>
              <Calendar size={12} color="rgba(255,255,255,0.7)" />
              <Text style={s.cardDate}>
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </Text>
            </View>

            <View style={s.cardCollaborators}>
              {trip.collaborators.slice(0, 3).map((collab, index) => {
                const avatar = getCollabAvatar(collab);
                return avatar ? (
                  <Image
                    key={collab.id}
                    source={{ uri: avatar }}
                    style={[s.cardAvatar, { marginLeft: index > 0 ? -6 : 0 }]}
                  />
                ) : (
                  <View
                    key={collab.id}
                    style={[s.cardAvatarPlaceholder, { marginLeft: index > 0 ? -6 : 0 }]}
                  >
                    <User size={12} color="#999" />
                  </View>
                );
              })}
              {trip.collaborators.length > 3 && (
                <View style={[s.cardAvatarMore, { marginLeft: -6 }]}>
                  <Text style={s.cardAvatarMoreText}>+{trip.collaborators.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  cardOuter: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    position: 'absolute' as const,
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    color: '#111',
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  badgeWithDemo: {
    right: 72,
  },
  demoBadge: {
    position: 'absolute' as const,
    top: 14,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  demoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.8,
  },
  sharedBadge: {
    position: 'absolute' as const,
    top: 14,
    left: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(8, 145, 178, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sharedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  cardContent: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  cardLocation: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500' as const,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500' as const,
  },
  cardCollaborators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  cardAvatarPlaceholder: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(200,200,200,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAvatarMore: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  cardAvatarMoreText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700' as const,
  },
  compactCard: {
    width: 150,
    height: 190,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  compactContent: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  compactCountry: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500' as const,
    marginTop: 1,
  },
});
