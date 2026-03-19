import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Animated, Pressable, Modal, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Search, SlidersHorizontal, TrendingUp, MapPin, Sun,
  Compass, ChevronRight, DollarSign, Calendar, Heart, Plane, Star,
  X, TreePalm, Building2, Trees, Landmark, Backpack, Wallet,
  Snowflake, Flower2, Leaf,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { hapticLight, hapticMedium } from '@/utils/haptics';
import { destinations, DiscoverDestination, TripType } from '@/mocks/destinations';
import { mockTrips } from '@/mocks/trips';
import { ThemeColors } from '@/constants/themes';
import { DEFAULT_FALLBACK_IMAGE } from '@/utils/destinationImages';

const categories = [
  { id: 'all', label: 'All', icon: Compass },
  { id: 'beach', label: 'Beach', icon: TreePalm },
  { id: 'city', label: 'City', icon: Building2 },
  { id: 'nature', label: 'Nature', icon: Trees },
  { id: 'culture', label: 'Culture', icon: Landmark },
  { id: 'adventure', label: 'Adventure', icon: Backpack },
  { id: 'budget', label: 'Budget', icon: Wallet },
];

const budgetRanges = [
  { id: 'any', label: 'Any budget', max: 9999 },
  { id: 'budget', label: 'Under $75', max: 75 },
  { id: 'mid', label: '$75–150', min: 75, max: 150 },
  { id: 'premium', label: '$150–250', min: 150, max: 250 },
  { id: 'luxury', label: '$250+', min: 250 },
];

const travelStyles: { id: TripType; label: string }[] = [
  { id: 'solo', label: 'Solo' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'family', label: 'Family' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'budget', label: 'Budget' },
];

