export interface Plan {
  _id: string;
  planNameEn: string;
  planNameTa: string;
  descriptionEn?: string;
  descriptionTa?: string;
  price: number;
  durationInDays: number;
  featuresEn: string[];
  featuresTa: string[];
  profileViewLimit: number;
  contactLimit: number;
  isActive: boolean;
}

export interface PlanPayload {
  planNameEn: string;
  planNameTa: string;
  descriptionEn?: string;
  descriptionTa?: string;
  price: number;
  durationInDays: number;
  featuresEn: string[];
  featuresTa: string[];
  profileViewLimit: number;
  contactLimit: number;
}