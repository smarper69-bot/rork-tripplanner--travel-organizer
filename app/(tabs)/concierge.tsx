import React, { useState, useRef, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  Modal, Animated, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Sparkles, MapPin, Calendar, ChevronDown, 
  Check, Wand2, Utensils, Landmark, Waves, Mountain,
  Moon, ShoppingBag, TreePalm, Bike, X, Trophy
} from 'lucide-react-native';
import { z } from 'zod';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTripsStore } from '@/store/useTripsStore';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { Trip } from '@/types/trip';
import { ThemeColors } from '@/constants/themes';
import { hapticLight, hapticMedium, hapticSelection } from '@/utils/haptics';

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
  interests?: string[];
  customNote?: string;
}

const INTEREST_OPTIONS = [
  { id: 'food', label: 'Food & Restaurants', icon: Utensils, color: '#EA580C' },
  { id: 'culture', label: 'Culture & History', icon: Landmark, color: '#7C3AED' },
  { id: 'nature', label: 'Nature & Scenery', icon: Mountain, color: '#059669' },
  { id: 'adventure', label: 'Adventure & Activities', icon: Bike, color: '#2563EB' },
  { id: 'nightlife', label: 'Nightlife', icon: Moon, color: '#DB2777' },
  { id: 'relaxation', label: 'Relaxation', icon: TreePalm, color: '#0891B2' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#D97706' },
  { id: 'beaches', label: 'Beaches & Water', icon: Waves, color: '#06B6D4' },
  { id: 'sports', label: 'Sports', icon: Trophy, color: '#EF4444' },
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
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);
  const [modalCustomInput, setModalCustomInput] = useState('');

  const modalAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const trips = useTripsStore((s) => s.trips);
  const addItineraryItem = useTripsStore((s) => s.addItineraryItem);

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) ?? null,
    [trips, selectedTripId],
  );

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

  const openInterestsModal = useCallback(() => {
    if (!selectedTrip) {
      Alert.alert('Select a trip', 'Please select a trip to generate an itinerary for.');
      return;
    }
    const dates = getDatesForTrip(selectedTrip);
    if (dates.length === 0) {
      Alert.alert('Invalid dates', 'The selected trip has no valid date range.');
      return;
    }
    hapticLight();
    setShowInterestsModal(true);
    Animated.parallel([
      Animated.spring(modalAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedTrip, modalAnim, overlayAnim, getDatesForTrip]);

  const closeInterestsModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowInterestsModal(false);
    });
  }, [modalAnim, overlayAnim]);

  const toggleInterest = useCallback((id: string) => {
    hapticSelection();
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
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

  const handleGenerateFromModal = useCallback(async () => {
    if (!selectedTrip) return;

    hapticMedium();
    closeInterestsModal();

    await new Promise((resolve) => setTimeout(resolve, 300));

    const tripDates = getDatesForTrip(selectedTrip);
    if (tripDates.length === 0) return;

    setIsGenerating(true);

    const interestLabels = selectedInterests.map(
      (id) => INTEREST_OPTIONS.find((o) => o.id === id)?.label ?? id
    );
    const customText = modalCustomInput.trim();

    const userEntry: ChatEntry = {
      id: Date.now().toString(),
      role: 'user',
      text: `Generate itinerary for "${selectedTrip.name}" in ${selectedTrip.destination}, ${selectedTrip.country}${interestLabels.length > 0 ? `\nInterests: ${interestLabels.join(', ')}` : ''}${customText ? `\nNotes: ${customText}` : ''}`,
      interests: [...selectedInterests],
      customNote: customText || undefined,
    };
    setChatLog((prev) => [...prev, userEntry]);

    try {
      const interestsBlock = interestLabels.length > 0
        ? `The traveler is especially interested in: ${interestLabels.join(', ')}. Prioritize activities related to these interests. Avoid suggesting activities that don't align with their preferences unless they complement the experience.`
        : '';
      const customBlock = customText
        ? `Additional specific preferences: "${customText}". Make sure to incorporate these into the plan.`
        : '';

      const interestExamples = selectedInterests.map((id) => {
        switch (id) {
          case 'food': return 'Include local restaurants, street food markets, food tours, and culinary experiences.';
          case 'culture': return 'Include museums, historical sites, temples, local traditions, and cultural tours.';
          case 'nature': return 'Include scenic viewpoints, parks, gardens, nature trails, and outdoor excursions.';
          case 'adventure': return 'Include adventure sports, hiking, zip-lining, kayaking, or other thrill activities.';
          case 'nightlife': return 'Include evening activities like bars, live music venues, night markets, and rooftop lounges.';
          case 'relaxation': return 'Include spa treatments, beach lounging, yoga sessions, and calm scenic spots.';
          case 'shopping': return 'Include local markets, shopping districts, artisan shops, and souvenir spots.';
          case 'beaches': return 'Include beach activities, snorkeling, coastal walks, and waterfront dining.';
          case 'sports': return 'Include sports activities like surfing, skiing, diving, cycling, or local sports experiences.';
          default: return '';
        }
      }).filter(Boolean).join('\n');

      const prompt = `You are a travel itinerary planner creating a personalized day-by-day itinerary for a trip to ${selectedTrip.destination}, ${selectedTrip.country}.

Trip dates: ${tripDates[0]} to ${tripDates[tripDates.length - 1]} (${tripDates.length} days).

${interestsBlock}

${interestExamples ? `Specific guidance based on interests:\n${interestExamples}` : ''}

${customBlock}

Generate activities for each day. Each day should have 3-5 activities with realistic times starting from morning. The itinerary should feel tailored and personal, not generic. Use the exact dates provided.

${interestLabels.length === 0 ? 'Since no specific interests were selected, create a well-rounded itinerary with a good mix of sightseeing, local food, cultural experiences, and leisure time.' : `Focus heavily on the selected interests (${interestLabels.join(', ')}). At least 60% of activities should directly relate to these interests.`}

Available dates: ${tripDates.join(', ')}`;

      console.log('[Concierge] Generating personalized itinerary for trip:', selectedTrip.id, 'interests:', selectedInterests);

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
        text: `Here's your personalized ${result.days.length}-day itinerary for "${selectedTrip.name}" with ${itemCount} activities${interestLabels.length > 0 ? `, tailored to your interests in ${interestLabels.join(', ').toLowerCase()}` : ''}. Review below and tap Save to add it to your trip.`,
        generatedCount: itemCount,
        tripName: selectedTrip.name,
        generatedDays: result.days,
        saved: false,
        interests: [...selectedInterests],
        customNote: customText || undefined,
      };
      setChatLog((prev) => [...prev, successEntry]);
      console.log('[Concierge] Generated', itemCount, 'personalized items for trip', selectedTrip.id);
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
      setModalCustomInput('');
    }
  }, [selectedTrip, selectedInterests, modalCustomInput, getDatesForTrip, closeInterestsModal]);

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

  const renderInterestsModal = () => {
    const translateY = modalAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [Dimensions.get('window').height, 0],
    });
    const scale = modalAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.95, 0.98, 1],
    });

    return (
      <Modal
        visible={showInterestsModal}
        transparent
        animationType="none"
        onRequestClose={closeInterestsModal}
        statusBarTranslucent
      >
        <View style={staticStyles.modalRoot}>
          <Animated.View
            style={[
              staticStyles.modalOverlay,
              { backgroundColor: colors.overlay, opacity: overlayAnim },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={closeInterestsModal}
            />
          </Animated.View>

          <Animated.View
            style={[
              staticStyles.modalSheet,
              {
                backgroundColor: colors.surface,
                transform: [{ translateY }, { scale }],
              },
            ]}
          >
            <View style={staticStyles.modalHandle}>
              <View style={[staticStyles.modalHandleBar, { backgroundColor: colors.borderLight }]} />
            </View>

            <View style={staticStyles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[staticStyles.modalTitle, { color: colors.text }]}>
                  What are you interested in?
                </Text>
                <Text style={[staticStyles.modalSubtitle, { color: colors.textSecondary }]}>
                  We'll tailor your trip to match your style
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeInterestsModal}
                style={[staticStyles.modalCloseButton, { backgroundColor: colors.inputBackground }]}
                activeOpacity={0.7}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={staticStyles.modalBody}
              contentContainerStyle={staticStyles.modalBodyContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={staticStyles.chipsGrid}>
                {INTEREST_OPTIONS.map((opt) => {
                  const isActive = selectedInterests.includes(opt.id);
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        s.modalChip,
                        isActive && { backgroundColor: opt.color + '18', borderColor: opt.color + '50' },
                      ]}
                      onPress={() => toggleInterest(opt.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        staticStyles.chipIconWrap,
                        { backgroundColor: isActive ? opt.color + '20' : colors.inputBackground },
                      ]}>
                        <opt.icon size={16} color={isActive ? opt.color : colors.textMuted} />
                      </View>
                      <Text style={[
                        s.modalChipText,
                        isActive && { color: opt.color, fontWeight: '600' as const },
                      ]}>
                        {opt.label}
                      </Text>
                      {isActive && (
                        <View style={[staticStyles.chipCheck, { backgroundColor: opt.color }]}>
                          <Check size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={staticStyles.customInputSection}>
                <Text style={[staticStyles.customInputLabel, { color: colors.textSecondary }]}>
                  Anything specific?
                </Text>
                <TextInput
                  style={[s.modalTextInput]}
                  placeholder="e.g. surfing, museums, hiking trails..."
                  placeholderTextColor={colors.textMuted}
                  value={modalCustomInput}
                  onChangeText={setModalCustomInput}
                  multiline
                  maxLength={300}
                />
              </View>

              {selectedInterests.length === 0 && !modalCustomInput.trim() && (
                <View style={[staticStyles.hintRow, { backgroundColor: colors.warningBg }]}>
                  <Sparkles size={14} color={colors.warning} />
                  <Text style={[staticStyles.hintText, { color: colors.warning }]}>
                    Selecting interests improves your itinerary
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={[staticStyles.modalFooter, { borderTopColor: colors.borderLight }]}>
              <TouchableOpacity
                style={[s.modalGenerateButton]}
                onPress={handleGenerateFromModal}
                activeOpacity={0.7}
              >
                <Wand2 size={20} color={colors.textOnPrimary} />
                <Text style={[staticStyles.modalGenerateText, { color: colors.textOnPrimary }]}>
                  Generate my itinerary
                </Text>
              </TouchableOpacity>

              {selectedInterests.length > 0 && (
                <Text style={[staticStyles.selectedCount, { color: colors.textMuted }]}>
                  {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
                </Text>
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[staticStyles.containerBase, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[staticStyles.header, { borderBottomColor: colors.borderLight }]}>
        <View style={[staticStyles.headerIcon, { backgroundColor: colors.accent + '20' }]}>
          <Sparkles size={24} color={colors.accent} />
        </View>
        <View style={staticStyles.headerContent}>
          <Text style={[staticStyles.titleText, { color: colors.text }]}>AI Concierge</Text>
          <Text style={[staticStyles.subtitleText, { color: colors.textSecondary }]}>Personalised itineraries powered by AI</Text>
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

            {selectedInterests.length > 0 && (
              <View style={staticStyles.selectedInterestsPreview}>
                <Text style={[staticStyles.configLabel, { color: colors.textSecondary }]}>Your interests</Text>
                <View style={staticStyles.previewChipsRow}>
                  {selectedInterests.map((id) => {
                    const opt = INTEREST_OPTIONS.find((o) => o.id === id);
                    if (!opt) return null;
                    return (
                      <View key={id} style={[staticStyles.previewChip, { backgroundColor: opt.color + '15' }]}>
                        <opt.icon size={12} color={opt.color} />
                        <Text style={[staticStyles.previewChipText, { color: opt.color }]}>{opt.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                s.generateButton,
                (!selectedTrip || isGenerating) && staticStyles.generateButtonDisabled,
              ]}
              onPress={isGenerating ? undefined : openInterestsModal}
              disabled={isGenerating}
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
                Select a trip, tell us your interests, and let AI create a personalised day-by-day itinerary just for you.
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {showTripPicker && renderTripPicker()}
      {renderInterestsModal()}
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
  modalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  modalChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    flex: 1,
  },
  modalTextInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    minHeight: 56,
    textAlignVertical: 'top' as const,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  modalGenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
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
  generateButtonDisabled: {
    opacity: 0.4,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  selectedInterestsPreview: {
    marginBottom: 20,
  },
  previewChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  previewChipText: {
    fontSize: 12,
    fontWeight: '500' as const,
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
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHandle: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 18,
  },
  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    flexGrow: 0,
    flexShrink: 1,
  },
  modalBodyContent: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  chipsGrid: {
    gap: 8,
  },
  chipIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customInputSection: {
    marginTop: 20,
  },
  customInputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  hintText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 1,
    gap: 8,
  },
  modalGenerateText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  selectedCount: {
    fontSize: 13,
    textAlign: 'center',
  },
});
