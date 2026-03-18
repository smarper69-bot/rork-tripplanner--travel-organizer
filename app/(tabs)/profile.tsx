import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  User, Settings, Bell, Download, Shield, HelpCircle, 
  LogOut, ChevronRight, Moon, Globe, CreditCard, Crown,
  Sparkles, Briefcase, Users, BarChart3, Check, Navigation
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { openComingSoon } from '@/utils/comingSoon';
import { hapticLight } from '@/utils/haptics';
import { useTripsStore, getUserTripCount } from '@/store/useTripsStore';
import { usePreferencesStore, CurrencyOption, AppearanceOption } from '@/store/usePreferencesStore';
import { useSubscriptionStore, FREE_TRIP_LIMIT, PLAN_FEATURES } from '@/store/useSubscriptionStore';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ThemeColors } from '@/constants/themes';

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  colors: ThemeColors;
}

function SettingsItem({ icon, label, value, onPress, showChevron = true, toggle, toggleValue, onToggle, colors }: SettingsItemProps) {
  return (
    <TouchableOpacity 
      style={[settingsStyles.settingsItem, { borderBottomColor: colors.borderLight }]}
      onPress={() => {
        hapticLight();
        onPress?.();
      }}
      disabled={toggle}
      activeOpacity={0.7}
    >
      <View style={settingsStyles.settingsItemLeft}>
        <View style={[settingsStyles.settingsIconWrap, { backgroundColor: colors.background }]}>
          {icon}
        </View>
        <Text style={[settingsStyles.settingsItemLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={settingsStyles.settingsItemRight}>
        {value && <Text style={[settingsStyles.settingsItemValue, { color: colors.textMuted }]}>{value}</Text>}
        {toggle && onToggle && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        )}
        {showChevron && !toggle && (
          <ChevronRight size={18} color={colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const settingsStyles = StyleSheet.create({
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsItemLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsItemValue: {
    fontSize: 13,
  },
});

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
  const colors = useThemeColors();
  const plan = useSubscriptionStore((s) => s.plan);
  const isPro = plan === 'premium';
  const userProfile = useUserProfile();

  const notifications = usePreferencesStore((s) => s.notifications);
  const offlineMode = usePreferencesStore((s) => s.offlineMode);
  const currency = usePreferencesStore((s) => s.currency);
  const appearance = usePreferencesStore((s) => s.appearance);
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

  const s = createStyles(colors);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <View style={s.header}>
          <Text style={s.title}>Profile</Text>
        </View>

        <View style={s.profileCard}>
          {userProfile.profileImage ? (
            <Image
              source={{ uri: userProfile.profileImage }}
              style={s.avatar}
            />
          ) : (
            <View style={[s.avatar, s.avatarPlaceholder]}>
              <User size={30} color={colors.textMuted} />
            </View>
          )}
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{userProfile.name}</Text>
            <Text style={s.profileEmail}>{userProfile.email || 'No email set'}</Text>
          </View>
          <TouchableOpacity style={s.editButton} onPress={() => router.push('/personal-info')} activeOpacity={0.7}>
            <Text style={s.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statValue}>{userTripCount}</Text>
            <Text style={s.statLabel}>{isPro ? 'Trips' : `/ ${FREE_TRIP_LIMIT} Trips`}</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{countriesVisited}</Text>
            <Text style={s.statLabel}>Countries</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>{totalNights}</Text>
            <Text style={s.statLabel}>Nights</Text>
          </View>
        </View>

        {!isPro && (
          <View style={s.proSection}>
            <View style={s.proCard}>
              <View style={s.proHeader}>
                <View style={[s.proBadge, { backgroundColor: colors.accent }]}>
                  <Crown size={20} color="#FFFFFF" />
                </View>
                <View style={s.proTitleContainer}>
                  <Text style={s.proTitle}>TripNest Premium</Text>
                  <Text style={s.proSubtitle}>Plan together, use AI, and unlock unlimited trips</Text>
                </View>
              </View>

              <View style={s.proFeatures}>
                {premiumFeaturesList.map((feature, index) => (
                  <View key={index} style={s.proFeatureItem}>
                    <View style={s.proFeatureCheck}>
                      <Check size={12} color={colors.accent} />
                    </View>
                    <Text style={s.proFeatureText}>{feature.text}</Text>
                  </View>
                ))}
              </View>

              <View style={s.pricingOptions}>
                <TouchableOpacity style={s.pricingCard} onPress={() => openComingSoon('TripNest Pro subscription')} activeOpacity={0.7}>
                  <Text style={s.pricingLabel}>Monthly</Text>
                  <Text style={s.pricingPrice}>$4.99</Text>
                  <Text style={s.pricingPeriod}>/month</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.pricingCard, s.pricingCardHighlight]} onPress={() => openComingSoon('TripNest Pro subscription')} activeOpacity={0.7}>
                  <View style={[s.bestValueBadge, { backgroundColor: colors.accent }]}>
                    <Text style={s.bestValueText}>Best Value</Text>
                  </View>
                  <Text style={s.pricingLabel}>Annual</Text>
                  <Text style={s.pricingPrice}>$29.99</Text>
                  <Text style={s.pricingPeriod}>/year</Text>
                  <Text style={[s.pricingSavings, { color: colors.accent }]}>Save 50%</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[s.upgradeButton, { backgroundColor: colors.accent }]} onPress={() => openComingSoon('TripNest Premium subscription')} activeOpacity={0.8}>
                <Text style={s.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>

              <Text style={s.proDisclaimer}>
                Cancel anytime. 7-day free trial included.
              </Text>

              <View style={s.freeCompare}>
                <Text style={s.freeCompareTitle}>Your free plan includes:</Text>
                {PLAN_FEATURES.free.features.map((f, i) => (
                  <Text key={i} style={s.freeCompareItem}>{`\u2022 ${f}`}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Preferences</Text>
          <View style={s.settingsCard}>
            <SettingsItem
              icon={<Bell size={18} color={colors.accent} />}
              label="Notifications"
              toggle
              toggleValue={notifications}
              onToggle={(v) => void setNotifications(v)}
              showChevron={false}
              colors={colors}
            />
            <SettingsItem
              icon={<Navigation size={18} color={colors.accent} />}
              label="Location"
              toggle
              toggleValue={locationEnabled}
              onToggle={(v) => void setLocationEnabled(v)}
              showChevron={false}
              colors={colors}
            />
            <SettingsItem
              icon={<Download size={18} color={colors.accent} />}
              label="Offline Mode"
              toggle
              toggleValue={offlineMode}
              onToggle={(v) => void setOfflineMode(v)}
              showChevron={false}
              colors={colors}
            />
            <SettingsItem
              icon={<Globe size={18} color={colors.accent} />}
              label="Currency"
              value={currency}
              onPress={handleCurrencySelect}
              colors={colors}
            />
            <SettingsItem
              icon={<Moon size={18} color={colors.accent} />}
              label="Appearance"
              value={appearance}
              onPress={handleAppearanceSelect}
              colors={colors}
            />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Account</Text>
          <View style={s.settingsCard}>
            <SettingsItem
              icon={<User size={18} color={colors.textSecondary} />}
              label="Personal Information"
              onPress={() => router.push('/personal-info')}
              colors={colors}
            />
            <SettingsItem
              icon={<CreditCard size={18} color={colors.textSecondary} />}
              label="Payment Methods"
              onPress={() => router.push('/payment-methods')}
              colors={colors}
            />
            <SettingsItem
              icon={<Shield size={18} color={colors.textSecondary} />}
              label="Privacy & Security"
              onPress={() => router.push('/privacy-security')}
              colors={colors}
            />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Support</Text>
          <View style={s.settingsCard}>
            <SettingsItem
              icon={<HelpCircle size={18} color={colors.textSecondary} />}
              label="Help Center"
              onPress={() => router.push('/help-center')}
              colors={colors}
            />
            <SettingsItem
              icon={<Settings size={18} color={colors.textSecondary} />}
              label="App Settings"
              onPress={() => router.push('/app-settings')}
              colors={colors}
            />
          </View>
        </View>

        <TouchableOpacity style={s.logoutButton} onPress={handleSignOut} activeOpacity={0.7}>
          <LogOut size={18} color={colors.error} />
          <Text style={[s.logoutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
    letterSpacing: -0.3,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    padding: 18,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 3,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.accent + '15',
    borderRadius: 10,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.accent,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    padding: 20,
    backgroundColor: colors.surface,
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
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  proSection: {
    marginBottom: 28,
    paddingHorizontal: 24,
  },
  proCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.accent + '25',
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
    color: colors.text,
  },
  proSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
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
    backgroundColor: colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proFeatureText: {
    fontSize: 14,
    color: colors.text,
  },
  pricingOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  pricingCardHighlight: {
    borderColor: colors.accent,
    position: 'relative',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  pricingLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  pricingPrice: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.text,
  },
  pricingPeriod: {
    fontSize: 11,
    color: colors.textMuted,
  },
  pricingSavings: {
    fontSize: 11,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  upgradeButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  proDisclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  freeCompare: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  freeCompareTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  freeCompareItem: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  settingsCard: {
    marginHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.error + '08',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.error + '15',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  version: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
});
