import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-horoscope-match',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './horoscope-match.html',
  styleUrl: './horoscope-match.scss'
})
export class HoroscopeMatch {

  apiUrl = environment.apiUrl;

  isLoading = false;
  errorMessage = '';
  result: any = null;

  nakshatras = [
    'Ashwini',
    'Bharani',
    'Krittika',
    'Rohini',
    'Mrigashirsha',
    'Ardra',
    'Punarvasu',
    'Pushya',
    'Ashlesha',
    'Magha',
    'Purva Phalguni',
    'Uttara Phalguni',
    'Hasta',
    'Chitra',
    'Swati',
    'Visakam',
    'Anuradha',
    'Jyeshtha',
    'Mula',
    'Purva Ashadha',
    'Uttara Ashadha',
    'Shravana',
    'Dhanishta',
    'Shatabhisha',
    'Purva Bhadrapada',
    'Uttara Bhadrapada',
    'Revati'
  ];

  rasis = [
    'Mesham',
    'Rishabam',
    'Mithunam',
    'Kadagam',
    'Simmam',
    'Kanni',
    'Thulam',
    'Viruchigam',
    'Dhanusu',
    'Magaram',
    'Kumbam',
    'Meenam'
  ];

  paadams = [1, 2, 3, 4];

  form = {
    brideNakshatra: '',
    bridePaadam: null as number | null,
    brideRasi: '',

    groomNakshatra: '',
    groomPaadam: null as number | null,
    groomRasi: ''
  };

 constructor(
  private http: HttpClient,
  private cdr: ChangeDetectorRef
) {}


checkMatch(): void {

  this.errorMessage = '';
  this.result = null;


if (
  !this.form.brideNakshatra ||
  !this.form.brideRasi ||
  !this.form.groomNakshatra ||
  !this.form.groomRasi
) {
  this.errorMessage =
    'Please select Nakshatra and Rasi for both bride and groom.';

  this.cdr.detectChanges();
  return;
}


  // Prevent duplicate requests
  if (this.isLoading) {
    return;
  }

  this.isLoading = true;
  this.cdr.detectChanges();

  const payload = {
    brideNakshatra: this.form.brideNakshatra,
    bridePaadam: this.form.bridePaadam,
    brideRasi: this.form.brideRasi,

    groomNakshatra: this.form.groomNakshatra,
    groomPaadam: this.form.groomPaadam,
    groomRasi: this.form.groomRasi
  };

  this.http.post<any>(
    `${this.apiUrl}/horoscope-matching/match`,
    payload
  ).subscribe({

    next: (response) => {

      this.result = response?.data || response;
      this.errorMessage = '';
      this.isLoading = false;

      console.log(
        'HOROSCOPE MATCH RESULT',
        this.result
      );

      // Immediately refresh the result in Angular
      this.cdr.detectChanges();
    },

    error: (error) => {

      console.error(
        'HOROSCOPE MATCH ERROR',
        error
      );

      const backendData = error?.error?.data;

      if (backendData) {

        this.result = backendData;

        this.errorMessage =
          backendData?.resultTa ||
          backendData?.resultEn ||
          error?.error?.message ||
          'Unable to calculate horoscope match.';

      } else {

        this.errorMessage =
          error?.error?.message ||
          'Unable to calculate horoscope match.';
      }

      this.isLoading = false;

      // Immediately show error/result without another click
      this.cdr.detectChanges();
    }

  });
}


  resetForm(): void {
    this.form = {
      brideNakshatra: '',
      bridePaadam: null,
      brideRasi: '',

      groomNakshatra: '',
      groomPaadam: null,
      groomRasi: ''
    };

    this.result = null;
    this.errorMessage = '';
  }

  getMatchedPoruthams(): any[] {
    if (!this.result?.poruthams) {
      return [];
    }

    return this.result.poruthams.filter(
      (item: any) =>
        item?.matched === true
    );
  }

  getUnmatchedPoruthams(): any[] {
    if (!this.result?.poruthams) {
      return [];
    }

    return this.result.poruthams.filter(
      (item: any) =>
        item?.matched === false
    );
  }

  isCritical(item: any): boolean {
    return (
      item?.level === 'critical' ||
      item?.manualReviewRequired === true
    );
  }

}