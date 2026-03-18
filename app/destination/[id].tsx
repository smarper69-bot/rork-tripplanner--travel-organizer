import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, DollarSign, Star, Calendar, MapPin,
  Hotel, Ticket, ChevronRight, Plane, ExternalLink, ArrowRight
} from 'lucide-react-native';
import { openHotelSearch, openFlightSearch } from '@/utils/bookingLinks';
import { useThemeColors } from '@/hooks/useThemeColors';
import { openComingSoon } from '@/utils/comingSoon';
import { destinations, getDestinationWithDefaults, DiscoverDestination } from '@/mocks/destinations';
import { ThemeColors } from '@/constants/themes';

export default function DestinationOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();

  const rawDestination: DiscoverDestination | undefined =
    destinations.find(d => d.id === id) ??
    destinations.find(d => d.city.toLowerCase() === (id ?? '').toLowerCase()) ??
    destinations.find(d => d.city.toLowerCase().replace(/\s+/g, '-') === (id ?? '').toLowerCase());

  const suggestedDestinations = destinations.slice(0, 3);

  if (!rawDestination) {
    return (
      <>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <View style={[staticStyles.notFound, { backgroundColor: colors.background }]}>
          <MapPin size={48} color={colors.textMuted} />
          <Text style={[staticStyles.notFoundTitle, { color: colors.text }]}>Destination not found</Text>
          <Text style={[staticStyles.notFoundSubtitle, { color: colors.textSecondary }]}>We couldn{"'"}t find that destination. Try one of these instead:</Text>
          <TouchableOpacity style={[staticStyles.backExploreButton, { backgroundColor: colors.accent }]} onPress={() => router.replace('/discover' as any)}>
            <Text style={staticStyles.backExploreText}>Back to Explore</Text>
          </TouchableOpacity>
          <View style={staticStyles.suggestedList}>
            {suggestedDestinations.map((dest) => (
              <TouchableOpacity
                key={dest.id}
                style={[staticStyles.suggestedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.replace({ pathname: '/destination/[id]' as any, params: { id: dest.id } })}
              >
                <Image source={{ uri: dest.imageUrl }} style={staticStyles.suggestedImage} />
                <View style={staticStyles.suggestedInfo}>
                  <Text style={[staticStyles.suggestedCity, { color: colors.text }]}>{dest.city}</Text>
                  <Text style={[staticStyles.suggestedCountry, { color: colors.textSecondary }]}>{dest.country}</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </>
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

  const s = createStyles(colors);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: destination.city }} />
      <View style={[staticStyles.container, { backgroundColor: colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={staticStyles.heroContainer}>
            <Image source={{ uri: destination.imageUrl }} style={staticStyles.heroImage} />
            <View style={staticStyles.heroOverlay} />
            
            <SafeAreaView style={staticStyles.heroContent} edges={['top']}>
              <View style={staticStyles.heroHeader}>
                <TouchableOpacity 
                  style={staticStyles.backButton}
                  onPress={() => router.back()}
                >
                  <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={staticStyles.heroInfo}>
                <Text style={staticStyles.heroCity}>{destination.city}</Text>
                <Text style={staticStyles.heroCountry}>{destination.country}</Text>
                <View style={staticStyles.ratingRow}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={staticStyles.ratingText}>{(destination.popularityScore / 20).toFixed(1)}</Text>
                </View>
              </View>
            </SafeAreaView>
          </View>

          <View style={staticStyles.content}>
            <View style={staticStyles.tagsRow}>
              {destination.tripTypes.slice(0, 4).map((tag, index) => (
                <View key={index} style={[s.tag]}>
                  <Text style={[staticStyles.tagText, { color: colors.text }]}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={staticStyles.infoCards}>
              <View style={[s.infoCard]}>
                <DollarSign size={18} color={colors.accent} />
                <View>
                  <Text style={[staticStyles.infoLabel, { color: colors.textMuted }]}>Avg. Daily</Text>
                  <Text style={[staticStyles.infoValue, { color: colors.text }]}>${destination.avgDailyCost}</Text>
                </View>
              </View>
              <View style={[s.infoCard]}>
                <Calendar size={18} color={colors.accent} />
                <View>
                  <Text style={[staticStyles.infoLabel, { color: colors.textMuted }]}>Best Time</Text>
                  <Text style={[staticStyles.infoValue, { color: colors.text }]}>{bestMonthsText}</Text>
                </View>
              </View>
            </View>

            <View style={staticStyles.section}>
              <Text style={[staticStyles.sectionTitle, { color: colors.text }]}>Why Go</Text>
              <Text style={[staticStyles.whyGoText, { color: colors.textSecondary }]}>{destination.whyGo}</Text>
            </View>

            <View style={staticStyles.section}>
              <Text style={[staticStyles.sectionTitle, { color: colors.text }]}>Hotels</Text>
              <TouchableOpacity
                style={[staticStyles.hotelsCta, { backgroundColor: colors.text }]}
                activeOpacity={0.8}
                onPress={() => router.push(`/hotels/${destination.city}` as any)}
              >
                <Text style={[staticStyles.hotelsCtaText, { color: colors.background }]}>Take me to hotels</Text>
                <ArrowRight size={20} color={colors.background} />
              </TouchableOpacity>
              <Text style={[staticStyles.hotelsCtaCaption, { color: colors.textMuted }]}>We may earn a commission on bookings.</Text>
            </View>

            <View style={staticStyles.section}>
              <View style={staticStyles.sectionHeader}>
                <Text style={[staticStyles.sectionTitle, { color: colors.text }]}>Things to Do</Text>
                <TouchableOpacity style={staticStyles.seeAllButton} onPress={() => openComingSoon('All activities')}>
                  <Text style={[staticStyles.seeAllText, { color: colors.textSecondary }]}>See all</Text>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={staticStyles.activitiesList}>
                {destination.activities.map((activity, index) => (
                  <TouchableOpacity key={index} style={[s.activityCard]} onPress={() => openComingSoon('Activity details')}>
                    <View style={[staticStyles.activityIcon, { backgroundColor: colors.accent + '15' }]}>
                      <Ticket size={18} color={colors.accent} />
                    </View>
                    <View style={staticStyles.activityInfo}>
                      <Text style={[staticStyles.activityName, { color: colors.text }]}>{activity.name}</Text>
                      <Text style={[staticStyles.activityMeta, { color: colors.textSecondary }]}>{activity.duration} · {activity.price}</Text>
                    </View>
                    <ChevronRight size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={staticStyles.bookingSection}>
              <Text style={[staticStyles.sectionTitle, { color: colors.text }]}>Book Your Trip</Text>
              <TouchableOpacity
                style={[s.bookingCta]}
                activeOpacity={0.7}
                onPress={() => openHotelSearch({ city: destination.city, country: destination.country })}
              >
                <View style={staticStyles.bookingCtaLeft}>
                  <View style={[staticStyles.bookingCtaIcon, { backgroundColor: colors.warningBg }]}>
                    <Hotel size={20} color={colors.warning} />
                  </View>
                  <View>
                    <Text style={[staticStyles.bookingCtaTitle, { color: colors.text }]}>Find Hotels</Text>
                    <Text style={[staticStyles.bookingCtaSubtitle, { color: colors.textSecondary }]}>Search accommodations in {destination.city}</Text>
                  </View>
                </View>
                <ExternalLink size={18} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.bookingCta]}
                activeOpacity={0.7}
                onPress={() => openFlightSearch({ city: destination.city, country: destination.country })}
              >
                <View style={staticStyles.bookingCtaLeft}>
                  <View style={[staticStyles.bookingCtaIcon, { backgroundColor: colors.info + '15' }]}>
                    <Plane size={20} color={colors.info} />
                  </View>
                  <View>
                    <Text style={[staticStyles.bookingCtaTitle, { color: colors.text }]}>Find Flights</Text>
                    <Text style={[staticStyles.bookingCtaSubtitle, { color: colors.textSecondary }]}>Search flights to {destination.city}</Text>
                  </View>
                </View>
                <ExternalLink size={18} color={colors.textMuted} />
              </TouchableOpacity>
              <Text style={[staticStyles.bookingDisclaimer, { color: colors.textMuted }]}>Opens partner site. We may earn a commission.</Text>
            </View>

            <View style={staticStyles.highlightsSection}>
              <Text style={[staticStyles.sectionTitle, { color: colors.text }]}>Highlights</Text>
              <View style={staticStyles.highlightsList}>
                {destination.highlights.map((highlight, index) => (
                  <View key={index} style={[s.highlightItem]}>
                    <MapPin size={14} color={colors.accent} />
                    <Text style={[staticStyles.highlightText, { color: colors.text }]}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <SafeAreaView style={[staticStyles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]} edges={['bottom']}>
          <View style={staticStyles.footerContent}>
            <View style={staticStyles.footerPrice}>
              <Text style={[staticStyles.footerPriceLabel, { color: colors.textMuted }]}>From</Text>
              <Text style={[staticStyles.footerPriceValue, { color: colors.text }]}>${destination.avgDailyCost}/day</Text>
            </View>
            <TouchableOpacity style={[staticStyles.planButton, { backgroundColor: colors.accent }]} onPress={handlePlanTrip}>
              <Plane size={18} color="#fff" />
              <Text style={staticStyles.planButtonText}>Plan this trip</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.chipBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookingCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

const staticStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  notFoundSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  backExploreButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginBottom: 28,
  },
  backExploreText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  suggestedList: {
    width: '100%',
    gap: 10,
  },
  suggestedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  suggestedImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  suggestedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  suggestedCity: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  suggestedCountry: {
    fontSize: 13,
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
  tagText: {
    fontSize: 13,
    fontWeight: '500' as const,
    textTransform: 'capitalize' as const,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600' as const,
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
    fontWeight: '500' as const,
  },
  whyGoText: {
    fontSize: 15,
    lineHeight: 24,
  },
  hotelsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 18,
    gap: 10,
  },
  hotelsCtaText: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  hotelsCtaCaption: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
  activitiesList: {
    gap: 10,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 13,
  },
  highlightsSection: {
    marginBottom: 24,
  },
  highlightsList: {
    gap: 10,
  },
  highlightText: {
    fontSize: 15,
  },
  bookingSection: {
    marginBottom: 24,
  },
  bookingCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bookingCtaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingCtaTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  bookingCtaSubtitle: {
    fontSize: 12,
  },
  bookingDisclaimer: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
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
  },
  footerPriceValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
