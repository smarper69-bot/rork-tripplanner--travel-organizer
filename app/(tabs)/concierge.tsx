import React, { useState, useRef, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Sparkles, MapPin, Calendar, ChevronDown, 
  Check, Wand2, Utensils, Landmark, Waves, Mountain
} from 'lucide-react-native';
import { z } from 'zod';
import Colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTripsStore } from '@/store/useTripsStore';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { Trip } from '@/types/trip';

interface GeneratedDay {
  date: string;
  items: { title: string; time: string; notes: string }[];
}

interface ChatEntry {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  generatedCount?: number;
  tripName?: string;
  generatedDays?: GeneratedDay[];
  saved?: boolean;
}

const INTEREST_OPTIONS = [
  { id: 'food', label: 'Food & Dining', icon: Utensils },
  { id: 'culture', label: 'Culture & History', icon: Landmark },
  { id: 'beach', label: 'Beach & Relaxation', icon: Waves },
  { id: 'adventure', label: 'Adventure & Nature', icon: Mountain },
] as const;

const itinerarySchema = z.object({
  days: z.array(z.object({
    date: z.string().describe('Date in YYYY-MM-DD format'),
    items: z.array(z.object({
      title: z.string().describe('Activity title'),
      time: z.string().describe('Time in HH:MM format'),
      notes: z.string().describe('Brief description or notes about the activity'),
    })),
  })),
});

