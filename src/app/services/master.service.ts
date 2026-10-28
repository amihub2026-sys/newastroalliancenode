import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../interfaces/common/api-response.interface';

import { Caste, CastePayload } from '../interfaces/master/caste.interface';
import { Religion, ReligionPayload } from '../interfaces/master/religion.interface';
import { Rasi, RasiPayload } from '../interfaces/master/rasi.interface';
import { Lagnam, LagnamPayload } from '../interfaces/master/lagnam.interface';
import { Country, CountryPayload } from '../interfaces/master/country.interface';
import { State, StatePayload } from '../interfaces/master/state.interface';
import { Nakshatra, NakshatraPayload } from '../interfaces/master/nakshatra.interface';
import { Dhosham, DhoshamPayload } from '../interfaces/master/dhosham.interface';
import { City, CityPayload } from '../interfaces/master/city.interface';
import { Plan, PlanPayload } from '../interfaces/master/plan.interface';
import {
  ThisaiIruppu,
  ThisaiIruppuPayload
} from '../interfaces/master/thisai-iruppu.interface';
@Injectable({
  providedIn: 'root'
})
export class MasterService {
  private baseUrl = `${environment.apiUrl}/masters`;

  constructor(private http: HttpClient) {}
  private getAuthHeaders(): HttpHeaders {
  const token =
    localStorage.getItem('admin_token') ||
    localStorage.getItem('auth_token') ||
    '';

  return new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
}

  getReligions(): Observable<ApiResponse<Religion[]>> {
    return this.http.get<ApiResponse<Religion[]>>(`${this.baseUrl}/religions`);
  }

  createReligion(data: ReligionPayload): Observable<ApiResponse<Religion>> {
    return this.http.post<ApiResponse<Religion>>(`${this.baseUrl}/religions`, data);
  }

  updateReligion(id: string, data: ReligionPayload): Observable<ApiResponse<Religion>> {
    return this.http.put<ApiResponse<Religion>>(`${this.baseUrl}/religions/${id}`, data);
  }

