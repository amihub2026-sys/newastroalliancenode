import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { shareReplay } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class ProfilesService {

  private apiUrl = `${environment.apiUrl}/profile`;
  private likeApiUrl = `${environment.apiUrl}/likes`;
  
private masterApiUrl = `${environment.apiUrl}/masters`;

private profilesCache$: Observable<any> | null = null;
private profilesCacheTime = 0;
private profilesCacheToken = '';

constructor(private http: HttpClient) {}



getProfiles(): Observable<any> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('matrimony_token') || ''
      : '';

  const now = Date.now();

  const cacheValid =
    this.profilesCache$ !== null &&
    this.profilesCacheToken === token &&
    now - this.profilesCacheTime < 120000;

  if (cacheValid) {
    return this.profilesCache$!;
  }

  this.profilesCacheToken = token;
  this.profilesCacheTime = now;

  this.profilesCache$ = this.http.get(this.apiUrl).pipe(
    shareReplay({ bufferSize: 1, refCount: false })
  );

  return this.profilesCache$;
}


  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

 
getCurrentPlan(_userId: string): Observable<any> {
  return this.http.get(
    `${environment.apiUrl}/subscription/me`,
    {
      headers: this.getHeaders()
    }
  );
}


  getUserSubscription(userId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/subscription/user/${userId}`);
  }

  toggleLike(fromUser: string, toUser: string): Observable<any> {
    return this.http.post(`${this.likeApiUrl}/toggle`, {
      fromUser,
      toUser
    });
  }

  getLikedByMe(userId: string): Observable<any> {
    return this.http.get(`${this.likeApiUrl}/liked-by-me/${userId}`);
  }

  getWhoLikedMe(userId: string): Observable<any> {
    return this.http.get(`${this.likeApiUrl}/who-liked-me/${userId}`);
  }
  getAgeOptions(): Observable<any> {

  return this.http.get(
    `${this.apiUrl}/age-options`
  );

}
getGenderOptions(): Observable<any> {

  return this.http.get(
    `${this.apiUrl}/gender-options`
  );

}
getReligionOptions(): Observable<any> {

  return this.http.get(
    `${this.apiUrl}/religion-options`
  );

}
getShortlistedByUser(userId:string){

 return this.http.get(
 `${environment.apiUrl}/shortlists/history/${userId}`
 );

}
translateText(
 text:string,
 target:'en'|'ta'
){

 return this.http.post(
 `${environment.apiUrl}/translate`,
 {
   text,
   target
 }
 );

}
getEducationOptions(): Observable<any> {

  return this.http.get(
    `${this.apiUrl}/education-options`
  );

}
getMaritalStatusOptions(): Observable<any> {

  return this.http.get(
    `${this.masterApiUrl}/marital-statuses`
  );

}


getStateOptions(): Observable<any> {

  return this.http.get(
    `${this.masterApiUrl}/states`
  );

}


getCityOptions(): Observable<any> {

  return this.http.get(
    `${this.masterApiUrl}/cities`
  );

}


getCasteOptions(): Observable<any> {

  return this.http.get(
    `${this.masterApiUrl}/castes`
  );

}


getGenderMasterOptions(): Observable<any> {

  return this.http.get(
    `${this.masterApiUrl}/genders`
  );

}
getProfessionOptions(): Observable<any> {

  return this.http.get(
    `${this.apiUrl}/profession-options`
  );

}
sendInterest(
  fromUser:string,
  toUser:string
){

 return this.http.post(
   `${environment.apiUrl}/interests`,
   {
     fromUser,
     toUser
   },
   {
     headers:this.getHeaders()
   }
 );

}
private getHeaders(): Record<string, string> {

  if (typeof window === 'undefined') {
    return {};
  }


  const token =
    localStorage.getItem('matrimony_token');


  if (!token) {
    return {};
  }


  return {
    Authorization: `Bearer ${token}`
  };

}
}