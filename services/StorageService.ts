import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyStats, Book } from '../types';
import { STORAGE_KEY_STATS, STORAGE_KEY_BOOKS } from '../constants';

export const storageService = {
  async getStats(): Promise<DailyStats> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_STATS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  async setStats(stats: DailyStats): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  },

  async getBooks(): Promise<Book[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_BOOKS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async setBooks(books: Book[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  },
};
