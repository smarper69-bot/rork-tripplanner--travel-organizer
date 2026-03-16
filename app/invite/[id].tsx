import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ArrowLeft, MapPin, Calendar, Users, Plane, UserPlus, Check,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTripsStore } from '@/store/useTripsStore';

export default function JoinTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [joined, setJoined] = useState(false);
  const [joinedTripId, setJoinedTripId] = useState<string | null>(null);

  const getTripByInviteId = useTripsStore((s) => s.getTripByInviteId);
  const joinTrip = useTripsStore((s) => s.joinTrip);

  const trip = useMemo(() => {
    if (!id) return undefined;
    return getTripByInviteId(id);
  }, [id, getTripByInviteId]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleJoin = () => {
    if (!userName.trim()) {
      Alert.alert('Enter your name', 'Please enter your name to join this trip.');
      return;
    }
    if (!id) return;
    const tripId = joinTrip(id, userName.trim());
    if (tripId) {
      setJoined(true);
      setJoinedTripId(tripId);
      console.log('[JoinTrip] Successfully joined trip:', tripId);
    } else {
      Alert.alert('Error', 'Could not join this trip. The invite link may be invalid.');
    }
  };

  const handleOpenTrip = () => {
    if (joinedTripId) {
      router.replace(`/trip/${joinedTripId}` as any);
    }
  };

  if (!trip) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.centerContent}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <Plane size={18} color="#fff" />
              </View>
              <Text style={styles.logoText}>Tripla</Text>
            </View>
            <Text style={styles.errorTitle}>Invite not found</Text>
            <Text style={styles.errorSub}>
              This invite link may have expired or the trip no longer exists.
            </Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (joined) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.centerContent}>
            <View style={styles.successIcon}>
              <Check size={32} color="#fff" />
            </View>
            <Text style={styles.successTitle}>You're in!</Text>
            <Text style={styles.successSub}>
              You've joined "{trip.name}". You can now view and edit this trip.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleOpenTrip}>
              <Plane size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Open Trip</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const owner = trip.collaborators.find((c) => c.role === 'owner');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <Plane size={16} color="#fff" />
              </View>
              <Text style={styles.logoText}>Tripla</Text>
            </View>
            <Text style={styles.inviteLabel}>You've been invited to join a trip</Text>
          </View>

          <View style={styles.tripCard}>
            <Text style={styles.tripName}>{trip.name}</Text>
            <View style={styles.tripMetaRow}>
              <MapPin size={15} color={Colors.textSecondary} />
              <Text style={styles.tripMetaText}>
                {trip.destination}, {trip.country}
              </Text>
            </View>
            <View style={styles.tripMetaRow}>
              <Calendar size={15} color={Colors.textSecondary} />
              <Text style={styles.tripMetaText}>
                {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              </Text>
            </View>
            {owner && (
              <View style={styles.ownerRow}>
                <Image source={{ uri: owner.avatar }} style={styles.ownerAvatar} />
                <View>
                  <Text style={styles.ownerLabel}>Organized by</Text>
                  <Text style={styles.ownerName}>{trip.ownerName || owner.name}</Text>
                </View>
              </View>
            )}

            {trip.collaborators.length > 1 && (
              <View style={styles.travelersRow}>
                <Users size={15} color={Colors.textSecondary} />
                <Text style={styles.travelersText}>
                  {trip.collaborators.length} traveler{trip.collaborators.length !== 1 ? 's' : ''} already joined
                </Text>
              </View>
            )}
          </View>

          <View style={styles.joinSection}>
            <Text style={styles.joinLabel}>Enter your name to join</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
              value={userName}
              onChangeText={setUserName}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleJoin}
            />
            <TouchableOpacity
              style={[styles.joinBtn, !userName.trim() && styles.joinBtnDisabled]}
              onPress={handleJoin}
              activeOpacity={0.8}
              disabled={!userName.trim()}
            >
              <UserPlus size={18} color="#fff" />
              <Text style={styles.joinBtnText}>Join Trip</Text>
            </TouchableOpacity>
            <Text style={styles.joinDisclaimer}>
              You'll be added as a collaborator and can edit the trip.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  navBack: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  inviteLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tripCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  tripName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  tripMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tripMetaText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  ownerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.borderLight,
  },
  ownerLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  travelersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  travelersText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  joinSection: {
    alignItems: 'center',
  },
  joinLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  nameInput: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    marginBottom: 12,
  },
  joinBtnDisabled: {
    opacity: 0.4,
  },
  joinBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  joinDisclaimer: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 28,
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    width: '100%',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
