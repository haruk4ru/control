import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PackagePlus, Check, ArrowRight, Plus, Minus } from 'lucide-react';
import { InventoryItem, StorageLocation, ALL_STORAGE_LOCATIONS } from '../types';

interface IncomingRegisterViewProps {
  items: InventoryItem[];
  onAddStock: (
    itemData: {
      name: string;
      quantity: number;
      storage: StorageLocation;
      registeredDate: string;
    },
    mergeExistingId?: string
  ) => void;
  onNavigateToInventory: () => void;
}

export const IncomingRegisterView: React.FC<IncomingRegisterViewProps> = ({
  items,
  onAddStock,
  onNavigateToInventory,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [storage, setStorage] = useState<StorageLocation>('1번 냉동고');
  const [quantity, setQuantity] = useState<number>(1);
  const [isFocused, setIsFocused] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Autocomplete suggestions from already registered items
  const matchingSuggestions = useMemo(() => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) {
      return items.slice(0, 6);
    }
    return items.filter((item) => item.name.toLowerCase().includes(trimmed));
  }, [items, name]);

  // Check if current input matches an existing item in this specific refrigerator
  const existingItemInStorage = items.find(
    (item) =>
      item.name.trim().toLowerCase() === name.trim().toLowerCase() &&
      item.storage === storage
  );

  // Close autocomplete on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item: InventoryItem) => {
    setName(item.name);
    setStorage(item.storage);
    setIsFocused(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      alert('제품명을 입력해주세요.');
      return;
    }
    if (quantity <= 0) {
      alert('입고 수량은 1개 이상이어야 합니다.');
      return;
    }

    const mergeId = existingItemInStorage ? existingItemInStorage.id : undefined;

    onAddStock(
      {
        name: trimmedName,
        quantity,
        storage,
        registeredDate: todayStr,
      },
      mergeId
    );

    const registeredMsg = existingItemInStorage
      ? `[${storage}] '${trimmedName}' 수량이 ${quantity}개 추가되어 총 ${existingItemInStorage.quantity + quantity}개가 되었습니다.`
      : `[${storage}] '${trimmedName}' ${quantity}개가 등록되었습니다.`;

    setSuccessMessage(registeredMsg);

    setName('');
    setQuantity(1);
    setIsFocused(false);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
          <PackagePlus className="w-4 h-4" />
          <span>입고 등록</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          새 제품 입고 등록
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          새로 들어온 제품의 이름, 보관 냉장고, 입고 수량을 등록합니다.
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">
                입고 등록 완료
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {successMessage}
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToInventory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <span>재고 현황 확인</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* 1. 제품명 with Autocomplete Recommendation */}
        <div className="relative" ref={containerRef}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-bold text-slate-900">
              제품명 <span className="text-rose-500">*</span>
            </label>
            {existingItemInStorage && (
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                [{storage}]에 이미 {existingItemInStorage.quantity}개 보유 중
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setIsFocused(true);
              }}
              onFocus={() => setIsFocused(true)}
              placeholder="제품명을 입력하세요"
              autoComplete="off"
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-300 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              required
            />
          </div>

          {/* Autocomplete Recommendation Dropdown */}
          {isFocused && matchingSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
              <div className="px-3 py-2 bg-slate-50 text-[11px] font-bold text-slate-500">
                기존 등록 제품 추천 (클릭 시 자동완성)
              </div>
              {matchingSuggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(item);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600">
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ({item.storage})
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {item.quantity}개
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. 냉장고 종류 선택 */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1.5">
            냉장고 종류 선택 <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_STORAGE_LOCATIONS.map((loc) => {
              const isSelected = storage === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setStorage(loc)}
                  className={`py-3 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 입고 수량 */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1.5">
            입고 수량 <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xl flex items-center justify-center transition-colors border border-slate-300"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="flex-1">
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full py-3 text-center font-mono text-2xl font-bold bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setQuantity((prev) => prev + 1)}
              className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xl flex items-center justify-center transition-colors border border-slate-300"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Increment Buttons */}
          <div className="flex items-center gap-2 mt-2.5">
            {[+1, +2, +5, +10].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => setQuantity((prev) => prev + delta)}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
              >
                +{delta}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setQuantity(1)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 ml-auto"
            >
              1개로 리셋
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <PackagePlus className="w-4 h-4" />
            <span>입고 등록 완료</span>
          </button>
        </div>
      </form>
    </div>
  );
};
