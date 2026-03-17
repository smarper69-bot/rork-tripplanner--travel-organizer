import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Star, MapPin, Sun, Mountain, Snowflake, Store, Trees, Landmark, Palmtree } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { Destination, DestinationIcon } from '@/types/trip';
import { getDestinationImage } from '@/utils/destinationImages';

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
  const IconComponent = getIconComponent(destination.icon);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageUrl = getDestinationImage(destination.name);

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

  if (variant === 'large') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={styles.largeCard}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Animated.Image
            source={{ uri: imageUrl }}
            style={[styles.largeImage, { opacity: imageOpacity }]}
            onLoad={onImageLoad}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.largeContent}>
            <View style={styles.ratingBadge}>
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{destination.rating}</Text>
            </View>
            <View style={styles.largeInfo}>
              <Text style={styles.largeName}>{destination.name}</Text>
              <Text style={styles.largeCountry}>{destination.country}</Text>
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
          style={styles.smallCard}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <View style={styles.smallImageWrap}>
            <Animated.Image
              source={{ uri: imageUrl }}
              style={[styles.smallImage, { opacity: imageOpacity }]}
              onLoad={onImageLoad}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.35)']}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
          <View style={styles.smallContent}>
            <Text style={styles.smallName} numberOfLines={1}>{destination.name}</Text>
            <Text style={styles.smallCountry}>{destination.country}</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.cardOuter, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={styles.imageContainer}>
          <Animated.Image
            source={{ uri: imageUrl }}
            style={[styles.cardImage, { opacity: imageOpacity }]}
            onLoad={onImageLoad}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.55)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.imageOverlay}>
            <View style={styles.iconBubble}>
              <IconComponent size={18} color="#FFFFFF" />
            </View>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{destination.name}</Text>
              <View style={styles.locationRow}>
                <MapPin size={12} color={Colors.textSecondary} />
                <Text style={styles.country}>{destination.country}</Text>
              </View>
            </View>
            <View style={styles.rating}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingValue}>{destination.rating}</Text>
            </View>
          </View>
          <Text style={styles.description} numberOfLines={2}>{destination.description}</Text>
          <View style={styles.tags}>
            {destination.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaText}>{destination.averageBudget}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{destination.bestTime}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.cardBg,
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
  header: {
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
    color: Colors.text,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  country: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.cardBg,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  metaDot: {
    fontSize: 12,
    color: Colors.textMuted,
    marginHorizontal: 8,
  },
  largeCard: {
    width: 280,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: Colors.cardBg,
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
    color: Colors.text,
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
    backgroundColor: Colors.cardBg,
  },
  smallImage: {
    width: '100%',
    height: '100%',
  },
  smallContent: {},
  smallName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  smallCountry: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
