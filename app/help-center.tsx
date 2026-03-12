import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, MessageCircle, HelpCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

const FAQ_ITEMS = [
  {
    question: 'How do I create a new trip?',
    answer: 'Tap the "Create Trip" button on the Home screen or go to My Trips and tap the + button. Fill in your destination, dates, and budget to get started.',
  },
  {
    question: 'Can I edit a trip after creating it?',
    answer: 'Yes! Open the trip detail screen and tap the edit icon in the top right corner. You can change the name, destination, dates, and budget.',
  },
  {
    question: 'How does the AI Concierge work?',
    answer: 'The AI Concierge generates a personalized day-by-day itinerary based on your destination, travel dates, and interests. Select a trip, add your preferences, and tap "Generate Itinerary".',
  },
  {
    question: 'How do I delete a trip?',
    answer: 'On the Home screen or My Trips page, swipe left on a trip card or tap the delete icon. You\'ll be asked to confirm before the trip is permanently removed.',
  },
  {
    question: 'Is my data stored securely?',
    answer: 'All your trip data is stored locally on your device. We do not share your personal information with third parties.',
  },
  {
    question: 'Can I use the app offline?',
    answer: 'Basic trip viewing is available offline. Enable Offline Mode in your Profile settings to save trip data for offline access.',
  },
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Support is coming soon. In the meantime, please check the FAQ above for answers to common questions.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="back-button">
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help Center</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={18} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>

          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => toggleExpand(index)}
                activeOpacity={0.7}
                testID={`faq-item-${index}`}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  {expandedIndex === index ? (
                    <ChevronUp size={18} color={Colors.textMuted} />
                  ) : (
                    <ChevronDown size={18} color={Colors.textMuted} />
                  )}
                </View>
                {expandedIndex === index && (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Still need help?</Text>
          <Text style={styles.supportText}>Our support team is here to assist you.</Text>
          <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport} testID="contact-support">
            <MessageCircle size={18} color={Colors.textLight} />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  faqList: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  faqItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginTop: 10,
  },
  supportSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  supportText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  supportButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
});
