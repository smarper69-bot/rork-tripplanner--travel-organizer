import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Compass,
  ChevronRight,
  Navigation,
  Bell,
  Check,
  Palmtree,
  Building2,
  Trees,
  UtensilsCrossed,
  Landmark,
  Mountain,
  Gem,
  Wallet,
  User,
  Heart,
  Users,
  Baby,
  Sparkles,
  Map,
  Wand2,
  ArrowRight,
  Plus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import Colors from '@/constants/colors';
import { useOnboardingStore, UsagePurpose, TripType, TravelCompanion } from '@/store/useOnboardingStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingStep =
  | 'welcome'
  | 'usage'
  | 'trip-types'
  | 'companion'
  | 'personal'
  | 'permissions'
  | 'ready';

const STEP_COUNT = 7;

const USAGE_OPTIONS: { id: UsagePurpose; label: string; icon: React.ElementType }[] = [
  { id: 'planning_trip', label: 'Planning a trip', icon: MapPin },
  { id: 'finding_destinations', label: 'Finding destinations', icon: Compass },
  { id: 'building_itineraries', label: 'Building itineraries', icon: Map },
  { id: 'planning_with_friends', label: 'Planning with friends', icon: Users },
  { id: 'tracking_memories', label: 'Tracking travel memories', icon: Heart },
];

const TRIP_TYPE_OPTIONS: { id: TripType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'beach', label: 'Beach', icon: Palmtree, color: '#0EA5E9' },
  { id: 'city', label: 'City', icon: Building2, color: '#6366F1' },
  { id: 'nature', label: 'Nature', icon: Trees, color: '#22C55E' },
  { id: 'food', label: 'Food', icon: UtensilsCrossed, color: '#F97316' },
  { id: 'culture', label: 'Culture', icon: Landmark, color: '#A855F7' },
  { id: 'adventure', label: 'Adventure', icon: Mountain, color: '#EF4444' },
  { id: 'luxury', label: 'Luxury', icon: Gem, color: '#D4A574' },
  { id: 'budget', label: 'Budget', icon: Wallet, color: '#14B8A6' },
];

const COMPANION_OPTIONS: { id: TravelCompanion; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'solo', label: 'Solo', icon: User, desc: 'Just me, myself & I' },
  { id: 'partner', label: 'Partner', icon: Heart, desc: 'Romantic getaways' },
  { id: 'friends', label: 'Friends', icon: Users, desc: 'Squad adventures' },
  { id: 'family', label: 'Family', icon: Baby, desc: 'Family-friendly trips' },
];

