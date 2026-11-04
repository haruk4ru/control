import React, { useState, useMemo } from 'react';
import { MinusCircle, Search, Check, ArrowRight, Minus, Plus } from 'lucide-react';
import { InventoryItem, ALL_STORAGE_LOCATIONS } from '../types';

interface UsageRegisterViewProps {
  items: InventoryItem[];
  onDeductStock: (itemId: string, deductQty: number) => void;
  onNavigateToInventory: () => void;
  onNavigateToIncoming: () => void;
}

export const UsageRegisterView: React.FC<UsageRegisterViewProps> = ({
  items,
  onDeductStock,
  onNavigateToInventory,
  onNavigateToIncoming,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [useQuantity, setUseQuantity] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [storageFilter, setStorageFilter] = useState<string>('ALL');
  const [successBanner, setSuccessBanner] = useState<{
    itemName: string;
    usedQty: number;
    remaining: number;
    storage: string;
  } | null>(null);

  // Selected item reference
  const selectedItem = items.find((i) => i.id === selectedItemId);

  // Filtered available items for picker
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.storage.toLowerCase().includes(query);
      const matchStorage = storageFilter === 'ALL' || item.storage === storageFilter;
      return matchSearch && matchStorage;
    });
  }, [items, searchQuery, storageFilter]);

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItemId(item.id);
    setUseQuantity(1);
    setSuccessBanner(null);
  };

  const handleDeduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) {
      alert('차감할 제품을 선택해주세요.');
      return;
    }
    if (useQuantity <= 0) {
      alert('사용 수량은 1개 이상이어야 합니다.');
      return;
    }

    if (useQuantity > selectedItem.quantity) {
      const confirmExceed = window.confirm(
        `현재 남은 수량(${selectedItem.quantity}개)보다 많은 수량(${useQuantity}개)을 차감하시겠습니까? 잔여 수량이 0이 됩니다.`
      );
      if (!confirmExceed) return;
    }

    const actualDeduct = Math.min(useQuantity, selectedItem.quantity);
    const newRemaining = Math.max(0, selectedItem.quantity - actualDeduct);

    onDeductStock(selectedItem.id, actualDeduct);

    setSuccessBanner({
      itemName: selectedItem.name,
      usedQty: actualDeduct,
      remaining: newRemaining,
      storage: selectedItem.storage,
    });

    setUseQuantity(1);

    setTimeout(() => {
      setSuccessBanner(null);
    }, 4500);
  };

  // If no items registered in the inventory
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <MinusCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          현재 등록된 제품이 없습니다
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          새 제품 입고 등록 창에서 먼저 제품의 이름과 냉장고, 입고 수량을 등록해주세요.
        </p>
        <div>
          <button
            onClick={onNavigateToIncoming}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
          >
            새 제품 등록하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
          <MinusCircle className="w-4 h-4" />
          <span>사용 등록 (차감)</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          오늘 사용 등록
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          제품명과 오늘 사용한 갯수를 입력하면 현재 남은 재고에서 자동으로 차감됩니다.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                차감 완료: [{successBanner.storage}] {successBanner.itemName} -{successBanner.usedQty}개
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                남은 수량: <span className="font-bold font-mono text-sm">{successBanner.remaining}개</span>
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToInventory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <span>재고 현황 확인</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Left Item Picker & Right Deduct Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Product Selection List (5 cols) */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col h-[500px]">
          <div className="mb-3 space-y-2">
            <h2 className="text-sm font-bold text-slate-900">
              차감할 제품 선택
            </h2>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="제품명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* Storage Filter buttons */}
            <div className="flex gap-1 overflow-x-auto py-1 text-[11px]">
              <button
                type="button"
                onClick={() => setStorageFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition-colors ${
                  storageFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                전체
              </button>
              {ALL_STORAGE_LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setStorageFilter(loc)}
                  className={`px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition-colors ${
                    storageFilter === loc
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 divide-y divide-slate-100 pr-1">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                해당 조건의 제품이 없습니다.
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50 border border-amber-300 ring-1 ring-amber-300'
                        : 'bg-white hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {item.storage}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-slate-900">
                        {item.quantity}개
                      </div>
                      <div className="text-[10px] text-slate-400">
                        남음
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Deduction Execution Form (7 cols) */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          {selectedItem ? (
            <form onSubmit={handleDeduct} className="space-y-6">
              
              {/* Selected Item Summary Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-amber-600 uppercase">
                  차감 선택 제품
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedItem.name}
                    </h3>
                    <div className="text-xs font-medium text-slate-600 mt-1">
                      보관: <strong className="text-slate-900">{selectedItem.storage}</strong>
                    </div>
                  </div>

                  <div className="text-right p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-400">현재 남은 수량</span>
                    <div className="text-2xl font-bold font-mono text-slate-900">
                      {selectedItem.quantity}개
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Used Quantity Stepper */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  오늘 사용한 갯수 입력 <span className="text-rose-500">*</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setUseQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xl flex items-center justify-center transition-colors border border-slate-300"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={useQuantity}
                      onChange={(e) => setUseQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full py-3 text-center font-mono text-3xl font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setUseQuantity((prev) => prev + 1)}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xl flex items-center justify-center transition-colors border border-slate-300"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Steppers & Use All */}
                <div className="flex items-center gap-2 mt-2.5">
                  {[1, 2, 3, 5].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setUseQuantity(amt)}
                      className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                    >
                      {amt}개
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setUseQuantity(selectedItem.quantity)}
                    className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors ml-auto"
                  >
                    전량 사용 ({selectedItem.quantity}개)
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={selectedItem.quantity <= 0}
                  className={`w-full sm:w-auto px-6 py-3 font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 ${
                    selectedItem.quantity <= 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <MinusCircle className="w-4 h-4" />
                  <span>오늘 사용 차감 실행</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8 text-slate-400">
              차감할 제품을 왼쪽에서 선택해주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
