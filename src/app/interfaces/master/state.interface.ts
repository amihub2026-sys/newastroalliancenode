import { Country } from './country.interface';

export interface State {
  _id: string;
  countryId: string | Country;
  nameEn: string;
  nameTa: string;
  sortOrder: number;
  isActive: boolean;
}

export interface StatePayload {
  countryId: string;
  nameEn: string;
  nameTa: string;
  sortOrder: number;
}