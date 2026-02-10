import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Bell, Plus, ArrowRight, AlertCircle, 
  Crown, Landmark, Sun, Mountain, Snowflake, Store, Trees, Palmtree 
} from 'lucide-react-native';
import { DestinationIcon } from '@/types/trip';
import Colors from '@/constants/colors';
import TripCard from '@/components/TripCard';
import { mockTrips, mockAlerts, mockDestinations } from '@/mocks/trips';

export default function HomeScreen() {
  const router = useRouter();
  
  const upcomingTrips = mockTrips.filter(t => t.status === 'upcoming' || t.status === 'planning');
  const planningTrips = mockTrips.filter(t => t.status === 'planning');
  const unreadAlerts = mockAlerts.filter(a => !a.isRead).length;

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

  const getReminders = () => {
    const reminders: { id: string; message: string; type: 'warning' | 'info' }[] = [];
    
    upcomingTrips.forEach(trip => {
      const hasHotel = trip.itinerary.some(day => 
        day.activities.some(a => a.category === 'accommodation' && a.isBooked)
      );
      if (!hasHotel) {
        reminders.push({
          id: `${trip.id}-hotel`,
          message: `${trip.name}: No hotel booked yet`,
          type: 'warning',
        });
      }
      
      const daysUntil = Math.ceil((new Date(trip.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 30 && daysUntil > 0) {
        reminders.push({
          id: `${trip.id}-date`,
          message: `${trip.name} starts in ${daysUntil} days`,
          type: 'info',
        });
      }
    });
    
    return reminders.slice(0, 3);
  };

  const reminders = getReminders();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>Traveler</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => console.log('Notifications')}
          >
            <Bell size={24} color={Colors.text} />
            {unreadAlerts > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadAlerts}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {reminders.length > 0 && (
          <View style={styles.remindersSection}>
            {reminders.map((reminder) => (
              <View 
                key={reminder.id} 
                style={[
                  styles.reminderCard,
                  reminder.type === 'warning' && styles.reminderWarning,
                ]}
              >
                <AlertCircle 
                  size={18} 
                  color={reminder.type === 'warning' ? Colors.primary : Colors.textSecondary} 
                />
                <Text style={styles.reminderText}>{reminder.message}</Text>
              </View>
            ))}
          </View>
        )}

        {planningTrips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Planning</Text>
            </View>
            {planningTrips.slice(0, 1).map((trip) => (
              <View key={trip.id}>
                <TripCard
                  trip={trip}
                  onPress={() => router.push(`/trip/${trip.id}`)}
                />
                <TouchableOpacity 
                  style={styles.continueButton}
                  onPress={() => router.push(`/trip/${trip.id}`)}
                >
                  <Text style={styles.continueButtonText}>Continue Planning</Text>
                  <ArrowRight size={18} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {upcomingTrips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Trips</Text>
              <TouchableOpacity onPress={() => router.push('/trips')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {upcomingTrips.filter(t => t.status === 'upcoming').slice(0, 2).map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={() => router.push(`/trip/${trip.id}`)}
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Inspiration</Text>
            <TouchableOpacity onPress={() => router.push('/discover')}>
              <Text style={styles.seeAll}>Explore</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsScroll}
          >
            {mockDestinations.slice(0, 4).map((dest) => {
              const IconComponent = getIconComponent(dest.icon);
              return (
                <TouchableOpacity 
                  key={dest.id} 
                  style={[styles.destinationCard, { backgroundColor: dest.iconColor + '12' }]}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/destination/${dest.id}`)}
                >
                  <View style={styles.destinationIconContainer}>
                    <IconComponent size={44} color={dest.iconColor} />
                  </View>
                  <View style={styles.destinationContent}>
                    <Text style={styles.destinationName}>{dest.name}</Text>
                    <Text style={styles.destinationCountry}>{dest.country}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.proCard}>
          <View style={styles.proHeader}>
            <View style={styles.proBadge}>
              <Crown size={16} color={Colors.textLight} />
            </View>
            <Text style={styles.proTitle}>Tripla Pro</Text>
          </View>
          <Text style={styles.proDescription}>
            Get AI itinerary generation, unlimited trips, and full offline access.
          </Text>
          <TouchableOpacity 
            style={styles.proButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.proButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.createTripFab}
          onPress={() => router.push('/create-trip')}
        >
          <Plus size={24} color={Colors.textLight} />
          <Text style={styles.createTripText}>New Trip</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: {},
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  remindersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.textMuted,
  },
  reminderWarning: {
    borderLeftColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  reminderText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: -8,
    marginBottom: 8,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 14,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  destinationsScroll: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  destinationCard: {
    width: 140,
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
    justifyContent: 'space-between',
    padding: 14,
  },
  destinationIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationContent: {},
  destinationName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  destinationCountry: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  proCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 20,
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  proBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  proDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  proButton: {
    paddingVertical: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 10,
    alignItems: 'center',
  },
  proButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  createTripFab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createTripText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  bottomPadding: {
    height: 100,
  },
});
