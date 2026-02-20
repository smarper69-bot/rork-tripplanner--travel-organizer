import React, { useState, useRef, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  Dimensions, Modal, TextInput, Alert, Platform
} from 'react-native';
import { TripIcon, StoredItineraryItem, StoredStay, StoredMemory } from '@/types/trip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, Share2, Edit3, Calendar, MapPin, 
  Users, ChevronRight, Plus, Clock, DollarSign,
  Hotel, Image as ImageIcon, Camera, Utensils, Car, ShoppingBag,
  Flower2, Church, Palmtree, Mountain, Sun, Landmark, Trees, Snowflake, Tent,
  Check, X, Trash2, FileText
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import ActivityCard from '@/components/ActivityCard';
import CalendarPicker from '@/components/CalendarPicker';
import { useTripsStore } from '@/store/useTripsStore';

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
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const scrollViewRef = useRef<ScrollView>(null);
  const tabScrollRef = useRef<ScrollView>(null);

  const trip = useTripsStore((s) => s.trips.find((t) => t.id === id));
  const itineraryItems = useTripsStore((s) => s.itineraryItems.filter((i) => i.tripId === id));
  const tripStays = useTripsStore((s) => s.stays.filter((s) => s.tripId === id));
  const tripMemories = useTripsStore((s) => s.memories.filter((m) => m.tripId === id));
  const updateTrip = useTripsStore((s) => s.updateTrip);
  const addItineraryItem = useTripsStore((s) => s.addItineraryItem);
  const deleteItineraryItem = useTripsStore((s) => s.deleteItineraryItem);
  const addStay = useTripsStore((s) => s.addStay);
  const deleteStay = useTripsStore((s) => s.deleteStay);
  const addMemory = useTripsStore((s) => s.addMemory);
  const deleteMemory = useTripsStore((s) => s.deleteMemory);

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
      case 'upcoming': return '#3B82F6';
      case 'ongoing': return '#10B981';
      case 'completed': return '#8B5CF6';
      default: return Colors.textSecondary;
    }
  };

  const handleTabPress = (tabId: TabType) => {
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
    Alert.alert('Delete Memory', 'Remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMemory(memoryId) },
    ]);
  };

  const handleSaveBudget = () => {
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
            <Clock size={18} color={Colors.textSecondary} />
            <Text style={styles.overviewStatValue}>{tripDays} days</Text>
            <Text style={styles.overviewStatLabel}>{tripNights} nights</Text>
          </View>
          <View style={styles.overviewStatDivider} />
          <View style={styles.overviewStatItem}>
            <DollarSign size={18} color={Colors.textSecondary} />
            <Text style={styles.overviewStatValue}>${trip.totalBudget.toLocaleString()}</Text>
            <Text style={styles.overviewStatLabel}>Total budget</Text>
          </View>
          <View style={styles.overviewStatDivider} />
          <View style={styles.overviewStatItem}>
            <Users size={18} color={Colors.textSecondary} />
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
                      <Clock size={14} color={Colors.textMuted} />
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
            <Plus size={18} color={Colors.primary} />
            <Text style={styles.addItemText}>Add Activity</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Calendar size={40} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No plans yet</Text>
          <Text style={styles.emptyText}>Start adding activities to your itinerary</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => setShowItineraryForm(true)}>
            <Plus size={18} color={Colors.textLight} />
            <Text style={styles.emptyButtonText}>Add Activity</Text>
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
            <Edit3 size={18} color={Colors.primary} />
            <Text style={styles.addItemText}>Update Budget</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyState}>
          <DollarSign size={40} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Set a budget to track spending</Text>
          <Text style={styles.emptyText}>Keep track of your trip expenses</Text>
          <TouchableOpacity 
            style={styles.emptyButton} 
            onPress={() => {
              setBudgetTotalInput('');
              setBudgetSpentInput('0');
              setShowBudgetEdit(true);
            }}
          >
            <Plus size={18} color={Colors.textLight} />
            <Text style={styles.emptyButtonText}>Set Budget</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderStays = () => (
    <View style={styles.tabContentInner}>
      {tripStays.length > 0 ? (
        <>
          {tripStays.map((stay) => (
            <View key={stay.id} style={styles.stayCard}>
              <View style={styles.stayHeader}>
                <View style={styles.stayIconContainer}>
                  <Hotel size={22} color={Colors.primary} />
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
            <Plus size={18} color={Colors.primary} />
            <Text style={styles.addItemText}>Add Another Stay</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Hotel size={40} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No stays added yet</Text>
          <Text style={styles.emptyText}>Add accommodations for your trip</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => setShowStayForm(true)}>
            <Plus size={18} color={Colors.textLight} />
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
            <Camera size={18} color={Colors.primary} />
            <Text style={styles.addItemText}>Add Photos</Text>
          </TouchableOpacity>
          <Text style={styles.hintText}>Long press a photo to delete</Text>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Camera size={40} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No memories yet</Text>
          <Text style={styles.emptyText}>
            Add photos and videos from your trip
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAddMemory}>
            <Camera size={18} color={Colors.textLight} />
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
      <View style={styles.container}>
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
                  <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.heroActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Edit3 size={18} color={Colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Share2 size={18} color={Colors.text} />
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
                  <MapPin size={16} color={Colors.textSecondary} />
                  <Text style={styles.heroLocationText}>
                    {trip.destination}, {trip.country}
                  </Text>
                </View>
                <View style={styles.heroDate}>
                  <Calendar size={14} color={Colors.textSecondary} />
                  <Text style={styles.heroDateText}>
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </View>

          <View style={styles.content}>
            <View style={styles.collaboratorsSection}>
              <Text style={styles.sectionLabel}>Travelers</Text>
              <View style={styles.collaboratorsRow}>
                {trip.collaborators.map((collab, index) => (
                  <Image
                    key={collab.id}
                    source={{ uri: collab.avatar }}
                    style={[styles.collaboratorAvatar, { marginLeft: index > 0 ? -12 : 0 }]}
                  />
                ))}
                <TouchableOpacity 
                  style={styles.addCollaborator}
                  onPress={() => router.push(`/collaboration/${trip.id}` as any)}
                >
                  <Users size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
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
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.formInput}
              placeholder="Activity title"
              placeholderTextColor={Colors.textMuted}
              value={itineraryTitle}
              onChangeText={setItineraryTitle}
            />
            <TouchableOpacity style={styles.formDateBtn} onPress={() => setShowItineraryCalendar(true)}>
              <Calendar size={18} color={Colors.textSecondary} />
              <Text style={[styles.formDateText, !itineraryDate && { color: Colors.textMuted }]}>
                {itineraryDate ? formatDate(itineraryDate) : 'Select date'}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={styles.formInput}
              placeholder="Time (e.g. 09:00)"
              placeholderTextColor={Colors.textMuted}
              value={itineraryTime}
              onChangeText={setItineraryTime}
            />
            <TextInput
              style={[styles.formInput, { height: 80, textAlignVertical: 'top' as const }]}
              placeholder="Notes (optional)"
              placeholderTextColor={Colors.textMuted}
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
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.formInput}
              placeholder="Hotel / accommodation name"
              placeholderTextColor={Colors.textMuted}
              value={stayName}
              onChangeText={setStayName}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Address (optional)"
              placeholderTextColor={Colors.textMuted}
              value={stayAddress}
              onChangeText={setStayAddress}
            />
            <TouchableOpacity style={styles.formDateBtn} onPress={() => setShowStayCheckInCalendar(true)}>
              <Calendar size={18} color={Colors.textSecondary} />
              <Text style={[styles.formDateText, !stayCheckIn && { color: Colors.textMuted }]}>
                {stayCheckIn ? `Check-in: ${formatDate(stayCheckIn)}` : 'Select check-in date'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.formDateBtn} onPress={() => setShowStayCheckOutCalendar(true)}>
              <Calendar size={18} color={Colors.textSecondary} />
              <Text style={[styles.formDateText, !stayCheckOut && { color: Colors.textMuted }]}>
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
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.formLabel}>Total Budget ($)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. 5000"
              placeholderTextColor={Colors.textMuted}
              value={budgetTotalInput}
              onChangeText={setBudgetTotalInput}
              keyboardType="numeric"
            />
            <Text style={styles.formLabel}>Amount Spent ($)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. 1200"
              placeholderTextColor={Colors.textMuted}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  heroContainer: {
    height: 300,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  heroLocationText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  heroDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  collaboratorsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  collaboratorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collaboratorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  addCollaborator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -12,
    borderWidth: 2,
    borderColor: Colors.background,
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
    backgroundColor: Colors.surface,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.text,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textLight,
  },
  tabContent: {},
  tabContentInner: {},
  
  overviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  overviewCardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
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
    color: Colors.text,
    marginTop: 6,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  overviewStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.borderLight,
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
    color: Colors.text,
  },
  budgetSummaryOf: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  budgetBarBg: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    marginBottom: 8,
  },
  budgetBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  budgetRemaining: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
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
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
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
    color: Colors.text,
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
    color: Colors.text,
  },
  itineraryDayDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  itineraryItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
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
    color: Colors.primary,
  },
  itineraryItemContent: {
    flex: 1,
  },
  itineraryItemTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  itineraryItemNotes: {
    fontSize: 13,
    color: Colors.textSecondary,
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
    paddingVertical: 50,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.primary,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  
  budgetOverviewCard: {
    backgroundColor: Colors.surface,
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
    color: Colors.textMuted,
    marginBottom: 4,
  },
  budgetTotalValue: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  budgetHeaderRight: {
    alignItems: 'flex-end',
  },
  budgetSpentLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  budgetSpentValue: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  budgetBarBgLarge: {
    height: 10,
    backgroundColor: Colors.borderLight,
    borderRadius: 5,
    marginBottom: 10,
  },
  budgetBarFillLarge: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  budgetFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetRemainingLarge: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  budgetPercentage: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textMuted,
  },
  
  stayCard: {
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.primary + '12',
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
    color: Colors.text,
    marginBottom: 2,
  },
  stayAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  stayDates: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
  },
  stayDateItem: {
    flex: 1,
  },
  stayDateLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  stayDateValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  stayDateDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
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
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 12,
  },
  formDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  formDateText: {
    fontSize: 15,
    color: Colors.text,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  formSaveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  formSaveBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
});
