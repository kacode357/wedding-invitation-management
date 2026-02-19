// Single guest from API
export interface Guest {
  id?: number;
  _id?: string;
  guestName: string;
  relationship?: string;
  phone: string;
  address?: string;
  numberOfGuests: number;
  notes?: string;
  categoryId?: number | string;
  categoryName?: string;
  category?: string; // Some APIs return "category" instead of "categoryName"
  tableId?: number | string;
  tableName?: string | number;
  table?: {
    _id: string;
    tableName?: string | number;
    tableNumber?: number;
    capacity?: number;
  };
  invitationSent?: boolean;
  arrived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Bulk guest creation response
export interface BulkGuestResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
  createdCount?: number;
  guests?: Guest[];
  data?: {
    guests: Guest[];
    count: number;
  };
}

// Single guest response
export interface GuestResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
  guest?: Guest;
}

// Guests list response
export interface GuestsResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
  guests?: Guest[];
  total?: number;
}

// Guest list response with pagination (new)
export interface GuestListResponse {
  success: boolean;
  data: {
    guests: Guest[];
    count: number;
  };
}