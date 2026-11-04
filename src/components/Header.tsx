import React from 'react';
import { PackagePlus, MinusCircle, Boxes } from 'lucide-react';
import { InventoryItem } from '../types';

interface HeaderProps {
  currentTab: 'incoming' | 'usage' | 'inventory';
  setCurrentTab: (tab: 'incoming' | 'usage' | 'inventory') => void;
  items: InventoryItem[];
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  items,
}) => {
  const totalItemsCount = items.length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Main Brand */}
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={() => setCurrentTab('incoming')}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
              재
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              재고관리
            </span>
          </button>

          {/* Item count indicator */}
          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            등록 제품: <strong className="text-slate-900 font-bold">{totalItemsCount}개</strong>
          </div>
        </div>

        {/* 3 Tabs in exact requested order */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-100">
          <button
            onClick={() => setCurrentTab('incoming')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'incoming'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>새 제품 입고 등록</span>
          </button>

          <button
            onClick={() => setCurrentTab('usage')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'usage'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <MinusCircle className="w-4 h-4" />
            <span>오늘 사용 등록</span>
          </button>

          <button
            onClick={() => setCurrentTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>현재 재고 현황</span>
            {totalItemsCount > 0 && (
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
