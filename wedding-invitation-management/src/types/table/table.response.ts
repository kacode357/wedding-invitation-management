import type { Guest } from '../guest/guest.response';

export interface Table {
  _id: string;
  tableName: string;
  tableNumber?: number;
  capacity: number;
  guestIds?: string[];
  currentGuests?: number;
  availableSeats?: number;
  guests?: Guest[];  // For table detail
  createdAt?: string;
  updatedAt?: string;
}

export interface TableResponse {
  success: boolean;
  message?: string;
  table?: Table;
}

export interface TablesResponse {
  success: boolean;
  data?: {
    tables: Table[];
    count: number;
  };
}

export interface TableDetailResponse {
  success: boolean;
  message?: string;
  data?: {
    table: Table;
  };
}

export interface GuestAssignResponse {
  success: boolean;
  message?: string;
  table?: Table;
}
