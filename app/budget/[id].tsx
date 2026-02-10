import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import BudgetChart from '@/components/BudgetChart';
import { mockTrips } from '@/mocks/trips';
import { ActivityCategory } from '@/types/trip';

export default function BudgetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const trip = mockTrips.find(t => t.id === id);

  if (!trip) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Trip not found</Text>
      </View>
    );
  }

  const categorySpending: { category: ActivityCategory; amount: number }[] = [];
  const categoryMap = new Map<ActivityCategory, number>();

  trip.itinerary.forEach(day => {
    day.activities.forEach(activity => {
      if (activity.cost) {
        const current = categoryMap.get(activity.category) || 0;
        categoryMap.set(activity.category, current + activity.cost);
      }
    });
  });

  categoryMap.forEach((amount, category) => {
    categorySpending.push({ category, amount });
  });

  categorySpending.sort((a, b) => b.amount - a.amount);

  const recentTransactions = trip.itinerary
    .flatMap(day => day.activities)
    .filter(a => a.cost)
    .sort((a, b) => b.cost! - a.cost!)
    .slice(0, 5);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Budget</Text>
            <Text style={styles.headerSubtitle}>{trip.name}</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <BudgetChart
            total={trip.totalBudget}
            spent={trip.spentBudget}
            categories={categorySpending}
            currency={trip.currency}
          />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Expenses</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {recentTransactions.length > 0 ? (
              recentTransactions.map((expense, index) => (
                <View key={index} style={styles.transactionItem}>
                  <View style={[styles.transactionIcon, { backgroundColor: Colors.categoryColors[expense.category] + '20' }]}>
                    <TrendingDown size={16} color={Colors.categoryColors[expense.category]} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{expense.title}</Text>
                    <Text style={styles.transactionCategory}>
                      {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.transactionAmount}>-${expense.cost}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No expenses recorded yet</Text>
              </View>
            )}
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <TrendingUp size={20} color={Colors.success} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Budget Insight</Text>
              <Text style={styles.insightText}>
                You are on track! At this pace, you will have ${(trip.totalBudget - trip.spentBudget).toLocaleString()} remaining at the end of your trip.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.addExpenseButton}>
            <Plus size={20} color={Colors.textLight} />
            <Text style={styles.addExpenseText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: Colors.success + '10',
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: Colors.background,
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  addExpenseText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
});
