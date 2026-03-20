import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { MapPin, Calendar, Users, DollarSign, Camera, X } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTripsStore, getUserTripCount } from '@/store/useTripsStore';
import { useSubscriptionStore, FREE_TRIP_LIMIT } from '@/store/useSubscriptionStore';
import { hapticSuccess, hapticLight } from '@/utils/haptics';
import CalendarPicker from '@/components/CalendarPicker';
import { ThemeColors } from '@/constants/themes';

const coverImages = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
];

export default function CreateTripScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const params = useLocalSearchParams<{
    prefillName?: string;
    prefillDestination?: string;
    prefillImage?: string;
  }>();

  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [budget, setBudget] = useState('');
  const [selectedCover, setSelectedCover] = useState(0);
  const [customCoverImage, setCustomCoverImage] = useState<string | null>(null);

  useEffect(() => {
    if (params.prefillName) {
      setTripName(params.prefillName);
    }
    if (params.prefillDestination) {
      setDestination(params.prefillDestination);
    }
    if (params.prefillImage) {
      setCustomCoverImage(params.prefillImage);
    }
  }, [params.prefillName, params.prefillDestination, params.prefillImage]);

  const createTrip = useTripsStore((s) => s.createTrip);
  const trips = useTripsStore((s) => s.trips);
  const plan = useSubscriptionStore((s) => s.plan);
  const canCreateTrip = useSubscriptionStore((s) => s.canCreateTrip);
  const userTripCount = getUserTripCount(trips);
  const remaining = plan === 'premium' ? Infinity : Math.max(0, FREE_TRIP_LIMIT - userTripCount);
  const isAtLimit = !canCreateTrip(userTripCount);
  const isValid = tripName.trim() && destination.trim() && !isAtLimit;

  const parseDestination = (dest: string) => {
    const parts = dest.split(',').map((s) => s.trim());
    if (parts.length >= 2) {
      return { city: parts[0], country: parts.slice(1).join(', ') };
    }
    return { city: dest.trim(), country: '' };
  };

  const handleCreate = () => {
    if (!isValid) return;
    const coverImage = selectedCover === -1 && customCoverImage 
      ? customCoverImage 
      : coverImages[selectedCover];
    const { city, country } = parseDestination(destination);
    const tripId = createTrip({
      title: tripName.trim(),
      destinationCity: city,
      destinationCountry: country,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      coverImage: coverImage || undefined,
      totalBudget: budget ? parseFloat(budget) : undefined,
    });
    hapticSuccess();
    console.log('[CreateTrip] Created trip:', tripId);
    router.dismiss();
    setTimeout(() => {
      router.push(`/trip/${tripId}` as any);
    }, 100);
  };

  useEffect(() => {
    if (customCoverImage) {
      setSelectedCover(-1);
    }
  }, [customCoverImage]);

  const s = createStyles(colors);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={staticStyles.header}>
          <TouchableOpacity style={[s.closeButton]} onPress={() => router.back()}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[staticStyles.headerTitle, { color: colors.text }]}>New Trip</Text>
          <View style={staticStyles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={staticStyles.content}>
          <View style={staticStyles.coverSection}>
            <Text style={[staticStyles.label, { color: colors.text }]}>Cover Photo</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={staticStyles.coverScroll}
            >
              {customCoverImage && (
                <TouchableOpacity
                  style={[staticStyles.coverOption, selectedCover === -1 && { borderWidth: 3, borderColor: colors.accent }]}
                  onPress={() => setSelectedCover(-1)}
                >
                  <Image source={{ uri: customCoverImage }} style={staticStyles.coverImage} />
                  {selectedCover === -1 && (
                    <View style={staticStyles.coverSelectedOverlay}>
                      <View style={[staticStyles.coverCheck, { backgroundColor: colors.accent }]}>
                        <Camera size={16} color="#fff" />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              {coverImages.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[staticStyles.coverOption, selectedCover === index && { borderWidth: 3, borderColor: colors.accent }]}
                  onPress={() => setSelectedCover(index)}
                >
                  <Image source={{ uri: img }} style={staticStyles.coverImage} />
                  {selectedCover === index && (
                    <View style={staticStyles.coverSelectedOverlay}>
                      <View style={[staticStyles.coverCheck, { backgroundColor: colors.accent }]}>
                        <Camera size={16} color="#fff" />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={staticStyles.inputGroup}>
            <Text style={[staticStyles.label, { color: colors.text }]}>Trip Name *</Text>
            <View style={[s.inputContainer]}>
              <TextInput
                style={[staticStyles.input, { color: colors.text }]}
                placeholder="e.g., Summer in Paris"
                placeholderTextColor={colors.textMuted}
                value={tripName}
                onChangeText={setTripName}
              />
            </View>
          </View>

          <View style={staticStyles.inputGroup}>
            <Text style={[staticStyles.label, { color: colors.text }]}>Destination *</Text>
            <View style={[s.inputContainer]}>
              <MapPin size={20} color={colors.textMuted} />
              <TextInput
                style={[staticStyles.input, staticStyles.inputWithIcon, { color: colors.text }]}
                placeholder="Where are you going?"
                placeholderTextColor={colors.textMuted}
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </View>

          <View style={staticStyles.row}>
            <View style={[staticStyles.inputGroup, staticStyles.halfWidth]}>
              <Text style={[staticStyles.label, { color: colors.text }]}>Start Date</Text>
              <TouchableOpacity style={[s.inputContainer]} onPress={() => setShowStartCalendar(true)}>
                <Calendar size={20} color={colors.textMuted} />
                <Text style={[staticStyles.inputText, { color: startDate ? colors.text : colors.textMuted }]}>
                  {startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[staticStyles.inputGroup, staticStyles.halfWidth]}>
              <Text style={[staticStyles.label, { color: colors.text }]}>End Date</Text>
              <TouchableOpacity style={[s.inputContainer]} onPress={() => setShowEndCalendar(true)}>
                <Calendar size={20} color={colors.textMuted} />
                <Text style={[staticStyles.inputText, { color: endDate ? colors.text : colors.textMuted }]}>
                  {endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <CalendarPicker
            visible={showStartCalendar}
            onClose={() => setShowStartCalendar(false)}
            onSelect={(date) => {
              setStartDate(date);
              setShowStartCalendar(false);
              if (endDate && date > endDate) {
                setEndDate('');
              }
            }}
            selectedDate={startDate}
            title="Start Date"
          />
          <CalendarPicker
            visible={showEndCalendar}
            onClose={() => setShowEndCalendar(false)}
            onSelect={(date) => {
              setEndDate(date);
              setShowEndCalendar(false);
            }}
            selectedDate={endDate}
            minDate={startDate || undefined}
            initialMonth={startDate || undefined}
            title="End Date"
          />

          <View style={staticStyles.inputGroup}>
            <Text style={[staticStyles.label, { color: colors.text }]}>Budget</Text>
            <View style={[s.inputContainer]}>
              <DollarSign size={20} color={colors.textMuted} />
              <TextInput
                style={[staticStyles.input, staticStyles.inputWithIcon, { color: colors.text }]}
                placeholder="Estimated budget"
                placeholderTextColor={colors.textMuted}
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={staticStyles.inputGroup}>
            <Text style={[staticStyles.label, { color: colors.text }]}>Invite Travelers</Text>
            <TouchableOpacity style={[s.inputContainer]} onPress={() => Alert.alert('Share After Creating', 'Create your trip first, then invite travelers from the trip details page.')}>
              <Users size={20} color={colors.textMuted} />
              <Text style={[staticStyles.inputText, { color: colors.textMuted }]}>
                Add collaborators
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={[s.footer]}>
          {isAtLimit && (
            <View style={[s.limitBanner]}>
              <Text style={[staticStyles.limitBannerText, { color: colors.text }]}>You've used all {FREE_TRIP_LIMIT} free trips. Upgrade to Premium for unlimited trips.</Text>
              <TouchableOpacity
                style={[staticStyles.limitUpgradeBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  hapticLight();
                  router.back();
                  setTimeout(() => router.push('/profile' as any), 150);
                }}
                activeOpacity={0.8}
              >
                <Text style={staticStyles.limitUpgradeBtnText}>View Premium</Text>
              </TouchableOpacity>
            </View>
          )}
          {!isAtLimit && plan === 'free' && remaining <= 2 && remaining > 0 && (
            <Text style={[staticStyles.remainingText, { color: colors.textSecondary }]}>
              {remaining === 1 ? 'You have 1 free trip left' : `You have ${remaining} free trips left`} — upgrade anytime for unlimited trips
            </Text>
          )}
          <TouchableOpacity 
            style={[s.createButton, !isValid && s.createButtonDisabled]}
            onPress={handleCreate}
            disabled={!isValid}
          >
            <Text style={[staticStyles.createButtonText, { color: colors.textOnPrimary }]}>Create Trip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  createButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  limitBanner: {
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warning + '30',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
});

const staticStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  coverSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 10,
  },
  coverScroll: {
    gap: 12,
  },
  coverOption: {
    width: 100,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverSelectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  inputWithIcon: {
    marginLeft: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  limitBannerText: {
    fontSize: 13,
    textAlign: 'center' as const,
    lineHeight: 18,
    marginBottom: 10,
  },
  limitUpgradeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  limitUpgradeBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#fff',
  },
  remainingText: {
    fontSize: 12,
    textAlign: 'center' as const,
    marginBottom: 10,
  },
});
