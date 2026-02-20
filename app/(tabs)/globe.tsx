import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, G, Text as SvgText } from 'react-native-svg';
import {
  Globe,
  X,
  MapPin,
  Calendar,
  Camera,
  ImagePlus,
  ChevronDown,
  ChevronRight,
  Plane,
  Moon,
  Image,
} from 'lucide-react-native';
import { Image as RNImage } from 'react-native';
import { useTripsStore } from '@/store/useTripsStore';
import {
  COUNTRY_PATHS,
  CITY_MARKERS,
  SVG_WIDTH,
  SVG_HEIGHT,
  TOTAL_COUNTRIES_WORLD,
  COUNTRY_NAME_TO_CODE,
} from '@/constants/countryPaths';

const { width } = Dimensions.get('window');
const MAP_CARD_WIDTH = width - 40;
const MAP_SVG_WIDTH = MAP_CARD_WIDTH - 24;
const MAP_SVG_HEIGHT = MAP_SVG_WIDTH * 0.5;

interface CountryGroup {
  country: string;
  countryCode: string;
  trips: { id: string; name: string; destination: string; startDate: string; endDate: string; nights: number }[];
  totalTrips: number;
  totalNights: number;
}

interface TripMemory {
  id: string;
  name: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  nights: number;
  memoryThumbnails: string[];
}

