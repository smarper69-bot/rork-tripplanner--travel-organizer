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
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTripsStore } from '@/store/useTripsStore';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { Trip } from '@/types/trip';
import { ThemeColors } from '@/constants/themes';

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

  const s = createStyles(colors);

  const renderTripPicker = () => (
    <View style={[staticStyles.tripPickerOverlay, { backgroundColor: colors.overlay }]}>
      <View style={[staticStyles.tripPickerContainer, { backgroundColor: colors.surface }]}>
        <Text style={[staticStyles.tripPickerTitle, { color: colors.text }]}>Select a Trip</Text>
        <ScrollView style={staticStyles.tripPickerList} showsVerticalScrollIndicator={false}>
          {trips.length === 0 && (
            <Text style={[staticStyles.noTripsText, { color: colors.textMuted }]}>No trips yet. Create a trip first.</Text>
          )}
          {trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={[
                s.tripPickerItem,
                selectedTripId === trip.id && s.tripPickerItemSelected,
              ]}
              onPress={() => {
                setSelectedTripId(trip.id);
                setShowTripPicker(false);
              }}
              activeOpacity={0.7}
            >
              <View style={staticStyles.tripPickerItemContent}>
                <Text style={[staticStyles.tripPickerItemName, { color: colors.text }]}>{trip.name}</Text>
                <Text style={[staticStyles.tripPickerItemMeta, { color: colors.textSecondary }]}>
                  {trip.destination}, {trip.country}
                </Text>
              </View>
              {selectedTripId === trip.id && <Check size={18} color={colors.accent} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={staticStyles.tripPickerClose}
          onPress={() => setShowTripPicker(false)}
        >
          <Text style={[staticStyles.tripPickerCloseText, { color: colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[staticStyles.containerBase, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[staticStyles.header, { borderBottomColor: colors.borderLight }]}>
        <View style={[staticStyles.headerIcon, { backgroundColor: colors.accent + '20' }]}>
          <Sparkles size={24} color={colors.accent} />
        </View>
        <View style={staticStyles.headerContent}>
          <Text style={[staticStyles.titleText, { color: colors.text }]}>AI Concierge</Text>
          <Text style={[staticStyles.subtitleText, { color: colors.textSecondary }]}>Generate itineraries with AI</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={staticStyles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={staticStyles.scrollBody}
          contentContainerStyle={staticStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={[s.configSection]}>
            <Text style={[staticStyles.configLabel, { color: colors.textSecondary }]}>Trip</Text>
            <TouchableOpacity
              style={[s.tripSelector]}
              onPress={() => setShowTripPicker(true)}
              activeOpacity={0.7}
            >
              {selectedTrip ? (
                <View style={staticStyles.tripSelectorContent}>
                  <MapPin size={16} color={colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={[staticStyles.tripSelectorName, { color: colors.text }]}>{selectedTrip.name}</Text>
                    <Text style={[staticStyles.tripSelectorMeta, { color: colors.textSecondary }]}>
                      {selectedTrip.destination}, {selectedTrip.country}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={[staticStyles.tripSelectorPlaceholder, { color: colors.textMuted }]}>Select a trip...</Text>
              )}
              <ChevronDown size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <Text style={[staticStyles.configLabel, { color: colors.textSecondary }]}>Interests (optional)</Text>
            <View style={staticStyles.interestsGrid}>
              {INTEREST_OPTIONS.map((opt) => {
                const isActive = selectedInterests.includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[s.interestChip, isActive && s.interestChipActive]}
                    onPress={() => toggleInterest(opt.id)}
                    activeOpacity={0.7}
                  >
                    <opt.icon size={16} color={isActive ? colors.chipActiveText : colors.textSecondary} />
                    <Text style={[s.interestChipText, isActive && s.interestChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[staticStyles.configLabel, { color: colors.textSecondary }]}>Additional notes (optional)</Text>
            <TextInput
              style={[s.notesInput]}
              placeholder="e.g. we love street food, skip museums..."
              placeholderTextColor={colors.textMuted}
              value={freeformInput}
              onChangeText={setFreeformInput}
              multiline
              maxLength={300}
            />

            <TouchableOpacity
              style={[
                s.generateButton,
                (!selectedTrip || isGenerating) && staticStyles.generateButtonDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!selectedTrip || isGenerating}
              activeOpacity={0.7}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={colors.textOnPrimary} />
              ) : (
                <Wand2 size={20} color={colors.textOnPrimary} />
              )}
              <Text style={[staticStyles.generateButtonText, { color: colors.textOnPrimary }]}>
                {isGenerating ? 'Generating...' : 'Generate Itinerary'}
              </Text>
            </TouchableOpacity>
          </View>

          {chatLog.length > 0 && (
            <View style={staticStyles.chatSection}>
              <Text style={[staticStyles.chatSectionTitle, { color: colors.textMuted }]}>Activity</Text>
              {chatLog.map((entry) => (
                <View
                  key={entry.id}
                  style={[
                    staticStyles.chatBubble,
                    entry.role === 'user' ? staticStyles.chatBubbleUser : staticStyles.chatBubbleAi,
                  ]}
                >
                  {entry.role === 'assistant' && (
                    <View style={[staticStyles.aiAvatarSmall, { backgroundColor: colors.accent + '20' }]}>
                      <Sparkles size={12} color={colors.accent} />
                    </View>
                  )}
                  <View style={[staticStyles.chatBubbleContent, { backgroundColor: colors.surface }]}>
                    <Text style={[staticStyles.chatBubbleText, { color: colors.text }]}>
                      {entry.text}
                    </Text>
                    {entry.generatedDays && entry.generatedDays.length > 0 && (
                      <View style={staticStyles.itineraryPreview}>
                        {entry.generatedDays.map((day, dayIdx) => (
                          <View key={day.date} style={[s.dayCard]}>
                            <View style={staticStyles.dayHeader}>
                              <Calendar size={14} color={colors.accent} />
                              <Text style={[staticStyles.dayHeaderText, { color: colors.text }]}>Day {dayIdx + 1}</Text>
                              <Text style={[staticStyles.dayDateText, { color: colors.textMuted }]}>{day.date}</Text>
                            </View>
                            {day.items.map((item, itemIdx) => (
                              <View key={`${day.date}-${itemIdx}`} style={staticStyles.activityRow}>
                                <Text style={[staticStyles.activityTime, { color: colors.textSecondary }]}>{item.time}</Text>
                                <View style={staticStyles.activityInfo}>
                                  <Text style={[staticStyles.activityTitle, { color: colors.text }]}>{item.title}</Text>
                                  {item.notes ? (
                                    <Text style={[staticStyles.activityNotes, { color: colors.textMuted }]} numberOfLines={2}>{item.notes}</Text>
                                  ) : null}
                                </View>
                              </View>
                            ))}
                          </View>
                        ))}
                        <TouchableOpacity
                          style={[
                            s.saveButton,
                            entry.saved && { backgroundColor: colors.successBg },
                          ]}
                          onPress={() => handleSaveItinerary(entry.id)}
                          disabled={entry.saved}
                          activeOpacity={0.7}
                        >
                          <Check size={18} color={entry.saved ? colors.success : colors.textOnPrimary} />
                          <Text style={[
                            staticStyles.saveButtonText,
                            { color: entry.saved ? colors.success : colors.textOnPrimary },
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
            <View style={staticStyles.emptyHint}>
              <Wand2 size={32} color={colors.textMuted} />
              <Text style={[staticStyles.emptyHintTitle, { color: colors.text }]}>AI Itinerary Generator</Text>
              <Text style={[staticStyles.emptyHintText, { color: colors.textSecondary }]}>
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

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  configSection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  tripSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  interestChipActive: {
    backgroundColor: colors.chipActiveBg,
    borderColor: colors.chipActiveBg,
  },
  interestChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  interestChipTextActive: {
    color: colors.chipActiveText,
  },
  notesInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top' as const,
    marginBottom: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
  },
  dayCard: {
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  tripPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: colors.inputBackground,
  },
  tripPickerItemSelected: {
    backgroundColor: colors.accent + '15',
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
});

const staticStyles = StyleSheet.create({
  containerBase: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  subtitleText: {
    fontSize: 13,
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
  configLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
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
  },
  tripSelectorMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  tripSelectorPlaceholder: {
    fontSize: 15,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  generateButtonDisabled: {
    opacity: 0.4,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  chatSection: {
    marginTop: 8,
  },
  chatSectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  chatBubbleContent: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
  },
  chatBubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  itineraryPreview: {
    marginTop: 12,
    gap: 10,
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
  },
  dayDateText: {
    fontSize: 12,
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
  },
  activityNotes: {
    fontSize: 12,
    lineHeight: 16,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  emptyHint: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyHintTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  emptyHintText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  tripPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  tripPickerContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '60%',
  },
  tripPickerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  tripPickerList: {
    maxHeight: 300,
  },
  tripPickerItemContent: {
    flex: 1,
  },
  tripPickerItemName: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  tripPickerItemMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  noTripsText: {
    fontSize: 14,
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
  },
});
