import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { ActivityCategory } from '@/types/trip';

interface BudgetChartProps {
  total: number;
  spent: number;
  categories: { category: ActivityCategory; amount: number }[];
  currency?: string;
}

export default function BudgetChart({ total, spent, categories, currency = 'USD' }: BudgetChartProps) {
  const remaining = total - spent;
  const percentage = Math.round((spent / total) * 100);

  const getCategoryLabel = (category: ActivityCategory) => {
    const labels: Record<ActivityCategory, string> = {
      flights: 'Flights',
      accommodation: 'Accommodation',
      food: 'Food & Dining',
      activities: 'Activities',
      transport: 'Transport',
      shopping: 'Shopping',
      other: 'Other',
    };
    return labels[category];
  };

  return (
    <View style={styles.container}>
      <View style={styles.ringContainer}>
        <View style={styles.ringOuter}>
          <View style={styles.ringInner}>
            <Text style={styles.percentage}>{percentage}%</Text>
            <Text style={styles.percentageLabel}>used</Text>
          </View>
        </View>
        <View style={[styles.ringProgress, { 
          transform: [{ rotate: `${(percentage / 100) * 360}deg` }] 
        }]} />
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Budget</Text>
            <Text style={styles.summaryValue}>${total.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={[styles.summaryValue, styles.spentValue]}>${spent.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={[styles.summaryValue, styles.remainingValue]}>${remaining.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.categories}>
        <Text style={styles.categoriesTitle}>Spending by Category</Text>
        {categories.map((cat, index) => (
          <View key={index} style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryDot, { backgroundColor: Colors.categoryColors[cat.category] }]} />
              <Text style={styles.categoryName}>{getCategoryLabel(cat.category)}</Text>
            </View>
            <Text style={styles.categoryAmount}>${cat.amount.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ringOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 12,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringInner: {
    alignItems: 'center',
  },
  ringProgress: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 12,
    borderColor: Colors.primary,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  percentage: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
  },
  percentageLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  summary: {
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  spentValue: {
    color: Colors.accent,
  },
  remainingValue: {
    color: Colors.success,
  },
  categories: {},
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
});
