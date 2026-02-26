import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Star, MapPin, ExternalLink } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import Colors from '@/constants/colors';

interface HotelData {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  neighborhood: string;
  tags: string[];
}

const HOTEL_CACHE: Record<string, HotelData[]> = {};

function getHotelsForCity(city: string): HotelData[] {
  if (HOTEL_CACHE[city]) return HOTEL_CACHE[city];

  const neighborhoods = [
    'City Center', 'Old Town', 'Waterfront', 'Arts District',
    'Financial District', 'Historic Quarter', 'Riverside', 'Beach Area',
  ];
  const prefixes = [
    'Grand', 'The', 'Hotel', 'Boutique', 'Royal', 'Park', 'Vista', 'Azure',
  ];
  const suffixes = [
    'Palace', 'Suites', 'Residences', 'Inn', 'Lodge', 'House', 'Tower', 'Retreat',
  ];
  const tagOptions = [
    'Free WiFi', 'Pool', 'Spa', 'Breakfast included', 'Gym',
    'Pet Friendly', 'Rooftop Bar', 'Airport Shuttle',
  ];

  const images = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&q=80',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
  ];

  const seed = city.length;
  const hotels: HotelData[] = Array.from({ length: 8 }, (_, i) => {
    const idx = (seed + i) % 8;
    const rating = 4.0 + ((idx * 3 + i * 7) % 10) / 10;
    const price = 80 + ((idx * 37 + i * 23) % 220);
    const reviewCount = 120 + ((idx * 47 + i * 31) % 880);
    const t1 = (idx + i) % tagOptions.length;
    const t2 = (idx + i + 3) % tagOptions.length;

    return {
      id: `${city}-hotel-${i}`,
      name: `${prefixes[idx]} ${city} ${suffixes[(idx + i) % suffixes.length]}`,
      image: images[idx],
      rating: Math.min(parseFloat(rating.toFixed(1)), 5.0),
      reviews: reviewCount,
      pricePerNight: price,
      neighborhood: neighborhoods[(idx + i) % neighborhoods.length],
      tags: [tagOptions[t1], tagOptions[t2]],
    };
  });

  HOTEL_CACHE[city] = hotels;
  return hotels;
}

async function handleBookNow(city: string, hotelName: string) {
  const query = encodeURIComponent(`${hotelName} ${city}`);
  const url = `https://www.booking.com/searchresults.html?ss=${query}&aid=REPLACE_ME`;
  try {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(url);
    }
  } catch (e) {
    console.log('Failed to open browser', e);
  }
}

function HotelCard({ hotel, city }: { hotel: HotelData; city: string }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: hotel.image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{hotel.name}</Text>
        <View style={styles.cardLocation}>
          <MapPin size={13} color={Colors.textMuted} />
          <Text style={styles.cardNeighborhood}>{hotel.neighborhood}</Text>
        </View>
        <View style={styles.cardRatingRow}>
          <Star size={13} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.cardRating}>{hotel.rating}</Text>
          <Text style={styles.cardReviews}>({hotel.reviews} reviews)</Text>
        </View>
        <View style={styles.cardTags}>
          {hotel.tags.map((tag, i) => (
            <View key={i} style={styles.cardTag}>
              <Text style={styles.cardTagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.priceLabel}>per night</Text>
            <Text style={styles.priceValue}>${hotel.pricePerNight}</Text>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            activeOpacity={0.75}
            onPress={() => handleBookNow(city, hotel.name)}
          >
            <Text style={styles.bookButtonText}>Book now</Text>
            <ExternalLink size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function HotelsScreen() {
  const { city } = useLocalSearchParams<{ city: string }>();
  const router = useRouter();
  const cityName = city ?? 'City';
  const hotels = getHotelsForCity(cityName);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={22} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Hotels in {cityName}</Text>
              <Text style={styles.headerSubtitle}>{hotels.length} properties</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>

        <FlatList
          data={hotels}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <HotelCard hotel={item} city={cityName} />}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />

        <SafeAreaView edges={['bottom']} style={styles.disclaimerWrap}>
          <Text style={styles.disclaimer}>
            Opens partner site. We may earn a commission.
          </Text>
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
  headerSafe: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.border,
  },
  cardBody: {
    padding: 14,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  cardNeighborhood: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  cardRating: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  cardReviews: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  cardTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  cardTagText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  disclaimerWrap: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
    paddingVertical: 8,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