interface PlaceDetail {
  id: string;
  name: string;
  country: string;
  dateVisited: string;
  hotels: string[];
  totalNights: number;
  tripName: string;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${s.toLocaleDateString('en-US', opts)} — ${e.toLocaleDateString('en-US', opts)}`;
}

function TripMemoryModal({
  visible,
  detail,
  onClose,
}: {
  visible: boolean;
  detail: PlaceDetail | null;
  onClose: () => void;
}) {
  if (!detail) return null;

  const placeholderPhotos = [1, 2, 3, 4, 5, 6];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer} edges={['top']}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderContent}>
            <Text style={styles.modalTitle}>{detail.name}</Text>
            <Text style={styles.modalSubtitle}>{detail.country}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={22} color="#1a1a1a" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          <View style={styles.modalInfoCard}>
            <Text style={styles.modalTripName}>{detail.tripName}</Text>
            <View style={styles.modalInfoRow}>
              <Calendar size={16} color="#888" />
              <Text style={styles.modalInfoText}>{detail.dateVisited}</Text>
            </View>
            <View style={styles.modalInfoRow}>
              <Moon size={16} color="#888" />
              <Text style={styles.modalInfoText}>{detail.totalNights} nights</Text>
            </View>
            {detail.hotels.length > 0 && (
              <View style={styles.modalInfoRow}>
                <MapPin size={16} color="#888" />
                <Text style={styles.modalInfoText}>{detail.hotels.join(', ')}</Text>
              </View>
            )}
          </View>

          <View style={styles.mediaSection}>
            <Text style={styles.mediaSectionTitle}>Photos & Videos</Text>
            <View style={styles.mediaGrid}>
              {placeholderPhotos.map((_, index) => (
                <View key={index} style={styles.mediaPlaceholder}>
                  <Image size={20} color="#555" />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.addMediaBtn} activeOpacity={0.8}>
              <ImagePlus size={18} color="#fff" />
              <Text style={styles.addMediaText}>Add photos/videos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.importBtn} disabled activeOpacity={1}>
              <Camera size={18} color="#777" />
              <Text style={styles.importBtnText}>Import from Photos (Coming soon)</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const VISITED_FILL = '#ffffff';
const UNVISITED_FILL = '#2a2a2a';
const BORDER_COLOR = '#444444';
const DOT_COLOR = '#ffffff';

function WorldMapSvg({
  visitedCodes,
  onCountryPress,
}: {
  visitedCodes: string[];
  onCountryPress?: (code: string) => void;
}) {
  const visitedSet = useMemo(() => new Set(visitedCodes), [visitedCodes]);

  const activeDots = useMemo(
    () => CITY_MARKERS.filter((dot) => visitedSet.has(dot.code)),
    [visitedSet],
  );

  return (
    <View style={styles.svgContainer}>
      <Svg
        width={MAP_SVG_WIDTH}
        height={MAP_SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="#0a0a0a" />

        {COUNTRY_PATHS.map((country) => {
          const visited = visitedSet.has(country.id);
          return (
            <Path
              key={country.id}
              d={country.d}
              fill={visited ? VISITED_FILL : UNVISITED_FILL}
              stroke={BORDER_COLOR}
              strokeWidth={0.8}
              strokeLinejoin="round"
              onPress={
                visited && onCountryPress
                  ? () => onCountryPress(country.id)
                  : undefined
              }
            />
          );
        })}

        {activeDots.map((dot) => (
          <G key={`${dot.code}-${dot.label}`}>
            <Circle cx={dot.x} cy={dot.y} r={8} fill="rgba(255,255,255,0.15)" />
            <Circle cx={dot.x} cy={dot.y} r={4} fill={DOT_COLOR} />
            <SvgText
              x={dot.x + 12}
              y={dot.y + 4}
              fill="rgba(255,255,255,0.8)"
              fontSize={14}
              fontWeight="600"
            >
              {dot.label}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
}

function getCountryCode(countryName: string): string {
  if (COUNTRY_NAME_TO_CODE[countryName]) return COUNTRY_NAME_TO_CODE[countryName];
  for (const cp of COUNTRY_PATHS) {
    if (cp.name.toLowerCase() === countryName.toLowerCase()) return cp.id;
  }
  return '';
}

function calculateNights(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}

export default function GlobeScreen() {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<PlaceDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const countryLayoutsRef = useRef<Record<string, number>>({});

  const trips = useTripsStore((s) => s.trips);
  const storedMemories = useTripsStore((s) => s.memories);

  const completedTrips = useMemo(() => trips.filter((t) => t.status === 'completed'), [trips]);

  const countryGroups = useMemo(() => {
    const map = new Map<string, CountryGroup>();
    for (const trip of completedTrips) {
      const country = trip.country;
      if (!country) continue;
      const nights = calculateNights(trip.startDate, trip.endDate);
      const existing = map.get(country);
      const tripData = { id: trip.id, name: trip.name, destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate, nights };
      if (existing) {
        existing.trips.push(tripData);
        existing.totalTrips += 1;
        existing.totalNights += nights;
      } else {
        map.set(country, {
          country,
          countryCode: getCountryCode(country),
          trips: [tripData],
          totalTrips: 1,
          totalNights: nights,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.country.localeCompare(b.country));
  }, [completedTrips]);

  const visitedCountries = useMemo(
    () => countryGroups.map((g) => g.country),
    [countryGroups],
  );
  const visitedCodes = useMemo(
    () => countryGroups.map((g) => g.countryCode).filter(Boolean),
    [countryGroups],
  );

  const codeToCountryName = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of countryGroups) {
      if (group.countryCode) map.set(group.countryCode, group.country);
    }
    return map;
  }, [countryGroups]);

  const totalNightsTraveled = useMemo(
    () => completedTrips.reduce((sum, t) => sum + calculateNights(t.startDate, t.endDate), 0),
    [completedTrips],
  );

  const worldPercent = Math.round((visitedCountries.length / TOTAL_COUNTRIES_WORLD) * 100);

  const expandAndScrollToCountry = useCallback((countryName: string) => {
    setExpandedCountry(countryName);
    setTimeout(() => {
      const yPos = countryLayoutsRef.current[countryName];
      if (yPos != null && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: yPos - 80, animated: true });
      }
    }, 100);
  }, []);

  const handleCountryPress = useCallback(
    (code: string) => {
      const name = codeToCountryName.get(code);
      if (name) {
        expandAndScrollToCountry(name);
      }
    },
    [codeToCountryName, expandAndScrollToCountry],
  );

  const handleChipPress = useCallback(
    (country: string) => {
      expandAndScrollToCountry(country);
    },
    [expandAndScrollToCountry],
  );

  const toggleCountry = useCallback((country: string) => {
    setExpandedCountry((prev) => (prev === country ? null : country));
  }, []);

  const buildTripMemories = useCallback((group: CountryGroup): TripMemory[] => {
    return group.trips
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .map((t) => {
        const thumbs = storedMemories
          .filter((m) => m.tripId === t.id)
          .slice(0, 3)
          .map((m) => m.uri);
        return {
          id: t.id,
          name: t.name,
          city: t.destination,
          country: group.country,
          startDate: t.startDate,
          endDate: t.endDate,
          nights: t.nights,
          memoryThumbnails: thumbs,
        };
      });
  }, [storedMemories]);

  const openTripMemory = useCallback((memory: TripMemory) => {
    setSelectedDetail({
      id: memory.id,
      name: memory.city,
      country: memory.country,
      dateVisited: formatDateRange(memory.startDate, memory.endDate),
      hotels: [],
      totalNights: memory.nights,
      tripName: memory.name,
    });
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedDetail(null);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Globe size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.title}>Globe</Text>
            <Text style={styles.subtitle}>Your travel footprint</Text>
          </View>
        </View>

        <View style={styles.mapCard}>
          <WorldMapSvg visitedCodes={visitedCodes} onCountryPress={handleCountryPress} />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {visitedCountries.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.countryChip}
                activeOpacity={0.7}
                onPress={() => handleChipPress(c)}
              >
                <Text style={styles.countryChipText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inTotalCard}>
          <Text style={styles.inTotalHeader}>In Total</Text>
          <View style={styles.inTotalRow}>
            <View style={styles.inTotalItem}>
              <Text style={styles.inTotalBigNumber}>{worldPercent}%</Text>
              <Text style={styles.inTotalSmallLabel}>of the world</Text>
            </View>
            <View style={styles.inTotalDivider} />
            <View style={styles.inTotalItem}>
              <Text style={styles.inTotalBigNumber}>{visitedCountries.length}</Text>
              <Text style={styles.inTotalSmallLabel}>countries</Text>
            </View>
          </View>
          <Text style={styles.inTotalFootnote}>Out of {TOTAL_COUNTRIES_WORLD} UN Countries</Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Travel Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{visitedCountries.length}</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedTrips.length}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalNightsTraveled}</Text>
              <Text style={styles.statLabel}>Nights</Text>
            </View>
          </View>
        </View>

        <View style={styles.memoriesSection}>
          <Text style={styles.sectionTitle}>Memories</Text>

          {countryGroups.length === 0 && (
            <View style={styles.emptyMemories}>
              <Plane size={32} color="#bbb" />
              <Text style={styles.emptyMemoriesText}>Complete a trip to see your memories here</Text>
            </View>
          )}

          {countryGroups.map((group) => {
            const isExpanded = expandedCountry === group.country;
            const memories = isExpanded ? buildTripMemories(group) : [];

            return (
              <View
                key={group.country}
                style={styles.countryAccordion}
                onLayout={(e) => {
                  countryLayoutsRef.current[group.country] = e.nativeEvent.layout.y;
                }}
              >
                <TouchableOpacity
                  style={styles.countryRow}
                  activeOpacity={0.7}
                  onPress={() => toggleCountry(group.country)}
                >
                  <View style={styles.countryFlag}>
                    <MapPin size={16} color="#fff" />
                  </View>
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryName}>{group.country}</Text>
                    <Text style={styles.countryMeta}>
                      {group.totalTrips} {group.totalTrips === 1 ? 'trip' : 'trips'} · {group.totalNights} nights
                    </Text>
                  </View>

                  {isExpanded ? (
                    <ChevronDown size={20} color="#888" />
                  ) : (
                    <ChevronRight size={20} color="#888" />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.tripsList}>
                    {memories.map((memory) => (
                      <TouchableOpacity
                        key={memory.id}
                        style={styles.tripMemoryCard}
                        activeOpacity={0.7}
                        onPress={() => openTripMemory(memory)}
                      >
                        <View style={styles.tripMemoryLeft}>
                          <View style={styles.tripIconCircle}>
                            <Plane size={14} color="#fff" />
                          </View>
                          <View style={styles.tripMemoryInfo}>
                            <Text style={styles.tripMemoryTitle}>{memory.name}</Text>
                            <Text style={styles.tripMemoryCity}>{memory.city}</Text>
                            <Text style={styles.tripMemoryDates}>
                              {formatDateRange(memory.startDate, memory.endDate)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.tripMemoryRight}>
                          {memory.memoryThumbnails.length > 0 && (
                            <View style={styles.miniPhotoRow}>
                              {memory.memoryThumbnails.map((uri, i) => (
                                <RNImage key={i} source={{ uri }} style={styles.miniPhotoImage} />
                              ))}
                            </View>
                          )}
                          <ChevronRight size={16} color="#aaa" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <TripMemoryModal
        visible={modalVisible}
        detail={selectedDetail}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  mapCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    padding: 12,
    overflow: 'hidden',
  },
  svgContainer: {
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 4,
  },
  countryChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countryChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#ccc',
  },
  inTotalCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inTotalHeader: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#aaa',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 14,
  },
  inTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  inTotalItem: {
    alignItems: 'center',
    flex: 1,
  },
  inTotalBigNumber: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#1a1a1a',
  },
  inTotalSmallLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  inTotalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e8e8e8',
  },
  inTotalFootnote: {
    fontSize: 12,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 14,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500' as const,
  },
  memoriesSection: {
    marginBottom: 20,
  },
  countryAccordion: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  countryFlag: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  countryMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  photoStrip: {
    flexDirection: 'row',
    gap: 3,
  },
  photoStripThumb: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripsList: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  tripMemoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  tripMemoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  tripIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripMemoryInfo: {
    flex: 1,
  },
  tripMemoryTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  tripMemoryCity: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
  tripMemoryDates: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 2,
  },
  tripMemoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniPhotoRow: {
    flexDirection: 'row',
    gap: 3,
  },
  miniPhoto: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 100,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1a1a1a',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    flex: 1,
  },
  modalInfoCard: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 14,
    gap: 10,
  },
  modalTripName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalInfoText: {
    fontSize: 14,
    color: '#555',
  },
  mediaSection: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
  mediaSectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaPlaceholder: {
    width: (width - 56) / 3,
    height: (width - 56) / 3,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderStyle: 'dashed',
  },
  modalActions: {
    padding: 20,
    gap: 10,
    marginTop: 12,
  },
  addMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    borderRadius: 12,
  },
  addMediaText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
  },
  importBtnText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#aaa',
  },
  emptyMemories: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 20,
    gap: 10,
  },
  emptyMemoriesText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
  miniPhotoImage: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
});
