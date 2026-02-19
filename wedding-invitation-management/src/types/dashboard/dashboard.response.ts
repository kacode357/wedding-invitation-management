// Guest category breakdown
export interface GuestCategory {
  category: string;
  count: number;
}

// Guest statistics
export interface GuestCount {
  total: number;
}

// Table statistics
export interface TableCount {
  total: number;
  occupied: number;
  available: number;
}

// User statistics
export interface UserCount {
  total: number;
}

// Main statistics object from API
export interface Statistics {
  guests: GuestCount;
  tables: TableCount;
  users: UserCount;
  guestsByCategory: GuestCategory[];
  unassignedGuests: number;
}

// Dashboard API response wrapper
export interface DashboardResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
  statistics?: Statistics;
}
