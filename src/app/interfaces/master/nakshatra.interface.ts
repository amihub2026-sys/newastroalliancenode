export interface Nakshatra {
  _id: string;
  nameEn: string;
  nameTa: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NakshatraPayload {
  nameEn: string;
  nameTa: string;
  sortOrder: number;
}