import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Animated, Pressable } from 'react-native';
import { MapPin, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { Trip } from '@/types/trip';

const DESTINATION_IMAGES: Record<string, string> = {
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop&q=80',
  'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop&q=80',
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=500&fit=crop&q=80',
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=500&fit=crop&q=80',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=500&fit=crop&q=80',
  'Santorini': 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=500&fit=crop&q=80',
  'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=500&fit=crop&q=80',
  'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=500&fit=crop&q=80',
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop&q=80',
  'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=500&fit=crop&q=80',
  'Hanoi': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=500&fit=crop&q=80',
  'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=500&fit=crop&q=80',
  'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=500&fit=crop&q=80',
  'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop&q=80',
  'Marrakech': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&h=500&fit=crop&q=80',
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=500&fit=crop&q=80',
];

function getDestinationImage(destination: string, id: string): string {
  if (DESTINATION_IMAGES[destination]) return DESTINATION_IMAGES[destination];
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
}

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
          <Image source={{ uri: imageUrl }} style={styles.compactImage} />
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
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
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
