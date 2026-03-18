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
import { openComingSoon } from '@/utils/comingSoon';
import { useThemeColors, useIsDark } from '@/hooks/useThemeColors';
import { ThemeColors } from '@/constants/themes';

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
  colors,
}: {
  visible: boolean;
  detail: PlaceDetail | null;
  onClose: () => void;
  colors: ThemeColors;
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
      <SafeAreaView style={[staticStyles.modalContainer, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[staticStyles.modalHeader, { borderBottomColor: colors.borderLight }]}>
          <View style={staticStyles.modalHeaderContent}>
            <Text style={[staticStyles.modalTitle, { color: colors.text }]}>{detail.name}</Text>
            <Text style={[staticStyles.modalSubtitle, { color: colors.textSecondary }]}>{detail.country}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={[staticStyles.closeButton, { backgroundColor: colors.inputBackground }]}>
            <X size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={staticStyles.modalBody} showsVerticalScrollIndicator={false}>
          <View style={[staticStyles.modalInfoCard, { backgroundColor: colors.surface }]}>
            <Text style={[staticStyles.modalTripName, { color: colors.text }]}>{detail.tripName}</Text>
            <View style={staticStyles.modalInfoRow}>
              <Calendar size={16} color={colors.textMuted} />
              <Text style={[staticStyles.modalInfoText, { color: colors.textSecondary }]}>{detail.dateVisited}</Text>
            </View>
            <View style={staticStyles.modalInfoRow}>
              <Moon size={16} color={colors.textMuted} />
              <Text style={[staticStyles.modalInfoText, { color: colors.textSecondary }]}>{detail.totalNights} nights</Text>
            </View>
            {detail.hotels.length > 0 && (
              <View style={staticStyles.modalInfoRow}>
                <MapPin size={16} color={colors.textMuted} />
                <Text style={[staticStyles.modalInfoText, { color: colors.textSecondary }]}>{detail.hotels.join(', ')}</Text>
              </View>
            )}
          </View>

          <View style={staticStyles.mediaSection}>
            <Text style={[staticStyles.mediaSectionTitle, { color: colors.text }]}>Photos & Videos</Text>
            <View style={staticStyles.mediaGrid}>
              {placeholderPhotos.map((_, index) => (
                <View key={index} style={[staticStyles.mediaPlaceholder, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Image size={20} color={colors.textMuted} />
                </View>
              ))}
            </View>
          </View>

          <View style={staticStyles.modalActions}>
            <TouchableOpacity style={[staticStyles.addMediaBtn, { backgroundColor: colors.text }]} activeOpacity={0.8} onPress={() => openComingSoon('Adding photos from Globe')}>
              <ImagePlus size={18} color={colors.background} />
              <Text style={[staticStyles.addMediaText, { color: colors.background }]}>Add photos/videos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[staticStyles.importBtn, { backgroundColor: colors.cardBg }]} disabled activeOpacity={1}>
              <Camera size={18} color={colors.textMuted} />
              <Text style={[staticStyles.importBtnText, { color: colors.textMuted }]}>Import from Photos (Coming soon)</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function WorldMapSvg({
  visitedCodes,
  onCountryPress,
  isDark,
}: {
  visitedCodes: string[];
  onCountryPress?: (code: string) => void;
  isDark: boolean;
}) {
  const visitedSet = useMemo(() => new Set(visitedCodes), [visitedCodes]);

  const activeDots = useMemo(
    () => CITY_MARKERS.filter((dot) => visitedSet.has(dot.code)),
    [visitedSet],
  );

  const visitedFill = isDark ? '#ffffff' : '#ffffff';
  const unvisitedFill = isDark ? '#2a2a2a' : '#2a2a2a';
  const borderColor = isDark ? '#444444' : '#444444';
  const dotColor = '#ffffff';

  return (
    <View style={staticStyles.svgContainer}>
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
              fill={visited ? visitedFill : unvisitedFill}
              stroke={borderColor}
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
            <Circle cx={dot.x} cy={dot.y} r={4} fill={dotColor} />
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
  const colors = useThemeColors();
  const isDark = useIsDark();
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<PlaceDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const countryLayoutsRef = useRef<Record<string, number>>({});

  const trips = useTripsStore((s) => s.trips);
  const storedMemories = useTripsStore((s) => s.memories);

  const allTrips = trips;

  const countryGroups = useMemo(() => {
    const map = new Map<string, CountryGroup>();
    for (const trip of allTrips) {
      const country = trip.country || trip.destination;
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
  }, [allTrips]);

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
    () => allTrips.reduce((sum, t) => {
      if (!t.startDate || !t.endDate) return sum;
      return sum + calculateNights(t.startDate, t.endDate);
    }, 0),
    [allTrips],
  );

  const worldPercent = Math.floor((visitedCountries.length / TOTAL_COUNTRIES_WORLD) * 100);

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

  const s = createStyles(colors);

  return (
    <SafeAreaView style={[staticStyles.containerBase, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        <View style={staticStyles.header}>
          <View style={[staticStyles.headerIcon, { backgroundColor: colors.text }]}>
            <Globe size={22} color={colors.background} />
          </View>
          <View>
            <Text style={[staticStyles.titleText, { color: colors.text }]}>Globe</Text>
            <Text style={[staticStyles.subtitleText, { color: colors.textSecondary }]}>Your travel footprint</Text>
          </View>
        </View>

        <View style={staticStyles.mapCard}>
          <WorldMapSvg visitedCodes={visitedCodes} onCountryPress={handleCountryPress} isDark={isDark} />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={staticStyles.chipsRow}
          >
            {visitedCountries.map((c) => (
              <TouchableOpacity
                key={c}
                style={staticStyles.countryChip}
                activeOpacity={0.7}
                onPress={() => handleChipPress(c)}
              >
                <Text style={staticStyles.countryChipText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[s.inTotalCard]}>
          <Text style={[staticStyles.inTotalHeaderText, { color: colors.textMuted }]}>In Total</Text>
          <View style={staticStyles.inTotalRow}>
            <View style={staticStyles.inTotalItem}>
              <Text style={[staticStyles.inTotalBigNumber, { color: colors.text }]}>{worldPercent}%</Text>
              <Text style={[staticStyles.inTotalSmallLabel, { color: colors.textSecondary }]}>of the world</Text>
            </View>
            <View style={[staticStyles.inTotalDivider, { backgroundColor: colors.borderLight }]} />
            <View style={staticStyles.inTotalItem}>
              <Text style={[staticStyles.inTotalBigNumber, { color: colors.text }]}>{visitedCountries.length}</Text>
              <Text style={[staticStyles.inTotalSmallLabel, { color: colors.textSecondary }]}>countries</Text>
            </View>
          </View>
          <Text style={[staticStyles.inTotalFootnote, { color: colors.textMuted }]}>Out of {TOTAL_COUNTRIES_WORLD} UN Countries</Text>
        </View>

        <View style={staticStyles.statsSection}>
          <Text style={[staticStyles.sectionTitleText, { color: colors.text }]}>Travel Stats</Text>
          <View style={staticStyles.statsGrid}>
            {[
              { value: visitedCountries.length, label: 'Countries' },
              { value: allTrips.length, label: 'Trips' },
              { value: totalNightsTraveled, label: 'Nights' },
            ].map((stat) => (
              <View key={stat.label} style={[s.statCard]}>
                <Text style={[staticStyles.statValueText, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[staticStyles.statLabelText, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={staticStyles.memoriesSection}>
          <Text style={[staticStyles.sectionTitleText, { color: colors.text }]}>Memories</Text>

          {countryGroups.length === 0 && (
            <View style={staticStyles.emptyMemories}>
              <Plane size={32} color={colors.textMuted} />
              <Text style={[staticStyles.emptyMemoriesText, { color: colors.textMuted }]}>Complete a trip to see your memories here</Text>
            </View>
          )}

          {countryGroups.map((group) => {
            const isExpanded = expandedCountry === group.country;
            const memories = isExpanded ? buildTripMemories(group) : [];

            return (
              <View
                key={group.country}
                style={[s.countryAccordion]}
                onLayout={(e) => {
                  countryLayoutsRef.current[group.country] = e.nativeEvent.layout.y;
                }}
              >
                <TouchableOpacity
                  style={staticStyles.countryRow}
                  activeOpacity={0.7}
                  onPress={() => toggleCountry(group.country)}
                >
                  <View style={[staticStyles.countryFlag, { backgroundColor: colors.text }]}>
                    <MapPin size={16} color={colors.background} />
                  </View>
                  <View style={staticStyles.countryInfo}>
                    <Text style={[staticStyles.countryNameText, { color: colors.text }]}>{group.country}</Text>
                    <Text style={[staticStyles.countryMeta, { color: colors.textSecondary }]}>
                      {group.totalTrips} {group.totalTrips === 1 ? 'trip' : 'trips'} · {group.totalNights} nights
                    </Text>
                  </View>

                  {isExpanded ? (
                    <ChevronDown size={20} color={colors.textMuted} />
                  ) : (
                    <ChevronRight size={20} color={colors.textMuted} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={[staticStyles.tripsList, { borderTopColor: colors.borderLight }]}>
                    {memories.map((memory) => (
                      <TouchableOpacity
                        key={memory.id}
                        style={[staticStyles.tripMemoryCard, { borderBottomColor: colors.borderLight }]}
                        activeOpacity={0.7}
                        onPress={() => openTripMemory(memory)}
                      >
                        <View style={staticStyles.tripMemoryLeft}>
                          <View style={[staticStyles.tripIconCircle, { backgroundColor: colors.surfaceElevated }]}>
                            <Plane size={14} color={colors.text} />
                          </View>
                          <View style={staticStyles.tripMemoryInfo}>
                            <Text style={[staticStyles.tripMemoryTitle, { color: colors.text }]}>{memory.name}</Text>
                            <Text style={[staticStyles.tripMemoryCity, { color: colors.textSecondary }]}>{memory.city}</Text>
                            <Text style={[staticStyles.tripMemoryDates, { color: colors.textMuted }]}>
                              {formatDateRange(memory.startDate, memory.endDate)}
                            </Text>
                          </View>
                        </View>
                        <View style={staticStyles.tripMemoryRight}>
                          {memory.memoryThumbnails.length > 0 && (
                            <View style={staticStyles.miniPhotoRow}>
                              {memory.memoryThumbnails.map((uri, i) => (
                                <RNImage key={i} source={{ uri }} style={staticStyles.miniPhotoImage} />
                              ))}
                            </View>
                          )}
                          <ChevronRight size={16} color={colors.textMuted} />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={staticStyles.bottomPadding} />
      </ScrollView>

      <TripMemoryModal
        visible={modalVisible}
        detail={selectedDetail}
        onClose={closeModal}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  inTotalCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryAccordion: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});

const staticStyles = StyleSheet.create({
  containerBase: {
    flex: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  subtitleText: {
    fontSize: 14,
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
  inTotalHeaderText: {
    fontSize: 13,
    fontWeight: '600' as const,
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
  },
  inTotalSmallLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  inTotalDivider: {
    width: 1,
    height: 40,
  },
  inTotalFootnote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  statValueText: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  statLabelText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  memoriesSection: {
    marginBottom: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryInfo: {
    flex: 1,
  },
  countryNameText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  countryMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  tripsList: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  tripMemoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripMemoryInfo: {
    flex: 1,
  },
  tripMemoryTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  tripMemoryCity: {
    fontSize: 12,
    marginTop: 1,
  },
  tripMemoryDates: {
    fontSize: 11,
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
  miniPhotoImage: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  bottomPadding: {
    height: 100,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    flex: 1,
  },
  modalInfoCard: {
    margin: 20,
    padding: 16,
    borderRadius: 14,
    gap: 10,
  },
  modalTripName: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalInfoText: {
    fontSize: 14,
  },
  mediaSection: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
  mediaSectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
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
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed' as const,
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
    paddingVertical: 14,
    borderRadius: 12,
  },
  addMediaText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  importBtnText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  emptyMemories: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 20,
    gap: 10,
  },
  emptyMemoriesText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
