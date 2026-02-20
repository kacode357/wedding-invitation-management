// Single guest data for bulk creation
export interface GuestData {
  guestName: string;
  phone?: string;
  numberOfGuests: number;
  confirmedGuests?: number;
  categoryId: number | string; // string for MongoDB _id, number for default value 0
  groupId?: string;
  tableId?: number | string;
  noteId?: string;
}

// Bulk guest creation payload
export interface BulkGuestPayload {
  guests: GuestData[];
}

// Guest update payload
export interface UpdateGuestPayload {
  guestName?: string;
  categoryId?: number | string;
  groupId?: string;
  phone?: string;
  numberOfGuests?: number;
  confirmedGuests?: number;
  tableId?: number | string;
  invitationSent?: boolean;
  noteId?: string;
}