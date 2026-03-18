import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Download, Globe, Moon, Navigation } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ThemeColors } from '@/constants/themes';
import { usePreferencesStore, CurrencyOption, AppearanceOption } from '@/store/usePreferencesStore';

const CURRENCY_OPTIONS: CurrencyOption[] = ['USD', 'GBP', 'EUR'];
const APPEARANCE_OPTIONS: AppearanceOption[] = ['Light', 'Dark', 'System'];

export default function AppSettingsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const notifications = usePreferencesStore((s) => s.notifications);
  const locationEnabled = usePreferencesStore((s) => s.locationEnabled);
  const offlineMode = usePreferencesStore((s) => s.offlineMode);
  const currency = usePreferencesStore((s) => s.currency);
  const appearance = usePreferencesStore((s) => s.appearance);
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

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="back-button">
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>App Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Notifications</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.row, { borderBottomColor: colors.borderLight }]}>
              <View style={styles.rowLeft}>
                <Bell size={20} color={colors.primary} />
                <View>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>Push Notifications</Text>
                  <Text style={[styles.rowHint, { color: colors.textMuted }]}>Receive trip reminders and updates</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={(v) => void setNotifications(v)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Location</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.row, { borderBottomColor: colors.borderLight }]}>
              <View style={styles.rowLeft}>
                <Navigation size={20} color={colors.primary} />
                <View>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>Location Access</Text>
                  <Text style={[styles.rowHint, { color: colors.textMuted }]}>Nearby suggestions & trip tracking</Text>
                </View>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={(v) => void setLocationEnabled(v)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Data</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.row, { borderBottomColor: colors.borderLight }]}>
              <View style={styles.rowLeft}>
                <Download size={20} color={colors.primary} />
                <View>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>Offline Mode</Text>
                  <Text style={[styles.rowHint, { color: colors.textMuted }]}>Save trips for offline viewing</Text>
                </View>
              </View>
              <Switch
                value={offlineMode}
                onValueChange={(v) => void setOfflineMode(v)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Display</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={[styles.row, { borderBottomColor: colors.borderLight }]} onPress={handleCurrencySelect} testID="currency-setting">
              <View style={styles.rowLeft}>
                <Globe size={20} color={colors.primary} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>Currency</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: colors.textMuted }]}>{currency}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.row, { borderBottomColor: colors.borderLight }]} onPress={handleAppearanceSelect} testID="appearance-setting">
              <View style={styles.rowLeft}>
                <Moon size={20} color={colors.primary} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>Appearance</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: colors.textMuted }]}>{appearance}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 15,
    color: colors.text,
  },
  rowHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowValue: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
