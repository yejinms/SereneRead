import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '../types';
import { colors } from '../theme';
import { triggerHaptic } from '../hooks/useHaptic';

interface BookManagerProps {
  books: Book[];
  selectedBookId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (title: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
}

export default function BookManager({
  books,
  selectedBookId,
  onSelect,
  onAdd,
  onDelete,
  onEdit,
}: BookManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [manageId, setManageId] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const startLongPress = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      triggerHaptic('medium');
      setManageId(id);
    }, 600);
  };

  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAdd(newTitle.trim());
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, title: string) => {
    if (title.trim()) onEdit(id, title.trim());
    setEditingId(null);
  };

  useEffect(() => {
    if (isAdding && scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [isAdding]);

  return (
    <Pressable style={styles.container} onPress={() => setManageId(null)}>
      <View style={styles.header}>
        <Text style={styles.label}>Now Reading</Text>
        <Pressable
          onPress={() => {
            triggerHaptic('light');
            setIsAdding(!isAdding);
          }}
          style={[styles.addBtn, isAdding && styles.addBtnActive]}
        >
          <Ionicons name="add" size={16} color={isAdding ? colors.white : colors.stone[400]} />
        </Pressable>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        <Pressable
          onPress={() => onSelect(null)}
          style={[styles.chip, selectedBookId === null && styles.chipSelected]}
        >
          <View
            style={[
              styles.dot,
              selectedBookId === null && styles.dotSelected,
              { backgroundColor: colors.rose[50] },
            ]}
          />
          <Text style={[styles.chipText, selectedBookId === null && styles.chipTextSelected]}>
            General
          </Text>
        </Pressable>
        {books.map((book) => (
          <Pressable
            key={book.id}
            onPress={() => {
              if (!manageId) onSelect(book.id);
            }}
            onPressIn={() => startLongPress(book.id)}
            onPressOut={endLongPress}
            style={[styles.chip, selectedBookId === book.id && styles.chipSelected]}
          >
            <View
              style={[
                styles.dot,
                selectedBookId === book.id && styles.dotSelected,
                { backgroundColor: book.color },
              ]}
            />
            {editingId === book.id ? (
              <TextInput
                autoFocus
                value={editTitle}
                onChangeText={setEditTitle}
                onBlur={() => handleEdit(book.id, editTitle)}
                onSubmitEditing={() => handleEdit(book.id, editTitle)}
                style={styles.input}
                placeholderTextColor={colors.stone[500]}
              />
            ) : (
              <Text
                style={[styles.chipText, selectedBookId === book.id && styles.chipTextSelected]}
                numberOfLines={1}
              >
                {book.title}
              </Text>
            )}
            {manageId === book.id && (
              <View style={styles.actions}>
                <Pressable
                  onPress={() => {
                    triggerHaptic('light');
                    setEditTitle(book.title);
                    setEditingId(book.id);
                    setManageId(null);
                  }}
                  style={styles.actionBtn}
                >
                  <Ionicons name="pencil" size={14} color={colors.stone[500]} />
                </Pressable>
                <Pressable
                  onPress={() => {
                    triggerHaptic('heavy');
                    onDelete(book.id);
                    setManageId(null);
                  }}
                  style={styles.actionBtn}
                >
                  <Ionicons name="trash-outline" size={14} color={colors.rose[400]} />
                </Pressable>
              </View>
            )}
          </Pressable>
        ))}
        {isAdding && (
          <View style={[styles.chip, styles.chipAdd]}>
            <TextInput
              autoFocus
              placeholder="Title..."
              placeholderTextColor={colors.stone[400]}
              value={newTitle}
              onChangeText={setNewTitle}
              onSubmitEditing={handleAdd}
              style={styles.input}
            />
            <Pressable onPress={handleAdd} hitSlop={8}>
              <Ionicons name="checkmark" size={18} color={colors.emerald[400]} />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: colors.rose[50],
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.stone[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnActive: {
    backgroundColor: colors.stone[800],
    borderColor: colors.stone[800],
  },
  scroll: { width: '100%', minHeight: 58 },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    marginRight: 10,
  },
  chipSelected: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: 'rgba(255,255,255,0.9)',
    transform: [{ scale: 1.05 }],
    zIndex: 10,
  },
  chipAdd: {
    backgroundColor: colors.white,
    borderColor: colors.stone[200],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.stone[300],
    marginRight: 10,
  },
  dotSelected: { transform: [{ scale: 1.25 }] },
  chipText: { fontSize: 14, fontWeight: '500', color: colors.stone[500], maxWidth: 110 },
  chipTextSelected: { color: colors.stone[800] },
  input: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.stone[700],
    padding: 0,
    minWidth: 80,
    maxWidth: 120,
  },
  actions: {
    position: 'absolute',
    top: -12,
    right: -8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 50,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.stone[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
