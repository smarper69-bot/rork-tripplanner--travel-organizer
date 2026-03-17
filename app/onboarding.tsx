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
  FlatList,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Plane,
  Globe,
  ChevronRight,
  Mail,
  User,
  Bell,
  Navigation,
  Compass,
  Plus,
  ArrowRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useOnboardingStore } from '@/store/useOnboardingStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingStep =
  | 'welcome'
  | 'carousel'
  | 'auth'
  | 'guest-name'
  | 'permissions'
  | 'first-action';

const CAROUSEL_DATA = [
  {
    id: '1',
    icon: MapPin,
    title: 'Plan trips in minutes',
    description: 'Create and manage trips effortlessly with smart itineraries.',
    accent: '#2D3436',
  },
  {
    id: '2',
    icon: Plane,
    title: 'Explore stays & flights',
    description: 'Discover hotels, flights, and experiences in one place.',
    accent: '#1A1A2E',
  },
  {
    id: '3',
    icon: Globe,
    title: 'Track your travel footprint',
    description: 'Visualize your journeys and see the world you have explored.',
    accent: '#16213E',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const setUserName = useOnboardingStore((s) => s.setUserName);

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [guestName, setGuestName] = useState<string>('');

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const animateTransition = useCallback((nextStep: OnboardingStep) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(30);
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
  }, [fadeAnim, slideAnim]);

  const handleContinueWelcome = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition('carousel');
  }, [animateTransition]);

  const handleCarouselNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (carouselIndex < CAROUSEL_DATA.length - 1) {
      const nextIndex = carouselIndex + 1;
      setCarouselIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      animateTransition('auth');
    }
  }, [carouselIndex, animateTransition]);

  const handleSkipCarousel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition('auth');
  }, [animateTransition]);

  const handleAuthChoice = useCallback((method: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (method === 'guest') {
      animateTransition('guest-name');
    } else {
      animateTransition('permissions');
    }
  }, [animateTransition]);

  const handleGuestContinue = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (guestName.trim()) {
      await setUserName(guestName.trim());
    }
    animateTransition('permissions');
  }, [guestName, setUserName, animateTransition]);

  const handlePermissions = useCallback((action: 'enable' | 'skip') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (action === 'enable') {
      if (Platform.OS !== 'web') {
        console.log('[Onboarding] Permission request would fire here');
      }
    }
    animateTransition('first-action');
  }, [animateTransition]);

  const handleFinish = useCallback(async (action: 'create' | 'explore') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await completeOnboarding();
    if (action === 'create') {
      router.replace('/');
      setTimeout(() => {
        router.push('/create-trip');
      }, 300);
    } else {
      router.replace('/');
    }
  }, [completeOnboarding, router]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCarouselIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeTop}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Compass size={40} color="#FFF" strokeWidth={1.5} />
          </View>
        </View>
        <Text style={styles.logoTitle}>TripNest</Text>
        <Text style={styles.logoTagline}>Your world, planned beautifully</Text>
      </View>
      <View style={styles.welcomeBottom}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleContinueWelcome}
          testID="onboarding-continue"
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <ChevronRight size={20} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );

  const renderCarouselItem = ({ item }: { item: typeof CAROUSEL_DATA[0] }) => {
    const IconComponent = item.icon;
    return (
      <View style={[styles.carouselItem, { width: SCREEN_WIDTH }]}>
        <View style={[styles.carouselIconWrap, { backgroundColor: item.accent }]}>
          <IconComponent size={48} color="#FFF" strokeWidth={1.2} />
        </View>
        <Text style={styles.carouselTitle}>{item.title}</Text>
        <Text style={styles.carouselDescription}>{item.description}</Text>
      </View>
    );
  };

  const renderCarousel = () => (
    <View style={styles.stepContainer}>
      <Pressable style={styles.skipButton} onPress={handleSkipCarousel} testID="onboarding-skip">
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={CAROUSEL_DATA}
          renderItem={renderCarouselItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          bounces={false}
        />
      </View>

      <View style={styles.carouselFooter}>
        <View style={styles.dots}>
          {CAROUSEL_DATA.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === carouselIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleCarouselNext}
          testID="onboarding-next"
        >
          <Text style={styles.primaryButtonText}>
            {carouselIndex === CAROUSEL_DATA.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ChevronRight size={20} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );

  const renderAuth = () => (
    <View style={styles.stepContainer}>
      <View style={styles.authTop}>
        <Text style={styles.authTitle}>Welcome aboard</Text>
        <Text style={styles.authSubtitle}>Choose how you{"'"}d like to continue</Text>
      </View>

      <View style={styles.authButtons}>
        <Pressable
          style={({ pressed }) => [
            styles.authButton,
            pressed && styles.authButtonPressed,
          ]}
          onPress={() => handleAuthChoice('email')}
          testID="onboarding-email"
        >
          <View style={styles.authButtonIcon}>
            <Mail size={20} color={Colors.text} />
          </View>
          <Text style={styles.authButtonText}>Continue with Email</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.authButton,
            pressed && styles.authButtonPressed,
          ]}
          onPress={() => handleAuthChoice('apple')}
          testID="onboarding-apple"
        >
          <View style={styles.authButtonIcon}>
            <Text style={styles.appleIcon}></Text>
          </View>
          <Text style={styles.authButtonText}>Continue with Apple</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.authButton,
            pressed && styles.authButtonPressed,
          ]}
          onPress={() => handleAuthChoice('google')}
          testID="onboarding-google"
        >
          <View style={styles.authButtonIcon}>
            <Text style={styles.googleIcon}>G</Text>
          </View>
          <Text style={styles.authButtonText}>Continue with Google</Text>
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.guestButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => handleAuthChoice('guest')}
          testID="onboarding-guest"
        >
          <User size={20} color="#FFF" />
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderGuestName = () => (
    <View style={styles.stepContainer}>
      <View style={styles.guestNameTop}>
        <View style={styles.guestAvatarCircle}>
          <User size={32} color={Colors.textMuted} />
        </View>
        <Text style={styles.guestNameTitle}>What should we call you?</Text>
        <Text style={styles.guestNameSubtitle}>This is optional — you can skip it</Text>
      </View>

      <View style={styles.guestNameMiddle}>
        <TextInput
          style={styles.nameInput}
          placeholder="Your name"
          placeholderTextColor={Colors.textMuted}
          value={guestName}
          onChangeText={setGuestName}
          autoCapitalize="words"
          autoFocus
          testID="onboarding-name-input"
        />
      </View>

      <View style={styles.guestNameBottom}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleGuestContinue}
          testID="onboarding-guest-continue"
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <ChevronRight size={20} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );

  const renderPermissions = () => (
    <View style={styles.stepContainer}>
      <View style={styles.permissionsTop}>
        <Text style={styles.permissionsTitle}>Stay in the loop</Text>
        <Text style={styles.permissionsSubtitle}>
          Enable permissions for a better experience
        </Text>
      </View>

      <View style={styles.permissionCards}>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIconWrap}>
            <Navigation size={24} color={Colors.text} />
          </View>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionName}>Location</Text>
            <Text style={styles.permissionDesc}>Nearby suggestions & trip tracking</Text>
          </View>
        </View>

        <View style={styles.permissionCard}>
          <View style={styles.permissionIconWrap}>
            <Bell size={24} color={Colors.text} />
          </View>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionName}>Notifications</Text>
            <Text style={styles.permissionDesc}>Trip reminders & travel alerts</Text>
          </View>
        </View>
      </View>

      <View style={styles.permissionsBottom}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => handlePermissions('enable')}
          testID="onboarding-enable-permissions"
        >
          <Text style={styles.primaryButtonText}>Enable</Text>
        </Pressable>
        <Pressable
          style={styles.textButton}
          onPress={() => handlePermissions('skip')}
          testID="onboarding-skip-permissions"
        >
          <Text style={styles.textButtonLabel}>Not now</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderFirstAction = () => (
    <View style={styles.stepContainer}>
      <View style={styles.firstActionTop}>
        <View style={styles.firstActionIconWrap}>
          <Compass size={56} color={Colors.text} strokeWidth={1} />
        </View>
        <Text style={styles.firstActionTitle}>Let{"'"}s plan your{'\n'}first adventure</Text>
        <Text style={styles.firstActionSubtitle}>
          Start by creating a trip or explore what the world has to offer
        </Text>
      </View>

      <View style={styles.firstActionBottom}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => handleFinish('create')}
          testID="onboarding-create-trip"
        >
          <Plus size={20} color="#FFF" />
          <Text style={styles.primaryButtonText}>Create your first trip</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
          onPress={() => handleFinish('explore')}
          testID="onboarding-explore"
        >
          <Text style={styles.secondaryButtonText}>Explore destinations</Text>
          <ArrowRight size={18} color={Colors.text} />
        </Pressable>
      </View>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return renderWelcome();
      case 'carousel':
        return renderCarousel();
      case 'auth':
        return renderAuth();
      case 'guest-name':
        return renderGuestName();
      case 'permissions':
        return renderPermissions();
      case 'first-action':
        return renderFirstAction();
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
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
    backgroundColor: '#FAFAFA',
  },
  safeArea: {
    flex: 1,
  },
  animatedWrap: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },

  welcomeTop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -1,
    marginBottom: 8,
  },
  logoTagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  welcomeBottom: {
    paddingBottom: 24,
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },

  skipButton: {
    position: 'absolute' as const,
    top: 8,
    right: 0,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },

  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  carouselItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  carouselIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  carouselTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center' as const,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  carouselDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 24,
    maxWidth: 280,
  },

  carouselFooter: {
    paddingBottom: 24,
    gap: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
  },
  dotActive: {
    backgroundColor: '#1A1A1A',
    width: 24,
  },

  authTop: {
    paddingTop: 48,
    marginBottom: 40,
  },
  authTitle: {
    fontSize: 30,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  authButtons: {
    gap: 12,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 14,
  },
  authButtonPressed: {
    backgroundColor: '#F5F5F5',
  },
  authButtonIcon: {
    width: 24,
    alignItems: 'center',
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  appleIcon: {
    fontSize: 20,
    color: Colors.text,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#4285F4',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  dividerText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 10,
  },
  guestButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },

  guestNameTop: {
    paddingTop: 48,
    alignItems: 'center',
    marginBottom: 32,
  },
  guestAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  guestNameTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center' as const,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  guestNameSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  guestNameMiddle: {
    flex: 1,
  },
  nameInput: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  guestNameBottom: {
    paddingBottom: 24,
  },

  permissionsTop: {
    paddingTop: 48,
    marginBottom: 32,
  },
  permissionsTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  permissionsSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  permissionCards: {
    gap: 12,
    marginBottom: 'auto' as const,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  permissionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionInfo: {
    flex: 1,
  },
  permissionName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  permissionDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  permissionsBottom: {
    paddingBottom: 24,
    gap: 12,
  },
  textButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  textButtonLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },

  firstActionTop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstActionIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  firstActionTitle: {
    fontSize: 30,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center' as const,
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 12,
  },
  firstActionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    maxWidth: 280,
  },
  firstActionBottom: {
    paddingBottom: 24,
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  secondaryButtonPressed: {
    backgroundColor: '#F5F5F5',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
