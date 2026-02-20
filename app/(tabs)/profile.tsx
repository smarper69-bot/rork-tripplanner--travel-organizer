import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, Settings, Bell, Download, Shield, HelpCircle, 
  LogOut, ChevronRight, Moon, Globe, CreditCard, Crown,
  Sparkles, Briefcase, Users, BarChart3, Check
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTripsStore } from '@/store/useTripsStore';

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
      onPress={onPress}
      disabled={toggle}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        {icon}
        <Text style={styles.settingsItemLabel}>{label}</Text>
      </View>
      <View style={styles.settingsItemRight}>
        {value && <Text style={styles.settingsItemValue}>{value}</Text>}
        {toggle && onToggle && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.textLight}
          />
        )}
        {showChevron && !toggle && (
          <ChevronRight size={20} color={Colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const proFeatures = [
  { icon: Briefcase, text: 'Unlimited trips' },
  { icon: Sparkles, text: 'AI itinerary generation' },
  { icon: Download, text: 'Full offline access' },
  { icon: Globe, text: 'My Globe travel map' },
  { icon: BarChart3, text: 'Travel statistics' },
  { icon: Users, text: 'Advanced collaboration' },
];

export default function ProfileScreen() {
  const [offlineMode, setOfflineMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [isPro] = React.useState(false);

  const trips = useTripsStore((s) => s.trips);
  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const countriesVisited = new Set(trips.filter(t => t.status === 'completed').map(t => t.country)).size;
  const totalNights = trips
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => {
      const diff = Math.ceil((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(diff, 0);
    }, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Alex Traveler</Text>
            <Text style={styles.profileEmail}>alex@travel.com</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>Trips</Text>
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
                  <Text style={styles.proTitle}>Tripla Pro</Text>
                  <Text style={styles.proSubtitle}>Unlock the full experience</Text>
                </View>
              </View>

              <View style={styles.proFeatures}>
                {proFeatures.map((feature, index) => (
                  <View key={index} style={styles.proFeatureItem}>
                    <View style={styles.proFeatureCheck}>
                      <Check size={14} color={Colors.primary} />
                    </View>
                    <Text style={styles.proFeatureText}>{feature.text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.pricingOptions}>
                <TouchableOpacity style={styles.pricingCard}>
                  <Text style={styles.pricingLabel}>Monthly</Text>
                  <Text style={styles.pricingPrice}>$4.99</Text>
                  <Text style={styles.pricingPeriod}>/month</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pricingCard, styles.pricingCardHighlight]}>
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>Best Value</Text>
                  </View>
                  <Text style={styles.pricingLabel}>Annual</Text>
                  <Text style={styles.pricingPrice}>$29.99</Text>
                  <Text style={styles.pricingPeriod}>/year</Text>
                  <Text style={styles.pricingSavings}>Save 50%</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
              </TouchableOpacity>

              <Text style={styles.proDisclaimer}>
                Cancel anytime. 7-day free trial included.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Bell size={20} color={Colors.primary} />}
              label="Notifications"
              toggle
              toggleValue={notifications}
              onToggle={setNotifications}
              showChevron={false}
            />
            <SettingsItem
              icon={<Download size={20} color={Colors.primary} />}
              label="Offline Mode"
              toggle
              toggleValue={offlineMode}
              onToggle={setOfflineMode}
              showChevron={false}
            />
            <SettingsItem
              icon={<Globe size={20} color={Colors.primary} />}
              label="Currency"
              value="USD"
              onPress={() => console.log('Currency')}
            />
            <SettingsItem
              icon={<Moon size={20} color={Colors.primary} />}
              label="Appearance"
              value="Light"
              onPress={() => console.log('Appearance')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<User size={20} color={Colors.textSecondary} />}
              label="Personal Information"
              onPress={() => console.log('Personal')}
            />
            <SettingsItem
              icon={<CreditCard size={20} color={Colors.textSecondary} />}
              label="Payment Methods"
              onPress={() => console.log('Payment')}
            />
            <SettingsItem
              icon={<Shield size={20} color={Colors.textSecondary} />}
              label="Privacy & Security"
              onPress={() => console.log('Privacy')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<HelpCircle size={20} color={Colors.textSecondary} />}
              label="Help Center"
              onPress={() => console.log('Help')}
            />
            <SettingsItem
              icon={<Settings size={20} color={Colors.textSecondary} />}
              label="App Settings"
              onPress={() => console.log('Settings')}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <LogOut size={20} color={Colors.accent} />
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary + '15',
    borderRadius: 10,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  proSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  proCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
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
    backgroundColor: Colors.primary,
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
    fontSize: 14,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proFeatureText: {
    fontSize: 15,
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
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  pricingCardHighlight: {
    borderColor: Colors.primary,
    position: 'relative',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textLight,
    textTransform: 'uppercase',
  },
  pricingLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  pricingPrice: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  pricingPeriod: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  pricingSavings: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginTop: 4,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  proDisclaimer: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  settingsCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsItemValue: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.accent + '10',
    borderRadius: 14,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  version: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 100,
  },
});
