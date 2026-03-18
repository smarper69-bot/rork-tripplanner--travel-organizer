import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  User, Settings, Bell, Download, Shield, HelpCircle, 
  LogOut, ChevronRight, Moon, Globe, CreditCard, Crown,
  Sparkles, Briefcase, Users, BarChart3, Check, Navigation
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { openComingSoon } from '@/utils/comingSoon';
import { hapticLight } from '@/utils/haptics';
import { useTripsStore, getUserTripCount } from '@/store/useTripsStore';
import { usePreferencesStore, CurrencyOption, AppearanceOption } from '@/store/usePreferencesStore';
import { useSubscriptionStore, FREE_TRIP_LIMIT, PLAN_FEATURES } from '@/store/useSubscriptionStore';


interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

function SettingsItem({ icon, label, value, onPress, showChevron = true, toggle, toggleValue, onToggle }: SettingsItemProps) {
  return (
    <TouchableOpacity 
      style={styles.settingsItem} 
      onPress={() => {
        hapticLight();
        onPress?.();
      }}
      disabled={toggle}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.settingsIconWrap}>
          {icon}
        </View>
        <Text style={styles.settingsItemLabel}>{label}</Text>
      </View>
      <View style={styles.settingsItemRight}>
        {value && <Text style={styles.settingsItemValue}>{value}</Text>}
        {toggle && onToggle && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: Colors.border, true: Colors.accent }}
            thumbColor={Colors.textLight}
          />
        )}
        {showChevron && !toggle && (
          <ChevronRight size={18} color={Colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const premiumFeaturesList = [
  { icon: Briefcase, text: 'Unlimited trips' },
  { icon: Sparkles, text: 'AI itinerary generation' },
  { icon: Sparkles, text: 'AI travel suggestions' },
  { icon: Users, text: 'Collaborative editing & shared planning' },
  { icon: Download, text: 'Offline trip access' },
  { icon: Globe, text: 'Advanced globe & travel history' },
  { icon: BarChart3, text: 'Smart hotel & activity suggestions' },
];

const CURRENCY_OPTIONS: CurrencyOption[] = ['USD', 'GBP', 'EUR'];
const APPEARANCE_OPTIONS: AppearanceOption[] = ['Light', 'Dark', 'System'];

export default function ProfileScreen() {
  const router = useRouter();
  const plan = useSubscriptionStore((s) => s.plan);
  const isPro = plan === 'premium';

  const notifications = usePreferencesStore((s) => s.notifications);
  const offlineMode = usePreferencesStore((s) => s.offlineMode);
  const currency = usePreferencesStore((s) => s.currency);
  const appearance = usePreferencesStore((s) => s.appearance);
  const profile = usePreferencesStore((s) => s.profile);
  const locationEnabled = usePreferencesStore((s) => s.locationEnabled);
  const setNotifications = usePreferencesStore((s) => s.setNotifications);
  const setLocationEnabled = usePreferencesStore((s) => s.setLocationEnabled);
  const setOfflineMode = usePreferencesStore((s) => s.setOfflineMode);
  const setCurrency = usePreferencesStore((s) => s.setCurrency);
  const setAppearance = usePreferencesStore((s) => s.setAppearance);

  const handleCurrencySelect = () => {
    Alert.alert(
      'Select Currency',
      undefined,
      CURRENCY_OPTIONS.map((opt) => ({
        text: opt + (currency === opt ? ' ✓' : ''),
        onPress: () => void setCurrency(opt),
      })),
    );
  };

  const handleAppearanceSelect = () => {
    Alert.alert(
      'Select Appearance',
      undefined,
      APPEARANCE_OPTIONS.map((opt) => ({
        text: opt + (appearance === opt ? ' ✓' : ''),
        onPress: () => void setAppearance(opt),
      })),
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Signed Out', 'You have been signed out successfully.');
          },
        },
      ],
    );
  };

  const trips = useTripsStore((s) => s.trips);
  const userTripCount = getUserTripCount(trips);
  const countriesVisited = new Set(trips.map(t => t.country || t.destination).filter(Boolean)).size;
  const totalNights = trips.reduce((sum, t) => {
    if (!t.startDate || !t.endDate) return sum;
    const diff = Math.ceil((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / (1000 * 60 * 60 * 24));
    return sum + Math.max(diff, 0);
  }, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          {profile.profileImage ? (
            <Image
              source={{ uri: profile.profileImage }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <User size={30} color={Colors.textMuted} />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name || 'Traveler'}</Text>
            <Text style={styles.profileEmail}>{profile.email || 'No email set'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push('/personal-info')} activeOpacity={0.7}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userTripCount}</Text>
            <Text style={styles.statLabel}>{isPro ? 'Trips' : `/ ${FREE_TRIP_LIMIT} Trips`}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{countriesVisited}</Text>
            <Text style={styles.statLabel}>Countries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalNights}</Text>
            <Text style={styles.statLabel}>Nights</Text>
          </View>
        </View>

        {!isPro && (
          <View style={styles.proSection}>
            <View style={styles.proCard}>
              <View style={styles.proHeader}>
                <View style={styles.proBadge}>
                  <Crown size={20} color={Colors.textLight} />
                </View>
                <View style={styles.proTitleContainer}>
                  <Text style={styles.proTitle}>TripNest Premium</Text>
                  <Text style={styles.proSubtitle}>Plan together, use AI, and unlock unlimited trips</Text>
                </View>
              </View>

              <View style={styles.proFeatures}>
                {premiumFeaturesList.map((feature, index) => (
                  <View key={index} style={styles.proFeatureItem}>
                    <View style={styles.proFeatureCheck}>
                      <Check size={12} color={Colors.accent} />
                    </View>
                    <Text style={styles.proFeatureText}>{feature.text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.pricingOptions}>
                <TouchableOpacity style={styles.pricingCard} onPress={() => openComingSoon('TripNest Pro subscription')} activeOpacity={0.7}>
                  <Text style={styles.pricingLabel}>Monthly</Text>
                  <Text style={styles.pricingPrice}>$4.99</Text>
                  <Text style={styles.pricingPeriod}>/month</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pricingCard, styles.pricingCardHighlight]} onPress={() => openComingSoon('TripNest Pro subscription')} activeOpacity={0.7}>
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>Best Value</Text>
                  </View>
                  <Text style={styles.pricingLabel}>Annual</Text>
                  <Text style={styles.pricingPrice}>$29.99</Text>
                  <Text style={styles.pricingPeriod}>/year</Text>
                  <Text style={styles.pricingSavings}>Save 50%</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.upgradeButton} onPress={() => openComingSoon('TripNest Premium subscription')} activeOpacity={0.8}>
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>

              <Text style={styles.proDisclaimer}>
                Cancel anytime. 7-day free trial included.
              </Text>

              <View style={styles.freeCompare}>
                <Text style={styles.freeCompareTitle}>Your free plan includes:</Text>
                {PLAN_FEATURES.free.features.map((f, i) => (
                  <Text key={i} style={styles.freeCompareItem}>{`\u2022 ${f}`}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Bell size={18} color={Colors.accent} />}
              label="Notifications"
              toggle
              toggleValue={notifications}
              onToggle={(v) => void setNotifications(v)}
              showChevron={false}
            />
            <SettingsItem
              icon={<Navigation size={18} color={Colors.accent} />}
              label="Location"
              toggle
              toggleValue={locationEnabled}
              onToggle={(v) => void setLocationEnabled(v)}
              showChevron={false}
            />
            <SettingsItem
              icon={<Download size={18} color={Colors.accent} />}
              label="Offline Mode"
              toggle
              toggleValue={offlineMode}
              onToggle={(v) => void setOfflineMode(v)}
              showChevron={false}
            />
            <SettingsItem
              icon={<Globe size={18} color={Colors.accent} />}
              label="Currency"
              value={currency}
              onPress={handleCurrencySelect}
            />
            <SettingsItem
              icon={<Moon size={18} color={Colors.accent} />}
              label="Appearance"
              value={appearance}
              onPress={handleAppearanceSelect}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<User size={18} color={Colors.textSecondary} />}
              label="Personal Information"
              onPress={() => router.push('/personal-info')}
            />
            <SettingsItem
              icon={<CreditCard size={18} color={Colors.textSecondary} />}
              label="Payment Methods"
              onPress={() => router.push('/payment-methods')}
            />
            <SettingsItem
              icon={<Shield size={18} color={Colors.textSecondary} />}
              label="Privacy & Security"
              onPress={() => router.push('/privacy-security')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<HelpCircle size={18} color={Colors.textSecondary} />}
              label="Help Center"
              onPress={() => router.push('/help-center')}
            />
            <SettingsItem
              icon={<Settings size={18} color={Colors.textSecondary} />}
              label="App Settings"
              onPress={() => router.push('/app-settings')}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut} activeOpacity={0.7}>
          <LogOut size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    padding: 18,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.accent + '15',
    borderRadius: 10,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  proSection: {
    marginBottom: 28,
    paddingHorizontal: 24,
  },
  proCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.accent + '25',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  proBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  proTitleContainer: {
    flex: 1,
  },
  proTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  proSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  proFeatures: {
    marginBottom: 20,
    gap: 10,
  },
  proFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proFeatureCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proFeatureText: {
    fontSize: 14,
    color: Colors.text,
  },
  pricingOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  pricingCardHighlight: {
    borderColor: Colors.accent,
    position: 'relative',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textLight,
    textTransform: 'uppercase',
  },
  pricingLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  pricingPrice: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  pricingPeriod: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  pricingSavings: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.accent,
    marginTop: 4,
  },
  upgradeButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textLight,
  },
  proDisclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  freeCompare: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderLight,
  },
  freeCompareTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  freeCompareItem: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  settingsCard: {
    marginHorizontal: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsItemLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsItemValue: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.error + '08',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.error + '15',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  version: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
});
