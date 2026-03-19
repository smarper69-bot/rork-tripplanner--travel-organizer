import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, TrendingUp, MapPin, Sun, Mountain, Utensils, Compass, ChevronRight, DollarSign, Calendar, Heart, Plane, Star } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

import { hapticLight } from '@/utils/haptics';
import { destinations, DiscoverDestination, TripType } from '@/mocks/destinations';
import { mockTrips } from '@/mocks/trips';
import { ThemeColors } from '@/constants/themes';
import { DEFAULT_FALLBACK_IMAGE } from '@/utils/destinationImages';

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
  const scale = useRef(new Animated.Value(1)).current;
  const [imgSrc, setImgSrc] = useState(destination.imageUrl);
  const onPressIn = useCallback(() => {
    hapticLight();
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  const onImageError = useCallback(() => {
    console.log('[DiscoverCompact] Image failed for:', destination.city, '- using fallback');
    setImgSrc(DEFAULT_FALLBACK_IMAGE);
  }, [destination.city]);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable style={staticStyles.compactCard} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Image source={{ uri: imgSrc }} style={staticStyles.compactImage} onError={onImageError} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.7)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={staticStyles.compactContent}>
          <View style={staticStyles.compactBadge}>
            <Star size={10} color="#FFD700" fill="#FFD700" />
            <Text style={staticStyles.compactBadgeText}>{(destination.popularityScore / 20).toFixed(1)}</Text>
          </View>
          <View style={staticStyles.compactInfo}>
            <Text style={staticStyles.compactCity}>{destination.city}</Text>
            <Text style={staticStyles.compactCountry}>{destination.country}</Text>
            <Text style={staticStyles.compactPrice}>From ${destination.avgDailyCost}/day</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface DestinationCardLargeProps {
  destination: DiscoverDestination;
  onPress: () => void;
}

function DestinationCardLarge({ destination, onPress }: DestinationCardLargeProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [imgSrc, setImgSrc] = useState(destination.imageUrl);
  const onPressIn = useCallback(() => {
    hapticLight();
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  const onImageError = useCallback(() => {
    console.log('[DiscoverLarge] Image failed for:', destination.city, '- using fallback');
    setImgSrc(DEFAULT_FALLBACK_IMAGE);
  }, [destination.city]);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable style={staticStyles.largeCard} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Image source={{ uri: imgSrc }} style={staticStyles.largeImage} onError={onImageError} />
        <LinearGradient
          colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={staticStyles.largeContent}>
          <View style={staticStyles.largeBadgeRow}>
            <View style={staticStyles.largeBadge}>
              <TrendingUp size={12} color="#fff" />
              <Text style={staticStyles.largeBadgeText}>Trending</Text>
            </View>
          </View>
          <View style={staticStyles.largeInfo}>
            <Text style={staticStyles.largeCity}>{destination.city}</Text>
            <Text style={staticStyles.largeCountry}>{destination.country}</Text>
            <View style={staticStyles.largeMetaRow}>
              <Text style={staticStyles.largePrice}>From ${destination.avgDailyCost}/day</Text>
              <View style={staticStyles.largeDot} />
              <Text style={staticStyles.largeTags}>{destination.tripTypes.slice(0, 2).join(' · ')}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface DestinationCardRowProps {
  destination: DiscoverDestination;
  onPress: () => void;
  colors: ThemeColors;
}

function DestinationCardRow({ destination, onPress, colors }: DestinationCardRowProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [imgSrc, setImgSrc] = useState(destination.imageUrl);
  const onPressIn = useCallback(() => {
    hapticLight();
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  const onImageError = useCallback(() => {
    console.log('[DiscoverRow] Image failed for:', destination.city, '- using fallback');
    setImgSrc(DEFAULT_FALLBACK_IMAGE);
  }, [destination.city]);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[staticStyles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Image source={{ uri: imgSrc }} style={staticStyles.rowImage} onError={onImageError} />
        <View style={staticStyles.rowContent}>
          <Text style={[staticStyles.rowCity, { color: colors.text }]}>{destination.city}</Text>
          <Text style={[staticStyles.rowCountry, { color: colors.textSecondary }]}>{destination.country}</Text>
          <View style={staticStyles.rowMeta}>
            <DollarSign size={12} color={colors.textSecondary} />
            <Text style={[staticStyles.rowPrice, { color: colors.textSecondary }]}>${destination.avgDailyCost}/day</Text>
          </View>
        </View>
        <View style={[staticStyles.rowAction, { backgroundColor: colors.inputBackground }]}>
          <Plane size={16} color={colors.text} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface FilteredDestinationCardProps {
  destination: DiscoverDestination;
  onPress: () => void;
}

function FilteredDestinationCard({ destination, onPress }: FilteredDestinationCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [imgSrc, setImgSrc] = useState(destination.imageUrl);
  const onPressIn = useCallback(() => {
    hapticLight();
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  const onImageError = useCallback(() => {
    console.log('[DiscoverFiltered] Image failed for:', destination.city, '- using fallback');
    setImgSrc(DEFAULT_FALLBACK_IMAGE);
  }, [destination.city]);
  return (
    <Animated.View style={[staticStyles.filteredCard, { transform: [{ scale }] }]}>
      <Pressable style={staticStyles.filteredCardPressable} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Image source={{ uri: imgSrc }} style={staticStyles.filteredImage} onError={onImageError} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.7)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={staticStyles.filteredContent}>
          <View style={staticStyles.filteredBadge}>
            <Star size={10} color="#FFD700" fill="#FFD700" />
            <Text style={staticStyles.filteredBadgeText}>{(destination.popularityScore / 20).toFixed(1)}</Text>
          </View>
          <View style={staticStyles.filteredInfo}>
            <Text style={staticStyles.filteredCity}>{destination.city}</Text>
            <Text style={staticStyles.filteredCountry}>{destination.country}</Text>
            <Text style={staticStyles.filteredPrice}>From ${destination.avgDailyCost}/day</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function DiscoverScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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

  const s = createStyles(colors);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={staticStyles.scrollContent}
      >
        <View style={staticStyles.header}>
          <Text style={[staticStyles.title, { color: colors.text }]}>Explore!</Text>
          <Text style={[staticStyles.subtitle, { color: colors.textSecondary }]}>Destinations, flights & stays</Text>
        </View>

        <View style={staticStyles.searchSection}>
          <View style={[s.searchBar]}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              style={[staticStyles.searchInput, { color: colors.text }]}
              placeholder="Where to next?"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={[s.filterIcon]} onPress={() => hapticLight()}>
              <SlidersHorizontal size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={staticStyles.categoriesSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={staticStyles.categoriesContainer}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const IconComponent = cat.icon;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={staticStyles.categoryItem}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <View style={[s.categoryIcon, isActive && s.categoryIconActive]}>
                    <IconComponent 
                      size={20} 
                      color={isActive ? colors.chipActiveText : colors.iconDefault} 
                    />
                  </View>
                  <Text style={[s.categoryText, isActive && s.categoryTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {!showFilteredView && (
          <>
            <View style={staticStyles.section}>
              <View style={staticStyles.sectionHeader}>
                <View style={staticStyles.sectionTitleRow}>
                  <TrendingUp size={18} color={colors.accent} />
                  <Text style={[staticStyles.sectionTitleText, { color: colors.text }]}>Trending Now</Text>
                </View>
                <TouchableOpacity style={staticStyles.seeAllButton} onPress={() => { hapticLight(); router.push({ pathname: '/explore-category', params: { category: 'trending' } }); }}>
                  <Text style={[staticStyles.seeAllText, { color: colors.textSecondary }]}>See all</Text>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={staticStyles.horizontalScroll}
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

            <View style={staticStyles.section}>
              <View style={staticStyles.sectionHeader}>
                <View style={staticStyles.sectionTitleRow}>
                  <DollarSign size={18} color="#27AE60" />
                  <Text style={[staticStyles.sectionTitleText, { color: colors.text }]}>Budget-Friendly</Text>
                </View>
                <TouchableOpacity style={staticStyles.seeAllButton} onPress={() => { hapticLight(); router.push({ pathname: '/explore-category', params: { category: 'budget' } }); }}>
                  <Text style={[staticStyles.seeAllText, { color: colors.textSecondary }]}>See all</Text>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={staticStyles.budgetFilters}
              >
                {budgetRanges.map((range) => (
                  <TouchableOpacity
                    key={range.id}
                    style={[
                      s.budgetPill,
                      selectedBudget === range.id && s.budgetPillActive,
                    ]}
                    onPress={() => setSelectedBudget(selectedBudget === range.id ? null : range.id)}
                  >
                    <Text style={[
                      s.budgetPillText,
                      selectedBudget === range.id && s.budgetPillTextActive,
                    ]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={staticStyles.horizontalScroll}
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

            <View style={staticStyles.section}>
              <View style={staticStyles.sectionHeader}>
                <View style={staticStyles.sectionTitleRow}>
                  <Calendar size={18} color="#E67E22" />
                  <Text style={[staticStyles.sectionTitleText, { color: colors.text }]}>Best in {currentMonthName}</Text>
                </View>
                <TouchableOpacity style={staticStyles.seeAllButton} onPress={() => { hapticLight(); router.push({ pathname: '/explore-category', params: { category: 'seasonal' } }); }}>
                  <Text style={[staticStyles.seeAllText, { color: colors.textSecondary }]}>See all</Text>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={staticStyles.horizontalScroll}
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

            <View style={staticStyles.section}>
              <View style={staticStyles.sectionHeader}>
                <View style={staticStyles.sectionTitleRow}>
                  <Heart size={18} color="#E74C3C" />
                  <Text style={[staticStyles.sectionTitleText, { color: colors.text }]}>Recommended for You</Text>
                </View>
                <TouchableOpacity style={staticStyles.seeAllButton} onPress={() => { hapticLight(); router.push({ pathname: '/explore-category', params: { category: 'recommended' } }); }}>
                  <Text style={[staticStyles.seeAllText, { color: colors.textSecondary }]}>See all</Text>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={[staticStyles.sectionSubtitle, { color: colors.textSecondary }]}>Based on your travel history</Text>
              <View style={staticStyles.rowList}>
                {recommendedForYou.slice(0, 4).map((dest) => (
                  <DestinationCardRow
                    key={dest.id}
                    destination={dest}
                    onPress={() => handleDestinationPress(dest)}
                    colors={colors}
                  />
                ))}
              </View>
            </View>

            <View style={staticStyles.section}>
              <View style={staticStyles.sectionHeader}>
                <View style={staticStyles.sectionTitleRow}>
                  <Plane size={18} color="#3498DB" />
                  <Text style={[staticStyles.sectionTitleText, { color: colors.text }]}>Weekend Getaways</Text>
                </View>
                <TouchableOpacity style={staticStyles.seeAllButton} onPress={() => { hapticLight(); router.push({ pathname: '/explore-category', params: { category: 'weekend' } }); }}>
                  <Text style={[staticStyles.seeAllText, { color: colors.textSecondary }]}>See all</Text>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={[staticStyles.sectionSubtitle, { color: colors.textSecondary }]}>Quick escapes nearby</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={staticStyles.horizontalScroll}
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
          <View style={staticStyles.section}>
            <View style={staticStyles.sectionHeader}>
              <Text style={[staticStyles.sectionTitleText, { color: colors.text }]}>
                {filteredDestinations.length} {selectedCategory !== 'all' && !searchQuery ? `${selectedCategory} ` : ''}destinations
              </Text>
            </View>
            <View style={staticStyles.filteredGrid}>
              {filteredDestinations.map((dest) => (
                <FilteredDestinationCard
                  key={dest.id}
                  destination={dest}
                  onPress={() => handleDestinationPress(dest)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 52,
  },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryIconActive: {
    backgroundColor: colors.chipActiveBg,
    borderColor: colors.chipActiveBg,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.text,
    fontWeight: '600' as const,
  },
  budgetPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.chipBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  budgetPillActive: {
    backgroundColor: colors.chipActiveBg,
    borderColor: colors.chipActiveBg,
  },
  budgetPillText: {
    fontSize: 13,
    color: colors.chipText,
    fontWeight: '500' as const,
  },
  budgetPillTextActive: {
    color: colors.chipActiveText,
  },
});

const staticStyles = StyleSheet.create({
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
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
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
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
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
  largeCard: {
    width: 280,
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  largeImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
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
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  compactImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
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
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
  },
  rowImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  rowContent: {
    flex: 1,
    marginLeft: 14,
  },
  rowCity: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  rowCountry: {
    fontSize: 13,
    marginBottom: 4,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowPrice: {
    fontSize: 12,
  },
  rowAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowList: {},
  filteredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  filteredCard: {
    width: '47%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  filteredCardPressable: {
    width: '100%',
    height: '100%',
  },
  filteredImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
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
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