  deleteReligion(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/religions/${id}`);
  }

  getCastes(religionId?: string): Observable<ApiResponse<Caste[]>> {
    const url = religionId
      ? `${this.baseUrl}/castes?religionId=${religionId}`
      : `${this.baseUrl}/castes`;

    return this.http.get<ApiResponse<Caste[]>>(url);
  }

  getCasteProfileCounts(): Observable<ApiResponse<any[]>> {
  return this.http.get<ApiResponse<any[]>>(
    `${this.baseUrl}/castes/profile-counts`
  );
}
 getProfilesByCaste(casteId: string): Observable<ApiResponse<any[]>> {
  return this.http.get<ApiResponse<any[]>>(
    `${this.baseUrl}/castes/${casteId}/profiles`
  );
}
  createCaste(data: CastePayload): Observable<ApiResponse<Caste>> {
    return this.http.post<ApiResponse<Caste>>(`${this.baseUrl}/castes`, data);
  }

  updateCaste(id: string, data: CastePayload): Observable<ApiResponse<Caste>> {
    return this.http.put<ApiResponse<Caste>>(`${this.baseUrl}/castes/${id}`, data);
  }

  deleteCaste(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/castes/${id}`);
  }

  getRasis(): Observable<ApiResponse<Rasi[]>> {
    return this.http.get<ApiResponse<Rasi[]>>(`${this.baseUrl}/rasis`);
  }

  createRasi(data: RasiPayload): Observable<ApiResponse<Rasi>> {
    return this.http.post<ApiResponse<Rasi>>(`${this.baseUrl}/rasis`, data);
  }

  updateRasi(id: string, data: RasiPayload): Observable<ApiResponse<Rasi>> {
    return this.http.put<ApiResponse<Rasi>>(`${this.baseUrl}/rasis/${id}`, data);
  }

  deleteRasi(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/rasis/${id}`);
  }

  getLagnams(): Observable<ApiResponse<Lagnam[]>> {
    return this.http.get<ApiResponse<Lagnam[]>>(`${this.baseUrl}/lagnams`);
  }

  createLagnam(data: LagnamPayload): Observable<ApiResponse<Lagnam>> {
    return this.http.post<ApiResponse<Lagnam>>(`${this.baseUrl}/lagnams`, data);
  }

  updateLagnam(id: string, data: LagnamPayload): Observable<ApiResponse<Lagnam>> {
    return this.http.put<ApiResponse<Lagnam>>(`${this.baseUrl}/lagnams/${id}`, data);
  }

  deleteLagnam(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/lagnams/${id}`);
  }

  getCountries(): Observable<ApiResponse<Country[]>> {
    return this.http.get<ApiResponse<Country[]>>(`${this.baseUrl}/countries`);
  }

  createCountry(data: CountryPayload): Observable<ApiResponse<Country>> {
    return this.http.post<ApiResponse<Country>>(`${this.baseUrl}/countries`, data);
  }

  updateCountry(id: string, data: CountryPayload): Observable<ApiResponse<Country>> {
    return this.http.put<ApiResponse<Country>>(`${this.baseUrl}/countries/${id}`, data);
  }

  deleteCountry(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/countries/${id}`);
  }

  getStates(countryId?: string): Observable<ApiResponse<State[]>> {
    const url = countryId
      ? `${this.baseUrl}/states?countryId=${countryId}`
      : `${this.baseUrl}/states`;

    return this.http.get<ApiResponse<State[]>>(url);
  }

  createState(data: StatePayload): Observable<ApiResponse<State>> {
    return this.http.post<ApiResponse<State>>(`${this.baseUrl}/states`, data);
  }

  updateState(id: string, data: StatePayload): Observable<ApiResponse<State>> {
    return this.http.put<ApiResponse<State>>(`${this.baseUrl}/states/${id}`, data);
  }

  deleteState(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/states/${id}`);
  }

  getCities(stateId?: string): Observable<ApiResponse<City[]>> {
    const url = stateId
      ? `${this.baseUrl}/cities?stateId=${stateId}`
      : `${this.baseUrl}/cities`;

    return this.http.get<ApiResponse<City[]>>(url);
  }

  createCity(data: CityPayload): Observable<ApiResponse<City>> {
    return this.http.post<ApiResponse<City>>(`${this.baseUrl}/cities`, data);
  }

  updateCity(id: string, data: CityPayload): Observable<ApiResponse<City>> {
    return this.http.put<ApiResponse<City>>(`${this.baseUrl}/cities/${id}`, data);
  }

  deleteCity(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/cities/${id}`);
  }

  getNakshatras(rasiId?: string): Observable<ApiResponse<Nakshatra[]>> {
    const url = rasiId
      ? `${this.baseUrl}/nakshatras?rasiId=${rasiId}`
      : `${this.baseUrl}/nakshatras`;

    return this.http.get<ApiResponse<Nakshatra[]>>(url);
  }

  createNakshatra(data: NakshatraPayload): Observable<ApiResponse<Nakshatra>> {
    return this.http.post<ApiResponse<Nakshatra>>(`${this.baseUrl}/nakshatras`, data);
  }

  updateNakshatra(id: string, data: NakshatraPayload): Observable<ApiResponse<Nakshatra>> {
    return this.http.put<ApiResponse<Nakshatra>>(`${this.baseUrl}/nakshatras/${id}`, data);
  }

  deleteNakshatra(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/nakshatras/${id}`);
  }
  getDhoshams(): Observable<ApiResponse<Dhosham[]>> {
  return this.http.get<ApiResponse<Dhosham[]>>(`${this.baseUrl}/dhoshams`);
}

createDhosham(data: DhoshamPayload): Observable<ApiResponse<Dhosham>> {
  return this.http.post<ApiResponse<Dhosham>>(`${this.baseUrl}/dhoshams`, data);
}

updateDhosham(id: string, data: DhoshamPayload): Observable<ApiResponse<Dhosham>> {
  return this.http.put<ApiResponse<Dhosham>>(`${this.baseUrl}/dhoshams/${id}`, data);
}

deleteDhosham(id: string): Observable<ApiResponse<null>> {
  return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/dhoshams/${id}`);
}
getThisaiIruppus(): Observable<ApiResponse<ThisaiIruppu[]>> {
  return this.http.get<ApiResponse<ThisaiIruppu[]>>(
    `${this.baseUrl}/thisai-iruppus`
  );
}

createThisaiIruppu(data: ThisaiIruppuPayload): Observable<ApiResponse<ThisaiIruppu>> {
  return this.http.post<ApiResponse<ThisaiIruppu>>(
    `${this.baseUrl}/thisai-iruppus`,
    data
  );
}

updateThisaiIruppu(id: string, data: ThisaiIruppuPayload): Observable<ApiResponse<ThisaiIruppu>> {
  return this.http.put<ApiResponse<ThisaiIruppu>>(
    `${this.baseUrl}/thisai-iruppus/${id}`,
    data
  );
}

deleteThisaiIruppu(id: string): Observable<ApiResponse<null>> {
  return this.http.delete<ApiResponse<null>>(
    `${this.baseUrl}/thisai-iruppus/${id}`
  );
}
getPlans(): Observable<ApiResponse<Plan[]>> {
  return this.http.get<ApiResponse<Plan[]>>(`${this.baseUrl}/plans`);
}

createPlan(data: PlanPayload): Observable<ApiResponse<Plan>> {
  return this.http.post<ApiResponse<Plan>>(`${this.baseUrl}/plans`, data);
}

updatePlan(id: string, data: PlanPayload): Observable<ApiResponse<Plan>> {
  return this.http.put<ApiResponse<Plan>>(`${this.baseUrl}/plans/${id}`, data);
}

deletePlan(id: string): Observable<ApiResponse<null>> {
  return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/plans/${id}`);
}
getMaritalStatuses(): Observable<ApiResponse<any[]>> {
  return this.http.get<ApiResponse<any[]>>(
    `${this.baseUrl}/marital-statuses`
  );
}

