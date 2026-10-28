import { Religion } from './religion.interface';

export interface Caste {
  _id: string;
  religionId: string | Religion;
  nameEn: string;
  nameTa: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CastePayload {
  religionId: string;
  nameEn: string;
  nameTa: string;
  isActive: boolean;
}