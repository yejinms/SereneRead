
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Moon, Volume2, BarChart3, Settings2 } from 'lucide-react';
import Layout from './components/Layout';
import TimerDisplay from './components/TimerDisplay';
import StatsChart from './components/StatsChart';
import BookManager from './components/BookManager';
import { audioService } from './services/AudioService';
import { ASMRType, DailyStats, Book } from './types';

const STORAGE_KEY_STATS = 'sereneread_stats_v3';
const STORAGE_KEY_BOOKS = 'sereneread_books';
const UNTRACKED_ID = 'untracked_session';

const AESTHETIC_PALETTE = [
  '#fbcfe8', '#ddd6fe', '#d1fae5', '#fef3c7', '#e0f2fe',
  '#ffedd5', '#ccfbf1', '#f3e8ff', '#fae8ff', '#ecfccb',
];

// 진동 피드백 유틸리티 (모바일용)
export const triggerHaptic = (duration = 15) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

const App: React.FC = () => {
  const [secondsRemaining, setSecondsRemaining] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [asmrType, setAsmrType] = useState<ASMRType>('none');
  const [stats, setStats] = useState<DailyStats>({});
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const savedStats = localStorage.getItem(STORAGE_KEY_STATS);
    const savedBooks = localStorage.getItem(STORAGE_KEY_BOOKS);
    if (savedBooks) {
      const parsedBooks = JSON.parse(savedBooks);
      setBooks(parsedBooks);
      if (parsedBooks.length > 0) setSelectedBookId(parsedBooks[0].id);
    }
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  }, [books]);

  const saveStats = useCallback((seconds: number) => {
    const targetBookId = selectedBookId || UNTRACKED_ID;
    const today = new Date().toISOString().split('T')[0];
    setStats(prev => {
      const dayData = prev[today] || {};
      const updatedDayData = { ...dayData, [targetBookId]: (dayData[targetBookId] || 0) + seconds };
      const updatedStats = { ...prev, [today]: updatedDayData };
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(updatedStats));
      return updatedStats;
    });
  }, [selectedBookId]);

  useEffect(() => {
    if (isRunning && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, secondsRemaining, saveStats]);

  useEffect(() => {
    if (isRunning && asmrType !== 'none') {
      audioService.play(asmrType, 0.05);
    } else {
      audioService.stop();
    }
  }, [isRunning, asmrType]);

  const toggleTimer = () => {
    triggerHaptic(30);
    setIsRunning(!isRunning);
  };

  const adjustTime = (mins: number) => {
    triggerHaptic(10);
    setSecondsRemaining(prev => Math.max(0, prev + mins * 60));
  };

  const handleAddBook = (title: string) => {
    triggerHaptic(20);
    const newBook: Book = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      color: AESTHETIC_PALETTE[books.length % AESTHETIC_PALETTE.length],
    };
    setBooks(prev => [...prev, newBook]);
    setSelectedBookId(newBook.id);
  };

  const totalToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const dayData = stats[today] || {};
    return Object.values(dayData).reduce((sum: number, val: any) => sum + (val as number), 0);
  }, [stats]);

  return (
    <Layout>
      <div className="flex flex-col space-y-4 animate-in fade-in duration-700">
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-stone-800 rounded-full flex items-center justify-center">
              <Moon size={16} className="text-stone-50" />
            </div>
            <h1 className="font-serif text-2xl tracking-tight text-stone-800 italic">SereneRead</h1>
          </div>
          <button 
            onClick={() => { triggerHaptic(); setShowStats(!showStats); }}
            className={`p-2.5 rounded-full transition-all duration-300 active:scale-90 ${
              showStats ? 'bg-stone-800 text-stone-50 rotate-90 shadow-lg' : 'bg-white shadow-sm'
            }`}
          >
            {showStats ? <Settings2 size={20} /> : <BarChart3 size={20} />}
          </button>
        </div>

        {showStats ? (
          <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[40px] p-6 shadow-sm overflow-y-auto no-scrollbar max-h-[85vh]">
             <div className="flex justify-between items-end mb-8 px-2">
                <div>
                  <h2 className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Weekly Insight</h2>
                  <p className="font-serif text-3xl text-stone-800">Your Progress</p>
                </div>
                <div className="text-right">
                   <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest">Today Total</p>
                   <p className="text-2xl font-medium text-stone-700">{Math.floor(totalToday / 60)}m</p>
                </div>
             </div>
             <StatsChart stats={stats} books={books} />
             <button 
                onClick={() => { triggerHaptic(); setShowStats(false); }}
                className="w-full mt-10 py-5 rounded-[24px] bg-stone-800 text-stone-50 font-medium text-sm active:scale-95 shadow-xl transition-all"
             >
               Back to Focus
             </button>
          </div>
        ) : (
          <div className="space-y-0 flex flex-col items-center">
            <div className="w-full mb-1">
              <BookManager 
                books={books}
                selectedBookId={selectedBookId}
                onSelect={(id) => { triggerHaptic(10); setSelectedBookId(id); }}
                onAdd={handleAddBook}
                onDelete={(id) => { triggerHaptic(40); setBooks(prev => prev.filter(b => b.id !== id)); if(selectedBookId === id) setSelectedBookId(null); }}
                onEdit={(id, title) => { triggerHaptic(15); setBooks(prev => prev.map(b => b.id === id ? { ...b, title } : b)); }}
              />
            </div>

            <div className="w-full bg-white/40 backdrop-blur-xl border border-white/50 rounded-[48px] p-6 pb-10 shadow-sm relative overflow-hidden transition-all duration-500">
              <TimerDisplay secondsRemaining={secondsRemaining} isRunning={isRunning} />
              
              <div className="flex justify-center items-center space-x-2 bg-stone-100/30 w-fit mx-auto px-4 py-1.5 rounded-full mt-6">
                <Volume2 size={12} className="text-stone-400 mr-1" />
                {(['none', 'white', 'pink', 'brown'] as ASMRType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => { triggerHaptic(); setAsmrType(type); }}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all active:scale-90 ${
                      asmrType === type ? 'bg-stone-800 text-stone-50 shadow-sm' : 'text-stone-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full grid grid-cols-1 gap-4 px-4 pt-8">
              <div className="flex justify-center items-center space-x-8">
                <button 
                  onClick={() => adjustTime(-5)}
                  className="p-4 rounded-full bg-white border border-stone-100 text-stone-400 active:bg-rose-50 active:text-rose-400 active:scale-90 shadow-sm transition-all duration-200"
                >
                  <Minus size={22} />
                </button>
                
                <button 
                  onClick={toggleTimer}
                  className={`p-11 rounded-full transition-all duration-700 shadow-2xl relative overflow-hidden active:scale-90 ${
                    isRunning 
                    ? 'bg-rose-50 text-rose-500 shadow-rose-100' 
                    : 'bg-stone-800 text-stone-50 shadow-stone-300'
                  }`}
                >
                  <div className="relative z-10">
                    {isRunning ? <Pause size={54} fill="currentColor" /> : <Play size={54} fill="currentColor" className="ml-2" />}
                  </div>
                  {isRunning && <div className="absolute inset-0 bg-rose-400/10 animate-pulse"></div>}
                </button>

                <button 
                  onClick={() => adjustTime(5)}
                  className="p-4 rounded-full bg-white border border-stone-100 text-stone-400 active:bg-emerald-50 active:text-emerald-400 active:scale-90 shadow-sm transition-all duration-200"
                >
                  <Plus size={22} />
                </button>
              </div>

              <div className="flex justify-center items-center space-x-3 pt-2">
                <div className="bg-white/30 backdrop-blur-sm px-4 py-2.5 rounded-[24px] border border-white/50 flex space-x-3 shadow-sm">
                  {[15, 25, 45, 60].map(mins => (
                    <button key={mins} onClick={() => { triggerHaptic(); setIsRunning(false); setSecondsRemaining(mins * 60); }} className="text-[11px] font-bold text-stone-400 active:text-stone-800 px-3 py-1.5 rounded-xl transition-all active:scale-90">
                      {mins}m
                    </button>
                  ))}
                  <div className="w-[1px] bg-stone-200 mx-1"></div>
                  <button onClick={() => { triggerHaptic(40); setIsRunning(false); setSecondsRemaining(1500); }} className="p-2 text-stone-300 active:text-rose-400 active:rotate-[-45deg] transition-all duration-300">
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
