export type StorageLocation =
  | '1번 냉동고'
  | '2번 냉동고'
  | '3번 냉동고'
  | '1번 스탠드 냉동고'
  | '2번 스탠드 냉동고'
  | '1번 쇼케이스 냉장고'
  | '2번 쇼케이스 냉장고';

export const ALL_STORAGE_LOCATIONS: StorageLocation[] = [
  '1번 냉동고',
  '2번 냉동고',
  '3번 냉동고',
  '1번 스탠드 냉동고',
  '2번 스탠드 냉동고',
  '1번 쇼케이스 냉장고',
  '2번 쇼케이스 냉장고',
];

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  storage: StorageLocation;
  registeredDate: string; // YYYY-MM-DD
  lastUpdated: string;
}

export interface StockLog {
  id: string;
  timestamp: string;
  type: 'INCOMING' | 'USAGE';
  itemId: string;
  itemName: string;
  quantityChange: number;
  remainingQuantity: number;
  storage: StorageLocation;
}
