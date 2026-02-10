import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { PackingItem as PackingItemType } from '@/types/trip';

interface PackingItemProps {
  item: PackingItemType;
  onToggle: () => void;
}

export default function PackingItem({ item, onToggle }: PackingItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkbox, item.isPacked && styles.checkboxChecked]}>
        {item.isPacked && <Check size={14} color={Colors.textLight} />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, item.isPacked && styles.nameChecked]}>{item.name}</Text>
        {item.quantity > 1 && (
          <Text style={styles.quantity}>×{item.quantity}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    color: Colors.text,
  },
  nameChecked: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  quantity: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
