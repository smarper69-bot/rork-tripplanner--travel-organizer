import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Mail } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const profile = usePreferencesStore((s) => s.profile);
  const setProfile = usePreferencesStore((s) => s.setProfile);

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  const setUserName = useOnboardingStore((s) => s.setUserName);
  const setUserEmail = useOnboardingStore((s) => s.setUserEmail);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter your name.');
      return;
    }
    void setProfile({ name: name.trim(), email: email.trim() });
    void setUserName(name.trim());
    if (email.trim()) {
      void setUserEmail(email.trim());
    }
    console.log('[PersonalInfo] Saved profile:', name.trim(), email.trim());
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="back-button">
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Personal Information</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputRow}>
              <User size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
                testID="name-input"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Mail size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Your email"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                testID="email-input"
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} testID="save-button">
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
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
  flex: {
    flex: 1,
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
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
});