function getStepIndex(step: OnboardingStep): number {
  const steps: OnboardingStep[] = ['welcome', 'usage', 'trip-types', 'companion', 'personal', 'permissions', 'ready'];
  return steps.indexOf(step);
}

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const setUserName = useOnboardingStore((s) => s.setUserName);
  const setUserEmail = useOnboardingStore((s) => s.setUserEmail);
  const setLocationEnabled = useOnboardingStore((s) => s.setLocationEnabled);
  const setNotificationsEnabled = useOnboardingStore((s) => s.setNotificationsEnabled);
  const setUsagePurposes = useOnboardingStore((s) => s.setUsagePurposes);
  const setTripTypes = useOnboardingStore((s) => s.setTripTypes);
  const setTravelCompanion = useOnboardingStore((s) => s.setTravelCompanion);
  const setProfile = usePreferencesStore((s) => s.setProfile);
  const setNotificationsPref = usePreferencesStore((s) => s.setNotifications);

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedUsage, setSelectedUsage] = useState<UsagePurpose[]>([]);
  const [selectedTripTypes, setSelectedTripTypes] = useState<TripType[]>([]);
  const [selectedCompanion, setSelectedCompanion] = useState<TravelCompanion>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = useCallback((nextStep: OnboardingStep) => {
    const nextIndex = getStepIndex(nextStep);
    Animated.timing(progressAnim, {
      toValue: nextIndex / (STEP_COUNT - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [fadeAnim, slideAnim, progressAnim]);

  const toggleUsage = useCallback((id: UsagePurpose) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUsage((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }, []);

  const toggleTripType = useCallback((id: TripType) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTripTypes((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }, []);

  const selectCompanion = useCallback((id: TravelCompanion) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCompanion(id);
  }, []);

  const handleGetStarted = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateTransition('usage');
  }, [animateTransition]);

  const handleUsageContinue = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setUsagePurposes(selectedUsage);
    animateTransition('trip-types');
  }, [selectedUsage, setUsagePurposes, animateTransition]);

  const handleTripTypesContinue = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setTripTypes(selectedTripTypes);
    animateTransition('companion');
  }, [selectedTripTypes, setTripTypes, animateTransition]);

  const handleCompanionContinue = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedCompanion) {
      await setTravelCompanion(selectedCompanion);
    }
    animateTransition('personal');
  }, [selectedCompanion, setTravelCompanion, animateTransition]);

  const handlePersonalContinue = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const name = nameInput.trim() || 'Traveler';
    const email = emailInput.trim();
    await setUserName(name);
    if (email) {
      await setUserEmail(email);
    }
    console.log('[Onboarding] Personal info saved - name:', name, 'email:', email);
    animateTransition('permissions');
  }, [nameInput, emailInput, setUserName, setUserEmail, animateTransition]);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      try {
        const result = await new Promise<boolean>((resolve) => {
          if (!navigator.geolocation) {
            resolve(false);
            return;
          }
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
          );
        });
        return result;
      } catch {
        return false;
      }
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('[Onboarding] Location permission status:', status);
      return status === 'granted';
    } catch (e) {
      console.error('[Onboarding] Location permission error:', e);
      return false;
    }
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      try {
        if (!('Notification' in window)) return false;
        const result = await Notification.requestPermission();
        return result === 'granted';
      } catch {
        return false;
      }
    }
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('[Onboarding] Notification permission status:', status);
      return status === 'granted';
    } catch (e) {
      console.error('[Onboarding] Notification permission error:', e);
      return false;
    }
  }, []);

  const handlePermissions = useCallback(async (action: 'enable' | 'skip') => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (action === 'enable') {
      const [locationGranted, notifGranted] = await Promise.all([
        requestLocationPermission(),
        requestNotificationPermission(),
      ]);
      await setLocationEnabled(locationGranted);
      await setNotificationsEnabled(notifGranted);
      await setNotificationsPref(notifGranted);
      console.log('[Onboarding] Permissions - location:', locationGranted, 'notifications:', notifGranted);
    } else {
      await setLocationEnabled(false);
      await setNotificationsEnabled(false);
      await setNotificationsPref(false);
    }
    animateTransition('ready');
  }, [animateTransition, requestLocationPermission, requestNotificationPermission, setLocationEnabled, setNotificationsEnabled, setNotificationsPref]);

  const handleFinish = useCallback(async (action: 'create' | 'explore' | 'ai') => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const userName = nameInput.trim() || 'Traveler';
    const userEmail = emailInput.trim();
    await setProfile({ name: userName, email: userEmail });
    console.log('[Onboarding] Profile synced - name:', userName, 'email:', userEmail);

    await completeOnboarding();
    if (action === 'create') {
      router.replace('/');
      setTimeout(() => { router.push('/create-trip'); }, 300);
    } else if (action === 'ai') {
      router.replace('/');
      setTimeout(() => { router.push('/(tabs)/concierge'); }, 300);
    } else {
      router.replace('/');
    }
  }, [completeOnboarding, router, setProfile, nameInput, emailInput]);

  const currentStepIndex = getStepIndex(step);
  const showProgress = step !== 'welcome' && step !== 'ready';

  const renderProgressBar = () => {
    if (!showProgress) return null;
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.progressLabel}>
          {currentStepIndex} of {STEP_COUNT - 2}
        </Text>
      </View>
    );
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeContent}>
        <View style={styles.welcomeIconRow}>
          <View style={styles.welcomeIconDot}>
            <MapPin size={20} color="#0EA5E9" strokeWidth={2} />
          </View>
          <View style={[styles.welcomeIconDot, { backgroundColor: '#FEF3C7' }]}>
            <Compass size={20} color="#D97706" strokeWidth={2} />
          </View>
          <View style={[styles.welcomeIconDot, { backgroundColor: '#DCFCE7' }]}>
            <Map size={20} color="#16A34A" strokeWidth={2} />
          </View>
        </View>
        <Text style={styles.welcomeHeadline}>Plan your next{'\n'}trip smarter</Text>
        <Text style={styles.welcomeSubtext}>
          Discover destinations, build itineraries,{'\n'}and plan with friends
        </Text>
      </View>
      <View style={styles.welcomeBottom}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
          onPress={handleGetStarted}
          testID="onboarding-get-started"
        >
          <Text style={styles.ctaText}>Get started</Text>
          <ArrowRight size={20} color="#FFF" strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );

  const renderUsage = () => (
    <ScrollView style={styles.scrollStep} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>What are you using{'\n'}TripNest for?</Text>
      <Text style={styles.stepSubtitle}>Select all that apply</Text>
      <View style={styles.chipGrid}>
        {USAGE_OPTIONS.map((option) => {
          const selected = selectedUsage.includes(option.id);
          const IconComp = option.icon;
          return (
            <Pressable
              key={option.id}
              style={[styles.usageChip, selected && styles.usageChipSelected]}
              onPress={() => toggleUsage(option.id)}
              testID={`onboarding-usage-${option.id}`}
            >
              <View style={[styles.usageChipIcon, selected && styles.usageChipIconSelected]}>
                <IconComp size={18} color={selected ? '#FFF' : Colors.textSecondary} strokeWidth={2} />
              </View>
              <Text style={[styles.usageChipLabel, selected && styles.usageChipLabelSelected]}>
                {option.label}
              </Text>
              {selected && (
                <View style={styles.usageCheckmark}>
                  <Check size={14} color="#0EA5E9" strokeWidth={3} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.scrollBottom}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
          onPress={handleUsageContinue}
          testID="onboarding-usage-continue"
        >
          <Text style={styles.ctaText}>{selectedUsage.length > 0 ? 'Continue' : 'Skip for now'}</Text>
          <ChevronRight size={20} color="#FFF" strokeWidth={2.5} />
        </Pressable>
        {selectedUsage.length === 0 && (
          <Text style={styles.hintText}>Selecting options helps personalise your experience</Text>
        )}
      </View>
    </ScrollView>
  );

  const renderTripTypes = () => (
    <ScrollView style={styles.scrollStep} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>What kind of trips{'\n'}do you like?</Text>
      <Text style={styles.stepSubtitle}>Pick your favourites</Text>
      <View style={styles.tripTypeGrid}>
        {TRIP_TYPE_OPTIONS.map((option) => {
          const selected = selectedTripTypes.includes(option.id);
          const IconComp = option.icon;
          return (
            <Pressable
              key={option.id}
              style={[styles.tripTypeCard, selected && { borderColor: option.color, borderWidth: 2 }]}
              onPress={() => toggleTripType(option.id)}
              testID={`onboarding-triptype-${option.id}`}
            >
              <View style={[styles.tripTypeIconWrap, { backgroundColor: option.color + '18' }]}>
                <IconComp size={24} color={option.color} strokeWidth={1.8} />
              </View>
              <Text style={[styles.tripTypeLabel, selected && { color: option.color, fontWeight: '700' as const }]}>
                {option.label}
              </Text>
              {selected && (
                <View style={[styles.tripTypeCheck, { backgroundColor: option.color }]}>
                  <Check size={12} color="#FFF" strokeWidth={3} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.scrollBottom}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
          onPress={handleTripTypesContinue}
          testID="onboarding-triptypes-continue"
        >
          <Text style={styles.ctaText}>{selectedTripTypes.length > 0 ? 'Continue' : 'Skip for now'}</Text>
          <ChevronRight size={20} color="#FFF" strokeWidth={2.5} />
        </Pressable>
        {selectedTripTypes.length === 0 && (
          <Text style={styles.hintText}>This helps us recommend better destinations</Text>
        )}
      </View>
    </ScrollView>
  );

  const renderCompanion = () => (
    <View style={styles.stepContainer}>
      <View style={styles.companionContent}>
        <Text style={styles.stepTitle}>Who do you usually{'\n'}travel with?</Text>
        <Text style={styles.stepSubtitle}>Pick one</Text>
        <View style={styles.companionGrid}>
          {COMPANION_OPTIONS.map((option) => {
            const selected = selectedCompanion === option.id;
            const IconComp = option.icon;
            return (
              <Pressable
                key={option.id}
                style={[styles.companionCard, selected && styles.companionCardSelected]}
                onPress={() => selectCompanion(option.id)}
                testID={`onboarding-companion-${option.id}`}
              >
                <View style={[styles.companionIconWrap, selected && styles.companionIconWrapSelected]}>
                  <IconComp size={26} color={selected ? '#FFF' : Colors.textSecondary} strokeWidth={1.8} />
                </View>
                <Text style={[styles.companionLabel, selected && styles.companionLabelSelected]}>
                  {option.label}
                </Text>
                <Text style={[styles.companionDesc, selected && styles.companionDescSelected]}>
                  {option.desc}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.bottomActions}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
          onPress={handleCompanionContinue}
          testID="onboarding-companion-continue"
        >
          <Text style={styles.ctaText}>{selectedCompanion ? 'Continue' : 'Skip for now'}</Text>
          <ChevronRight size={20} color="#FFF" strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );

  const renderPersonal = () => (
    <KeyboardAvoidingView
      style={styles.stepContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={20}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.personalContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.personalHeader}>
          <View style={styles.personalAvatar}>
            <User size={32} color="#FFF" strokeWidth={1.8} />
          </View>
          <Text style={styles.stepTitle}>Tell us about{'\n'}yourself</Text>
          <Text style={styles.stepSubtitle}>So we can personalise your experience</Text>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Your name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="What should we call you?"
            placeholderTextColor={Colors.textMuted}
            value={nameInput}
            onChangeText={setNameInput}
            autoCapitalize="words"
            testID="onboarding-name-input"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email (optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="your@email.com"
            placeholderTextColor={Colors.textMuted}
            value={emailInput}
            onChangeText={setEmailInput}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            testID="onboarding-email-input"
          />
        </View>
      </ScrollView>
      <View style={styles.bottomActions}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
          onPress={handlePersonalContinue}
          testID="onboarding-personal-continue"
        >
          <Text style={styles.ctaText}>Continue</Text>
          <ChevronRight size={20} color="#FFF" strokeWidth={2.5} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );

  const renderPermissions = () => (
    <View style={styles.stepContainer}>
      <View style={styles.permContent}>
        <Text style={styles.stepTitle}>One more thing</Text>
        <Text style={styles.stepSubtitle}>These help us make your experience better</Text>
        <View style={styles.permCards}>
          <View style={styles.permCard}>
            <View style={[styles.permIconWrap, { backgroundColor: '#DBEAFE' }]}>
              <Navigation size={22} color="#2563EB" strokeWidth={2} />
            </View>
            <View style={styles.permInfo}>
              <Text style={styles.permName}>Location</Text>
              <Text style={styles.permDesc}>Used for relevant destination suggestions</Text>
            </View>
          </View>
          <View style={styles.permCard}>
            <View style={[styles.permIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Bell size={22} color="#D97706" strokeWidth={2} />
            </View>
            <View style={styles.permInfo}>
              <Text style={styles.permName}>Notifications</Text>
              <Text style={styles.permDesc}>Used for trip reminders and updates</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.bottomActions}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
          onPress={() => handlePermissions('enable')}
          testID="onboarding-enable-permissions"
        >
          <Text style={styles.ctaText}>Allow permissions</Text>
        </Pressable>
        <Pressable
          style={styles.skipBtn}
          onPress={() => handlePermissions('skip')}
          testID="onboarding-skip-permissions"
        >
          <Text style={styles.skipBtnText}>Maybe later</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderReady = () => (
    <View style={styles.stepContainer}>
      <View style={styles.readyContent}>
        <View style={styles.readyBadge}>
          <Sparkles size={32} color="#D97706" strokeWidth={1.8} />
        </View>
        <Text style={styles.readyTitle}>You{"'"}re ready to go</Text>
        <Text style={styles.readySubtext}>
          {nameInput.trim() ? `Let's plan something amazing, ${nameInput.trim()}` : "Let's plan something amazing"}
        </Text>
      </View>
      <View style={styles.readyActions}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
          onPress={() => handleFinish('create')}
          testID="onboarding-create-trip"
        >
          <Plus size={20} color="#FFF" strokeWidth={2.5} />
          <Text style={styles.ctaText}>Create my first trip</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.outlineButton, pressed && styles.outlineButtonPressed]}
          onPress={() => handleFinish('explore')}
          testID="onboarding-explore"
        >
          <Compass size={18} color={Colors.text} strokeWidth={2} />
          <Text style={styles.outlineButtonText}>Explore destinations</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.outlineButton, pressed && styles.outlineButtonPressed]}
          onPress={() => handleFinish('ai')}
          testID="onboarding-ai-itinerary"
        >
          <Wand2 size={18} color={Colors.text} strokeWidth={2} />
          <Text style={styles.outlineButtonText}>Try AI itinerary</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 'welcome': return renderWelcome();
      case 'usage': return renderUsage();
      case 'trip-types': return renderTripTypes();
      case 'companion': return renderCompanion();
      case 'personal': return renderPersonal();
      case 'permissions': return renderPermissions();
      case 'ready': return renderReady();
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {renderProgressBar()}
        <Animated.View
          style={[
            styles.animatedWrap,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {renderStep()}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  safeArea: {
    flex: 1,
  },
  animatedWrap: {
    flex: 1,
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E7E5E4',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500' as const,
    minWidth: 32,
    textAlign: 'right' as const,
  },

  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollStep: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  stepTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#1A1A1A',
    letterSpacing: -0.8,
    lineHeight: 40,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 28,
    lineHeight: 22,
  },

  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeIconRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  welcomeIconDot: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeHeadline: {
    fontSize: 38,
    fontWeight: '800' as const,
    color: '#1A1A1A',
    letterSpacing: -1,
    lineHeight: 46,
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  welcomeSubtext: {
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 26,
  },
  welcomeBottom: {
    paddingBottom: 24,
  },

  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 17,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 8,
  },
  ctaPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  ctaText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },

  hintText: {
    textAlign: 'center' as const,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 12,
  },

  chipGrid: {
    gap: 10,
    marginBottom: 24,
  },
  usageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
    gap: 14,
  },
  usageChipSelected: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  usageChipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F5F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usageChipIconSelected: {
    backgroundColor: '#0EA5E9',
  },
  usageChipLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  usageChipLabelSelected: {
    color: '#0369A1',
  },
  usageCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  tripTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  tripTypeCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
    position: 'relative' as const,
  },
  tripTypeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tripTypeLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  tripTypeCheck: {
    position: 'absolute' as const,
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollBottom: {
    paddingTop: 8,
    paddingBottom: 24,
  },

  companionContent: {
    flex: 1,
    paddingTop: 8,
  },
  companionGrid: {
    gap: 12,
  },
  companionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
    gap: 16,
  },
  companionCardSelected: {
    borderColor: '#1A1A1A',
    backgroundColor: '#FAFAF9',
  },
  companionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F5F5F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companionIconWrapSelected: {
    backgroundColor: '#1A1A1A',
  },
  companionLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  companionLabelSelected: {
    color: '#1A1A1A',
  },
  companionDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    position: 'absolute' as const,
    right: 18,
  },
  companionDescSelected: {
    color: Colors.textSecondary,
  },

  bottomActions: {
    paddingBottom: 24,
    gap: 12,
  },

  personalContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  personalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  personalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 17,
    color: Colors.text,
    fontWeight: '500' as const,
  },

  permContent: {
    flex: 1,
    paddingTop: 8,
  },
  permCards: {
    gap: 14,
  },
  permCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#F0EFED',
  },
  permIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permInfo: {
    flex: 1,
  },
  permName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  permDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  skipBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  skipBtnText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },

  readyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readyBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  readyTitle: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: '#1A1A1A',
    letterSpacing: -0.8,
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  readySubtext: {
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  readyActions: {
    paddingBottom: 24,
    gap: 10,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
    gap: 8,
  },
  outlineButtonPressed: {
    backgroundColor: '#F5F5F4',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
