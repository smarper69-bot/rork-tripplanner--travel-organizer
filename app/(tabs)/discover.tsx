import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, TrendingUp, MapPin, Sun, Mountain, Utensils, Compass, ChevronRight, DollarSign, Calendar, Heart, Plane, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { destinations, DiscoverDestination, TripType } from '@/mocks/destinations';
import { mockTrips } from '@/mocks/trips';

const categories = [
  { id: 'all', label: 'All', icon: Compass },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'beach', label: 'Beach', icon: Sun },
  { id: 'adventure', label: 'Adventure', icon: Mountain },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'city', label: 'City', icon: MapPin },
];

const budgetRanges = [
  { id: 'budget', label: 'Under $75/day', max: 75 },
  { id: 'mid', label: '$75-150/day', min: 75, max: 150 },
  { id: 'premium', label: '$150-250/day', min: 150, max: 250 },
  { id: 'luxury', label: '$250+/day', min: 250 },
];

function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

function getUserTripTypes(): TripType[] {
  const types = new Set<TripType>();
  mockTrips.forEach(trip => {
    if (trip.country === 'Japan') types.add('culture');
    if (trip.country === 'Spain') types.add('city');
    if (trip.country === 'Indonesia') types.add('beach');
  });
  if (types.size === 0) {
    return ['city', 'culture', 'food'];
  }
  return Array.from(types);
}

interface DestinationCardCompactProps {
  destination: DiscoverDestination;
  onPress: () => void;
}

function DestinationCardCompact({ destination, onPress }: DestinationCardCompactProps) {
  return (
    <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: destination.imageUrl }} style={styles.compactImage} />
      <View style={styles.compactOverlay} />
      <View style={styles.compactContent}>
        <View style={styles.compactBadge}>
          <Star size={10} color="#FFD700" fill="#FFD700" />
          <Text style={styles.compactBadgeText}>{(destination.popularityScore / 20).toFixed(1)}</Text>
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactCity}>{destination.city}</Text>
          <Text style={styles.compactCountry}>{destination.country}</Text>
          <Text style={styles.compactPrice}>From ${destination.avgDailyCost}/day</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface DestinationCardLargeProps {
  destination: DiscoverDestination;
  onPress: () => void;
}

function DestinationCardLarge({ destination, onPress }: DestinationCardLargeProps) {
  return (
    <TouchableOpacity style={styles.largeCard} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: destination.imageUrl }} style={styles.largeImage} />
      <View style={styles.largeOverlay} />
      <View style={styles.largeContent}>
        <View style={styles.largeBadgeRow}>
          <View style={styles.largeBadge}>
            <TrendingUp size={12} color="#fff" />
            <Text style={styles.largeBadgeText}>Trending</Text>
          </View>
        </View>
        <View style={styles.largeInfo}>
          <Text style={styles.largeCity}>{destination.city}</Text>
          <Text style={styles.largeCountry}>{destination.country}</Text>
          <View style={styles.largeMetaRow}>
            <Text style={styles.largePrice}>From ${destination.avgDailyCost}/day</Text>
            <View style={styles.largeDot} />
            <Text style={styles.largeTags}>{destination.tripTypes.slice(0, 2).join(' · ')}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface DestinationCardRowProps {
  destination: DiscoverDestination;
  onPress: () => void;
}

