import React, { useState, useEffect, useCallback } from 'react';
import { InventoryItem, StockLog, StorageLocation } from './types';
import { INITIAL_ITEMS, INITIAL_LOGS } from './mockData';
import { Header } from './components/Header';
import { IncomingRegisterView } from './components/IncomingRegisterView';
import { UsageRegisterView } from './components/UsageRegisterView';
import { InventoryOverview } from './components/InventoryOverview';

const PRIMARY_STORAGE_KEY = 'inventory_mgmt_items_permanent_v1';
const BACKUP_STORAGE_KEY = 'inventory_mgmt_backup_permanent_v1';
const LOGS_STORAGE_KEY = 'inventory_mgmt_logs_permanent_v1';

// Function to load saved items with cross-version recovery
const loadSavedItems = (): InventoryItem[] => {
  try {
    const keysToCheck = [
      PRIMARY_STORAGE_KEY,
      BACKUP_STORAGE_KEY,
      'inventory_mgmt_items_v4',
      'inventory_mgmt_items_v3',
    ];

    for (const key of keysToCheck) {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            id: item.id || `item-${Date.now()}-${Math.random()}`,
            name: item.name || '',
            quantity: typeof item.quantity === 'number' ? item.quantity : 0,
            storage: item.storage || '1번 냉동고',
            registeredDate: item.registeredDate || new Date().toISOString().split('T')[0],
            lastUpdated: item.lastUpdated || new Date().toISOString(),
          }));
        }
      }
    }
  } catch (e) {
    console.error('Failed to load items from storage', e);
  }
  return INITIAL_ITEMS;
};

// Function to load saved logs
const loadSavedLogs = (): StockLog[] => {
  try {
    const saved = localStorage.getItem(LOGS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load logs', e);
  }
  return INITIAL_LOGS;
};

export default function App() {
  // Navigation tab: 'incoming' | 'usage' | 'inventory'
  const [currentTab, setCurrentTab] = useState<'incoming' | 'usage' | 'inventory'>('incoming');

  // Items State (loaded permanently from storage)
  const [items, setItems] = useState<InventoryItem[]>(loadSavedItems);

  // Logs State
  const [logs, setLogs] = useState<StockLog[]>(loadSavedLogs);

  // Last saved time indicator
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  });

  // Permanently save items to primary and backup storage keys
  const saveToStorage = useCallback((newItems: InventoryItem[]) => {
    try {
      const serialized = JSON.stringify(newItems);
      localStorage.setItem(PRIMARY_STORAGE_KEY, serialized);
      localStorage.setItem(BACKUP_STORAGE_KEY, serialized);
      setLastSavedTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error('Failed to persist items', e);
    }
  }, []);

  // Sync on every item state update
  useEffect(() => {
    saveToStorage(items);
  }, [items, saveToStorage]);

  // Sync logs
  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to persist logs', e);
    }
  }, [logs]);

  // Ensure document uses bright light theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // 1. Add Incoming Stock
  const handleAddStock = (
    itemData: {
      name: string;
      quantity: number;
      storage: StorageLocation;
      registeredDate: string;
    },
    mergeExistingId?: string
  ) => {
    const timestamp = new Date().toISOString();

    if (mergeExistingId) {
      let newRemaining = 0;
      setItems((prev) => {
        const next = prev.map((item) => {
          if (item.id === mergeExistingId) {
            newRemaining = item.quantity + itemData.quantity;
            return {
              ...item,
              quantity: newRemaining,
              storage: itemData.storage,
              lastUpdated: timestamp,
            };
          }
          return item;
        });
        saveToStorage(next);
        return next;
      });

      const newLog: StockLog = {
        id: `log-${Date.now()}`,
        timestamp,
        type: 'INCOMING',
        itemId: mergeExistingId,
        itemName: itemData.name,
        quantityChange: itemData.quantity,
        remainingQuantity: newRemaining,
        storage: itemData.storage,
      };
      setLogs((prev) => [newLog, ...prev]);
    } else {
      const newItemId = `item-${Date.now()}`;
      const newItem: InventoryItem = {
        id: newItemId,
        ...itemData,
        lastUpdated: timestamp,
      };

      setItems((prev) => {
        const next = [newItem, ...prev];
        saveToStorage(next);
        return next;
      });

      const newLog: StockLog = {
        id: `log-${Date.now()}`,
        timestamp,
        type: 'INCOMING',
        itemId: newItemId,
        itemName: itemData.name,
        quantityChange: itemData.quantity,
        remainingQuantity: itemData.quantity,
        storage: itemData.storage,
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  // 2. Deduct Used Stock (Auto-deduction)
  const handleDeductStock = (itemId: string, deductQty: number) => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) return;

    const actualDeduct = Math.min(deductQty, targetItem.quantity);
    const newRemaining = Math.max(0, targetItem.quantity - actualDeduct);
    const timestamp = new Date().toISOString();

    setItems((prev) => {
      const next = prev.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            quantity: newRemaining,
            lastUpdated: timestamp,
          };
        }
        return i;
      });
      saveToStorage(next);
      return next;
    });

    const newLog: StockLog = {
      id: `log-${Date.now()}`,
      timestamp,
      type: 'USAGE',
      itemId: targetItem.id,
      itemName: targetItem.name,
      quantityChange: -actualDeduct,
      remainingQuantity: newRemaining,
      storage: targetItem.storage,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Delete product from inventory
  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== itemId);
      saveToStorage(next);
      return next;
    });
  };

  // Export current inventory state to a downloadable JSON file for permanent external backup
  const handleExportBackup = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `재고현황_백업_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import backup file into state and persist
  const handleImportBackup = (importedItems: InventoryItem[]) => {
    setItems(importedItems);
    saveToStorage(importedItems);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header with Auto-Save status & Backup actions */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        items={items}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        lastSavedTime={lastSavedTime}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'incoming' && (
          <IncomingRegisterView
            items={items}
            onAddStock={handleAddStock}
            onNavigateToInventory={() => setCurrentTab('inventory')}
          />
        )}

        {currentTab === 'usage' && (
          <UsageRegisterView
            items={items}
            onDeductStock={handleDeductStock}
            onNavigateToInventory={() => setCurrentTab('inventory')}
            onNavigateToIncoming={() => setCurrentTab('incoming')}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryOverview
            items={items}
            onDeleteItem={handleDeleteItem}
            onGoToIncoming={() => setCurrentTab('incoming')}
            onGoToUsage={() => setCurrentTab('usage')}
          />
        )}
      </main>

      {/* Footer with permanent save confirmation */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-2">
          <div>재고관리 시스템</div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <span>● 브라우저 저장소에 실시간 영구 보관 중</span>
            <span>(앱을 다시 열어도 내용이 유지됩니다)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
