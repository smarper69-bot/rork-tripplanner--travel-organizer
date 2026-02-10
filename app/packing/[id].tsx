import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Plus, Sparkles, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import PackingItem from '@/components/PackingItem';
import { mockTrips } from '@/mocks/trips';
import { PackingItem as PackingItemType, PackingCategory } from '@/types/trip';

const categoryLabels: Record<PackingCategory, string> = {
  essentials: 'Essentials',
  clothing: 'Clothing',
  toiletries: 'Toiletries',
  electronics: 'Electronics',
  documents: 'Documents',
  other: 'Other',
};

const categoryOrder: PackingCategory[] = ['essentials', 'documents', 'clothing', 'toiletries', 'electronics', 'other'];

export default function PackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const trip = mockTrips.find(t => t.id === id);
  const [packingList, setPackingList] = useState<PackingItemType[]>(trip?.packingList || []);
  const [newItemText, setNewItemText] = useState('');

  if (!trip) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Trip not found</Text>
      </View>
    );
  }

  const toggleItem = (itemId: string) => {
    setPackingList(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, isPacked: !item.isPacked } : item
      )
    );
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    const newItem: PackingItemType = {
      id: Date.now().toString(),
      name: newItemText.trim(),
      category: 'other',
      isPacked: false,
      quantity: 1,
    };
    setPackingList(prev => [...prev, newItem]);
    setNewItemText('');
  };

  const groupedItems = categoryOrder.reduce((acc, category) => {
    const items = packingList.filter(item => item.category === category);
    if (items.length > 0) {
      acc[category] = items;
    }
    return acc;
  }, {} as Record<PackingCategory, PackingItemType[]>);

  const totalItems = packingList.length;
  const packedItems = packingList.filter(p => p.isPacked).length;
  const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Packing List</Text>
            <Text style={styles.headerSubtitle}>{trip.name}</Text>
          </View>
          <TouchableOpacity style={styles.aiButton}>
            <Sparkles size={20} color={Colors.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Packing Progress</Text>
            <Text style={styles.progressCount}>{packedItems}/{totalItems} items</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          {progress === 100 && (
            <View style={styles.completeBadge}>
              <Check size={14} color={Colors.success} />
              <Text style={styles.completeText}>All packed!</Text>
            </View>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {Object.entries(groupedItems).map(([category, items]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>
                {categoryLabels[category as PackingCategory]}
              </Text>
              {items.map((item) => (
                <PackingItem
                  key={item.id}
                  item={item}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </View>
          ))}

          {totalItems === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No items yet</Text>
              <Text style={styles.emptyText}>Add items to your packing list</Text>
              <TouchableOpacity style={styles.suggestButton}>
                <Sparkles size={16} color={Colors.textLight} />
                <Text style={styles.suggestText}>Get AI Suggestions</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.addItemRow}>
            <TextInput
              style={styles.addItemInput}
              placeholder="Add item..."
              placeholderTextColor={Colors.textMuted}
              value={newItemText}
              onChangeText={setNewItemText}
              onSubmitEditing={addItem}
            />
            <TouchableOpacity 
              style={[styles.addItemButton, !newItemText.trim() && styles.addItemButtonDisabled]}
              onPress={addItem}
              disabled={!newItemText.trim()}
            >
              <Plus size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
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
  aiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  progressCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: Colors.success + '15',
    borderRadius: 8,
  },
  completeText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.success,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  suggestText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  addItemRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 15,
    color: Colors.text,
  },
  addItemButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
});
