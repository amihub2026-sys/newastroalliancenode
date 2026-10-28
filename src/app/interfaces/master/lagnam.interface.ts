export interface Lagnam {
  _id: string;
  nameEn: string;
  nameTa: string;
  sortOrder: number;
  isActive: boolean;
}

export interface LagnamPayload {
  nameEn: string;
  nameTa: string;
  sortOrder: number;
}