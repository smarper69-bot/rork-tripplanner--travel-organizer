import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { MapPin, Calendar, DollarSign, Users, X, Check } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ThemeColors } from '@/constants/themes';
import { useTripsStore } from '@/store/useTripsStore';
import CalendarPicker from '@/components/CalendarPicker';

export default function EditTripScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  const trips = useTripsStore((s) => s.trips);
  const updateTrip = useTripsStore((s) => s.updateTrip);

  const trip = trips.find((t) => t.id === id);

  const [tripName, setTripName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [travelers, setTravelers] = useState('');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  useEffect(() => {
    if (trip) {
      setTripName(trip.name);
      setCity(trip.destination);
      setCountry(trip.country);
      setStartDate(trip.startDate ? trip.startDate.split('T')[0] : '');
      setEndDate(trip.endDate ? trip.endDate.split('T')[0] : '');
      setBudget(trip.totalBudget > 0 ? trip.totalBudget.toString() : '');
      setTravelers(trip.collaborators.length.toString());
      console.log('[EditTrip] Loaded trip data for:', trip.id, trip.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.id]);

  const styles = createStyles(colors);

  if (!trip) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>Trip not found</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const isValid = tripName.trim().length > 0 && city.trim().length > 0;

  const formatDateDisplay = (date: string) => {
    if (!date) return '';
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const computeStatus = (start: string, end: string) => {
    if (!start || !end) return 'planning' as const;
    const now = new Date();
    const s = new Date(start);
    const e = new Date(end);
    if (now > e) return 'completed' as const;
    if (now >= s && now <= e) return 'ongoing' as const;
    return 'upcoming' as const;
  };

  const handleSave = () => {
    if (!isValid) {
      Alert.alert('Missing Info', 'Please enter a trip name and destination city.');
      return;
    }

    const newStatus = computeStatus(startDate, endDate);
    const parsedBudget = parseFloat(budget) || 0;

    updateTrip(trip.id, {
      name: tripName.trim(),
      destination: city.trim(),
      country: country.trim(),
      startDate: startDate || trip.startDate,
      endDate: endDate || trip.endDate,
      totalBudget: parsedBudget,
      status: newStatus,
    });

    console.log('[EditTrip] Saved trip:', trip.id, tripName.trim());
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleCancel}>
            <X size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Trip</Text>
          <TouchableOpacity
            style={[styles.headerBtn, styles.saveHeaderBtn, !isValid && styles.saveHeaderBtnDisabled]}
            onPress={handleSave}
            disabled={!isValid}
          >
            <Check size={22} color={isValid ? '#fff' : colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Trip Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g., Summer in Paris"
                placeholderTextColor={colors.textMuted}
                value={tripName}
                onChangeText={setTripName}
                testID="edit-trip-name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={colors.textMuted} />
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="Destination city"
                placeholderTextColor={colors.textMuted}
                value={city}
                onChangeText={setCity}
                testID="edit-trip-city"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={colors.textMuted} />
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="Country"
                placeholderTextColor={colors.textMuted}
                value={country}
                onChangeText={setCountry}
                testID="edit-trip-country"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowStartCalendar(true)}
                testID="edit-trip-start-date"
              >
                <Calendar size={20} color={colors.textMuted} />
                <Text style={[styles.inputText, !startDate && styles.placeholder]}>
                  {startDate ? formatDateDisplay(startDate) : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowEndCalendar(true)}
                testID="edit-trip-end-date"
              >
                <Calendar size={20} color={colors.textMuted} />
                <Text style={[styles.inputText, !endDate && styles.placeholder]}>
                  {endDate ? formatDateDisplay(endDate) : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Budget</Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color={colors.textMuted} />
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="e.g., 5000"
                placeholderTextColor={colors.textMuted}
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                testID="edit-trip-budget"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Travelers</Text>
            <View style={styles.inputContainer}>
              <Users size={20} color={colors.textMuted} />
              <Text style={[styles.inputText, styles.readOnlyText]}>
                {travelers} {parseInt(travelers) === 1 ? 'traveler' : 'travelers'}
              </Text>
            </View>
            <Text style={styles.hintText}>Manage travelers from the trip detail screen</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!isValid}
            testID="edit-trip-save"
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
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
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  backBtnText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveHeaderBtn: {
    backgroundColor: colors.primary,
  },
  saveHeaderBtnDisabled: {
    backgroundColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  content: {
    padding: 20,
    paddingBottom: 140,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  inputWithIcon: {
    marginLeft: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    marginLeft: 10,
  },
  placeholder: {
    color: colors.textMuted,
  },
  readOnlyText: {
    color: colors.textSecondary,
  },
  hintText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    marginLeft: 2,
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
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 34,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  saveButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textLight,
  },
});
