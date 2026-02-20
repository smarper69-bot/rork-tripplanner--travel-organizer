import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, DollarSign, Star, Calendar, MapPin,
  Hotel, Ticket, ChevronRight, Plane
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { destinations, getDestinationWithDefaults } from '@/mocks/destinations';

export default function DestinationOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const rawDestination = destinations.find(d => d.id === id);
  
  if (!rawDestination) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Destination not found</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const destination = getDestinationWithDefaults(rawDestination);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const bestMonthsText = destination.bestMonths
    .slice(0, 3)
    .map(m => monthNames[m - 1])
    .join(', ');

  const handlePlanTrip = () => {
    router.push({
      pathname: '/create-trip' as any,
      params: {
        prefillName: `Trip to ${destination.city}`,
        prefillDestination: `${destination.city}, ${destination.country}`,
        prefillImage: destination.imageUrl,
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.heroContainer}>
            <Image source={{ uri: destination.imageUrl }} style={styles.heroImage} />
            <View style={styles.heroOverlay} />
            
            <SafeAreaView style={styles.heroContent} edges={['top']}>
              <View style={styles.heroHeader}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.heroInfo}>
                <Text style={styles.heroCity}>{destination.city}</Text>
                <Text style={styles.heroCountry}>{destination.country}</Text>
                <View style={styles.ratingRow}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ratingText}>{(destination.popularityScore / 20).toFixed(1)}</Text>
                </View>
              </View>
            </SafeAreaView>
          </View>

          <View style={styles.content}>
            <View style={styles.tagsRow}>
              {destination.tripTypes.slice(0, 4).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoCards}>
              <View style={styles.infoCard}>
                <DollarSign size={18} color={Colors.primary} />
                <View>
                  <Text style={styles.infoLabel}>Avg. Daily</Text>
                  <Text style={styles.infoValue}>${destination.avgDailyCost}</Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <Calendar size={18} color={Colors.primary} />
                <View>
                  <Text style={styles.infoLabel}>Best Time</Text>
                  <Text style={styles.infoValue}>{bestMonthsText}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Why Go</Text>
              <Text style={styles.whyGoText}>{destination.whyGo}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Hotels</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.hotelsList}>
                {destination.hotels.map((hotel, index) => (
                  <TouchableOpacity key={index} style={styles.hotelCard}>
                    <View style={styles.hotelIcon}>
                      <Hotel size={18} color={Colors.primary} />
                    </View>
                    <View style={styles.hotelInfo}>
                      <Text style={styles.hotelName}>{hotel.name}</Text>
                      <View style={styles.hotelMeta}>
                        <Text style={styles.hotelPrice}>{hotel.priceRange}</Text>
                        <View style={styles.hotelRating}>
                          <Star size={12} color="#FFD700" fill="#FFD700" />
                          <Text style={styles.hotelRatingText}>{hotel.rating}</Text>
                        </View>
                      </View>
                    </View>
                    <ChevronRight size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Things to Do</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.activitiesList}>
                {destination.activities.map((activity, index) => (
                  <TouchableOpacity key={index} style={styles.activityCard}>
                    <View style={styles.activityIcon}>
                      <Ticket size={18} color={Colors.primary} />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityName}>{activity.name}</Text>
                      <Text style={styles.activityMeta}>{activity.duration} · {activity.price}</Text>
                    </View>
                    <ChevronRight size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.highlightsSection}>
              <Text style={styles.sectionTitle}>Highlights</Text>
              <View style={styles.highlightsList}>
                {destination.highlights.map((highlight, index) => (
                  <View key={index} style={styles.highlightItem}>
                    <MapPin size={14} color={Colors.primary} />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <SafeAreaView style={styles.footer} edges={['bottom']}>
          <View style={styles.footerContent}>
            <View style={styles.footerPrice}>
              <Text style={styles.footerPriceLabel}>From</Text>
              <Text style={styles.footerPriceValue}>${destination.avgDailyCost}/day</Text>
            </View>
            <TouchableOpacity style={styles.planButton} onPress={handlePlanTrip}>
              <Plane size={18} color="#fff" />
              <Text style={styles.planButtonText}>Plan this trip</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  backLink: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
  backLinkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  heroContainer: {
    height: 320,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInfo: {},
  heroCity: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  heroCountry: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.text + '10',
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text,
    textTransform: 'capitalize' as const,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  whyGoText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  hotelsList: {
    gap: 10,
  },
  hotelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hotelIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  hotelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hotelPrice: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  hotelRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hotelRatingText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  activitiesList: {
    gap: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  highlightsSection: {
    marginBottom: 24,
  },
  highlightsList: {
    gap: 10,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  highlightText: {
    fontSize: 15,
    color: Colors.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  footerPrice: {},
  footerPriceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  footerPriceValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
