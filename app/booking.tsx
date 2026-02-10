import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, Search, SlidersHorizontal, Hotel, Ticket, 
  Star, MapPin, Heart, Calendar, Users 
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { mockBookings } from '@/mocks/trips';
import { Booking } from '@/types/trip';

const tabs = [
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'activities', label: 'Activities', icon: Ticket },
];

export default function BookingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('hotels');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredBookings = mockBookings.filter(b => {
    const matchesTab = activeTab === 'hotels' ? b.type === 'hotel' : b.type === 'activity';
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         b.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const renderBookingCard = (booking: Booking) => (
    <TouchableOpacity key={booking.id} style={styles.bookingCard} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: booking.image }} style={styles.bookingImage} />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(booking.id)}
        >
          <Heart 
            size={20} 
            color={favorites.includes(booking.id) ? Colors.accent : Colors.textLight}
            fill={favorites.includes(booking.id) ? Colors.accent : 'transparent'}
          />
        </TouchableOpacity>
        {booking.type === 'activity' && booking.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{booking.duration}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.bookingContent}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingName} numberOfLines={1}>{booking.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={Colors.text} fill={Colors.text} />
            <Text style={styles.ratingText}>{booking.rating}</Text>
            <Text style={styles.reviewCount}>({booking.reviewCount.toLocaleString()})</Text>
          </View>
        </View>
        
        <View style={styles.locationRow}>
          <MapPin size={14} color={Colors.textMuted} />
          <Text style={styles.locationText}>{booking.location}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>{booking.description}</Text>
        
        {booking.amenities && (
          <View style={styles.amenitiesRow}>
            {booking.amenities.slice(0, 3).map((amenity, i) => (
              <View key={i} style={styles.amenityBadge}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {booking.amenities.length > 3 && (
              <Text style={styles.moreAmenities}>+{booking.amenities.length - 3}</Text>
            )}
          </View>
        )}
        
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>
              {booking.type === 'hotel' ? 'From' : 'Price'}
            </Text>
            <Text style={styles.price}>
              ${booking.price}
              {booking.type === 'hotel' && <Text style={styles.priceUnit}>/night</Text>}
            </Text>
          </View>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>
              {booking.type === 'hotel' ? 'View Rooms' : 'Book Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Book</Text>
            <Text style={styles.subtitle}>Find the perfect stay or experience</Text>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hotels, activities..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <SlidersHorizontal size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.dateSelector}>
          <TouchableOpacity style={styles.dateButton}>
            <Calendar size={18} color={Colors.primary} />
            <Text style={styles.dateText}>Mar 15 - Mar 25</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.guestButton}>
            <Users size={18} color={Colors.primary} />
            <Text style={styles.guestText}>2 guests</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <tab.icon 
                size={18} 
                color={activeTab === tab.id ? Colors.primary : Colors.textMuted} 
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.resultsCount}>
            {filteredBookings.length} {activeTab === 'hotels' ? 'hotels' : 'activities'} found
          </Text>
          
          {filteredBookings.map(renderBookingCard)}
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.text,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  guestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
  },
  guestText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: Colors.primary + '15',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    paddingHorizontal: 20,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  bookingImage: {
    width: '100%',
    height: 180,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
  },
  durationText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  bookingContent: {
    padding: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  amenitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  amenityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.background,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  moreAmenities: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  bookButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  bottomPadding: {
    height: 40,
  },
});
