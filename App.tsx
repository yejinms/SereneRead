import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';

import Layout from './components/Layout';
import TimerDisplay from './components/TimerDisplay';
import StatsChart from './components/StatsChart';
import BookManager from './components/BookManager';
import { audioService } from './services/AudioService';
import { storageService } from './services/StorageService';
import { triggerHaptic } from './hooks/useHaptic';
import { UNTRACKED_ID, AESTHETIC_PALETTE } from './constants';
import { ASMRType, DailyStats, Book } from './types';
import { colors } from './theme';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [secondsRemaining, setSecondsRemaining] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [asmrType, setAsmrType] = useState<ASMRType>('none');
  const [stats, setStats] = useState<DailyStats>({});
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [ready, setReady] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
  });

  useEffect(() => {
    (async () => {
      try {
        const [loadedStats, loadedBooks] = await Promise.all([
          storageService.getStats(),
          storageService.getBooks(),
        ]);
        setStats(loadedStats);
        setBooks(loadedBooks);
        if (loadedBooks.length > 0 && !selectedBookId) {
          setSelectedBookId(loadedBooks[0].id);
        }
      } catch (_) {}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [ready, fontsLoaded]);

  useEffect(() => {
    storageService.setBooks(books);
  }, [books]);

  const saveStats = useCallback(
    (seconds: number) => {
      const targetBookId = selectedBookId || UNTRACKED_ID;
      const today = new Date().toISOString().split('T')[0];
      setStats((prev) => {
        const dayData = prev[today] || {};
        const updatedDayData = {
          ...dayData,
          [targetBookId]: (dayData[targetBookId] || 0) + seconds,
        };
        const updated = { ...prev, [today]: updatedDayData };
        storageService.setStats(updated);
        return updated;
      });
    },
    [selectedBookId]
  );

  useEffect(() => {
    if (isRunning && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            saveStats(1);
            return 0;
          }
          return prev - 1;
        });
        saveStats(1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, secondsRemaining, saveStats]);

  useEffect(() => {
    if (isRunning && asmrType !== 'none') {
      audioService.play(asmrType, 0.05);
    } else {
      audioService.stop();
    }
  }, [isRunning, asmrType]);

  const toggleTimer = () => {
    triggerHaptic('medium');
    setIsRunning(!isRunning);
  };

  const adjustTime = (mins: number) => {
    triggerHaptic('light');
    setSecondsRemaining((prev) => Math.max(0, prev + mins * 60));
  };

  const handleAddBook = (title: string) => {
    triggerHaptic('medium');
    const newBook: Book = {
      id: Math.random().toString(36).slice(2, 11),
      title,
      color: AESTHETIC_PALETTE[books.length % AESTHETIC_PALETTE.length],
    };
    setBooks((prev) => [...prev, newBook]);
    setSelectedBookId(newBook.id);
  };

  const totalToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const dayData = stats[today] || {};
    return Object.values(dayData).reduce((s, v) => s + (v as number), 0);
  }, [stats]);

  const insets = useSafeAreaInsets();
  const headerPaddingTop = Math.max(insets.top, 8);
  const contentPaddingTop = 16;

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Layout>
        <View style={[styles.wrapper, { paddingTop: headerPaddingTop }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoIcon}>
                <Ionicons name="moon" size={16} color={colors.stone[50]} />
              </View>
              <Text style={styles.title}>SereneRead</Text>
            </View>
            <Pressable
              onPress={() => {
                triggerHaptic('light');
                setShowStats(!showStats);
              }}
              style={[styles.headerBtn, showStats && styles.headerBtnActive]}
            >
              <Ionicons
                name={showStats ? 'settings' : 'bar-chart'}
                size={20}
                color={showStats ? colors.stone[50] : colors.stone[800]}
              />
            </Pressable>
          </View>

          {showStats ? (
            <ScrollView
              style={[styles.statsPanel, { marginTop: contentPaddingTop }]}
              contentContainerStyle={styles.statsContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.statsHeader}>
                <View>
                  <Text style={styles.statsLabel}>Weekly Insight</Text>
                  <Text style={styles.statsTitle}>Your Progress</Text>
                </View>
                <View style={styles.statsToday}>
                  <Text style={styles.statsTodayLabel}>Today Total</Text>
                  <Text style={styles.statsTodayValue}>{Math.floor(totalToday / 60)}m</Text>
                </View>
              </View>
              <StatsChart stats={stats} books={books} />
              <Pressable
                onPress={() => {
                  triggerHaptic('light');
                  setShowStats(false);
                }}
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>Back to Focus</Text>
              </Pressable>
            </ScrollView>
          ) : (
            <View style={[styles.main, { paddingTop: contentPaddingTop }]}>
              <BookManager
                books={books}
                selectedBookId={selectedBookId}
                onSelect={(id) => {
                  triggerHaptic('light');
                  setSelectedBookId(id);
                }}
                onAdd={handleAddBook}
                onDelete={(id) => {
                  triggerHaptic('heavy');
                  setBooks((prev) => prev.filter((b) => b.id !== id));
                  if (selectedBookId === id) setSelectedBookId(null);
                }}
                onEdit={(id, title) => {
                  triggerHaptic('light');
                  setBooks((prev) =>
                    prev.map((b) => (b.id === id ? { ...b, title } : b))
                  );
                }}
              />

              <View style={styles.timerCard}>
                <TimerDisplay
                  secondsRemaining={secondsRemaining}
                  isRunning={isRunning}
                />
                <View style={styles.asmrRow}>
                  <Ionicons name="volume-high" size={12} color={colors.stone[400]} />
                  {(['none', 'white', 'pink', 'brown'] as ASMRType[]).map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => {
                        triggerHaptic('light');
                        setAsmrType(type);
                      }}
                      style={[
                        styles.asmrChip,
                        asmrType === type && styles.asmrChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.asmrChipText,
                          asmrType === type && styles.asmrChipTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.controls}>
                <Pressable
                  onPress={() => adjustTime(-5)}
                  style={styles.controlBtn}
                >
                  <Ionicons name="remove" size={24} color={colors.stone[400]} />
                </Pressable>
                <Pressable
                  onPress={toggleTimer}
                  style={[
                    styles.playBtn,
                    isRunning && styles.playBtnActive,
                  ]}
                >
                  <Ionicons
                    name={isRunning ? 'pause' : 'play'}
                    size={54}
                    color={isRunning ? colors.rose[500] : colors.stone[50]}
                  />
                </Pressable>
                <Pressable
                  onPress={() => adjustTime(5)}
                  style={styles.controlBtn}
                >
                  <Ionicons name="add" size={24} color={colors.stone[400]} />
                </Pressable>
              </View>

              <View style={styles.presets}>
                {[15, 25, 45, 60].map((mins) => (
                  <Pressable
                    key={mins}
                    onPress={() => {
                      triggerHaptic('light');
                      setIsRunning(false);
                      setSecondsRemaining(mins * 60);
                    }}
                    style={styles.presetChip}
                  >
                    <Text style={styles.presetChipText}>{mins}m</Text>
                  </Pressable>
                ))}
                <View style={styles.presetDivider} />
                <Pressable
                  onPress={() => {
                    triggerHaptic('heavy');
                    setIsRunning(false);
                    setSecondsRemaining(1500);
                  }}
                  style={styles.resetBtn}
                >
                  <Ionicons name="refresh" size={16} color={colors.stone[400]} />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Layout>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, width: '100%' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 0,
    marginBottom: 0,
    minHeight: 52,
    height: 52,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.stone[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'InstrumentSerif_400Regular_Italic',
    fontSize: 24,
    letterSpacing: -0.5,
    color: colors.stone[800],
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerBtnActive: {
    backgroundColor: colors.stone[800],
    transform: [{ rotate: '90deg' }],
  },
  statsPanel: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    minHeight: 0,
  },
  statsContent: { padding: 20, paddingBottom: 40 },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.stone[400],
    marginBottom: 4,
  },
  statsTitle: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 28,
    color: colors.stone[800],
  },
  statsToday: { alignItems: 'flex-end' },
  statsTodayLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.stone[400],
  },
  statsTodayValue: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.stone[700],
  },
  backBtn: {
    marginTop: 40,
    paddingVertical: 20,
    borderRadius: 24,
    backgroundColor: colors.stone[800],
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.stone[50],
  },
  main: { flex: 1, width: '100%', alignItems: 'center', minHeight: 0 },
  timerCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    padding: 20,
    paddingBottom: 32,
    overflow: 'visible',
  },
  asmrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(245,245,244,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 24,
    gap: 4,
  },
  asmrChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  asmrChipActive: {
    backgroundColor: colors.stone[800],
  },
  asmrChipText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.stone[400],
    textTransform: 'uppercase',
  },
  asmrChipTextActive: { color: colors.stone[50] },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.stone[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.stone[800],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.stone[800],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  playBtnActive: {
    backgroundColor: colors.rose[50],
    shadowColor: colors.rose[100],
  },
  presets: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.stone[400],
  },
  presetDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.stone[200],
    marginHorizontal: 4,
  },
  resetBtn: { padding: 8 },
});
