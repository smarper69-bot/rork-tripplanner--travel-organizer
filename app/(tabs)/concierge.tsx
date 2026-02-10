import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Sparkles, MapPin, Hotel, Ticket, Plane, Lock, Crown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { ChatMessage } from '@/types/trip';
import { mockChatMessages } from '@/mocks/trips';

const quickActions = [
  { id: 'plan', label: 'Plan a trip', icon: MapPin, isPro: false },
  { id: 'hotels', label: 'Find hotels', icon: Hotel, isPro: false },
  { id: 'activities', label: 'Activities', icon: Ticket, isPro: false },
  { id: 'flights', label: 'Book flights', icon: Plane, isPro: false },
];

const proFeatures = [
  { id: 'generate', label: 'Generate full itinerary', description: 'AI creates your perfect trip' },
  { id: 'optimize', label: 'Optimize by budget', description: 'Smart budget allocation' },
  { id: 'packing', label: 'Auto-fill packing list', description: 'Based on destination & duration' },
  { id: 'suggestions', label: 'Smart suggestions', description: 'Hotels & activities in trips' },
];

export default function ConciergeScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPro] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();
    
    if (input.includes('generate') || input.includes('create itinerary') || input.includes('full itinerary')) {
      if (!isPro) {
        return {
          id: Date.now().toString(),
          content: "I'd love to generate a complete itinerary for you! This feature is available with Tripla Pro. Upgrade to unlock AI-powered itinerary generation, budget optimization, and more.",
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          suggestions: ['Learn about Pro', 'Plan manually instead'],
        };
      }
    }
    
    if (input.includes('tokyo') || input.includes('japan')) {
      return {
        id: Date.now().toString(),
        content: "Tokyo is an amazing choice! Here's what I recommend for your trip:",
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        tripSuggestion: {
          destination: 'Tokyo',
          country: 'Japan',
          duration: '7-10 days',
          highlights: ['Senso-ji Temple', 'TeamLab Borderless', 'Shibuya Crossing', 'Mt. Fuji Day Trip'],
        },
        suggestions: ['Add to my trip', 'Find hotels in Tokyo', 'Popular activities'],
      };
    }
    
    if (input.includes('hotel') || input.includes('stay') || input.includes('accommodation')) {
      return {
        id: Date.now().toString(),
        content: "I found some great accommodation options for you! Here are my top picks:",
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        bookingSuggestion: [
          { type: 'hotel', name: 'Park Hyatt Tokyo', price: '$450/night', rating: 4.9 },
          { type: 'hotel', name: 'Aman Tokyo', price: '$780/night', rating: 4.8 },
          { type: 'hotel', name: 'The Peninsula Tokyo', price: '$520/night', rating: 4.8 },
        ],
        suggestions: ['Compare prices', 'See on map', 'Filter by amenities'],
      };
    }

    if (input.includes('budget') || input.includes('cost') || input.includes('expensive')) {
      return {
        id: Date.now().toString(),
        content: "I can help you plan within your budget! For a comfortable trip, here's a breakdown:\n\n• Flights: $800-1,200 (round trip)\n• Hotels: $150-300/night (mid-range)\n• Food: $50-80/day\n• Activities: $30-50/day\n\nWant me to find options that fit your specific budget?",
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        suggestions: ['Set my budget', 'Find deals', 'Budget-friendly tips'],
      };
    }

    return {
      id: Date.now().toString(),
      content: "I'd be happy to help with that! I can assist with:\n\n• Finding destinations that match your interests\n• Suggesting hotels and activities\n• Answering travel questions\n• Helping add items to your itinerary",
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      suggestions: ['Suggest destinations', 'Help me plan', 'Find deals'],
    };
  };

  const handleQuickAction = (action: string) => {
    const prompts: Record<string, string> = {
      plan: "I want to plan a new trip",
      hotels: "Help me find hotels",
      activities: "What activities do you recommend?",
      flights: "I need to book flights",
    };
    setInputText(prompts[action] || '');
  };

  const handleSuggestion = (suggestion: string) => {
    setInputText(suggestion);
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user';
    
    return (
      <View key={message.id} style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <View style={styles.aiAvatar}>
              <Sparkles size={16} color={Colors.primary} />
            </View>
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {message.content}
          </Text>
          
          {message.tripSuggestion && (
            <View style={styles.suggestionCard}>
              <View style={styles.suggestionHeader}>
                <MapPin size={16} color={Colors.primary} />
                <Text style={styles.suggestionTitle}>
                  {message.tripSuggestion.destination}, {message.tripSuggestion.country}
                </Text>
              </View>
              <Text style={styles.suggestionDuration}>
                Recommended: {message.tripSuggestion.duration}
              </Text>
              <View style={styles.highlightsList}>
                {message.tripSuggestion.highlights.map((h, i) => (
                  <View key={i} style={styles.highlightItem}>
                    <View style={styles.highlightDot} />
                    <Text style={styles.highlightText}>{h}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.createTripButton}>
                <Text style={styles.createTripText}>Create this trip</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {message.bookingSuggestion && (
            <View style={styles.bookingsContainer}>
              {message.bookingSuggestion.map((booking, i) => (
                <TouchableOpacity key={i} style={styles.bookingCard}>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingName}>{booking.name}</Text>
                    <View style={styles.bookingMeta}>
                      <Text style={styles.bookingPrice}>{booking.price}</Text>
                      <Text style={styles.bookingRating}>★ {booking.rating}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {message.suggestions && message.suggestions.length > 0 && (
            <View style={styles.suggestionsRow}>
              {message.suggestions.map((s, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.suggestionPill}
                  onPress={() => handleSuggestion(s)}
                >
                  <Text style={styles.suggestionPillText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Sparkles size={24} color={Colors.primary} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>AI Concierge</Text>
          <Text style={styles.subtitle}>Your personal travel assistant</Text>
        </View>
        {!isPro && (
          <TouchableOpacity style={styles.proButton}>
            <Crown size={14} color={Colors.textLight} />
            <Text style={styles.proButtonText}>Pro</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 1 && (
            <>
              <View style={styles.quickActionsContainer}>
                <Text style={styles.quickActionsLabel}>Quick actions</Text>
                <View style={styles.quickActionsGrid}>
                  {quickActions.map((action) => (
                    <TouchableOpacity 
                      key={action.id} 
                      style={styles.quickActionCard}
                      onPress={() => handleQuickAction(action.id)}
                    >
                      <action.icon size={24} color={Colors.primary} />
                      <Text style={styles.quickActionText}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {!isPro && (
                <View style={styles.proFeaturesContainer}>
                  <View style={styles.proFeaturesHeader}>
                    <Crown size={18} color={Colors.primary} />
                    <Text style={styles.proFeaturesTitle}>Pro Features</Text>
                  </View>
                  <View style={styles.proFeaturesList}>
                    {proFeatures.map((feature) => (
                      <View key={feature.id} style={styles.proFeatureCard}>
                        <Lock size={16} color={Colors.textMuted} />
                        <View style={styles.proFeatureInfo}>
                          <Text style={styles.proFeatureLabel}>{feature.label}</Text>
                          <Text style={styles.proFeatureDesc}>{feature.description}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.unlockButton}>
                    <Text style={styles.unlockButtonText}>Upgrade to Pro</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
          
          {messages.map(renderMessage)}
          
          {isTyping && (
            <View style={styles.messageContainer}>
              <View style={styles.avatarContainer}>
                <View style={styles.aiAvatar}>
                  <Sparkles size={16} color={Colors.primary} />
                </View>
              </View>
              <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask me anything about travel..."
              placeholderTextColor={Colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send size={20} color={inputText.trim() ? Colors.textLight : Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  proButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 20,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  proFeaturesContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  proFeaturesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  proFeaturesTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  proFeaturesList: {
    gap: 10,
    marginBottom: 14,
  },
  proFeatureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    backgroundColor: Colors.background,
    borderRadius: 10,
  },
  proFeatureInfo: {
    flex: 1,
  },
  proFeatureLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  proFeatureDesc: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  unlockButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  unlockButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    marginRight: 10,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
  },
  aiBubble: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
    marginLeft: 'auto',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  userMessageText: {
    color: Colors.textLight,
  },
  suggestionCard: {
    marginTop: 12,
    padding: 14,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  suggestionDuration: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  highlightsList: {
    gap: 6,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  highlightText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  createTripButton: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  createTripText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  bookingsContainer: {
    marginTop: 12,
    gap: 8,
  },
  bookingCard: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 10,
  },
  bookingInfo: {
    gap: 4,
  },
  bookingName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  bookingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookingPrice: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  bookingRating: {
    fontSize: 13,
    color: Colors.secondary,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  suggestionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary + '15',
    borderRadius: 16,
  },
  suggestionPillText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  typingBubble: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  inputContainer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.borderLight,
  },
});