function DestinationCardRow({ destination, onPress }: DestinationCardRowProps) {
  return (
    <TouchableOpacity style={styles.rowCard} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: destination.imageUrl }} style={styles.rowImage} />
      <View style={styles.rowContent}>
        <Text style={styles.rowCity}>{destination.city}</Text>
        <Text style={styles.rowCountry}>{destination.country}</Text>
        <View style={styles.rowMeta}>
          <DollarSign size={12} color={Colors.textSecondary} />
          <Text style={styles.rowPrice}>${destination.avgDailyCost}/day</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.rowAction} onPress={onPress}>
        <Plane size={16} color={Colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function DiscoverScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);

  const currentMonth = getCurrentMonth();
  const userTripTypes = getUserTripTypes();

  const trendingThreshold = useMemo(() => {
    const sortedScores = [...destinations]
      .map(d => d.popularityScore)
      .sort((a, b) => b - a);
    const topIndex = Math.floor(sortedScores.length * 0.3);
    return sortedScores[topIndex] || 80;
  }, []);

  const trendingDestinations = useMemo(() => {
    return [...destinations]
      .filter(d => d.popularityScore >= trendingThreshold)
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 6);
  }, [trendingThreshold]);

  const budgetFriendly = useMemo(() => {
    const maxBudget = selectedBudget 
      ? budgetRanges.find(b => b.id === selectedBudget)?.max || 100
      : 100;
    return destinations
      .filter(d => d.avgDailyCost <= maxBudget)
      .sort((a, b) => a.avgDailyCost - b.avgDailyCost)
      .slice(0, 8);
  }, [selectedBudget]);

  const bestThisMonth = useMemo(() => {
    return destinations
      .filter(d => d.bestMonths.includes(currentMonth))
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 6);
  }, [currentMonth]);

  const recommendedForYou = useMemo(() => {
    return destinations
      .filter(d => d.tripTypes.some(t => userTripTypes.includes(t)))
      .sort((a, b) => {
        const aMatches = a.tripTypes.filter(t => userTripTypes.includes(t)).length;
        const bMatches = b.tripTypes.filter(t => userTripTypes.includes(t)).length;
        return bMatches - aMatches;
      })
      .slice(0, 6);
  }, [userTripTypes]);

  const weekendGetaways = useMemo(() => {
    const nearbyRegions = ['north-america', 'caribbean'];
    return destinations
      .filter(d => nearbyRegions.includes(d.region))
      .sort((a, b) => a.avgDailyCost - b.avgDailyCost)
      .slice(0, 6);
  }, []);

  const filteredDestinations = useMemo(() => {
    let filtered = [...destinations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.city.toLowerCase().includes(query) || 
        d.country.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'trending') {
        filtered = filtered
          .filter(d => d.popularityScore >= trendingThreshold)
          .sort((a, b) => b.popularityScore - a.popularityScore);
      } else {
        filtered = filtered.filter(d => 
          d.tripTypes.some(t => t.toLowerCase() === selectedCategory.toLowerCase())
        );
      }
    }

    return filtered.slice(0, 20);
  }, [searchQuery, selectedCategory, trendingThreshold]);

  const showFilteredView = selectedCategory !== 'all' || searchQuery.length > 0;

  const handleDestinationPress = (destination: DiscoverDestination) => {
    router.push({
      pathname: '/destination/[id]' as any,
      params: { id: destination.id },
    });
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthName = monthNames[currentMonth - 1];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Explore!</Text>
          <Text style={styles.subtitle}>Destinations, flights & stays</Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Where to next?"
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.filterIcon}>
              <SlidersHorizontal size={18} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const IconComponent = cat.icon;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    isActive && styles.categoryItemActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <View style={[styles.categoryIcon, isActive && styles.categoryIconActive]}>
                    <IconComponent 
                      size={20} 
                      color={isActive ? '#fff' : Colors.text} 
                    />
                  </View>
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {!showFilteredView && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <TrendingUp size={18} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Trending Now</Text>
                </View>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {trendingDestinations.slice(0, 3).map((dest) => (
                  <DestinationCardLarge
                    key={dest.id}
                    destination={dest}
                    onPress={() => handleDestinationPress(dest)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <DollarSign size={18} color="#27AE60" />
                  <Text style={styles.sectionTitle}>Budget-Friendly</Text>
                </View>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.budgetFilters}
              >
                {budgetRanges.map((range) => (
                  <TouchableOpacity
                    key={range.id}
                    style={[
                      styles.budgetPill,
                      selectedBudget === range.id && styles.budgetPillActive,
                    ]}
                    onPress={() => setSelectedBudget(selectedBudget === range.id ? null : range.id)}
                  >
                    <Text style={[
                      styles.budgetPillText,
                      selectedBudget === range.id && styles.budgetPillTextActive,
                    ]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {budgetFriendly.map((dest) => (
                  <DestinationCardCompact
                    key={dest.id}
                    destination={dest}
                    onPress={() => handleDestinationPress(dest)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Calendar size={18} color="#E67E22" />
                  <Text style={styles.sectionTitle}>Best in {currentMonthName}</Text>
                </View>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {bestThisMonth.map((dest) => (
                  <DestinationCardCompact
                    key={dest.id}
                    destination={dest}
                    onPress={() => handleDestinationPress(dest)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Heart size={18} color="#E74C3C" />
                  <Text style={styles.sectionTitle}>Recommended for You</Text>
                </View>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionSubtitle}>Based on your travel history</Text>
              <View style={styles.rowList}>
                {recommendedForYou.slice(0, 4).map((dest) => (
                  <DestinationCardRow
                    key={dest.id}
                    destination={dest}
                    onPress={() => handleDestinationPress(dest)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Plane size={18} color="#3498DB" />
                  <Text style={styles.sectionTitle}>Weekend Getaways</Text>
                </View>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionSubtitle}>Quick escapes nearby</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {weekendGetaways.map((dest) => (
                  <DestinationCardCompact
                    key={dest.id}
                    destination={dest}
                    onPress={() => handleDestinationPress(dest)}
                  />
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {showFilteredView && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {filteredDestinations.length} {selectedCategory !== 'all' && !searchQuery ? `${selectedCategory} ` : ''}destinations
              </Text>
            </View>
            <View style={styles.filteredGrid}>
              {filteredDestinations.map((dest) => (
                <TouchableOpacity 
                  key={dest.id} 
                  style={styles.filteredCard}
                  onPress={() => handleDestinationPress(dest)}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: dest.imageUrl }} style={styles.filteredImage} />
                  <View style={styles.filteredOverlay} />
                  <View style={styles.filteredContent}>
                    <View style={styles.filteredBadge}>
                      <Star size={10} color="#FFD700" fill="#FFD700" />
                      <Text style={styles.filteredBadgeText}>{(dest.popularityScore / 20).toFixed(1)}</Text>
                    </View>
                    <View style={styles.filteredInfo}>
                      <Text style={styles.filteredCity}>{dest.city}</Text>
                      <Text style={styles.filteredCountry}>{dest.country}</Text>
                      <Text style={styles.filteredPrice}>From ${dest.avgDailyCost}/day</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 52,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  categoryItemActive: {},
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIconActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.text,
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: -4,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 12,
  },
  budgetFilters: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  budgetPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  budgetPillActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  budgetPillText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  budgetPillTextActive: {
    color: '#fff',
  },
  largeCard: {
    width: 280,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  largeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  largeContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'space-between',
  },
  largeBadgeRow: {
    flexDirection: 'row',
  },
  largeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  largeBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
  },
  largeInfo: {},
  largeCity: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 2,
  },
  largeCountry: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  largeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  largePrice: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#fff',
  },
  largeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 8,
  },
  largeTags: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize' as const,
  },
  compactCard: {
    width: 160,
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  compactContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'space-between',
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  compactBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
  },
  compactInfo: {},
  compactCity: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 2,
  },
  compactCountry: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  compactPrice: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  rowContent: {
    flex: 1,
    marginLeft: 14,
  },
  rowCity: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  rowCountry: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  rowAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowList: {},
  searchResults: {},
  filteredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  filteredCard: {
    width: '47%',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
  },
  filteredImage: {
    width: '100%',
    height: '100%',
  },
  filteredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  filteredContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'space-between',
  },
  filteredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  filteredBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
  },
  filteredInfo: {},
  filteredCity: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 2,
  },
  filteredCountry: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  filteredPrice: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
