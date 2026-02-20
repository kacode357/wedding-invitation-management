// Guest category breakdown
export interface GuestCategory {
  category: string;
  count: number;
}

// Guests object
export interface GuestsData {
  confirmedGuests: number;
  numberOfGuests: number;
}

// Invitations object
export interface InvitationsData {
  familiesInvited: number;
  invitationsSent: number;
}

// Main statistics object from API
export interface Statistics {
  guests: GuestsData;
  invitations: InvitationsData;
  guestsByCategory: GuestCategory[];
}

// Dashboard API response wrapper
export interface DashboardResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
  guests?: GuestsData;
  invitations?: InvitationsData;
  guestsByCategory?: GuestCategory[];
}
