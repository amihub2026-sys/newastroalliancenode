export interface Country {
  _id: string;
  nameEn: string;
  nameTa: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CountryPayload {
  nameEn: string;
  nameTa: string;
  sortOrder: number;
}