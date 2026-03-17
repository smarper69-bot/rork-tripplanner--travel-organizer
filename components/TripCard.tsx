import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Animated, Pressable } from 'react-native';
import { MapPin, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { Trip } from '@/types/trip';
import { getDestinationImage } from '@/utils/destinationImages';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  variant?: 'large' | 'compact';
}

export default function TripCard({ trip, onPress, variant = 'large' }: TripCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const daysUntil = Math.ceil(
    (new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const onPressIn = useCallback(() => {
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

  const imageUrl = getDestinationImage(trip.destination, trip.id);
  const imageOpacity = useRef(new Animated.Value(0)).current;

  const onImageLoad = useCallback(() => {
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [imageOpacity]);

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

  if (variant === 'compact') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={styles.compactCard}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Animated.Image
            source={{ uri: imageUrl }}
            style={[styles.compactImage, { opacity: imageOpacity }]}
            onLoad={onImageLoad}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.compactGradient}
          />
          <View style={styles.compactContent}>
            <Text style={styles.compactTitle} numberOfLines={1}>{trip.destination}</Text>
            <Text style={styles.compactCountry} numberOfLines={1}>{trip.country}</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.cardOuter, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.Image
          source={{ uri: imageUrl }}
          style={[styles.cardImage, { opacity: imageOpacity }]}
          onLoad={onImageLoad}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
          locations={[0, 0.4, 1]}
          style={styles.cardGradient}
        />

        {badgeText && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{trip.name}</Text>
          <View style={styles.cardLocationRow}>
            <MapPin size={13} color="rgba(255,255,255,0.8)" />
            <Text style={styles.cardLocation}>{trip.destination}, {trip.country}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.cardDateRow}>
              <Calendar size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.cardDate}>
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </Text>
            </View>

            <View style={styles.cardCollaborators}>
              {trip.collaborators.slice(0, 3).map((collab, index) => (
                <Image
                  key={collab.id}
                  source={{ uri: collab.avatar }}
                  style={[styles.cardAvatar, { marginLeft: index > 0 ? -6 : 0 }]}
                />
              ))}
              {trip.collaborators.length > 3 && (
                <View style={[styles.cardAvatarMore, { marginLeft: -6 }]}>
                  <Text style={styles.cardAvatarMoreText}>+{trip.collaborators.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: Colors.surface,
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
    color: Colors.text,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
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
    backgroundColor: Colors.surface,
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
