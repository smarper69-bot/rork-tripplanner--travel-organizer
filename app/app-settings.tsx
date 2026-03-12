import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Download, Globe, Moon } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePreferencesStore, CurrencyOption, AppearanceOption } from '@/store/usePreferencesStore';

const CURRENCY_OPTIONS: CurrencyOption[] = ['USD', 'GBP', 'EUR'];
const APPEARANCE_OPTIONS: AppearanceOption[] = ['Light', 'Dark', 'System'];

export default function AppSettingsScreen() {
  const router = useRouter();
  const notifications = usePreferencesStore((s) => s.notifications);
  const offlineMode = usePreferencesStore((s) => s.offlineMode);
  const currency = usePreferencesStore((s) => s.currency);
  const appearance = usePreferencesStore((s) => s.appearance);
  const setNotifications = usePreferencesStore((s) => s.setNotifications);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="back-button">
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>App Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Bell size={20} color={Colors.primary} />
                <View>
                  <Text style={styles.rowLabel}>Push Notifications</Text>
                  <Text style={styles.rowHint}>Receive trip reminders and updates</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={(v) => void setNotifications(v)}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.textLight}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Download size={20} color={Colors.primary} />
                <View>
                  <Text style={styles.rowLabel}>Offline Mode</Text>
                  <Text style={styles.rowHint}>Save trips for offline viewing</Text>
                </View>
              </View>
              <Switch
                value={offlineMode}
                onValueChange={(v) => void setOfflineMode(v)}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.textLight}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={handleCurrencySelect} testID="currency-setting">
              <View style={styles.rowLeft}>
                <Globe size={20} color={Colors.primary} />
                <Text style={styles.rowLabel}>Currency</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{currency}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={handleAppearanceSelect} testID="appearance-setting">
              <View style={styles.rowLeft}>
                <Moon size={20} color={Colors.primary} />
                <Text style={styles.rowLabel}>Appearance</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{appearance}</Text>
              </View>
            </TouchableOpacity>
          </View>
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
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
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
    borderBottomColor: Colors.borderLight,
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
    color: Colors.text,
  },
  rowHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rowValue: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
