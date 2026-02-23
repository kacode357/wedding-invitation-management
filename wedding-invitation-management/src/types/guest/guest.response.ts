// Single guest from API
export interface Guest {
  id?: number;
  _id?: string;
  guestName: string;
  relationship?: string;
  phone?: string;
  address?: string;
  numberOfGuests: number;
  confirmedGuests: number;
  notes?: string;
  categoryId?: number | string;
  categoryName?: string;
  category?: string; // Some APIs return "category" instead of "categoryName"
  groupId?: string | null;
  groupName?: string | null;
  groupPriorityLevel?: number | null;
  tableId?: number | string | null;
  tableName?: string | number | null;
  table?: {
    _id: string;
    tableName?: string | number;
    tableNumber?: number;
    capacity?: number;
  };
  noteId?: string | null;
  noteName?: string | null;
  invitationSent?: boolean;
  isInvitationCreated?: boolean;
  invitationId?: string;
  isArrived?: boolean;
  arrivedAt?: string | null;
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
  data?: {
    guest: Guest;
  };
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

// Search guest by table response
export interface TableInfo {
  _id: string;
  tableName: string | number;
  tableNumber: number;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface GuestSearchTableResponse {
  success: boolean;
  data: {
    guest: Guest;
    table: TableInfo;
    tableGuests: Guest[];
  };
}