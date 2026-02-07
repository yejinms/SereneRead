import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
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
import { BlurView } from 'expo-blur';

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
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
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
            >
              <BlurView
                intensity={50}
                tint="light"
                style={[styles.headerBtn, showStats && styles.headerBtnActive]}
              >
                <Ionicons
                  name={showStats ? 'settings' : 'bar-chart'}
                  size={20}
                  color={showStats ? colors.stone[50] : colors.stone[800]}
                />
              </BlurView>
            </Pressable>
          </View>

          {showStats ? (
            <ScrollView
              style={[styles.statsPanel, { marginTop: contentPaddingTop }]}
              contentContainerStyle={styles.statsContent}
              showsVerticalScrollIndicator={false}
            >
              <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
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
              >
                <BlurView intensity={80} tint="dark" style={styles.backBtn}>
                  <Text style={styles.backBtnText}>Back to Focus</Text>
                </BlurView>
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

              <View style={styles.timerSection}>
                <View style={styles.timerCardContainer}>
                  <BlurView intensity={30} tint="light" style={styles.timerCard}>
                    <TimerDisplay
                      secondsRemaining={secondsRemaining}
                      isRunning={isRunning}
                    />
                    <View style={styles.asmrHeader}>
                      <Text style={styles.asmrLabel}>Now Playing</Text>
                    </View>
                    <View style={styles.asmrRow}>
                      <Ionicons name="volume-high" size={12} color={colors.stone[500]} />
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
                  </BlurView>
                </View>

                <View style={styles.controls}>
                  <Pressable onPress={() => adjustTime(-5)}>
                    <BlurView intensity={40} tint="light" style={styles.controlBtn}>
                      <Ionicons name="remove" size={28} color={colors.stone[600]} />
                    </BlurView>
                  </Pressable>
                  
                  <Pressable onPress={toggleTimer} style={styles.playBtnWrap}>
                    <View
                      style={[
                        styles.playBtnCircle,
                        isRunning && styles.playBtnActive,
                        {
                          backgroundColor: isRunning ? colors.rose[100] : colors.stone[800],
                        },
                      ]}
                    >
                      <Ionicons
                        name={isRunning ? 'pause' : 'play'}
                        size={62}
                        color={isRunning ? colors.rose[500] : colors.stone[50]}
                        style={!isRunning ? { marginLeft: 4 } : undefined}
                      />
                    </View>
                  </Pressable>

                  <Pressable onPress={() => adjustTime(5)}>
                    <BlurView intensity={40} tint="light" style={styles.controlBtn}>
                      <Ionicons name="add" size={28} color={colors.stone[600]} />
                    </BlurView>
                  </Pressable>
                </View>

                <View style={styles.presetsContainer}>
                  <BlurView intensity={20} tint="light" style={styles.presets}>
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
                      <Ionicons name="refresh" size={16} color={colors.stone[500]} />
                    </Pressable>
                  </BlurView>
                </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  headerBtnActive: {
    backgroundColor: colors.stone[800],
    transform: [{ rotate: '90deg' }],
  },
  statsPanel: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden', // for blur
    marginTop: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
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
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.rose[50],
    marginBottom: 4,
  },
  statsTitle: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 28,
    color: colors.stone[800],
  },
  statsToday: { alignItems: 'flex-end' },
  statsTodayLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.rose[50],
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
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(41, 37, 36, 0.8)', // stone 800
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.stone[50],
  },
  main: { flex: 1, width: '100%', alignItems: 'center', minHeight: 0 },
  timerSection: {
    flex: 1,
    width: '100%',
    paddingTop: 16,
    paddingBottom: 32,
  },
  timerCardContainer: {
    width: '100%',
    paddingHorizontal: 16,
    borderRadius: 48,
    overflow: 'hidden',
  },
  timerCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    padding: 28,
    paddingBottom: 32,
    alignItems: 'center',
  },
  asmrHeader: {
    alignSelf: 'stretch',
    marginTop: 24,
    marginBottom: 12,
    paddingLeft: 4,
    paddingRight: 16,
  },
  asmrLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: colors.rose[50],
    textAlign: 'left',
  },
  asmrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 0,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  asmrChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  asmrChipActive: {
    backgroundColor: 'rgba(41, 37, 36, 0.1)', // Subtle active state
  },
  asmrChipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.rose[50],
    textTransform: 'uppercase',
  },
  asmrChipTextActive: { color: colors.stone[800] },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  controlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  playBtnWrap: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnActive: {
    borderColor: 'rgba(253, 164, 175, 0.4)',
  },
  presetsContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  presets: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.rose[50],
  },
  presetDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(168, 162, 158, 0.4)', // stone 400 with opacity
    marginHorizontal: 4,
  },
  resetBtn: { padding: 8 },
});
