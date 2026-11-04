import React, { useRef } from 'react';
import { PackagePlus, MinusCircle, Boxes, Download, Upload, Check } from 'lucide-react';
import { InventoryItem } from '../types';

interface HeaderProps {
  currentTab: 'incoming' | 'usage' | 'inventory';
  setCurrentTab: (tab: 'incoming' | 'usage' | 'inventory') => void;
  items: InventoryItem[];
  onExportBackup: () => void;
  onImportBackup: (importedItems: InventoryItem[]) => void;
  lastSavedTime: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  items,
  onExportBackup,
  onImportBackup,
  lastSavedTime,
}) => {
  const totalItemsCount = items.length;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          onImportBackup(parsed);
          alert(`성공적으로 ${parsed.length}개의 재고 데이터를 불러왔습니다.`);
        } else {
          alert('올바른 백업 파일 형식이 아닙니다.');
        }
      } catch (err) {
        alert('파일을 읽는 도중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    // Reset file input so user can import the same file again if needed
    e.target.value = '';
  };

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

          {/* Persistence status and backup controls */}
          <div className="flex items-center gap-2 text-xs">
            {/* Auto-save status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>자동 저장됨</span>
            </div>

            {/* Total items badge */}
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              등록: <strong className="text-slate-900 font-bold">{totalItemsCount}개</strong>
            </div>

            {/* Backup Save & Restore buttons */}
            <button
              onClick={onExportBackup}
              title="현재 재고 현황을 파일로 따로 저장(백업)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">백업 저장</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="저장해둔 백업 파일 불러오기"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">불러오기</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
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
