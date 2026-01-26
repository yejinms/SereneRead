
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { Book } from '../types';
import { triggerHaptic } from '../App';

interface BookManagerProps {
  books: Book[];
  selectedBookId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (title: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
}

const BookManager: React.FC<BookManagerProps> = ({
  books,
  selectedBookId,
  onSelect,
  onAdd,
  onDelete,
  onEdit,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [manageId, setManageId] = useState<string | null>(null);
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startLongPress = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      triggerHaptic(30);
      setManageId(id);
    }, 600);
  };

  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAdd(newTitle.trim());
      setNewTitle('');
      setIsAdding(false);
    }
  };

  useEffect(() => {
    if (isAdding && scrollRef.current) {
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
    }
  }, [isAdding]);

  return (
    <div className="w-full overflow-hidden" onClick={() => setManageId(null)}>
      <div className="flex items-center justify-between px-4 mb-1">
        <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold text-stone-400/70">Now Reading</h3>
        <button 
          onClick={(e) => { e.stopPropagation(); triggerHaptic(); setIsAdding(!isAdding); }}
          className={`p-1 rounded-full transition-all active:scale-75 ${
            isAdding ? 'bg-stone-800 text-white rotate-45' : 'bg-white text-stone-300 shadow-sm border border-stone-100'
          }`}
        >
          <Plus size={12} />
        </button>
      </div>

      <div ref={scrollRef} className="flex items-center space-x-2.5 px-4 py-2 overflow-x-auto no-scrollbar flex-nowrap min-h-[58px] w-full">
        {/* General Option */}
        <div 
          className={`flex-shrink-0 flex items-center h-10 px-4 rounded-[18px] transition-all duration-300 border cursor-pointer active:scale-95 ${
            selectedBookId === null ? 'bg-white border-stone-200 shadow-md scale-105 z-10' : 'bg-stone-50/40 border-stone-100/50 text-stone-400'
          }`}
          onClick={(e) => { e.stopPropagation(); onSelect(null); }}
        >
          <div className={`w-2 h-2 rounded-full mr-2.5 bg-stone-300 ${selectedBookId === null ? 'scale-125' : 'scale-100'}`} />
          <span className={`text-sm font-medium ${selectedBookId === null ? 'text-stone-800' : 'text-stone-500'}`}>General</span>
        </div>

        {books.map((book) => (
          <div 
            key={book.id}
            className={`relative flex-shrink-0 flex items-center h-10 px-4 rounded-[18px] transition-all duration-300 border cursor-pointer active:scale-95 ${
              selectedBookId === book.id ? 'bg-white border-stone-200 shadow-md scale-105 z-10' : 'bg-stone-50/40 border-stone-100/50 text-stone-400'
            }`}
            onTouchStart={() => startLongPress(book.id)}
            onTouchEnd={endLongPress}
            onMouseDown={() => startLongPress(book.id)}
            onMouseUp={endLongPress}
            onMouseLeave={endLongPress}
            onClick={(e) => { e.stopPropagation(); if (!manageId) onSelect(book.id); }}
          >
            <div className={`w-2 h-2 rounded-full mr-2.5 ${selectedBookId === book.id ? 'scale-125' : 'scale-100'}`} style={{ backgroundColor: book.color }} />
            
            {editingId === book.id ? (
              <input 
                autoFocus
                className="bg-transparent border-none outline-none text-sm font-medium w-24 text-stone-700"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => { onEdit(book.id, editTitle); setEditingId(null); }}
                onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={`text-sm font-medium truncate max-w-[110px] ${selectedBookId === book.id ? 'text-stone-800' : 'text-stone-500'}`}>
                {book.title}
              </span>
            )}

            {/* 롱 프레스 시 노출되는 액션 버튼 (호버 UI 유지) */}
            {manageId === book.id && (
              <div className="absolute -top-3 -right-2 flex items-center space-x-1 animate-in zoom-in-90 fade-in duration-200 z-50">
                <button 
                  onClick={(e) => { e.stopPropagation(); triggerHaptic(); setEditTitle(book.title); setEditingId(book.id); setManageId(null); }}
                  className="p-1.5 bg-white shadow-xl border border-stone-100 rounded-full text-stone-400 active:scale-75 active:text-stone-600 transition-all"
                >
                  <Edit3 size={12} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); triggerHaptic(40); onDelete(book.id); setManageId(null); }}
                  className="p-1.5 bg-white shadow-xl border border-stone-100 rounded-full text-rose-300 active:scale-75 active:text-rose-500 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        ))}

        {isAdding && (
          <div className="flex-shrink-0 flex items-center h-10 px-4 rounded-[18px] bg-white border border-stone-200 shadow-md animate-in slide-in-from-left-4 fade-in">
            <input 
              autoFocus
              className="bg-transparent border-none outline-none text-sm font-medium w-28 text-stone-700"
              placeholder="Title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd} className="ml-2 text-emerald-500 active:scale-75">
              <Check size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookManager;
