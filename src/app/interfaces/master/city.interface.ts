import { State } from './state.interface';

export interface City {
  _id: string;
  stateId: string | State;
  nameEn: string;
  nameTa: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CityPayload {
  stateId: string;
  nameEn: string;
  nameTa: string;
  sortOrder: number;
}