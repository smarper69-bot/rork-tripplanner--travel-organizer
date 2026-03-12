import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText, Shield, Trash2, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function PrivacySecurityScreen() {
  const router = useRouter();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Account deletion is not yet available. Please contact support for assistance.');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="back-button">
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Security</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => Alert.alert('Privacy Policy', 'We value your privacy. Your data is stored locally on your device and is not shared with third parties. We only collect anonymous usage data to improve the app experience.\n\nFor the full privacy policy, visit our website.')}
              testID="privacy-policy"
            >
              <View style={styles.rowLeft}>
                <FileText size={20} color={Colors.textSecondary} />
                <Text style={styles.rowLabel}>Privacy Policy</Text>
              </View>
              <ChevronRight size={20} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={() => Alert.alert('Terms of Service', 'By using Tripla, you agree to our terms of service. The app is provided as-is for personal travel planning purposes.\n\nFor the full terms of service, visit our website.')}
              testID="terms-of-service"
            >
              <View style={styles.rowLeft}>
                <Shield size={20} color={Colors.textSecondary} />
                <Text style={styles.rowLabel}>Terms of Service</Text>
              </View>
              <ChevronRight size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={handleDeleteAccount}
              testID="delete-account"
            >
              <View style={styles.rowLeft}>
                <Trash2 size={20} color="#D32F2F" />
                <Text style={styles.deleteLabel}>Delete Account</Text>
              </View>
              <ChevronRight size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.deleteHint}>
            Permanently delete your account and all associated data.
          </Text>
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
  },
  rowLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  deleteLabel: {
    fontSize: 15,
    color: '#D32F2F',
  },
  deleteHint: {
    fontSize: 13,
    color: Colors.textMuted,
    paddingHorizontal: 24,
    marginTop: 8,
  },
});
