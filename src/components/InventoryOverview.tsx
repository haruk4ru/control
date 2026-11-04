import React, { useState, useMemo } from 'react';
import { Boxes, Search, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { InventoryItem, StorageLocation, ALL_STORAGE_LOCATIONS } from '../types';

interface InventoryOverviewProps {
  items: InventoryItem[];
  onDeleteItem: (itemId: string) => void;
  onGoToIncoming: () => void;
  onGoToUsage: () => void;
}

export const InventoryOverview: React.FC<InventoryOverviewProps> = ({
  items,
  onDeleteItem,
  onGoToIncoming,
  onGoToUsage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStorage, setSelectedStorage] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ORDER_NEEDED' | 'NORMAL'>('ALL');

  // Filtered items logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        item.storage.toLowerCase().includes(searchQuery.trim().toLowerCase());

      const matchStorage = selectedStorage === 'ALL' || item.storage === selectedStorage;

      let matchStatus = true;
      if (statusFilter === 'ORDER_NEEDED') {
        matchStatus = item.quantity < 5;
      } else if (statusFilter === 'NORMAL') {
        matchStatus = item.quantity >= 5;
      }

      return matchSearch && matchStorage && matchStatus;
    });
  }, [items, searchQuery, selectedStorage, statusFilter]);

  const orderNeededCount = items.filter((item) => item.quantity < 5).length;
  const normalCount = items.filter((item) => item.quantity >= 5).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Boxes className="w-4 h-4" />
            <span>재고 현황</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            현재 재고 현황
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            입고 및 오늘 사용에서 등록한 값이 실시간으로 적용된 현재 남은 재고입니다.
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onGoToIncoming}
            className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            새 제품 입고 등록
          </button>
          <button
            onClick={onGoToUsage}
            className="px-4 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
          >
            오늘 사용 등록
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Refrigerator Filter & Order Status Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 self-start text-xs font-bold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체 ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('ORDER_NEEDED')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                statusFilter === 'ORDER_NEEDED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>주문 필요 ({orderNeededCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('NORMAL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'NORMAL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              정상 ({normalCount})
            </button>
          </div>
        </div>

        {/* 7 Refrigerators Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1 text-[11px]">
            냉장고 필터:
          </span>
          <button
            onClick={() => setSelectedStorage('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
              selectedStorage === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체
          </button>
          {ALL_STORAGE_LOCATIONS.map((loc) => {
            const isSelected = selectedStorage === loc;
            return (
              <button
                key={loc}
                onClick={() => setSelectedStorage(loc)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {loc}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stock List Table */}
      {items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Boxes className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            현재 등록된 재고가 없습니다
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            &apos;새 제품 입고 등록&apos; 탭에서 제품의 이름과 냉장고, 입고 수량을 등록해주세요.
          </p>
          <button
            onClick={onGoToIncoming}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            + 새 제품 등록하기
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3.5 px-6">제품명</th>
                  <th className="py-3.5 px-4">보관 냉장고</th>
                  <th className="py-3.5 px-6 text-right">남은 수량</th>
                  <th className="py-3.5 px-6">상태 안내</th>
                  <th className="py-3.5 px-4 text-center w-16">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      검색 조건에 맞는 제품이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isOrderNeeded = item.quantity < 5;

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isOrderNeeded
                            ? 'bg-rose-50/80 hover:bg-rose-100/70 border-l-4 border-l-rose-500'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        {/* 제품명 */}
                        <td className="py-4 px-6 font-bold text-base text-slate-900">
                          {item.name}
                        </td>

                        {/* 보관 냉장고 */}
                        <td className="py-4 px-4 font-bold text-slate-700">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold text-xs">
                            {item.storage}
                          </span>
                        </td>

                        {/* 남은 수량 (보기 전용) */}
                        <td className="py-4 px-6 text-right font-mono font-black text-xl">
                          <span className={isOrderNeeded ? 'text-rose-600' : 'text-slate-900'}>
                            {item.quantity}개
                          </span>
                        </td>

                        {/* 상태 안내 (5개 미만 시 경고 배경색 및 주문 필요 안내) */}
                        <td className="py-4 px-6">
                          {isOrderNeeded ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>주문 필요 (5개 미만)</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>재고 정상</span>
                            </div>
                          )}
                        </td>

                        {/* 삭제 버튼 */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm(`[${item.storage}] '${item.name}' 제품을 삭제하시겠습니까?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                            title="제품 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
