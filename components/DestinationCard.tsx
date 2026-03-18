import React, { useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ImageErrorEventData, NativeSyntheticEvent } from 'react-native';
import { Star, MapPin, Sun, Mountain, Snowflake, Store, Trees, Landmark, Palmtree } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Destination, DestinationIcon } from '@/types/trip';
import { getDestinationImage, DEFAULT_FALLBACK_IMAGE } from '@/utils/destinationImages';
import { ThemeColors } from '@/constants/themes';

interface DestinationCardProps {
  destination: Destination;
  onPress: () => void;
  variant?: 'large' | 'medium' | 'small';
}

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

export default function DestinationCard({ destination, onPress, variant = 'medium' }: DestinationCardProps) {
  const colors = useThemeColors();
  const IconComponent = getIconComponent(destination.icon);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const [imgSrc, setImgSrc] = useState<string>(getDestinationImage(destination.name));

  const onImageError = useCallback((_e: NativeSyntheticEvent<ImageErrorEventData>) => {
    console.log('[DestinationCard] Image failed for:', destination.name, '- swapping to fallback');
    setImgSrc(DEFAULT_FALLBACK_IMAGE);
  }, [destination.name]);

  const onPressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const onPressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const onImageLoad = useCallback(() => {
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [imageOpacity]);

  const s = createStyles(colors);

  if (variant === 'large') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={[staticStyles.largeCard, { backgroundColor: colors.cardBg }]}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Animated.Image
            source={{ uri: imgSrc }}
            style={[staticStyles.largeImage, { opacity: imageOpacity }]}
            onLoad={onImageLoad}
            onError={onImageError}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={staticStyles.largeContent}>
            <View style={staticStyles.ratingBadge}>
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text style={staticStyles.ratingText}>{destination.rating}</Text>
            </View>
            <View style={staticStyles.largeInfo}>
              <Text style={staticStyles.largeName}>{destination.name}</Text>
              <Text style={staticStyles.largeCountry}>{destination.country}</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  if (variant === 'small') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={staticStyles.smallCard}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <View style={[staticStyles.smallImageWrap, { backgroundColor: colors.cardBg }]}>
            <Animated.Image
              source={{ uri: imgSrc }}
              style={[staticStyles.smallImage, { opacity: imageOpacity }]}
              onLoad={onImageLoad}
              onError={onImageError}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.35)']}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
          <View style={staticStyles.smallContent}>
            <Text style={[staticStyles.smallName, { color: colors.text }]} numberOfLines={1}>{destination.name}</Text>
            <Text style={[staticStyles.smallCountry, { color: colors.textSecondary }]}>{destination.country}</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[staticStyles.cardOuter, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={[staticStyles.card, { backgroundColor: colors.surface }]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={[staticStyles.imageContainer, { backgroundColor: colors.cardBg }]}>
          <Animated.Image
            source={{ uri: imgSrc }}
            style={[staticStyles.cardImage, { opacity: imageOpacity }]}
            onLoad={onImageLoad}
            onError={onImageError}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.55)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={staticStyles.imageOverlay}>
            <View style={staticStyles.iconBubble}>
              <IconComponent size={18} color="#FFFFFF" />
            </View>
          </View>
        </View>
        <View style={staticStyles.content}>
          <View style={staticStyles.headerRow}>
            <View style={staticStyles.headerLeft}>
              <Text style={[staticStyles.name, { color: colors.text }]}>{destination.name}</Text>
              <View style={staticStyles.locationRow}>
                <MapPin size={12} color={colors.textSecondary} />
                <Text style={[staticStyles.country, { color: colors.textSecondary }]}>{destination.country}</Text>
              </View>
            </View>
            <View style={[s.rating]}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={[staticStyles.ratingValue, { color: colors.text }]}>{destination.rating}</Text>
            </View>
          </View>
          <Text style={[staticStyles.description, { color: colors.textSecondary }]} numberOfLines={2}>{destination.description}</Text>
          <View style={staticStyles.tags}>
            {destination.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[s.tag]}>
                <Text style={[staticStyles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={staticStyles.meta}>
            <Text style={[staticStyles.metaText, { color: colors.textMuted }]}>{destination.averageBudget}</Text>
            <Text style={[staticStyles.metaDot, { color: colors.textMuted }]}>•</Text>
            <Text style={[staticStyles.metaText, { color: colors.textMuted }]}>{destination.bestTime}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.cardBg,
  },
});

const staticStyles = StyleSheet.create({
  cardOuter: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 160,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  country: {
    fontSize: 13,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
  },
  metaDot: {
    fontSize: 12,
    marginHorizontal: 8,
  },
  largeCard: {
    width: 280,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
  },
  largeImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  largeContent: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#111',
  },
  largeInfo: {},
  largeName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  largeCountry: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  smallCard: {
    width: 120,
    marginRight: 12,
  },
  smallImageWrap: {
    width: '100%',
    height: 90,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  smallImage: {
    width: '100%',
    height: '100%',
  },
  smallContent: {},
  smallName: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  smallCountry: {
    fontSize: 12,
  },
});
