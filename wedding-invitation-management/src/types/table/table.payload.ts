export interface CreateTablePayload {
  tableName: string;
  capacity: number;
  guestIds?: string[];
}

export interface RenameTablePayload {
  tableName: string;
}

export interface UpdateTablePayload {
  tableName: string;
  tableNumber?: number;
  capacity: number;
}
