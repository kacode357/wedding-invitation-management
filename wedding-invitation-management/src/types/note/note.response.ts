// Note from API
export interface Note {
  _id: string;
  name: string;
  description?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Notes list response (wrapped in data)
export interface NotesResponse {
  success: boolean;
  data?: {
    notes: Note[];
    count?: number;
  };
  message?: string;
  timestamp?: string;
}

// Notes list response (direct)
export interface NotesResponseDirect {
  success: boolean;
  notes?: Note[];
  message?: string;
  timestamp?: string;
}

// Single note response (GET by ID)
export interface NoteDetailResponse {
  success: boolean;
  data?: {
    note: Note;
  };
  message?: string;
  timestamp?: string;
}

// Note creation response
export interface NoteCreateResponse {
  success: boolean;
  data?: {
    note: Note;
  };
  message?: string;
  timestamp?: string;
}

// Note update response
export interface NoteUpdateResponse {
  success: boolean;
  data?: {
    note: Note;
  };
  message?: string;
  timestamp?: string;
}

// Note delete response
export interface NoteDeleteResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
}
