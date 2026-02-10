import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, MapPin, Sun, Mountain, Snowflake, Store, Trees, Landmark, Palmtree } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Destination, DestinationIcon } from '@/types/trip';

interface DestinationCardProps {
  destination: Destination;
  onPress: () => void;
  variant?: 'large' | 'medium' | 'small';
}

const getIconComponent = (iconName: DestinationIcon) => {
  const iconMap: Record<DestinationIcon, React.ComponentType<{ size: number; color: string }>> = {
    'torii-gate': Landmark,
    'sun': Sun,
    'mountain': Mountain,
    'snowflake': Snowflake,
    'store': Store,
    'trees': Trees,
    'landmark': Landmark,
    'palm-tree': Palmtree,
  };
  return iconMap[iconName] || Landmark;
};

export default function DestinationCard({ destination, onPress, variant = 'medium' }: DestinationCardProps) {
  const IconComponent = getIconComponent(destination.icon);

  if (variant === 'large') {
    return (
      <TouchableOpacity style={styles.largeCard} onPress={onPress} activeOpacity={0.9}>
        <View style={[styles.largeIconContainer, { backgroundColor: destination.iconColor + '15' }]}>
          <IconComponent size={64} color={destination.iconColor} />
        </View>
        <View style={styles.largeContent}>
          <View style={styles.ratingBadge}>
            <Star size={12} color={Colors.text} fill={Colors.text} />
            <Text style={styles.ratingText}>{destination.rating}</Text>
          </View>
          <View style={styles.largeInfo}>
            <Text style={styles.largeName}>{destination.name}</Text>
            <Text style={styles.largeCountry}>{destination.country}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'small') {
    return (
      <TouchableOpacity style={styles.smallCard} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.smallIconContainer, { backgroundColor: destination.iconColor + '15' }]}>
          <IconComponent size={32} color={destination.iconColor} />
        </View>
        <View style={styles.smallContent}>
          <Text style={styles.smallName} numberOfLines={1}>{destination.name}</Text>
          <Text style={styles.smallCountry}>{destination.country}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.iconContainer, { backgroundColor: destination.iconColor + '12' }]}>
        <IconComponent size={48} color={destination.iconColor} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{destination.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color={Colors.textSecondary} />
              <Text style={styles.country}>{destination.country}</Text>
            </View>
          </View>
          <View style={styles.rating}>
            <Star size={14} color={Colors.text} fill={Colors.text} />
            <Text style={styles.ratingValue}>{destination.rating}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>{destination.description}</Text>
        <View style={styles.tags}>
          {destination.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: destination.iconColor + '15' }]}>
              <Text style={[styles.tagText, { color: destination.iconColor }]}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{destination.averageBudget}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{destination.bestTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  country: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  metaDot: {
    fontSize: 12,
    color: Colors.textMuted,
    marginHorizontal: 8,
  },
  largeCard: {
    width: 280,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: Colors.surface,
  },
  largeIconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  largeInfo: {},
  largeName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  largeCountry: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  smallCard: {
    width: 120,
    marginRight: 12,
  },
  smallIconContainer: {
    width: '100%',
    height: 90,
    borderRadius: 16,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallContent: {},
  smallName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  smallCountry: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
