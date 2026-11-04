import React, { useState, useEffect } from 'react';
import { InventoryItem, StockLog, StorageLocation } from './types';
import { INITIAL_ITEMS, INITIAL_LOGS } from './mockData';
import { Header } from './components/Header';
import { IncomingRegisterView } from './components/IncomingRegisterView';
import { UsageRegisterView } from './components/UsageRegisterView';
import { InventoryOverview } from './components/InventoryOverview';

const STORAGE_KEY_ITEMS = 'inventory_mgmt_items_v4';
const STORAGE_KEY_LOGS = 'inventory_mgmt_logs_v4';

export default function App() {
  // Navigation tab: 'incoming' | 'usage' | 'inventory'
  const [currentTab, setCurrentTab] = useState<'incoming' | 'usage' | 'inventory'>('incoming');

  // Items State (Empty by default)
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load items', e);
    }
    return INITIAL_ITEMS;
  });

  // Logs State
  const [logs, setLogs] = useState<StockLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load logs', e);
    }
    return INITIAL_LOGS;
  });

  // Persist items & logs in LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save items', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save logs', e);
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
      setItems((prev) =>
        prev.map((item) => {
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
        })
      );

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

      setItems((prev) => [newItem, ...prev]);

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

    setItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            quantity: newRemaining,
            lastUpdated: timestamp,
          };
        }
        return i;
      })
    );

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
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        items={items}
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

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500 font-medium">
          재고관리 시스템
        </div>
      </footer>
    </div>
  );
}
