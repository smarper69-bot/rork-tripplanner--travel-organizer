import React, { useMemo, useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft, Star, DollarSign, MapPin } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { hapticLight } from '@/utils/haptics';
import { destinations, DiscoverDestination } from '@/mocks/destinations';
import { ThemeColors } from '@/constants/themes';
import { DEFAULT_FALLBACK_IMAGE } from '@/utils/destinationImages';

type CategoryType = 'trending' | 'budget' | 'seasonal' | 'recommended' | 'weekend';

function getCategoryTitle(category: CategoryType, monthName?: string): string {
  switch (category) {
    case 'trending': return 'Trending Destinations';
    case 'budget': return 'Budget-Friendly';
    case 'seasonal': return `Best in ${monthName ?? 'This Month'}`;
    case 'recommended': return 'Recommended for You';
    case 'weekend': return 'Weekend Getaways';
    default: return 'Destinations';
  }
}

function getCategorySubtitle(category: CategoryType): string {
  switch (category) {
    case 'trending': return 'Most popular destinations right now';
    case 'budget': return 'Amazing destinations that won\'t break the bank';
    case 'seasonal': return 'Perfect weather and events this time of year';
    case 'recommended': return 'Curated based on your travel style';
    case 'weekend': return 'Quick escapes for a short break';
    default: return '';
  }
}

function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

interface CardProps {
  destination: DiscoverDestination;
  onPress: () => void;
  colors: ThemeColors;
}

function DestinationGridCard({ destination, onPress, colors }: CardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [imgSrc, setImgSrc] = useState(destination.imageUrl);
  const onImageError = useCallback(() => {
    console.log('[ExploreCategory] Image failed for:', destination.city, '- using fallback');
    setImgSrc(DEFAULT_FALLBACK_IMAGE);
  }, [destination.city]);
  const onPressIn = useCallback(() => {
    hapticLight();
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);

  return (
    <Animated.View style={[styles.gridCardWrapper, { transform: [{ scale }] }]}>
      <Pressable
        style={[styles.gridCard, { backgroundColor: colors.surface }]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={styles.gridImageContainer}>
          <Image source={{ uri: imgSrc }} style={styles.gridImage} onError={onImageError} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.7)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.gridBadge}>
            <Star size={10} color="#FFD700" fill="#FFD700" />
            <Text style={styles.gridBadgeText}>{(destination.popularityScore / 20).toFixed(1)}</Text>
          </View>
          <View style={styles.gridImageInfo}>
            <Text style={styles.gridCity}>{destination.city}</Text>
            <Text style={styles.gridCountry}>{destination.country}</Text>
          </View>
        </View>
        <View style={styles.gridContent}>
          <View style={styles.gridMetaRow}>
            <DollarSign size={13} color={colors.textSecondary} />
            <Text style={[styles.gridPrice, { color: colors.textSecondary }]}>From ${destination.avgDailyCost}/day</Text>
          </View>
          <View style={styles.gridTagsRow}>
            {destination.tripTypes.slice(0, 2).map((type) => (
              <View key={type} style={[styles.gridTag, { backgroundColor: colors.inputBackground }]}>
                <Text style={[styles.gridTagText, { color: colors.textSecondary }]}>{type}</Text>
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ExploreCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category: string }>();
  const colors = useThemeColors();
  const category = (params.category ?? 'trending') as CategoryType;

  const currentMonth = getCurrentMonth();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthName = monthNames[currentMonth - 1];

  const filteredDestinations = useMemo(() => {
    switch (category) {
      case 'trending': {
        const sorted = [...destinations].sort((a, b) => b.popularityScore - a.popularityScore);
        const threshold = sorted[Math.floor(sorted.length * 0.3)]?.popularityScore ?? 80;
        return sorted.filter(d => d.popularityScore >= threshold);
      }
      case 'budget':
        return [...destinations]
          .filter(d => d.avgDailyCost <= 100)
          .sort((a, b) => a.avgDailyCost - b.avgDailyCost);
      case 'seasonal':
        return destinations
          .filter(d => d.bestMonths.includes(currentMonth))
          .sort((a, b) => b.popularityScore - a.popularityScore);
      case 'recommended': {
        const userTypes = ['city', 'culture', 'food'] as const;
        return [...destinations]
          .filter(d => d.tripTypes.some(t => (userTypes as readonly string[]).includes(t)))
          .sort((a, b) => {
            const aM = a.tripTypes.filter(t => (userTypes as readonly string[]).includes(t)).length;
            const bM = b.tripTypes.filter(t => (userTypes as readonly string[]).includes(t)).length;
            return bM - aM;
          });
      }
      case 'weekend': {
        const nearbyRegions = ['north-america', 'caribbean'];
        return destinations
          .filter(d => nearbyRegions.includes(d.region))
          .sort((a, b) => a.avgDailyCost - b.avgDailyCost);
      }
      default:
        return destinations;
    }
  }, [category, currentMonth]);

  const title = getCategoryTitle(category, currentMonthName);
  const subtitle = getCategorySubtitle(category);

  const handleDestinationPress = useCallback((destination: DiscoverDestination) => {
    router.push({
      pathname: '/destination/[id]' as any,
      params: { id: destination.id },
    });
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
        <View style={styles.navBar}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => { hapticLight(); router.back(); }}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.navTitleContainer}>
            <Text style={[styles.navTitle, { color: colors.text }]}>{title}</Text>
          </View>
          <View style={styles.backButton} />
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection}>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          <View style={[styles.countBadge, { backgroundColor: colors.inputBackground }]}>
            <MapPin size={13} color={colors.accent} />
            <Text style={[styles.countText, { color: colors.text }]}>{filteredDestinations.length} destinations</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {filteredDestinations.map((dest) => (
            <DestinationGridCard
              key={dest.id}
              destination={dest}
              onPress={() => handleDestinationPress(dest)}
              colors={colors}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  countText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  gridCardWrapper: {
    width: '47.5%',
    marginBottom: 4,
  },
  gridCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  gridImageContainer: {
    width: '100%',
    height: 150,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
  },
  gridBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  gridBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
  },
  gridImageInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  gridCity: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  gridCountry: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  gridContent: {
    padding: 10,
  },
  gridMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  gridPrice: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  gridTagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  gridTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gridTagText: {
    fontSize: 11,
    fontWeight: '500' as const,
    textTransform: 'capitalize' as const,
  },
});
