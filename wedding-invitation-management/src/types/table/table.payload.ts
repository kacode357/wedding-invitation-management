export interface CreateTablePayload {
  tableName: string;
  capacity: number;
  guestIds?: string[];
}
