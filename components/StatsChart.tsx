
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DailyStats, Book } from '../types';
import { triggerHaptic } from '../App';

interface StatsChartProps {
  stats: DailyStats;
  books: Book[];
}

const UNTRACKED_ID = 'untracked_session';
const ACCENT_RGB = '225, 29, 72';

const StatsChart: React.FC<StatsChartProps> = ({ stats, books }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{ day: number, mins: number, dateStr: string } | null>(null);
  const [activeData, setActiveData] = useState<{ date: string, details: any[] } | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 마운트 직후 레이아웃 에러 방지를 위한 딜레이
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayData = stats[date] || {};
      const item: any = { 
        date: date.split('-').slice(1).join('/'), 
        fullDate: date 
      };
      const details: any[] = [];
      
      const untrackedSecs = dayData[UNTRACKED_ID] || 0;
      const untrackedMins = Number((untrackedSecs / 60).toFixed(1));
      item[UNTRACKED_ID] = untrackedMins;
      if (untrackedMins > 0) {
        details.push({ title: 'General', mins: untrackedMins, color: '#d6d3d1' });
      }

      books.forEach(book => {
        const secs = dayData[book.id] || 0;
        const mins = Number((secs / 60).toFixed(1));
        item[book.id] = mins;
        if (mins > 0) {
          details.push({ title: book.title, mins, color: book.color });
        }
      });
      
      item.details = details;
      return item;
    });
  }, [stats, books]);

  const changeMonth = (offset: number) => {
    triggerHaptic();
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  // Fix: Implemented renderGrass function to handle the monthly heatmap grid
  const renderGrass = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const squares = [];
    
    // Add empty squares for leading days of the week to align the grid
    for (let i = 0; i < firstDayOfMonth; i++) {
      squares.push(<div key={`empty-${i}`} className="w-full aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = stats[dateStr] || {};
      const totalSecs = Object.values(dayData).reduce((sum, val) => sum + (val as number), 0);
      const totalMins = Math.round(totalSecs / 60);
      
      // Determine background color based on reading intensity
      let intensityClass = 'bg-stone-100';
      if (totalMins > 0) {
        if (totalMins < 15) intensityClass = 'bg-rose-100';
        else if (totalMins < 30) intensityClass = 'bg-rose-200';
        else if (totalMins < 60) intensityClass = 'bg-rose-300';
        else if (totalMins < 120) intensityClass = 'bg-rose-400';
        else intensityClass = 'bg-rose-500';
      }

      const isSelected = selectedDay?.day === day;

      squares.push(
        <div
          key={day}
          onClick={() => {
            triggerHaptic(5);
            setSelectedDay({ day, mins: totalMins, dateStr });
          }}
          className={`w-full aspect-square rounded-[4px] transition-all cursor-pointer ${intensityClass} ${
            isSelected ? 'ring-2 ring-stone-800 ring-offset-2 scale-90' : 'hover:scale-110 active:scale-95'
          }`}
        />
      );
    }

    return squares;
  };

  // 커스텀 툴팁: 막대 근처에 뜨도록 설정
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md border border-stone-100 p-4 rounded-2xl shadow-xl animate-in zoom-in-95 fade-in duration-200 pointer-events-none min-w-[140px] z-50">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 border-b border-stone-50 pb-2">{data.fullDate}</p>
          <div className="space-y-2">
            {data.details.map((d: any, i: number) => (
              <div key={i} className="flex justify-between items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-[11px] font-medium text-stone-600 truncate max-w-[80px]">{d.title}</span>
                </div>
                <span className="text-[11px] font-bold text-stone-900">{Math.round(d.mins)}m</span>
              </div>
            ))}
            {data.details.length === 0 && <p className="text-[11px] text-stone-300 italic">No activity</p>}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-10 relative">
      {/* Weekly Bar Chart Section */}
      <div className="w-full relative flex justify-center items-center" style={{ height: '220px', minWidth: '0' }}>
        {isReady ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              barCategoryGap="20%"
              onClick={(state) => {
                if (state && state.activePayload) triggerHaptic(20);
              }}
              style={{ outline: 'none' }}
            >
              <defs>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1"/>
                </filter>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#a8a29e', fontWeight: 600 }} 
                dy={12}
              />
              {/* Y축 숨김 */}
              <YAxis hide={true} domain={[0, 'auto']} />
              
              {/* 툴팁 설정: 파란 테두리 방지를 위해 cursor fill 투명화 및 포커스 해제 */}
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }}
                trigger="click"
                wrapperStyle={{ outline: 'none', pointerEvents: 'none' }}
              />
              
              <Bar 
                dataKey={UNTRACKED_ID} 
                stackId="a" 
                fill="#d6d3d1" 
                radius={[6, 6, 0, 0]} 
                isAnimationActive={false}
                barSize={32}
                style={{ outline: 'none', cursor: 'pointer' }}
              />
              {books.map((book) => (
                <Bar 
                  key={book.id} 
                  dataKey={book.id} 
                  stackId="a" 
                  fill={book.color} 
                  radius={[6, 6, 0, 0]} 
                  isAnimationActive={false}
                  barSize={32}
                  style={{ outline: 'none', cursor: 'pointer' }}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-stone-50/50 rounded-3xl animate-pulse">
            <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-400 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Reading Grass Section */}
      <div className="pt-8 border-t border-stone-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold text-stone-400">Monthly Intensity</h3>
            <div className="h-4 mt-1">
              {selectedDay && (
                <p className="text-[11px] font-semibold text-stone-600">
                  {currentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} {selectedDay.day} • <span className="text-rose-600">{selectedDay.mins}m</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => changeMonth(-1)} className="p-2 bg-stone-50 rounded-full text-stone-400 active:scale-75 transition-transform"><ChevronLeft size={16} /></button>
            <span className="text-[11px] font-bold text-stone-700 min-w-[80px] text-center uppercase tracking-widest">
              {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-2 bg-stone-50 rounded-full text-stone-400 active:scale-75 transition-transform"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">{renderGrass()}</div>
      </div>
      
      <style>{`
        /* Recharts 내부의 포커스 링(파란 테두리) 강제 제거 */
        .recharts-wrapper, .recharts-surface {
          outline: none !important;
          -webkit-tap-highlight-color: transparent;
        }
        .recharts-bar-rectangle {
          transition: opacity 0.2s ease;
        }
        .recharts-bar-rectangle:active {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default StatsChart;
