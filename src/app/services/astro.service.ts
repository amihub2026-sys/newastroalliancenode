import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
interface HoroscopeInput {
  nakshatra: string;
  rasi: string;
  paadam?: number;
}
@Injectable({ providedIn: 'root' })
export class AstroService {
  private readonly http = inject(HttpClient);
  getMatch(boy: HoroscopeInput, girl: HoroscopeInput): Promise<unknown> {
    return firstValueFrom(
      this.http.post(`${environment.apiUrl}/horoscope-matching/match`, {
        brideNakshatra: girl.nakshatra,
        brideRasi: girl.rasi,
        bridePaadam: girl.paadam,
        groomNakshatra: boy.nakshatra,
        groomRasi: boy.rasi,
        groomPaadam: boy.paadam,
      }),
    );
  }
}
