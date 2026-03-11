import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Plane, MapPin, Calendar, Trash2, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTripsStore } from '@/store/useTripsStore';
import { Trip, TripIcon } from '@/types/trip';
import { Flower2, Church, Palmtree, Mountain, Sun, Landmark, Trees, Snowflake, Tent } from 'lucide-react-native';

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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function HomeScreen() {
  const router = useRouter();
  const { trips, deleteTrip } = useTripsStore();

  const futureTrips = useMemo(() => {
    return trips
      .filter(t => t.status === 'upcoming' || t.status === 'planning' || t.status === 'ongoing')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [trips]);

  const mainTrip = futureTrips[0] ?? null;
  const otherTrips = futureTrips.slice(1);

  const handleDeleteTrip = (trip: Trip) => {
    Alert.alert(
      'Remove this trip?',
      'This will delete the trip and its related data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTrip(trip.id);
            console.log('[Home] Deleted trip:', trip.id);
          },
        },
      ]
    );
  };

  const getDaysLabel = (trip: Trip) => {
    const days = Math.ceil(
      (new Date(trip.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (days < 0) return 'In progress';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const MainTripIcon = mainTrip ? getIconComponent(mainTrip.icon) : Landmark;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.title}>
            {futureTrips.length > 0
              ? `You have ${futureTrips.length} trip${futureTrips.length > 1 ? 's' : ''} ahead`
              : 'Ready for your next adventure?'}
          </Text>
        </View>

        {mainTrip ? (
          <>
            <TouchableOpacity
              style={[styles.mainCard, { backgroundColor: mainTrip.iconColor + '10' }]}
              activeOpacity={0.85}
              onPress={() => router.push(`/trip/${mainTrip.id}` as any)}
              testID="main-trip-card"
            >
              <View style={styles.mainCardHeader}>
                <View style={[styles.statusPill, { backgroundColor: mainTrip.iconColor + '20' }]}>
                  <Text style={[styles.statusPillText, { color: mainTrip.iconColor }]}>
                    {mainTrip.status === 'planning' ? 'Planning' : getDaysLabel(mainTrip)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteTrip(mainTrip)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  testID="main-trip-delete"
                >
                  <Trash2 size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.mainCardIcon}>
                <MainTripIcon size={64} color={mainTrip.iconColor} />
              </View>

              <View style={styles.mainCardFooter}>
                <Text style={styles.mainCardName} numberOfLines={1}>{mainTrip.name}</Text>
                <View style={styles.mainCardMeta}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.mainCardLocation}>{mainTrip.destination}, {mainTrip.country}</Text>
                </View>
                <View style={styles.mainCardMeta}>
                  <Calendar size={14} color={Colors.textSecondary} />
                  <Text style={styles.mainCardDates}>
                    {formatDate(mainTrip.startDate)} – {formatDate(mainTrip.endDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.mainCardArrow}>
                <ChevronRight size={20} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newTripButton}
              onPress={() => router.push('/create-trip' as any)}
              activeOpacity={0.8}
              testID="new-trip-btn"
            >
              <Plus size={22} color={Colors.textLight} />
              <Text style={styles.newTripButtonText}>New Trip</Text>
            </TouchableOpacity>

            {otherTrips.length > 0 && (
              <View style={styles.otherSection}>
                <View style={styles.otherHeader}>
                  <Text style={styles.otherTitle}>Other trips</Text>
                  <TouchableOpacity onPress={() => router.push('/trips' as any)}>
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
                {otherTrips.map((trip) => {
                  const Icon = getIconComponent(trip.icon);
                  return (
                    <TouchableOpacity
                      key={trip.id}
                      style={styles.otherCard}
                      activeOpacity={0.8}
                      onPress={() => router.push(`/trip/${trip.id}` as any)}
                      testID={`trip-card-${trip.id}`}
                    >
                      <View style={[styles.otherCardIcon, { backgroundColor: trip.iconColor + '12' }]}>
                        <Icon size={28} color={trip.iconColor} />
                      </View>
                      <View style={styles.otherCardContent}>
                        <Text style={styles.otherCardName} numberOfLines={1}>{trip.name}</Text>
                        <Text style={styles.otherCardSub}>
                          {trip.destination} · {formatDate(trip.startDate)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.otherDeleteBtn}
                        onPress={() => handleDeleteTrip(trip)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      >
                        <Trash2 size={16} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Plane size={48} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptyText}>
              Plan your next adventure — it only takes a minute.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/create-trip' as any)}
              activeOpacity={0.8}
              testID="create-first-trip-btn"
            >
              <Plus size={20} color={Colors.textLight} />
              <Text style={styles.emptyButtonText}>Create your first trip</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    lineHeight: 28,
  },
  mainCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    padding: 20,
    minHeight: 240,
    justifyContent: 'space-between',
    position: 'relative' as const,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCardIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  mainCardFooter: {
    gap: 6,
  },
  mainCardName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  mainCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mainCardLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  mainCardDates: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  mainCardArrow: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  newTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  newTripButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  otherSection: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  otherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  otherTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  otherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  otherCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otherCardContent: {
    flex: 1,
    marginLeft: 14,
  },
  otherCardName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  otherCardSub: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  otherDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
});
