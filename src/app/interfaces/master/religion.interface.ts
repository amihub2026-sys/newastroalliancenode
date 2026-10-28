export interface Religion {
  _id: string;
  nameEn: string;
  nameTa: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReligionPayload {
  nameEn: string;
  nameTa: string;
  sortOrder: number;
  isActive: boolean;
}