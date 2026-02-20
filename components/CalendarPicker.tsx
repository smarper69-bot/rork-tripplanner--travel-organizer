import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 80) / 7);

interface CalendarPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  selectedDate?: string;
  minDate?: string;
  title?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateISO(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function parseDate(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10) - 1,
    day: parseInt(parts[2], 10),
  };
}

export default function CalendarPicker({
  visible,
  onClose,
  onSelect,
  selectedDate,
  minDate,
  title = 'Select Date',
}: CalendarPickerProps) {
  const today = new Date();
  const initialDate = selectedDate ? parseDate(selectedDate) : null;

  const [viewYear, setViewYear] = useState(initialDate?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate?.month ?? today.getMonth());
  const [fadeAnim] = useState(new Animated.Value(0));

  const parsedMin = useMemo(() => (minDate ? parseDate(minDate) : null), [minDate]);

  React.useEffect(() => {
    if (visible) {
      if (selectedDate) {
        const parsed = parseDate(selectedDate);
        if (parsed) {
          setViewYear(parsed.year);
          setViewMonth(parsed.month);
        }
      }
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, selectedDate]);

  const goToPrevMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const isDateDisabled = useCallback(
    (year: number, month: number, day: number) => {
      if (!parsedMin) return false;
      const dateVal = new Date(year, month, day).getTime();
      const minVal = new Date(parsedMin.year, parsedMin.month, parsedMin.day).getTime();
      return dateVal < minVal;
    },
    [parsedMin]
  );

  const isSelected = useCallback(
    (year: number, month: number, day: number) => {
      if (!selectedDate) return false;
      const sel = parseDate(selectedDate);
      if (!sel) return false;
      return sel.year === year && sel.month === month && sel.day === day;
    },
    [selectedDate]
  );

  const isToday = useCallback(
    (year: number, month: number, day: number) => {
      return (
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day
      );
    },
    []
  );

  const handleDayPress = useCallback(
    (day: number) => {
      if (isDateDisabled(viewYear, viewMonth, day)) return;
      const iso = formatDateISO(viewYear, viewMonth, day);
      console.log('[CalendarPicker] Selected:', iso);
      onSelect(iso);
    },
    [viewYear, viewMonth, isDateDisabled, onSelect]
  );

  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const rows: (number | null)[][] = [];
    let currentRow: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      currentRow.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      currentRow.push(day);
      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    }

    if (currentRow.length > 0) {
      while (currentRow.length < 7) {
        currentRow.push(null);
      }
      rows.push(currentRow);
    }

    return rows;
  }, [viewYear, viewMonth]);

  const isPrevDisabled = useMemo(() => {
    if (!parsedMin) return false;
    return viewYear === parsedMin.year && viewMonth <= parsedMin.month;
  }, [viewYear, viewMonth, parsedMin]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.monthNav}>
            <TouchableOpacity
              style={[styles.navBtn, isPrevDisabled && styles.navBtnDisabled]}
              onPress={goToPrevMonth}
              disabled={isPrevDisabled}
            >
              <ChevronLeft size={20} color={isPrevDisabled ? Colors.textMuted : Colors.text} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity style={styles.navBtn} onPress={goToNextMonth}>
              <ChevronRight size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <View key={day} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {calendarGrid.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((day, colIndex) => {
                  if (day === null) {
                    return <View key={colIndex} style={styles.dayCell} />;
                  }

                  const disabled = isDateDisabled(viewYear, viewMonth, day);
                  const selected = isSelected(viewYear, viewMonth, day);
                  const todayMatch = isToday(viewYear, viewMonth, day);

                  return (
                    <TouchableOpacity
                      key={colIndex}
                      style={[
                        styles.dayCell,
                        selected && styles.dayCellSelected,
                        todayMatch && !selected && styles.dayCellToday,
                      ]}
                      onPress={() => handleDayPress(day)}
                      disabled={disabled}
                      activeOpacity={0.6}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          disabled && styles.dayTextDisabled,
                          selected && styles.dayTextSelected,
                          todayMatch && !selected && styles.dayTextToday,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.todayBtn} onPress={() => {
              setViewYear(today.getFullYear());
              setViewMonth(today.getMonth());
            }}>
              <Text style={styles.todayBtnText}>Today</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
  },
  grid: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: CELL_SIZE / 2,
  },
  dayCellSelected: {
    backgroundColor: Colors.text,
  },
  dayCellToday: {
    backgroundColor: Colors.background,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  dayTextDisabled: {
    color: Colors.textMuted,
    opacity: 0.4,
  },
  dayTextSelected: {
    color: Colors.textLight,
    fontWeight: '700' as const,
  },
  dayTextToday: {
    fontWeight: '700' as const,
    color: Colors.text,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 4,
  },
  todayBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
  },
  todayBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
