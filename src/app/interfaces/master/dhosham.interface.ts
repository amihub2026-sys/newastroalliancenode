export interface Dhosham {
  _id: string;
  nameEn: string;
  nameTa: string;
  sortOrder: number;
  isActive: boolean;
}

export interface DhoshamPayload {
  nameEn: string;
  nameTa: string;
  sortOrder: number;
}