export default function ConciergeScreen() {
  const colors = useThemeColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTripPicker, setShowTripPicker] = useState(false);
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);
  const [freeformInput, setFreeformInput] = useState('');

  const trips = useTripsStore((s) => s.trips);
  const addItineraryItem = useTripsStore((s) => s.addItineraryItem);

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) ?? null,
    [trips, selectedTripId],
  );

  const toggleInterest = useCallback((id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const getDatesForTrip = useCallback((trip: Trip): string[] => {
    const dates: string[] = [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const current = new Date(start);
    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, []);

  const handleSaveItinerary = useCallback((entryId: string) => {
    const entry = chatLog.find((e) => e.id === entryId);
    if (!entry?.generatedDays || !selectedTrip || entry.saved) return;

    let itemCount = 0;
    for (const day of entry.generatedDays) {
      for (const item of day.items) {
        addItineraryItem(selectedTrip.id, {
          title: item.title,
          date: day.date,
          time: item.time,
          notes: item.notes,
        });
        itemCount++;
      }
    }

    setChatLog((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, saved: true } : e
      )
    );

    Alert.alert('Saved', `${itemCount} activities added to "${selectedTrip.name}". Open the trip to view them.`);
    console.log('[Concierge] Saved', itemCount, 'items to trip', selectedTrip.id);
  }, [chatLog, selectedTrip, addItineraryItem]);

  const handleGenerate = useCallback(async () => {
    if (!selectedTrip) {
      Alert.alert('Select a trip', 'Please select a trip to generate an itinerary for.');
      return;
    }

    const tripDates = getDatesForTrip(selectedTrip);
    if (tripDates.length === 0) {
      Alert.alert('Invalid dates', 'The selected trip has no valid date range.');
      return;
    }

    setIsGenerating(true);

    const userEntry: ChatEntry = {
      id: Date.now().toString(),
      role: 'user',
      text: `Generate itinerary for "${selectedTrip.name}" in ${selectedTrip.destination}, ${selectedTrip.country}${selectedInterests.length > 0 ? ` (interests: ${selectedInterests.join(', ')})` : ''}${freeformInput.trim() ? `\nNotes: ${freeformInput.trim()}` : ''}`,
    };
    setChatLog((prev) => [...prev, userEntry]);
    setFreeformInput('');

    try {
      const interestsText = selectedInterests.length > 0 
        ? `The traveler is especially interested in: ${selectedInterests.join(', ')}.` 
        : '';
      const freeformText = freeformInput.trim() 
        ? `Additional preferences: ${freeformInput.trim()}` 
        : '';

      const prompt = `You are a travel itinerary planner. Create a detailed day-by-day itinerary for a trip to ${selectedTrip.destination}, ${selectedTrip.country}.

Trip dates: ${tripDates[0]} to ${tripDates[tripDates.length - 1]} (${tripDates.length} days).
${interestsText}
${freeformText}

Generate activities for each day. Each day should have 3-5 activities with realistic times starting from morning. Include a mix of sightseeing, meals, and experiences. Use the exact dates provided.

Available dates: ${tripDates.join(', ')}`;

      console.log('[Concierge] Generating itinerary for trip:', selectedTrip.id);

      const result = await generateObject({
        messages: [{ role: 'user', content: prompt }],
        schema: itinerarySchema,
      });

      console.log('[Concierge] Generated result:', JSON.stringify(result).slice(0, 200));

      let itemCount = 0;
      for (const day of result.days) {
        itemCount += day.items.length;
      }

      const successEntry: ChatEntry = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `Here's your ${result.days.length}-day itinerary for "${selectedTrip.name}" with ${itemCount} activities. Review it below and tap Save to add it to your trip.`,
        generatedCount: itemCount,
        tripName: selectedTrip.name,
        generatedDays: result.days,
        saved: false,
      };
      setChatLog((prev) => [...prev, successEntry]);
      console.log('[Concierge] Generated', itemCount, 'items for trip', selectedTrip.id);
    } catch (e) {
      console.error('[Concierge] Generation failed:', e);
      const errorEntry: ChatEntry = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, I couldn\'t generate the itinerary right now. Please try again in a moment.',
      };
      setChatLog((prev) => [...prev, errorEntry]);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTrip, selectedInterests, freeformInput, getDatesForTrip]);

  const renderTripPicker = () => (
    <View style={styles.tripPickerOverlay}>
      <View style={styles.tripPickerContainer}>
        <Text style={styles.tripPickerTitle}>Select a Trip</Text>
        <ScrollView style={styles.tripPickerList} showsVerticalScrollIndicator={false}>
          {trips.length === 0 && (
            <Text style={styles.noTripsText}>No trips yet. Create a trip first.</Text>
          )}
          {trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={[
                styles.tripPickerItem,
                selectedTripId === trip.id && styles.tripPickerItemSelected,
              ]}
              onPress={() => {
                setSelectedTripId(trip.id);
                setShowTripPicker(false);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.tripPickerItemContent}>
                <Text style={styles.tripPickerItemName}>{trip.name}</Text>
                <Text style={styles.tripPickerItemMeta}>
                  {trip.destination}, {trip.country}
                </Text>
              </View>
              {selectedTripId === trip.id && <Check size={18} color={Colors.primary} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.tripPickerClose}
          onPress={() => setShowTripPicker(false)}
        >
          <Text style={styles.tripPickerCloseText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <View style={[styles.headerIcon, { backgroundColor: colors.primary + '15' }]}>
          <Sparkles size={24} color={colors.primary} />
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>AI Concierge</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Generate itineraries with AI</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={[styles.configSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.configLabel, { color: colors.textSecondary }]}>Trip</Text>
            <TouchableOpacity
              style={[styles.tripSelector, { backgroundColor: colors.background }]}
              onPress={() => setShowTripPicker(true)}
              activeOpacity={0.7}
            >
              {selectedTrip ? (
                <View style={styles.tripSelectorContent}>
                  <MapPin size={16} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tripSelectorName, { color: colors.text }]}>{selectedTrip.name}</Text>
                    <Text style={styles.tripSelectorMeta}>
                      {selectedTrip.destination}, {selectedTrip.country}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.tripSelectorPlaceholder}>Select a trip...</Text>
              )}
              <ChevronDown size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <Text style={[styles.configLabel, { color: colors.textSecondary }]}>Interests (optional)</Text>
            <View style={styles.interestsGrid}>
              {INTEREST_OPTIONS.map((opt) => {
                const isActive = selectedInterests.includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.interestChip, isActive && styles.interestChipActive]}
                    onPress={() => toggleInterest(opt.id)}
                    activeOpacity={0.7}
                  >
                    <opt.icon size={16} color={isActive ? Colors.textLight : Colors.textSecondary} />
                    <Text style={[styles.interestChipText, isActive && styles.interestChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.configLabel, { color: colors.textSecondary }]}>Additional notes (optional)</Text>
            <TextInput
              style={[styles.notesInput, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="e.g. we love street food, skip museums..."
              placeholderTextColor={colors.textMuted}
              value={freeformInput}
              onChangeText={setFreeformInput}
              multiline
              maxLength={300}
            />

            <TouchableOpacity
              style={[
                styles.generateButton, { backgroundColor: colors.primary },
                (!selectedTrip || isGenerating) && styles.generateButtonDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!selectedTrip || isGenerating}
              activeOpacity={0.7}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={Colors.textLight} />
              ) : (
                <Wand2 size={20} color={Colors.textLight} />
              )}
              <Text style={styles.generateButtonText}>
                {isGenerating ? 'Generating...' : 'Generate Itinerary'}
              </Text>
            </TouchableOpacity>
          </View>

          {chatLog.length > 0 && (
            <View style={styles.chatSection}>
              <Text style={styles.chatSectionTitle}>Activity</Text>
              {chatLog.map((entry) => (
                <View
                  key={entry.id}
                  style={[
                    styles.chatBubble,
                    entry.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAi,
                  ]}
                >
                  {entry.role === 'assistant' && (
                    <View style={styles.aiAvatarSmall}>
                      <Sparkles size={12} color={Colors.primary} />
                    </View>
                  )}
                  <View style={styles.chatBubbleContent}>
                    <Text
                      style={[
                        styles.chatBubbleText,
                        entry.role === 'user' && styles.chatBubbleTextUser,
                      ]}
                    >
                      {entry.text}
                    </Text>
                    {entry.generatedDays && entry.generatedDays.length > 0 && (
                      <View style={styles.itineraryPreview}>
                        {entry.generatedDays.map((day, dayIdx) => (
                          <View key={day.date} style={styles.dayCard}>
                            <View style={styles.dayHeader}>
                              <Calendar size={14} color={Colors.primary} />
                              <Text style={styles.dayHeaderText}>Day {dayIdx + 1}</Text>
                              <Text style={styles.dayDateText}>{day.date}</Text>
                            </View>
                            {day.items.map((item, itemIdx) => (
                              <View key={`${day.date}-${itemIdx}`} style={styles.activityRow}>
                                <Text style={styles.activityTime}>{item.time}</Text>
                                <View style={styles.activityInfo}>
                                  <Text style={styles.activityTitle}>{item.title}</Text>
                                  {item.notes ? (
                                    <Text style={styles.activityNotes} numberOfLines={2}>{item.notes}</Text>
                                  ) : null}
                                </View>
                              </View>
                            ))}
                          </View>
                        ))}
                        <TouchableOpacity
                          style={[
                            styles.saveButton,
                            entry.saved && styles.saveButtonDone,
                          ]}
                          onPress={() => handleSaveItinerary(entry.id)}
                          disabled={entry.saved}
                          activeOpacity={0.7}
                        >
                          <Check size={18} color={entry.saved ? '#10B981' : Colors.textLight} />
                          <Text style={[
                            styles.saveButtonText,
                            entry.saved && styles.saveButtonTextDone,
                          ]}>
                            {entry.saved ? 'Saved to trip' : 'Save to trip'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {chatLog.length === 0 && (
            <View style={styles.emptyHint}>
              <Wand2 size={32} color={Colors.textMuted} />
              <Text style={styles.emptyHintTitle}>AI Itinerary Generator</Text>
              <Text style={styles.emptyHintText}>
                Select a trip, choose your interests, and let AI create a detailed day-by-day itinerary for you.
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {showTripPicker && renderTripPicker()}
    </SafeAreaView>
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
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  configSection: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  configLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  tripSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  tripSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  tripSelectorName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  tripSelectorMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  tripSelectorPlaceholder: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  interestChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  interestChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  interestChipTextActive: {
    color: Colors.textLight,
  },
  notesInput: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 60,
    textAlignVertical: 'top' as const,
    marginBottom: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  generateButtonDisabled: {
    opacity: 0.4,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  chatSection: {
    marginTop: 8,
  },
  chatSectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  chatBubble: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  chatBubbleUser: {
    justifyContent: 'flex-end',
  },
  chatBubbleAi: {
    justifyContent: 'flex-start',
  },
  aiAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  chatBubbleContent: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.surface,
  },
  chatBubbleText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  chatBubbleTextUser: {
    color: Colors.text,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
  },
  successBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#065F46',
  },
  itineraryPreview: {
    marginTop: 12,
    gap: 10,
  },
  dayCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  dayDateText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 'auto' as const,
  },
  activityRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    width: 46,
    paddingTop: 2,
  },
  activityInfo: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  activityNotes: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  saveButtonDone: {
    backgroundColor: '#D1FAE5',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  saveButtonTextDone: {
    color: '#065F46',
  },
  emptyHint: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyHintTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  emptyHintText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  tripPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  tripPickerContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '60%',
  },
  tripPickerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  tripPickerList: {
    maxHeight: 300,
  },
  tripPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: Colors.background,
  },
  tripPickerItemSelected: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  tripPickerItemContent: {
    flex: 1,
  },
  tripPickerItemName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  tripPickerItemMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  noTripsText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  tripPickerClose: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  tripPickerCloseText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
});
