import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyStats, Book } from '../types';
import { colors } from '../theme';
import { triggerHaptic } from '../hooks/useHaptic';
import { UNTRACKED_ID } from '../constants';

const CHART_HEIGHT = 180;
const { width: screenWidth } = Dimensions.get('window');
const chartWidth = Math.min(screenWidth - 32 - 48, 400);
const barWidth = (chartWidth - 80) / 7;
const barMaxHeight = 140;

const GRID_GAP = 4;
const GRID_COLUMNS = 7;
// Layout(16*2) + statsContent(20*2) = 72px 패딩 반영
const gridAvailableWidth = screenWidth - 72;
const gridCellSize = Math.floor((gridAvailableWidth - (GRID_COLUMNS - 1) * GRID_GAP) / GRID_COLUMNS);
const gridTotalWidth = GRID_COLUMNS * gridCellSize + (GRID_COLUMNS - 1) * GRID_GAP;

interface StatsChartProps {
  stats: DailyStats;
  books: Book[];
}

export default function StatsChart({ stats, books }: StatsChartProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{
    day: number;
    mins: number;
    dateStr: string;
  } | null>(null);
  const [tooltipDay, setTooltipDay] = useState<{
    fullDate: string;
    details: { title: string; mins: number; color: string }[];
  } | null>(null);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    return last7Days.map((date) => {
      const dayData = stats[date] || {};
      const details: { title: string; mins: number; color: string }[] = [];
      const untrackedSecs = dayData[UNTRACKED_ID] || 0;
      const untrackedMins = Number((untrackedSecs / 60).toFixed(1));
      if (untrackedMins > 0) details.push({ title: 'General', mins: untrackedMins, color: colors.rose[50] });
      books.forEach((b) => {
        const secs = dayData[b.id] || 0;
        const mins = Number((secs / 60).toFixed(1));
        if (mins > 0) details.push({ title: b.title, mins, color: b.color });
      });
      const totalMins = details.reduce((s, d) => s + d.mins, 0);
      return {
        date: date.split('-').slice(1).join('/'),
        fullDate: date,
        details,
        totalMins,
        segments: details,
      };
    });
  }, [stats, books]);

  const maxMins = Math.max(1, ...chartData.map((d) => d.totalMins));

  const changeMonth = (delta: number) => {
    triggerHaptic('light');
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
    setSelectedDay(null);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // 첫 셀을 항상 해당 월 1일로: 요일 빈칸 없이 1일부터 순서대로 채움
  const firstDay = 0;

  const intensityBg = (totalMins: number) => {
    if (totalMins <= 0) return colors.rose[50];
    if (totalMins < 10) return colors.rose[100];
    if (totalMins < 25) return colors.rose[200];
    if (totalMins < 45) return colors.rose[400];
    return colors.rose[600];
  };

  return (
    <View style={styles.container}>
      {/* Weekly stacked bars */}
      <View style={styles.chartWrap}>
        <View style={styles.barRow}>
          {chartData.map((day, i) => (
            <Pressable
              key={day.fullDate}
              onPress={() => {
                triggerHaptic('medium');
                setTooltipDay(
                  tooltipDay?.fullDate === day.fullDate
                    ? null
                    : { fullDate: day.fullDate, details: day.details }
                );
              }}
              style={styles.barCol}
            >
              <View style={styles.barStack}>
                {day.segments.length === 0 ? (
                  <View style={[styles.barSegment, { height: 4, backgroundColor: colors.stone[100] }]} />
                ) : (
                  [...day.segments].reverse().map((seg, j) => (
                    <View
                      key={j}
                      style={[
                        styles.barSegment,
                        {
                          height: Math.max(4, (seg.mins / maxMins) * barMaxHeight),
                          backgroundColor: seg.color,
                        },
                      ]}
                    />
                  ))
                )}
              </View>
            </Pressable>
          ))}
        </View>
        <View style={styles.xAxis}>
          {chartData.map((day) => (
            <Text key={day.fullDate} style={styles.xLabel}>
              {day.date}
            </Text>
          ))}
        </View>
        {tooltipDay && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipTitle}>
              {new Date(tooltipDay.fullDate + 'T00:00:00').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            {tooltipDay.details.map((d, i) => (
              <View key={i} style={styles.tooltipRow}>
                <View style={[styles.tooltipDot, { backgroundColor: d.color }]} />
                <Text style={styles.tooltipName} numberOfLines={1}>
                  {d.title}
                </Text>
                <Text style={styles.tooltipMins}>{Math.round(d.mins)}m</Text>
              </View>
            ))}
            {tooltipDay.details.length === 0 && (
              <Text style={styles.tooltipEmpty}>No activity</Text>
            )}
          </View>
        )}
      </View>

      {/* Monthly intensity grid */}
      <View style={styles.grassSection}>
        <View style={styles.grassHeader}>
          <View>
            <Text style={styles.grassLabel}>Monthly Intensity</Text>
            {selectedDay && (
              <Text style={styles.grassSelected}>
                {currentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}{' '}
                {selectedDay.day} • <Text style={{ color: colors.rose[600] }}>{selectedDay.mins}m</Text>
              </Text>
            )}
          </View>
          <View style={styles.monthNav}>
            <Pressable onPress={() => changeMonth(-1)} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={18} color={colors.stone[400]} />
            </Pressable>
            <Text style={styles.monthTitle}>
              {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </Text>
            <Pressable onPress={() => changeMonth(1)} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={18} color={colors.stone[400]} />
            </Pressable>
          </View>
        </View>
        <View style={[styles.grid, { gap: GRID_GAP, width: gridTotalWidth }]}>
          {Array.from({ length: firstDay }, (_, i) => (
            <View
              key={`e-${i}`}
              style={[styles.cell, { width: gridCellSize, height: gridCellSize, backgroundColor: colors.rose[50] }]}
            />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = stats[dateStr] || {};
            const totalSecs = Object.values(dayData).reduce((s, v) => s + (v as number), 0);
            const totalMins = Math.round(totalSecs / 60);
            return (
              <Pressable
                key={day}
                onPress={() => {
                  triggerHaptic('light');
                  setSelectedDay({ day, mins: totalMins, dateStr });
                }}
                style={[
                  styles.cell,
                  { width: gridCellSize, height: gridCellSize, backgroundColor: intensityBg(totalMins) },
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  chartWrap: {
    height: CHART_HEIGHT,
    width: '100%',
    paddingHorizontal: 24,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: barMaxHeight + 8,
    paddingHorizontal: 8,
  },
  barCol: { flex: 1, alignItems: 'center', marginHorizontal: 2 },
  barStack: {
    width: barWidth - 4,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'column-reverse',
    minHeight: 4,
  },
  barSegment: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  xLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    color: colors.rose[50],
  },
  tooltip: {
    position: 'absolute',
    top: 24,
    left: '50%',
    marginLeft: -80,
    minWidth: 160,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.stone[100],
    padding: 16,
    zIndex: 50,
  },
  tooltipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.stone[800],
    letterSpacing: 1,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.stone[100],
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tooltipDot: { width: 6, height: 6, borderRadius: 3 },
  tooltipName: { flex: 1, fontSize: 13, fontWeight: '500', color: colors.stone[600], maxWidth: 90 },
  tooltipMins: { fontSize: 13, fontWeight: '700', color: colors.stone[900] },
  tooltipEmpty: { fontSize: 13, color: colors.rose[50], fontStyle: 'italic' },
  grassSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.stone[100],
  },
  grassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  grassLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: colors.rose[50],
  },
  grassSelected: { fontSize: 13, fontWeight: '600', color: colors.rose[50], marginTop: 4 },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.stone[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.stone[700],
    minWidth: 80,
    textAlign: 'center',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    borderRadius: 4,
  },
});
