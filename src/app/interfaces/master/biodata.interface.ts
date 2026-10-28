export interface BilingualText {
  en: string;
  ta: string;
}

export interface Biodata {
  basic: BasicInfo;
  personal: PersonalInfo;
  religion: ReligionInfo;
  family: FamilyInfo;
  educationCareer: EducationCareer;
  address: AddressInfo;
  astrology: AstrologyInfo;
  media: MediaInfo;
  extras: ExtraInfo;

  profileStatus?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BasicInfo {
  fullName: BilingualText;

  gender: string;

  dob: string;

  age: number;

  birthTime: string;

  mobile: string;

  additionalMobile: string[];

  email: string;

  profileFor: string;
}

export interface PersonalInfo {
  height: string;

  weight: string;

  colorId: string;

  color: string;

  maritalStatusId: string | null;

  maritalStatus: string;

  secondMarriageReason: string;

  childrenStatus: string;

  childrenDetails: BilingualText;

  handicapStatus: string;

  handicapDetails: BilingualText;

  kalappuThirumanam: string;

  kalappuThirumanamDetails: BilingualText;
}

export interface ReligionInfo {
  religionId: string | null;

  religion: string;

  casteId: string | null;

  caste: string;

  otherCaste: string;

  noCastePreference: boolean;

  subCaste: BilingualText;

  gothram: BilingualText;
}

export interface FamilyInfo {
  fatherName: BilingualText;

  motherName: BilingualText;

  fatherOccupation: BilingualText;

  motherOccupation: BilingualText;

  marriedBrothers: number;

  unmarriedBrothers: number;

  marriedSisters: number;

  unmarriedSisters: number;

  kudumbaNilaiId: string;

  kudumbaNilai: BilingualText;

  sothukal: BilingualText;

  poorvegam: BilingualText;

  iruppidam: BilingualText;

  kuladeivam: BilingualText;
}

export interface EducationCareer {
  education: string;

  otherEducation: string;

  job: BilingualText;

  otherProfession: string;

  company: BilingualText;

  workPlace: BilingualText;

  salary: BilingualText;
}

export interface AddressInfo {
  address: BilingualText;

  country: string;

  state: string;

  city: string;

  stateId: string | null;

  cityId: string | null;

  latitude: number | null;

  longitude: number | null;
}

export interface AstrologyInfo {
  rasiId: string | null;

  rasi: string;

  nakshatraId: string | null;

  nakshatra: string;

  lagnamId: string | null;

  lagnam: string;

  dhoshamId: string | null;

  dhosham: string;

  birthPlace: BilingualText;

  thisai: BilingualText;

  thisaiIruppuId: string | null;

  thisaiIruppu: string;

  paatham: BilingualText;

  thisaiYear: string;

  thisaiMonth: string;

  thisaiDay: string;

  rasiChart: string[];

  amsamChart: string[];

  horoscopeFile: string;
}

export interface MediaInfo {
  profileImage: string;

  gallery: string[];

  video: string;
}

export interface ExtraInfo {
  aboutMe: BilingualText;

  partnerExpectation: BilingualText;
}