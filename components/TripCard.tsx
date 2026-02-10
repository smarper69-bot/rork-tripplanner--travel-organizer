import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, Flower2, Church, Palmtree, Mountain, Sun, Landmark, Trees, Snowflake, Tent } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Trip, TripIcon } from '@/types/trip';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  variant?: 'large' | 'compact';
}

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

export default function TripCard({ trip, onPress, variant = 'large' }: TripCardProps) {
  const daysUntil = Math.ceil(
    (new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const budgetProgress = (trip.spentBudget / trip.totalBudget) * 100;
  const IconComponent = getIconComponent(trip.icon);

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.compactIconContainer, { backgroundColor: trip.iconColor + '15' }]}>
          <IconComponent size={32} color={trip.iconColor} />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{trip.name}</Text>
          <View style={styles.compactLocation}>
            <MapPin size={12} color={Colors.textSecondary} />
            <Text style={styles.compactLocationText}>{trip.destination}</Text>
          </View>
          <Text style={styles.compactDate}>{formatDate(trip.startDate)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.iconBackground, { backgroundColor: trip.iconColor + '15' }]}>
        <IconComponent size={80} color={trip.iconColor} />
      </View>
      
      {trip.status === 'upcoming' && daysUntil > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{daysUntil} days away</Text>
        </View>
      )}
      
      {trip.status === 'planning' && (
        <View style={[styles.badge, styles.planningBadge]}>
          <Text style={styles.badgeText}>Planning</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{trip.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.location}>{trip.destination}, {trip.country}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.dateRow}>
            <Calendar size={14} color={Colors.textSecondary} />
            <Text style={styles.dateText}>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.collaborators}>
              {trip.collaborators.slice(0, 3).map((collab, index) => (
                <Image
                  key={collab.id}
                  source={{ uri: collab.avatar }}
                  style={[styles.avatar, { marginLeft: index > 0 ? -8 : 0 }]}
                />
              ))}
              {trip.collaborators.length > 3 && (
                <View style={[styles.avatarMore, { marginLeft: -8 }]}>
                  <Text style={styles.avatarMoreText}>+{trip.collaborators.length - 3}</Text>
                </View>
              )}
            </View>

            <View style={styles.budgetContainer}>
              <Text style={styles.budgetText}>
                ${trip.spentBudget.toLocaleString()} / ${trip.totalBudget.toLocaleString()}
              </Text>
              <View style={styles.budgetBar}>
                <View style={[styles.budgetProgress, { width: `${Math.min(budgetProgress, 100)}%` }]} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: Colors.surface,
  },
  iconBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  planningBadge: {
    backgroundColor: Colors.textSecondary,
  },
  badgeText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footer: {},
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collaborators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  avatarMore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  avatarMoreText: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: '600' as const,
  },
  budgetContainer: {
    alignItems: 'flex-end',
  },
  budgetText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  budgetBar: {
    width: 100,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  budgetProgress: {
    height: '100%',
    backgroundColor: Colors.text,
    borderRadius: 2,
  },
  compactCard: {
    width: 160,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  compactIconContainer: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactContent: {
    padding: 12,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  compactLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  compactLocationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  compactDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
