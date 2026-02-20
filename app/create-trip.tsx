import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { MapPin, Calendar, Users, DollarSign, Camera, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTripsStore } from '@/store/useTripsStore';

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
  const params = useLocalSearchParams<{
    prefillName?: string;
    prefillDestination?: string;
    prefillImage?: string;
  }>();

  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // These setters will be used with date picker implementation
  const _setStartDate = setStartDate;
  const _setEndDate = setEndDate;
  void _setStartDate;
  void _setEndDate;
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
  const isValid = tripName.trim() && destination.trim();

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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Trip</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.coverSection}>
            <Text style={styles.label}>Cover Photo</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.coverScroll}
            >
              {customCoverImage && (
                <TouchableOpacity
                  style={[styles.coverOption, selectedCover === -1 && styles.coverOptionSelected]}
                  onPress={() => setSelectedCover(-1)}
                >
                  <Image source={{ uri: customCoverImage }} style={styles.coverImage} />
                  {selectedCover === -1 && (
                    <View style={styles.coverSelectedOverlay}>
                      <View style={styles.coverCheck}>
                        <Camera size={16} color={Colors.textLight} />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              {coverImages.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.coverOption, selectedCover === index && styles.coverOptionSelected]}
                  onPress={() => setSelectedCover(index)}
                >
                  <Image source={{ uri: img }} style={styles.coverImage} />
                  {selectedCover === index && (
                    <View style={styles.coverSelectedOverlay}>
                      <View style={styles.coverCheck}>
                        <Camera size={16} color={Colors.textLight} />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Trip Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g., Summer in Paris"
                placeholderTextColor={Colors.textMuted}
                value={tripName}
                onChangeText={setTripName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destination *</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={Colors.textMuted} />
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="Where are you going?"
                placeholderTextColor={Colors.textMuted}
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity style={styles.inputContainer}>
                <Calendar size={20} color={Colors.textMuted} />
                <Text style={[styles.inputText, !startDate && styles.placeholder]}>
                  {startDate || 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity style={styles.inputContainer}>
                <Calendar size={20} color={Colors.textMuted} />
                <Text style={[styles.inputText, !endDate && styles.placeholder]}>
                  {endDate || 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Budget</Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color={Colors.textMuted} />
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="Estimated budget"
                placeholderTextColor={Colors.textMuted}
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Invite Travelers</Text>
            <TouchableOpacity style={styles.inputContainer}>
              <Users size={20} color={Colors.textMuted} />
              <Text style={[styles.inputText, styles.placeholder]}>
                Add collaborators
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.createButton, !isValid && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={!isValid}
          >
            <Text style={styles.createButtonText}>Create Trip</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
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
    fontWeight: '600',
    color: Colors.text,
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
  coverOptionSelected: {
    borderWidth: 3,
    borderColor: Colors.primary,
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
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  inputWithIcon: {
    marginLeft: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginLeft: 10,
  },
  placeholder: {
    color: Colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
});