const seasons = [
  { id: 'spring', label: 'Spring', icon: Flower2, months: [3, 4, 5] },
  { id: 'summer', label: 'Summer', icon: Sun, months: [6, 7, 8] },
  { id: 'autumn', label: 'Autumn', icon: Leaf, months: [9, 10, 11] },
  { id: 'winter', label: 'Winter', icon: Snowflake, months: [12, 1, 2] },
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

const TAG_COLORS: Record<string, string> = {
  beach: '#0EA5E9',
  city: '#8B5CF6',
  nature: '#22C55E',
  culture: '#F59E0B',
  adventure: '#EF4444',
  food: '#FB923C',
  romantic: '#EC4899',
  family: '#6366F1',
  solo: '#14B8A6',
  luxury: '#D4AF37',
  budget: '#10B981',
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag.toLowerCase()] ?? '#6B7280';
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
          colors={['transparent', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.72)']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={staticStyles.compactContent}>
          <View style={staticStyles.compactTagRow}>
            {destination.tripTypes.slice(0, 2).map((t) => (
              <View key={t} style={[staticStyles.miniTag, { backgroundColor: getTagColor(t) + '30' }]}>
                <Text style={[staticStyles.miniTagText, { color: getTagColor(t) }]}>{t}</Text>
              </View>
            ))}
          </View>
          <View style={staticStyles.compactInfo}>
            <Text style={staticStyles.compactCity} numberOfLines={1}>{destination.city}</Text>
            <Text style={staticStyles.compactCountry} numberOfLines={1}>{destination.country}</Text>
            <View style={staticStyles.compactPriceRow}>
              <DollarSign size={11} color="#fff" />
              <Text style={staticStyles.compactPrice}>{destination.avgDailyCost}/day</Text>
            </View>
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
          colors={['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.78)']}
          locations={[0, 0.3, 1]}
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
            <View style={staticStyles.largeTagRow}>
              {destination.tripTypes.slice(0, 3).map((t) => (
                <View key={t} style={[staticStyles.cardTag, { backgroundColor: getTagColor(t) + '40' }]}>
                  <Text style={[staticStyles.cardTagText, { color: '#fff' }]}>{t}</Text>
                </View>
              ))}
            </View>
            <Text style={staticStyles.largeCity}>{destination.city}</Text>
            <Text style={staticStyles.largeCountry}>{destination.country}</Text>
            <View style={staticStyles.largeMetaRow}>
              <DollarSign size={13} color="#fff" />
              <Text style={staticStyles.largePrice}>{destination.avgDailyCost}/day</Text>
              <View style={staticStyles.largeDot} />
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text style={staticStyles.largeTags}>{(destination.popularityScore / 20).toFixed(1)}</Text>
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
          <View style={staticStyles.rowTagsRow}>
            {destination.tripTypes.slice(0, 2).map((t) => (
              <View key={t} style={[staticStyles.rowTag, { backgroundColor: getTagColor(t) + '18' }]}>
                <Text style={[staticStyles.rowTagText, { color: getTagColor(t) }]}>{t}</Text>
              </View>
            ))}
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
          <View style={staticStyles.filteredBadgeRow}>
            {destination.tripTypes.slice(0, 2).map((t) => (
              <View key={t} style={[staticStyles.miniTag, { backgroundColor: getTagColor(t) + '30' }]}>
                <Text style={[staticStyles.miniTagText, { color: getTagColor(t) }]}>{t}</Text>
              </View>
            ))}
          </View>
          <View style={staticStyles.filteredInfo}>
            <Text style={staticStyles.filteredCity}>{destination.city}</Text>
            <Text style={staticStyles.filteredCountry}>{destination.country}</Text>
            <View style={staticStyles.compactPriceRow}>
              <DollarSign size={11} color="#fff" />
              <Text style={staticStyles.filteredPrice}>{destination.avgDailyCost}/day</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  selectedBudget: string;
  onBudgetChange: (id: string) => void;
  selectedStyles: TripType[];
  onStyleToggle: (id: TripType) => void;
  selectedSeason: string | null;
  onSeasonChange: (id: string | null) => void;
  onReset: () => void;
  activeFilterCount: number;
}

function FilterModal({
  visible, onClose, colors, selectedBudget, onBudgetChange,
  selectedStyles, onStyleToggle, selectedSeason, onSeasonChange,
  onReset, activeFilterCount,
}: FilterModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent>
      <View style={[staticStyles.modalOverlay]}>
        <View style={[staticStyles.modalContainer, { backgroundColor: colors.background }]}>
          <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
            <View style={[staticStyles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={onClose} style={staticStyles.modalCloseBtn}>
                <X size={22} color={colors.text} />
              </TouchableOpacity>
              <Text style={[staticStyles.modalTitle, { color: colors.text }]}>Filters</Text>
              <TouchableOpacity onPress={onReset}>
                <Text style={[staticStyles.modalResetText, { color: colors.accent }]}>Reset</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={staticStyles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={[staticStyles.filterGroupTitle, { color: colors.text }]}>Budget per day</Text>
              <View style={staticStyles.filterChipRow}>
                {budgetRanges.map((range) => {
                  const active = selectedBudget === range.id;
                  return (
                    <TouchableOpacity
                      key={range.id}
                      style={[
                        staticStyles.filterChip,
                        { backgroundColor: active ? colors.chipActiveBg : colors.surface, borderColor: active ? colors.chipActiveBg : colors.border },
                      ]}
                      onPress={() => { hapticLight(); onBudgetChange(range.id); }}
                    >
                      <Text style={[staticStyles.filterChipText, { color: active ? colors.chipActiveText : colors.text }]}>
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[staticStyles.filterGroupTitle, { color: colors.text }]}>Travel style</Text>
              <View style={staticStyles.filterChipRow}>
                {travelStyles.map((style) => {
                  const active = selectedStyles.includes(style.id);
                  return (
                    <TouchableOpacity
                      key={style.id}
                      style={[
                        staticStyles.filterChip,
                        { backgroundColor: active ? colors.chipActiveBg : colors.surface, borderColor: active ? colors.chipActiveBg : colors.border },
                      ]}
                      onPress={() => { hapticLight(); onStyleToggle(style.id); }}
                    >
                      <Text style={[staticStyles.filterChipText, { color: active ? colors.chipActiveText : colors.text }]}>
                        {style.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[staticStyles.filterGroupTitle, { color: colors.text }]}>Season</Text>
              <View style={staticStyles.filterChipRow}>
                {seasons.map((season) => {
                  const active = selectedSeason === season.id;
                  const IconComp = season.icon;
                  return (
                    <TouchableOpacity
                      key={season.id}
                      style={[
                        staticStyles.seasonChip,
                        { backgroundColor: active ? colors.chipActiveBg : colors.surface, borderColor: active ? colors.chipActiveBg : colors.border },
                      ]}
                      onPress={() => { hapticLight(); onSeasonChange(active ? null : season.id); }}
                    >
                      <IconComp size={16} color={active ? colors.chipActiveText : colors.iconDefault} />
                      <Text style={[staticStyles.filterChipText, { color: active ? colors.chipActiveText : colors.text }]}>
                        {season.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={[staticStyles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[staticStyles.applyButton, { backgroundColor: colors.chipActiveBg }]}
                onPress={() => { hapticMedium(); onClose(); }}
              >
                <Text style={[staticStyles.applyButtonText, { color: colors.chipActiveText }]}>
                  Show results{activeFilterCount > 0 ? ` (${activeFilterCount} filters)` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

export default function DiscoverScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterVisible, setFilterVisible] = useState(false);

  const [filterBudget, setFilterBudget] = useState('any');
  const [filterStyles, setFilterStyles] = useState<TripType[]>([]);
  const [filterSeason, setFilterSeason] = useState<string | null>(null);

  const currentMonth = getCurrentMonth();
  const userTripTypes = getUserTripTypes();

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterBudget !== 'any') count++;
    if (filterStyles.length > 0) count++;
    if (filterSeason) count++;
    return count;
  }, [filterBudget, filterStyles, filterSeason]);

  const handleStyleToggle = useCallback((id: TripType) => {
    setFilterStyles(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilterBudget('any');
    setFilterStyles([]);
    setFilterSeason(null);
  }, []);

  const applyGlobalFilters = useCallback((list: DiscoverDestination[]): DiscoverDestination[] => {
    let result = list;
    if (filterBudget !== 'any') {
      const range = budgetRanges.find(b => b.id === filterBudget);
      if (range) {
        result = result.filter(d => {
          if (range.min !== undefined && d.avgDailyCost < range.min) return false;
          if (range.max !== undefined && d.avgDailyCost > range.max) return false;
          return true;
        });
      }
    }
    if (filterStyles.length > 0) {
      result = result.filter(d => d.tripTypes.some(t => filterStyles.includes(t)));
    }
    if (filterSeason) {
      const season = seasons.find(s => s.id === filterSeason);
      if (season) {
        result = result.filter(d => d.bestMonths.some(m => season.months.includes(m)));
      }
    }
    return result;
  }, [filterBudget, filterStyles, filterSeason]);

  const trendingThreshold = useMemo(() => {
    const sortedScores = [...destinations].map(d => d.popularityScore).sort((a, b) => b - a);
    const topIndex = Math.floor(sortedScores.length * 0.3);
    return sortedScores[topIndex] || 80;
  }, []);

  const trendingDestinations = useMemo(() => {
    const base = [...destinations]
      .filter(d => d.popularityScore >= trendingThreshold)
      .sort((a, b) => b.popularityScore - a.popularityScore);
    return applyGlobalFilters(base).slice(0, 6);
  }, [trendingThreshold, applyGlobalFilters]);

  const budgetFriendly = useMemo(() => {
    const base = [...destinations].sort((a, b) => a.avgDailyCost - b.avgDailyCost);
    return applyGlobalFilters(base.filter(d => d.avgDailyCost <= 100)).slice(0, 8);
  }, [applyGlobalFilters]);

  const bestThisMonth = useMemo(() => {
    const base = destinations
      .filter(d => d.bestMonths.includes(currentMonth))
      .sort((a, b) => b.popularityScore - a.popularityScore);
    return applyGlobalFilters(base).slice(0, 6);
  }, [currentMonth, applyGlobalFilters]);

  const recommendedForYou = useMemo(() => {
    const base = destinations
      .filter(d => d.tripTypes.some(t => userTripTypes.includes(t)))
      .sort((a, b) => {
        const aMatches = a.tripTypes.filter(t => userTripTypes.includes(t)).length;
        const bMatches = b.tripTypes.filter(t => userTripTypes.includes(t)).length;
        return bMatches - aMatches;
      });
    return applyGlobalFilters(base).slice(0, 6);
  }, [userTripTypes, applyGlobalFilters]);

  const filteredDestinations = useMemo(() => {
    let filtered = [...destinations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.city.toLowerCase().includes(query) ||
        d.country.toLowerCase().includes(query) ||
        d.tripTypes.some(t => t.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'budget') {
        filtered = filtered.filter(d => d.avgDailyCost <= 100 || d.tripTypes.includes('budget'));
      } else {
        filtered = filtered.filter(d =>
          d.tripTypes.some(t => t.toLowerCase() === selectedCategory.toLowerCase())
        );
      }
    }

    filtered = applyGlobalFilters(filtered);
    return filtered.slice(0, 30);
  }, [searchQuery, selectedCategory, applyGlobalFilters]);

  const showFilteredView = selectedCategory !== 'all' || searchQuery.length > 0;

  const handleDestinationPress = useCallback((destination: DiscoverDestination) => {
    router.push({
      pathname: '/destination/[id]' as any,
      params: { id: destination.id },
    });
  }, [router]);

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
          <Text style={[staticStyles.title, { color: colors.text }]}>Explore</Text>
          <Text style={[staticStyles.subtitle, { color: colors.textSecondary }]}>Find your next adventure</Text>
        </View>

        <View style={staticStyles.searchSection}>
          <View style={[s.searchBar]}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              style={[staticStyles.searchInput, { color: colors.text }]}
              placeholder="Search destinations, styles..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={[s.filterIcon, activeFilterCount > 0 && { backgroundColor: colors.accent + '20', borderWidth: 1, borderColor: colors.accent }]}
              onPress={() => { hapticLight(); setFilterVisible(true); }}
            >
              <SlidersHorizontal size={18} color={activeFilterCount > 0 ? colors.accent : colors.text} />
              {activeFilterCount > 0 && (
                <View style={[staticStyles.filterBadge, { backgroundColor: colors.accent }]}>
                  <Text style={staticStyles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
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
                  onPress={() => { hapticLight(); setSelectedCategory(cat.id); }}
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

        {activeFilterCount > 0 && !showFilteredView && (
          <View style={staticStyles.activeFiltersBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={staticStyles.activeFiltersScroll}>
              {filterBudget !== 'any' && (
                <View style={[staticStyles.activeFilterPill, { backgroundColor: colors.accent + '18', borderColor: colors.accent + '30' }]}>
                  <DollarSign size={12} color={colors.accent} />
                  <Text style={[staticStyles.activeFilterText, { color: colors.accent }]}>
                    {budgetRanges.find(b => b.id === filterBudget)?.label}
                  </Text>
                </View>
              )}
              {filterStyles.map(st => (
                <View key={st} style={[staticStyles.activeFilterPill, { backgroundColor: getTagColor(st) + '18', borderColor: getTagColor(st) + '30' }]}>
                  <Text style={[staticStyles.activeFilterText, { color: getTagColor(st) }]}>{st}</Text>
                </View>
              ))}
              {filterSeason && (
                <View style={[staticStyles.activeFilterPill, { backgroundColor: colors.accent + '18', borderColor: colors.accent + '30' }]}>
                  <Text style={[staticStyles.activeFilterText, { color: colors.accent }]}>
                    {seasons.find(s => s.id === filterSeason)?.label}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[staticStyles.clearFiltersPill, { borderColor: colors.border }]}
                onPress={() => { hapticLight(); handleResetFilters(); }}
              >
                <X size={12} color={colors.textSecondary} />
                <Text style={[staticStyles.activeFilterText, { color: colors.textSecondary }]}>Clear</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {!showFilteredView && (
          <>
            {trendingDestinations.length > 0 && (
              <View style={staticStyles.section}>
                <View style={staticStyles.sectionHeader}>
                  <View style={staticStyles.sectionTitleRow}>
                    <View style={[staticStyles.sectionIconBg, { backgroundColor: '#EF4444' + '18' }]}>
                      <TrendingUp size={16} color="#EF4444" />
                    </View>
                    <Text style={[staticStyles.sectionTitleText, { color: colors.text }]}>Trending Now</Text>
                  </View>
                  <TouchableOpacity style={staticStyles.seeAllButton} onPress={() => { hapticLight(); router.push({ pathname: '/explore-category', params: { category: 'trending' } }); }}>
                    <Text style={[staticStyles.seeAllText, { color: colors.accent }]}>See all</Text>
                    <ChevronRight size={16} color={colors.accent} />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={staticStyles.horizontalScroll}
                >
                  {trendingDestinations.slice(0, 4).map((dest) => (
                    <DestinationCardLarge
                      key={dest.id}
                      destination={dest}
                      onPress={() => handleDestinationPress(dest)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {budgetFriendly.length > 0 && (
              <View style={staticStyles.section}>
                <View style={staticStyles.sectionHeader}>
                  <View style={staticStyles.sectionTitleRow}>
                    <View style={[staticStyles.sectionIconBg, { backgroundColor: '#10B981' + '18' }]}>
                      <DollarSign size={16} color="#10B981" />
                    </View>
                    <Text style={[staticStyles.sectionTitleText, { color: colors.text }]}>Budget-Friendly</Text>
                  </View>
                  <TouchableOpacity style={staticStyles.seeAllButton} onPress={() => { hapticLight(); router.push({ pathname: '/explore-category', params: { category: 'budget' } }); }}>
                    <Text style={[staticStyles.seeAllText, { color: colors.accent }]}>See all</Text>
                    <ChevronRight size={16} color={colors.accent} />
                  </TouchableOpacity>
                </View>
                <Text style={[staticStyles.sectionSubtitle, { color: colors.textSecondary }]}>Under $100 per day</Text>
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
            )}

            {bestThisMonth.length > 0 && (
              <View style={staticStyles.section}>
                <View style={staticStyles.sectionHeader}>
                  <View style={staticStyles.sectionTitleRow}>
                    <View style={[staticStyles.sectionIconBg, { backgroundColor: '#F59E0B' + '18' }]}>
                      <Calendar size={16} color="#F59E0B" />
                    </View>
                    <Text style={[staticStyles.sectionTitleText, { color: colors.text }]}>Best in {currentMonthName}</Text>
                  </View>
                  <TouchableOpacity style={staticStyles.seeAllButton} onPress={() => { hapticLight(); router.push({ pathname: '/explore-category', params: { category: 'seasonal' } }); }}>
                    <Text style={[staticStyles.seeAllText, { color: colors.accent }]}>See all</Text>
                    <ChevronRight size={16} color={colors.accent} />
                  </TouchableOpacity>
                </View>
                <Text style={[staticStyles.sectionSubtitle, { color: colors.textSecondary }]}>Perfect weather right now</Text>
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
            )}

            {recommendedForYou.length > 0 && (
              <View style={staticStyles.section}>
                <View style={staticStyles.sectionHeader}>
                  <View style={staticStyles.sectionTitleRow}>
                    <View style={[staticStyles.sectionIconBg, { backgroundColor: '#EC4899' + '18' }]}>
                      <Heart size={16} color="#EC4899" />
                    </View>
                    <Text style={[staticStyles.sectionTitleText, { color: colors.text }]}>Recommended for You</Text>
                  </View>
                  <TouchableOpacity style={staticStyles.seeAllButton} onPress={() => { hapticLight(); router.push({ pathname: '/explore-category', params: { category: 'recommended' } }); }}>
                    <Text style={[staticStyles.seeAllText, { color: colors.accent }]}>See all</Text>
                    <ChevronRight size={16} color={colors.accent} />
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
            )}
          </>
        )}

        {showFilteredView && (
          <View style={staticStyles.section}>
            <View style={staticStyles.sectionHeader}>
              <View style={staticStyles.sectionTitleRow}>
                <View style={[staticStyles.sectionIconBg, { backgroundColor: colors.accent + '18' }]}>
                  <MapPin size={16} color={colors.accent} />
                </View>
                <Text style={[staticStyles.sectionTitleText, { color: colors.text }]}>
                  {filteredDestinations.length} {selectedCategory !== 'all' && !searchQuery ? `${selectedCategory} ` : ''}destination{filteredDestinations.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            {filteredDestinations.length === 0 ? (
              <View style={staticStyles.emptyState}>
                <Compass size={48} color={colors.textMuted} />
                <Text style={[staticStyles.emptyTitle, { color: colors.text }]}>No destinations found</Text>
                <Text style={[staticStyles.emptySubtitle, { color: colors.textSecondary }]}>Try adjusting your filters or search</Text>
                {activeFilterCount > 0 && (
                  <TouchableOpacity
                    style={[staticStyles.emptyResetBtn, { backgroundColor: colors.accent }]}
                    onPress={() => { handleResetFilters(); setSearchQuery(''); setSelectedCategory('all'); }}
                  >
                    <Text style={staticStyles.emptyResetText}>Reset all filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={staticStyles.filteredGrid}>
                {filteredDestinations.map((dest) => (
                  <FilteredDestinationCard
                    key={dest.id}
                    destination={dest}
                    onPress={() => handleDestinationPress(dest)}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        colors={colors}
        selectedBudget={filterBudget}
        onBudgetChange={setFilterBudget}
        selectedStyles={filterStyles}
        onStyleToggle={handleStyleToggle}
        selectedSeason={filterSeason}
        onSeasonChange={setFilterSeason}
        onReset={handleResetFilters}
        activeFilterCount={activeFilterCount}
      />
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    height: 52,
  },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
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
    fontWeight: '700' as const,
  },
});

const staticStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: '800' as const,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    fontWeight: '400' as const,
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
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#fff',
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  activeFiltersBar: {
    marginBottom: 16,
  },
  activeFiltersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  clearFiltersPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
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
    gap: 10,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '600' as const,
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 12,
  },
  largeCard: {
    width: 280,
    height: 210,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 14,
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
    gap: 5,
    backgroundColor: 'rgba(239,68,68,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  largeBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#fff',
  },
  largeInfo: {},
  largeTagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  cardTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  largeCity: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  largeCountry: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  largeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  largePrice: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#fff',
  },
  largeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  largeTags: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600' as const,
  },
  compactCard: {
    width: 160,
    height: 210,
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
  compactTagRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  miniTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  miniTagText: {
    fontSize: 9,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  },
  compactInfo: {},
  compactCity: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  compactCountry: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 6,
    fontWeight: '500' as const,
  },
  compactPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  compactPrice: {
    fontSize: 12,
    fontWeight: '700' as const,
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
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: '#2a2a2a',
  },
  rowContent: {
    flex: 1,
    marginLeft: 14,
  },
  rowCity: {
    fontSize: 16,
    fontWeight: '700' as const,
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
    marginBottom: 6,
  },
  rowPrice: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  rowTagsRow: {
    flexDirection: 'row',
    gap: 5,
  },
  rowTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rowTagText: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
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
    height: 210,
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
  filteredBadgeRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  filteredInfo: {},
  filteredCity: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  filteredCountry: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 6,
  },
  filteredPrice: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center' as const,
  },
  emptyResetBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyResetText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '65%',
    maxHeight: '90%',
    ...Platform.select({
      web: { minHeight: '70%' },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  modalResetText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterGroupTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  seasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  applyButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
