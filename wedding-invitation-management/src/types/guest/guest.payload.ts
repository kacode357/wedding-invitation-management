// Single guest data for bulk creation
export interface GuestData {
  guestName: string;
  phone?: string;
  numberOfGuests: number;
  notes?: string;
  categoryId: number | string; // string for MongoDB _id, number for default value 0
}

// Bulk guest creation payload
export interface BulkGuestPayload {
  guests: GuestData[];
}

// Guest update payload
export interface UpdateGuestPayload {
  guestName?: string;
  categoryId?: number | string;
  phone?: string;
  numberOfGuests?: number;
  tableId?: number | string;
  invitationSent?: boolean;
  notes?: string;
}