createMaritalStatus(data: any): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(
    `${this.baseUrl}/marital-statuses`,
    data
  );
}

updateMaritalStatus(id: string, data: any): Observable<ApiResponse<any>> {
  return this.http.put<ApiResponse<any>>(
    `${this.baseUrl}/marital-statuses/${id}`,
    data
  );
}

deleteMaritalStatus(id: string): Observable<ApiResponse<null>> {
  return this.http.delete<ApiResponse<null>>(
    `${this.baseUrl}/marital-statuses/${id}`
  );
}
getGenders(): Observable<ApiResponse<any[]>> {
  return this.http.get<ApiResponse<any[]>>(
    `${this.baseUrl}/genders`
  );
}

createGender(data: any): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(
    `${this.baseUrl}/genders`,
    data,
    { headers: this.getAuthHeaders() }
  );
}

updateGender(id: string, data: any): Observable<ApiResponse<any>> {
  return this.http.put<ApiResponse<any>>(
    `${this.baseUrl}/genders/${id}`,
    data,
    { headers: this.getAuthHeaders() }
  );
}

deleteGender(id: string): Observable<ApiResponse<null>> {
  return this.http.delete<ApiResponse<null>>(
    `${this.baseUrl}/genders/${id}`,
    { headers: this.getAuthHeaders() }
  );
}
getColors() {
  return this.http.get<any>(`${this.baseUrl}/colors`);
}

getKudumbaNilai() {
  return this.http.get<any>(`${this.baseUrl}/kudumba-nilai`);
}

getProfessions() {
  return this.http.get<any>(`${this.baseUrl}/professions`);
}

getEducationLevels() {
  return this.http.get<any>(`${this.baseUrl}/education-levels`);
}
createColor(data: any) {
  return this.http.post<any>(`${this.baseUrl}/colors`, data, {
    headers: this.getAuthHeaders()
  });
}

updateColor(id: string, data: any) {
  return this.http.put<any>(`${this.baseUrl}/colors/${id}`, data, {
    headers: this.getAuthHeaders()
  });
}

deleteColor(id: string) {
  return this.http.delete<any>(`${this.baseUrl}/colors/${id}`, {
    headers: this.getAuthHeaders()
  });
}

createKudumbaNilai(data: any) {
  return this.http.post<any>(`${this.baseUrl}/kudumba-nilai`, data, {
    headers: this.getAuthHeaders()
  });
}

updateKudumbaNilai(id: string, data: any) {
  return this.http.put<any>(`${this.baseUrl}/kudumba-nilai/${id}`, data, {
    headers: this.getAuthHeaders()
  });
}

deleteKudumbaNilai(id: string) {
  return this.http.delete<any>(`${this.baseUrl}/kudumba-nilai/${id}`, {
    headers: this.getAuthHeaders()
  });
}
// Second Marriage Reason

getSecondMarriageReasons() {
  return this.http.get<any>(
    `${this.baseUrl}/second-marriage-reasons`
  );
}


createSecondMarriageReason(data: any) {
  return this.http.post<any>(
    `${this.baseUrl}/second-marriage-reasons`,
    data,
    {
      headers: this.getAuthHeaders()
    }
  );
}


updateSecondMarriageReason(
  id: string,
  data: any
) {
  return this.http.put<any>(
    `${this.baseUrl}/second-marriage-reasons/${id}`,
    data,
    {
      headers: this.getAuthHeaders()
    }
  );
}


deleteSecondMarriageReason(id: string) {
  return this.http.delete<any>(
    `${this.baseUrl}/second-marriage-reasons/${id}`,
    {
      headers: this.getAuthHeaders()
    }
  );
}
}