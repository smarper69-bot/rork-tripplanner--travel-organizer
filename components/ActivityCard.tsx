import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  Plane, 
  Hotel, 
  Utensils, 
  Camera, 
  Car, 
  ShoppingBag,
  MoreHorizontal,
  MapPin,
  Clock,
  Check
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Activity, ActivityCategory } from '@/types/trip';

interface ActivityCardProps {
  activity: Activity;
  onPress?: () => void;
  isDragging?: boolean;
}

const getCategoryIcon = (category: ActivityCategory) => {
  const iconProps = { size: 18, color: Colors.textLight };
  switch (category) {
    case 'flights': return <Plane {...iconProps} />;
    case 'accommodation': return <Hotel {...iconProps} />;
    case 'food': return <Utensils {...iconProps} />;
    case 'activities': return <Camera {...iconProps} />;
    case 'transport': return <Car {...iconProps} />;
    case 'shopping': return <ShoppingBag {...iconProps} />;
    default: return <MoreHorizontal {...iconProps} />;
  }
};

const getCategoryColor = (category: ActivityCategory) => {
  return Colors.categoryColors[category] || Colors.categoryColors.other;
};

export default function ActivityCard({ activity, onPress, isDragging }: ActivityCardProps) {
  const categoryColor = getCategoryColor(activity.category);

  return (
    <TouchableOpacity 
      style={[styles.card, isDragging && styles.dragging]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: categoryColor }]}>
        {getCategoryIcon(activity.category)}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{activity.title}</Text>
          {activity.isBooked && (
            <View style={styles.bookedBadge}>
              <Check size={10} color={Colors.success} />
              <Text style={styles.bookedText}>Booked</Text>
            </View>
          )}
        </View>
        
        <View style={styles.details}>
          <View style={styles.timeRow}>
            <Clock size={12} color={Colors.textMuted} />
            <Text style={styles.timeText}>
              {activity.startTime}
              {activity.endTime && ` - ${activity.endTime}`}
            </Text>
          </View>
          
          {activity.location && (
            <View style={styles.locationRow}>
              <MapPin size={12} color={Colors.textMuted} />
              <Text style={styles.locationText} numberOfLines={1}>{activity.location}</Text>
            </View>
          )}
        </View>
      </View>
      
      {activity.cost !== undefined && activity.cost > 0 && (
        <View style={styles.costContainer}>
          <Text style={styles.costText}>${activity.cost}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dragging: {
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  bookedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bookedText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '500',
  },
  details: {
    gap: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  costContainer: {
    marginLeft: 12,
  },
  costText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
