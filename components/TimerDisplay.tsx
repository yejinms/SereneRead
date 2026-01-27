
import React from 'react';

interface TimerDisplayProps {
  secondsRemaining: number;
  isRunning: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ secondsRemaining, isRunning }) => {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className={`relative transition-all duration-1000 ${isRunning ? 'scale-105' : 'scale-100'}`}>
        <div className="font-serif text-[130px] md:text-[160px] leading-[0.9] tracking-[-0.05em] text-stone-800 flex tabular-nums items-center">
          <span className="inline-block min-w-[1.2ch] text-center">{formatTime(minutes)}</span>
          <span className="text-[60px] md:text-[80px] text-stone-600/40 mx-1 leading-none">:</span>
          <span className="inline-block min-w-[1.2ch] text-center">{formatTime(seconds)}</span>
        </div>
        
        {/* Subtle glow effect when running */}
        {isRunning && (
          <div className="absolute inset-0 bg-stone-400/5 blur-[80px] -z-10 rounded-full scale-150 animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

export default TimerDisplay;
