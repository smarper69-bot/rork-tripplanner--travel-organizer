import React, { useState, useRef, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  Dimensions, Modal, TextInput, Alert, Platform, Share
} from 'react-native';
import { TripIcon, StoredItineraryItem } from '@/types/trip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, Share2, Edit3, Calendar, MapPin, 
  Users, Plus, Clock, DollarSign,
  Hotel, Camera, Heart, BarChart3,
  Flower2, Church, Palmtree, Mountain, Sun, Landmark, Trees, Snowflake, Tent,
  X, Trash2, ExternalLink, Plane, Link2, Copy, Check,
  Crown, UserPlus, UserMinus
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useUserAvatar } from '@/hooks/useUserProfile';
import { hapticHeavy, hapticSuccess, hapticSelection } from '@/utils/haptics';

import CalendarPicker from '@/components/CalendarPicker';
import { useTripsStore } from '@/store/useTripsStore';
import { openHotelSearch, openFlightSearch } from '@/utils/bookingLinks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'overview' | 'itinerary' | 'budget' | 'stays' | 'memories';

const TABS: { id: TabType; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'budget', label: 'Budget' },
  { id: 'stays', label: 'Stays' },
  { id: 'memories', label: 'Memories' },
];

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const userAvatar = useUserAvatar();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const scrollViewRef = useRef<ScrollView>(null);
  const tabScrollRef = useRef<ScrollView>(null);

  const trips = useTripsStore((s) => s.trips);
  const allItineraryItems = useTripsStore((s) => s.itineraryItems);
  const allStays = useTripsStore((s) => s.stays);
  const allMemories = useTripsStore((s) => s.memories);
  const updateTrip = useTripsStore((s) => s.updateTrip);
  const deleteTripAction = useTripsStore((s) => s.deleteTrip);
  const generateInviteLink = useTripsStore((s) => s.generateInviteLink);
  const removeCollaborator = useTripsStore((s) => s.removeCollaborator);
  const addItineraryItem = useTripsStore((s) => s.addItineraryItem);
  const deleteItineraryItem = useTripsStore((s) => s.deleteItineraryItem);
  const addStay = useTripsStore((s) => s.addStay);
  const deleteStay = useTripsStore((s) => s.deleteStay);
  const addMemory = useTripsStore((s) => s.addMemory);
  const deleteMemory = useTripsStore((s) => s.deleteMemory);

  const styles = createTripStyles(colors);

  const trip = useMemo(() => trips.find((t) => t.id === id), [trips, id]);
  const itineraryItems = useMemo(() => allItineraryItems.filter((i) => i.tripId === id), [allItineraryItems, id]);
  const tripStays = useMemo(() => allStays.filter((s) => s.tripId === id), [allStays, id]);
  const tripMemories = useMemo(() => allMemories.filter((m) => m.tripId === id), [allMemories, id]);

  const [showItineraryForm, setShowItineraryForm] = useState(false);
  const [itineraryTitle, setItineraryTitle] = useState('');
  const [itineraryDate, setItineraryDate] = useState('');
  const [itineraryTime, setItineraryTime] = useState('');
  const [itineraryNotes, setItineraryNotes] = useState('');
  const [showItineraryCalendar, setShowItineraryCalendar] = useState(false);

  const [showStayForm, setShowStayForm] = useState(false);
  const [stayName, setStayName] = useState('');
  const [stayAddress, setStayAddress] = useState('');
  const [stayCheckIn, setStayCheckIn] = useState('');
  const [stayCheckOut, setStayCheckOut] = useState('');
  const [showStayCheckInCalendar, setShowStayCheckInCalendar] = useState(false);
  const [showStayCheckOutCalendar, setShowStayCheckOutCalendar] = useState(false);

  const [showBudgetEdit, setShowBudgetEdit] = useState(false);
  const [budgetTotalInput, setBudgetTotalInput] = useState('');
  const [budgetSpentInput, setBudgetSpentInput] = useState('');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const getIconComponent = (iconName: TripIcon) => {
    const iconMap: Record<TripIcon, React.ComponentType<{ size: number; color: string }>> = {
      'cherry-blossom': Flower2,
      'cathedral': Church,
      'palm-tree': Palmtree,
      'mountain': Mountain,
      'sun': Sun,
      'landmark': Landmark,
      'trees': Trees,
      'snowflake': Snowflake,
      'tent': Tent,
    };
    return iconMap[iconName] || Landmark;
  };

  if (!trip) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Trip not found</Text>
      </View>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateTripDays = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  };

  const tripDays = calculateTripDays();
  const tripNights = tripDays;
  const budgetProgress = trip.totalBudget > 0 ? (trip.spentBudget / trip.totalBudget) * 100 : 0;
  const IconComponent = getIconComponent(trip.icon);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Planning';
      case 'upcoming': return 'Upcoming';
      case 'ongoing': return 'In Progress';
      case 'completed': return 'Past';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return '#6B7280';
      case 'upcoming': return colors.accent;
      case 'ongoing': return '#059669';
      case 'completed': return '#7C3AED';
      default: return colors.textSecondary;
    }
  };

  const handleTabPress = (tabId: TabType) => {
    hapticSelection();
    setActiveTab(tabId);
  };

  const groupedItinerary = useMemo(() => {
    const groups: Record<string, StoredItineraryItem[]> = {};
    for (const item of itineraryItems) {
      const dateKey = item.date.split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, items]) => ({ date, items: items.sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')) }));
  }, [itineraryItems]);

  const handleSaveItinerary = () => {
    if (!itineraryTitle.trim() || !itineraryDate) {
      Alert.alert('Missing Info', 'Please enter a title and select a date.');
      return;
    }
    hapticSuccess();
    addItineraryItem(trip.id, {
      title: itineraryTitle.trim(),
      date: itineraryDate,
      time: itineraryTime.trim() || undefined,
      notes: itineraryNotes.trim() || undefined,
    });
    setItineraryTitle('');
    setItineraryDate('');
    setItineraryTime('');
    setItineraryNotes('');
    setShowItineraryForm(false);
  };

  const handleDeleteItinerary = (itemId: string) => {
    hapticHeavy();
    Alert.alert('Delete Activity', 'Remove this activity?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItineraryItem(itemId) },
    ]);
  };

  const handleSaveStay = () => {
    if (!stayName.trim() || !stayCheckIn || !stayCheckOut) {
      Alert.alert('Missing Info', 'Please enter a name and select check-in/check-out dates.');
      return;
    }
    hapticSuccess();
    addStay(trip.id, {
      name: stayName.trim(),
      address: stayAddress.trim() || undefined,
      checkIn: stayCheckIn,
      checkOut: stayCheckOut,
    });
    setStayName('');
    setStayAddress('');
    setStayCheckIn('');
    setStayCheckOut('');
    setShowStayForm(false);
  };

  const handleDeleteStay = (stayId: string) => {
    hapticHeavy();
    Alert.alert('Delete Stay', 'Remove this stay?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteStay(stayId) },
    ]);
  };

  const handleAddMemory = async () => {
    if (Platform.OS === 'web') {
      addMemory(trip.id, {
        uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
        type: 'photo',
      });
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        addMemory(trip.id, {
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'photo',
        });
      }
    } catch (e) {
      console.log('[TripDetail] Image picker error:', e);
      addMemory(trip.id, {
        uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
        type: 'photo',
      });
    }
  };

  const handleDeleteMemory = (memoryId: string) => {
    hapticHeavy();
    Alert.alert('Delete Memory', 'Remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMemory(memoryId) },
    ]);
  };

  const handleDeleteTrip = () => {
    if (!trip) return;
    hapticHeavy();
    Alert.alert(
      'Remove this trip?',
      'This will delete the trip and its related data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTripAction(trip.id);
            console.log('[TripDetail] Deleted trip:', trip.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleSaveBudget = () => {
    hapticSuccess();
    const total = parseFloat(budgetTotalInput) || 0;
    const spent = parseFloat(budgetSpentInput) || 0;
    updateTrip(trip.id, { totalBudget: total, spentBudget: spent });
    setShowBudgetEdit(false);
  };

  const renderOverview = () => (
    <View style={styles.tabContentInner}>
      <View style={styles.overviewCard}>
        <Text style={styles.overviewCardTitle}>Trip Summary</Text>
        <View style={styles.overviewStats}>
          <View style={styles.overviewStatItem}>
            <Clock size={18} color={colors.textSecondary} />
            <Text style={styles.overviewStatValue}>{tripDays} days</Text>
            <Text style={styles.overviewStatLabel}>{tripNights} nights</Text>
          </View>
          <View style={styles.overviewStatDivider} />
          <View style={styles.overviewStatItem}>
            <DollarSign size={18} color={colors.textSecondary} />
            <Text style={styles.overviewStatValue}>${trip.totalBudget.toLocaleString()}</Text>
            <Text style={styles.overviewStatLabel}>Total budget</Text>
          </View>
          <View style={styles.overviewStatDivider} />
          <View style={styles.overviewStatItem}>
            <Users size={18} color={colors.textSecondary} />
            <Text style={styles.overviewStatValue}>{trip.collaborators.length}</Text>
            <Text style={styles.overviewStatLabel}>Travelers</Text>
          </View>
        </View>
      </View>

      {trip.totalBudget > 0 && (
        <View style={styles.overviewCard}>
          <Text style={styles.overviewCardTitle}>Budget Overview</Text>
          <View style={styles.budgetSummaryRow}>
            <Text style={styles.budgetSummarySpent}>${trip.spentBudget.toLocaleString()}</Text>
            <Text style={styles.budgetSummaryOf}>of ${trip.totalBudget.toLocaleString()}</Text>
          </View>
          <View style={styles.budgetBarBg}>
            <View style={[styles.budgetBarFill, { width: `${Math.min(budgetProgress, 100)}%` }]} />
          </View>
          <Text style={styles.budgetRemaining}>
            ${(trip.totalBudget - trip.spentBudget).toLocaleString()} remaining
          </Text>
        </View>
      )}

      <View style={styles.bookingCtaSection}>
        <Text style={styles.overviewCardTitle}>Book for this trip</Text>
        <TouchableOpacity
          style={styles.bookingCtaRow}
          activeOpacity={0.7}
          onPress={() => openHotelSearch({ city: trip.destination, country: trip.country, checkIn: trip.startDate, checkOut: trip.endDate })}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
            <Hotel size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bookingCtaTitle}>Find Hotels</Text>
            <Text style={styles.bookingCtaSub}>{trip.destination}</Text>
          </View>
          <ExternalLink size={16} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookingCtaRow}
          activeOpacity={0.7}
          onPress={() => openFlightSearch({ city: trip.destination, country: trip.country, departDate: trip.startDate, returnDate: trip.endDate })}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#EEF2FF' }]}>
            <Plane size={20} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bookingCtaTitle}>Find Flights</Text>
            <Text style={styles.bookingCtaSub}>{trip.destination}</Text>
          </View>
          <ExternalLink size={16} color={colors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.bookingDisclaimer}>Opens partner site. We may earn a commission.</Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => setActiveTab('itinerary')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#EEF2FF' }]}>
            <Calendar size={20} color="#6366F1" />
          </View>
          <Text style={styles.quickActionLabel}>Add itinerary</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => setActiveTab('stays')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
            <Hotel size={20} color="#D97706" />
          </View>
          <Text style={styles.quickActionLabel}>Add stays</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => setActiveTab('budget')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
            <DollarSign size={20} color="#059669" />
          </View>
          <Text style={styles.quickActionLabel}>Track budget</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => setActiveTab('memories')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#FCE7F3' }]}>
            <Camera size={20} color="#DB2777" />
          </View>
          <Text style={styles.quickActionLabel}>Add memories</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItinerary = () => (
    <View style={styles.tabContentInner}>
      {groupedItinerary.length > 0 ? (
        <>
          {groupedItinerary.map((group, groupIndex) => (
            <View key={group.date} style={styles.itineraryDayGroup}>
              <View style={styles.itineraryDayHeader}>
                <Text style={styles.itineraryDayLabel}>Day {groupIndex + 1}</Text>
                <Text style={styles.itineraryDayDate}>{formatDate(group.date)}</Text>
              </View>
              {group.items.map((item) => (
                <View key={item.id} style={styles.itineraryItemCard}>
                  <View style={styles.itineraryItemLeft}>
                    {item.time ? (
                      <Text style={styles.itineraryItemTime}>{item.time}</Text>
                    ) : (
                      <Clock size={14} color={colors.textMuted} />
                    )}
                  </View>
                  <View style={styles.itineraryItemContent}>
                    <Text style={styles.itineraryItemTitle}>{item.title}</Text>
                    {item.notes ? (
                      <Text style={styles.itineraryItemNotes}>{item.notes}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteItemBtn}
                    onPress={() => handleDeleteItinerary(item.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
          <TouchableOpacity style={styles.addItemButton} onPress={() => setShowItineraryForm(true)}>
            <Plus size={18} color={colors.accent} />
            <Text style={styles.addItemText}>Add Activity</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconComposed}>
            <View style={styles.emptyIconCircle}>
              <Calendar size={28} color={colors.accent} />
            </View>
            <View style={[styles.emptyIconAccent, { backgroundColor: '#FEF3C7', top: 2, right: -4 }]}>
              <Clock size={12} color="#D97706" />
            </View>
          </View>
          <Text style={styles.emptyTitle}>Plan your days</Text>
          <Text style={styles.emptyText}>Add activities, reservations, and experiences to build your perfect itinerary.</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => {
            hapticSelection();
            setShowItineraryForm(true);
          }}>
            <Plus size={18} color={colors.textLight} />
            <Text style={styles.emptyButtonText}>Add first activity</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderBudget = () => (
    <View style={styles.tabContentInner}>
      {trip.totalBudget > 0 ? (
        <>
          <View style={styles.budgetOverviewCard}>
            <View style={styles.budgetHeaderRow}>
              <View>
                <Text style={styles.budgetTotalLabel}>Total Budget</Text>
                <Text style={styles.budgetTotalValue}>${trip.totalBudget.toLocaleString()}</Text>
              </View>
              <View style={styles.budgetHeaderRight}>
                <Text style={styles.budgetSpentLabel}>Spent</Text>
                <Text style={styles.budgetSpentValue}>${trip.spentBudget.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.budgetBarBgLarge}>
              <View style={[styles.budgetBarFillLarge, { width: `${Math.min(budgetProgress, 100)}%` }]} />
            </View>
            <View style={styles.budgetFooterRow}>
              <Text style={styles.budgetRemainingLarge}>
                ${(trip.totalBudget - trip.spentBudget).toLocaleString()} remaining
              </Text>
              <Text style={styles.budgetPercentage}>{Math.round(budgetProgress)}% used</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.addItemButton} 
            onPress={() => {
              setBudgetTotalInput(trip.totalBudget.toString());
              setBudgetSpentInput(trip.spentBudget.toString());
              setShowBudgetEdit(true);
            }}
          >
            <Edit3 size={18} color={colors.accent} />
            <Text style={styles.addItemText}>Update Budget</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconComposed}>
            <View style={[styles.emptyIconCircle, { backgroundColor: '#D1FAE5' }]}>
              <DollarSign size={28} color="#059669" />
            </View>
            <View style={[styles.emptyIconAccent, { backgroundColor: '#EEF2FF', top: 2, right: -4 }]}>
              <BarChart3 size={12} color="#6366F1" />
            </View>
          </View>
          <Text style={styles.emptyTitle}>Stay on budget</Text>
          <Text style={styles.emptyText}>Set a total budget and track your spending as you go. No surprises when you get home.</Text>
          <TouchableOpacity 
            style={styles.emptyButton} 
            onPress={() => {
              hapticSelection();
              setBudgetTotalInput('');
              setBudgetSpentInput('0');
              setShowBudgetEdit(true);
            }}
          >
            <Plus size={18} color={colors.textLight} />
            <Text style={styles.emptyButtonText}>Set Budget</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderStays = () => (
    <View style={styles.tabContentInner}>
      <TouchableOpacity
        style={styles.bookingCtaRow}
        activeOpacity={0.7}
        onPress={() => openHotelSearch({ city: trip.destination, country: trip.country, checkIn: trip.startDate, checkOut: trip.endDate })}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
          <Hotel size={18} color="#D97706" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bookingCtaTitle}>Search Hotels</Text>
          <Text style={styles.bookingCtaSub}>Find stays in {trip.destination}</Text>
        </View>
        <ExternalLink size={16} color={colors.textMuted} />
      </TouchableOpacity>

      {tripStays.length > 0 ? (
        <>
          {tripStays.map((stay) => (
            <View key={stay.id} style={styles.stayCard}>
              <View style={styles.stayHeader}>
                <View style={styles.stayIconContainer}>
                  <Hotel size={22} color={colors.accent} />
                </View>
                <View style={styles.stayInfo}>
                  <Text style={styles.stayName}>{stay.name}</Text>
                  {stay.address ? <Text style={styles.stayAddress}>{stay.address}</Text> : null}
                </View>
                <TouchableOpacity
                  style={styles.deleteItemBtn}
                  onPress={() => handleDeleteStay(stay.id)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.stayDates}>
                <View style={styles.stayDateItem}>
                  <Text style={styles.stayDateLabel}>Check-in</Text>
                  <Text style={styles.stayDateValue}>{formatDate(stay.checkIn)}</Text>
                </View>
                <View style={styles.stayDateDivider} />
                <View style={styles.stayDateItem}>
                  <Text style={styles.stayDateLabel}>Check-out</Text>
                  <Text style={styles.stayDateValue}>{formatDate(stay.checkOut)}</Text>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addItemButton} onPress={() => setShowStayForm(true)}>
            <Plus size={18} color={colors.accent} />
            <Text style={styles.addItemText}>Add Another Stay</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconComposed}>
            <View style={[styles.emptyIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Hotel size={28} color="#D97706" />
            </View>
            <View style={[styles.emptyIconAccent, { backgroundColor: '#FCE7F3', top: 2, right: -4 }]}>
              <MapPin size={12} color="#DB2777" />
            </View>
          </View>
          <Text style={styles.emptyTitle}>Where are you staying?</Text>
          <Text style={styles.emptyText}>Keep all your accommodation details in one place for easy access during your trip.</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => {
            hapticSelection();
            setShowStayForm(true);
          }}>
            <Plus size={18} color={colors.textLight} />
            <Text style={styles.emptyButtonText}>Add Stay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderMemories = () => (
    <View style={styles.tabContentInner}>
      {tripMemories.length > 0 ? (
        <>
          <View style={styles.memoriesGrid}>
            {tripMemories.map((memory) => (
              <TouchableOpacity
                key={memory.id}
                style={styles.memoryImageWrap}
                onLongPress={() => handleDeleteMemory(memory.id)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: memory.uri }} style={styles.memoryImage} />
                {memory.type === 'video' && (
                  <View style={styles.videoIndicator}>
                    <Text style={styles.videoIndicatorText}>VIDEO</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.addItemButton} onPress={handleAddMemory}>
            <Camera size={18} color={colors.accent} />
            <Text style={styles.addItemText}>Add Photos</Text>
          </TouchableOpacity>
          <Text style={styles.hintText}>Long press a photo to delete</Text>
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconComposed}>
            <View style={[styles.emptyIconCircle, { backgroundColor: '#FCE7F3' }]}>
              <Camera size={28} color="#DB2777" />
            </View>
            <View style={[styles.emptyIconAccent, { backgroundColor: '#DBEAFE', top: 2, right: -4 }]}>
              <Heart size={12} color="#2563EB" />
            </View>
          </View>
          <Text style={styles.emptyTitle}>Capture the moments</Text>
          <Text style={styles.emptyText}>Save your favourite photos and videos from this trip to relive the memories later.</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => {
            hapticSelection();
            void handleAddMemory();
          }}>
            <Camera size={18} color={colors.textLight} />
            <Text style={styles.emptyButtonText}>Add Photos</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'itinerary': return renderItinerary();
      case 'budget': return renderBudget();
      case 'stays': return renderStays();
      case 'memories': return renderMemories();
      default: return renderOverview();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false} ref={scrollViewRef}>
          <View style={[styles.heroContainer, { backgroundColor: trip.iconColor + '15' }]}>
            <View style={styles.heroIconContainer}>
              <IconComponent size={100} color={trip.iconColor} />
            </View>
            
            <SafeAreaView style={styles.heroContent} edges={['top']}>
              <View style={styles.heroHeader}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.heroActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => router.push({ pathname: '/edit-trip', params: { id: trip.id } } as any)}>
                    <Edit3 size={18} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => {
                    setLinkCopied(false);
                    const link = generateInviteLink(trip.id);
                    console.log('[TripDetail] Share button pressed. Generated URL:', link, 'tripId:', trip.id);
                    setInviteLink(link);
                    setShowInviteModal(true);
                  }}>
                    <Share2 size={18} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={handleDeleteTrip} testID="trip-detail-delete">
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.heroInfo}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(trip.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(trip.status) }]}>
                    {getStatusLabel(trip.status)}
                  </Text>
                </View>
                <Text style={styles.heroTitle}>{trip.name}</Text>
                <View style={styles.heroLocation}>
                  <MapPin size={16} color={colors.textSecondary} />
                  <Text style={styles.heroLocationText}>
                    {trip.destination}, {trip.country}
                  </Text>
                </View>
                <View style={styles.heroDate}>
                  <Calendar size={14} color={colors.textSecondary} />
                  <Text style={styles.heroDateText}>
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </View>

          <View style={styles.content}>
            <View style={styles.collaboratorsFullSection}>
              <View style={styles.collabHeader}>
                <Text style={styles.collabHeaderTitle}>Travelers</Text>
                <TouchableOpacity
                  style={styles.inviteSmallBtn}
                  onPress={() => {
                    setLinkCopied(false);
                    const link = generateInviteLink(trip.id);
                    console.log('[TripDetail] Invite button pressed. Generated URL:', link, 'tripId:', trip.id);
                    setInviteLink(link);
                    setShowInviteModal(true);
                  }}
                >
                  <UserPlus size={14} color="#fff" />
                  <Text style={styles.inviteSmallBtnText}>Invite</Text>
                </TouchableOpacity>
              </View>
              {trip.collaborators.map((collab) => {
                const collabAvatar = collab.id === 'self' && userAvatar ? userAvatar : collab.avatar;
                return (
                <View key={collab.id} style={styles.collabMemberRow}>
                  {collabAvatar ? (
                    <Image source={{ uri: collabAvatar }} style={styles.collabMemberAvatar} />
                  ) : (
                    <View style={[styles.collabMemberAvatar, { backgroundColor: colors.borderLight, justifyContent: 'center' as const, alignItems: 'center' as const }]}>
                      <Users size={16} color={colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.collabMemberInfo}>
                    <Text style={styles.collabMemberName}>{collab.name}</Text>
                    <View style={styles.collabRoleBadge}>
                      {collab.role === 'owner' && <Crown size={11} color="#D97706" />}
                      <Text style={[
                        styles.collabRoleText,
                        collab.role === 'owner' && { color: '#D97706' },
                      ]}>
                        {collab.role === 'owner' ? 'Owner' : collab.role === 'editor' ? 'Can edit' : 'View only'}
                      </Text>
                    </View>
                  </View>
                  {collab.role !== 'owner' && (
                    <TouchableOpacity
                      style={styles.collabRemoveBtn}
                      onPress={() => {
                        Alert.alert(
                          'Remove Traveler',
                          `Remove ${collab.name} from this trip?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Remove', style: 'destructive', onPress: () => removeCollaborator(trip.id, collab.id) },
                          ]
                        );
                      }}
                    >
                      <UserMinus size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
                );
              })}
              <TouchableOpacity
                style={styles.collabGroupBtn}
                onPress={() => router.push(`/collaboration/${trip.id}` as any)}
              >
                <Users size={16} color={colors.accent} />
                <Text style={styles.collabGroupBtnText}>Group Planning</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tabsContainer}>
              <ScrollView 
                ref={tabScrollRef}
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScroll}
              >
                {TABS.map((tab) => (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                    onPress={() => handleTabPress(tab.id)}
                  >
                    <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.tabContent}>
              {renderTabContent()}
            </View>
          </View>
        </ScrollView>
      </View>

      <Modal visible={showItineraryForm} transparent animationType="slide" onRequestClose={() => setShowItineraryForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Activity</Text>
              <TouchableOpacity onPress={() => setShowItineraryForm(false)} style={styles.modalCloseBtn}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.formInput}
              placeholder="Activity title"
              placeholderTextColor={colors.textMuted}
              value={itineraryTitle}
              onChangeText={setItineraryTitle}
            />
            <TouchableOpacity style={styles.formDateBtn} onPress={() => setShowItineraryCalendar(true)}>
              <Calendar size={18} color={colors.textSecondary} />
              <Text style={[styles.formDateText, !itineraryDate && { color: colors.textMuted }]}>
                {itineraryDate ? formatDate(itineraryDate) : 'Select date'}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={styles.formInput}
              placeholder="Time (e.g. 09:00)"
              placeholderTextColor={colors.textMuted}
              value={itineraryTime}
              onChangeText={setItineraryTime}
            />
            <TextInput
              style={[styles.formInput, { height: 80, textAlignVertical: 'top' as const }]}
              placeholder="Notes (optional)"
              placeholderTextColor={colors.textMuted}
              value={itineraryNotes}
              onChangeText={setItineraryNotes}
              multiline
            />
            <TouchableOpacity style={styles.formSaveBtn} onPress={handleSaveItinerary}>
              <Text style={styles.formSaveBtnText}>Save Activity</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showStayForm} transparent animationType="slide" onRequestClose={() => setShowStayForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Stay</Text>
              <TouchableOpacity onPress={() => setShowStayForm(false)} style={styles.modalCloseBtn}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.formInput}
              placeholder="Hotel / accommodation name"
              placeholderTextColor={colors.textMuted}
              value={stayName}
              onChangeText={setStayName}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Address (optional)"
              placeholderTextColor={colors.textMuted}
              value={stayAddress}
              onChangeText={setStayAddress}
            />
            <TouchableOpacity style={styles.formDateBtn} onPress={() => setShowStayCheckInCalendar(true)}>
              <Calendar size={18} color={colors.textSecondary} />
              <Text style={[styles.formDateText, !stayCheckIn && { color: colors.textMuted }]}>
                {stayCheckIn ? `Check-in: ${formatDate(stayCheckIn)}` : 'Select check-in date'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.formDateBtn} onPress={() => setShowStayCheckOutCalendar(true)}>
              <Calendar size={18} color={colors.textSecondary} />
              <Text style={[styles.formDateText, !stayCheckOut && { color: colors.textMuted }]}>
                {stayCheckOut ? `Check-out: ${formatDate(stayCheckOut)}` : 'Select check-out date'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.formSaveBtn} onPress={handleSaveStay}>
              <Text style={styles.formSaveBtnText}>Save Stay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showBudgetEdit} transparent animationType="slide" onRequestClose={() => setShowBudgetEdit(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Budget</Text>
              <TouchableOpacity onPress={() => setShowBudgetEdit(false)} style={styles.modalCloseBtn}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.formLabel}>Total Budget ($)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. 5000"
              placeholderTextColor={colors.textMuted}
              value={budgetTotalInput}
              onChangeText={setBudgetTotalInput}
              keyboardType="numeric"
            />
            <Text style={styles.formLabel}>Amount Spent ($)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. 1200"
              placeholderTextColor={colors.textMuted}
              value={budgetSpentInput}
              onChangeText={setBudgetSpentInput}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.formSaveBtn} onPress={handleSaveBudget}>
              <Text style={styles.formSaveBtnText}>Save Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showInviteModal} transparent animationType="slide" onRequestClose={() => setShowInviteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Travelers</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)} style={styles.modalCloseBtn}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inviteDesc}>
              Share this invite link. Anyone who opens it can join your trip as a collaborator.
            </Text>

            <View style={styles.shareLinkContainer}>
              <Link2 size={18} color={colors.accent} />
              <Text style={styles.shareLinkText} numberOfLines={1}>
                {(inviteLink || trip.inviteLink || `https://tripla.app/join/${trip.id}`).replace('https://', '')}
              </Text>
            </View>

            <View style={styles.shareActionsRow}>
              <TouchableOpacity
                style={[styles.shareActionButton, linkCopied && styles.shareActionButtonSuccess]}
                onPress={async () => {
                  const rawLink = inviteLink || generateInviteLink(trip.id);
                  const link = rawLink.startsWith('http') ? rawLink : `https://${rawLink}`;
                  console.log('[TripDetail] Copy link pressed. Full URL:', link);
                  try {
                    await Clipboard.setStringAsync(link);
                    setLinkCopied(true);
                    console.log('[TripDetail] Invite link copied to clipboard:', link);
                    setTimeout(() => setLinkCopied(false), 2500);
                  } catch (e) {
                    console.error('[TripDetail] Failed to copy:', e);
                    Alert.alert('Error', 'Failed to copy link');
                  }
                }}
              >
                {linkCopied ? <Check size={20} color="#fff" /> : <Copy size={20} color="#fff" />}
                <Text style={styles.shareActionText}>{linkCopied ? 'Copied!' : 'Copy Link'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareActionButtonOutline}
                onPress={async () => {
                  const rawLink = inviteLink || generateInviteLink(trip.id);
                  const link = rawLink.startsWith('http') ? rawLink : `https://${rawLink}`;
                  console.log('[TripDetail] Share button pressed. Full URL:', link);
                  try {
                    await Share.share({
                      message: Platform.OS === 'ios'
                        ? `Join my trip "${trip.name}" on TripNest!`
                        : `Join my trip "${trip.name}" on TripNest! ${link}`,
                      url: Platform.OS === 'ios' ? link : undefined,
                      title: `Join Trip: ${trip.name}`,
                    });
                    console.log('[TripDetail] Share sheet opened with URL:', link);
                  } catch (e) {
                    console.error('[TripDetail] Share failed:', e);
                  }
                }}
              >
                <Share2 size={20} color={colors.accent} />
                <Text style={styles.shareActionTextOutline}>Share</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.shareNote}>
              Collaborators can view and edit the itinerary, stays, budget, and more.
            </Text>
          </View>
        </View>
      </Modal>

      <CalendarPicker
        visible={showItineraryCalendar}
        onClose={() => setShowItineraryCalendar(false)}
        onSelect={(date) => {
          setItineraryDate(date);
          setShowItineraryCalendar(false);
        }}
        selectedDate={itineraryDate}
        title="Activity Date"
      />
      <CalendarPicker
        visible={showStayCheckInCalendar}
        onClose={() => setShowStayCheckInCalendar(false)}
        onSelect={(date) => {
          setStayCheckIn(date);
          setShowStayCheckInCalendar(false);
        }}
        selectedDate={stayCheckIn}
        title="Check-in Date"
      />
      <CalendarPicker
        visible={showStayCheckOutCalendar}
        onClose={() => setShowStayCheckOutCalendar(false)}
        onSelect={(date) => {
          setStayCheckOut(date);
          setShowStayCheckOutCalendar(false);
        }}
        selectedDate={stayCheckOut}
        minDate={stayCheckIn || undefined}
        title="Check-out Date"
      />
    </>
  );
}

const createTripStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  heroContainer: {
    height: 320,
  },
  heroIconContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  heroInfo: {},
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  heroLocationText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  heroDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
  collaboratorsFullSection: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  collabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  collabHeaderTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  inviteSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.accent,
    borderRadius: 10,
  },
  inviteSmallBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  collabMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  collabMemberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    backgroundColor: colors.borderLight,
  },
  collabMemberInfo: {
    flex: 1,
  },
  collabMemberName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  collabRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  collabRoleText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  collabRemoveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collabGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 12,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  collabGroupBtnText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.accent,
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabsScroll: {
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textLight,
  },
  tabContent: {},
  tabContentInner: {},
  
  overviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  overviewCardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 14,
  },
  overviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 6,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  overviewStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
  },
  budgetSummaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 10,
  },
  budgetSummarySpent: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
  },
  budgetSummaryOf: {
    fontSize: 14,
    color: colors.textMuted,
  },
  budgetBarBg: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    marginBottom: 8,
  },
  budgetBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  budgetRemaining: {
    fontSize: 13,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.text,
  },
  
  itineraryDayGroup: {
    marginBottom: 16,
  },
  itineraryDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  itineraryDayLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
  },
  itineraryDayDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itineraryItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  itineraryItemLeft: {
    width: 44,
    alignItems: 'center',
  },
  itineraryItemTime: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.accent,
  },
  itineraryItemContent: {
    flex: 1,
  },
  itineraryItemTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  itineraryItemNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteItemBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 6,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center' as const,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  emptyButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: colors.accent,
    borderRadius: 14,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.textLight,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.accent,
  },
  hintText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  
  budgetOverviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  budgetTotalLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  budgetTotalValue: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.text,
  },
  budgetHeaderRight: {
    alignItems: 'flex-end',
  },
  budgetSpentLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  budgetSpentValue: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.accent,
  },
  budgetBarBgLarge: {
    height: 10,
    backgroundColor: colors.borderLight,
    borderRadius: 5,
    marginBottom: 10,
  },
  budgetBarFillLarge: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 5,
  },
  budgetFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetRemainingLarge: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  budgetPercentage: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textMuted,
  },
  
  stayCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  stayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  stayIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stayInfo: {
    flex: 1,
  },
  stayName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  stayAddress: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  stayDates: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  stayDateItem: {
    flex: 1,
  },
  stayDateLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  stayDateValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
  },
  stayDateDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 12,
  },
  
  memoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  memoryImageWrap: {
    width: (SCREEN_WIDTH - 56) / 3,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  memoryImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  videoIndicatorText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#fff',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  formDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  formDateText: {
    fontSize: 15,
    color: colors.text,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  formSaveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  formSaveBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textLight,
  },
  bookingCtaSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bookingCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  bookingCtaTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  bookingCtaSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  bookingDisclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  shareLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  shareLinkText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500' as const,
  },
  shareNote: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 16,
    lineHeight: 18,
    textAlign: 'center',
  },
  inviteDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  shareActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shareActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: colors.accent,
    borderRadius: 14,
  },
  shareActionButtonSuccess: {
    backgroundColor: '#2D9C5A',
  },
  shareActionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  shareActionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  shareActionTextOutline: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.accent,
  },
  emptyIconComposed: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconAccent: {
    position: 'absolute' as const,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
});
