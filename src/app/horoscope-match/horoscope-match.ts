import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
    private http: HttpClient
  ) {}

  checkMatch(): void {
    this.errorMessage = '';
    this.result = null;

    if (
      !this.form.brideNakshatra ||
      !this.form.bridePaadam ||
      !this.form.brideRasi ||
      !this.form.groomNakshatra ||
      !this.form.groomPaadam ||
      !this.form.groomRasi
    ) {
      this.errorMessage =
        'Please fill all bride and groom horoscope details.';
      return;
    }

    this.isLoading = true;

    const payload = {
      brideNakshatra:
        this.form.brideNakshatra,

      bridePaadam:
        this.form.bridePaadam,

      brideRasi:
        this.form.brideRasi,

      groomNakshatra:
        this.form.groomNakshatra,

      groomPaadam:
        this.form.groomPaadam,

      groomRasi:
        this.form.groomRasi
    };

    this.http.post<any>(
      `${this.apiUrl}/horoscope-matching/match`,
      payload
    ).subscribe({
      next: (response) => {
        this.isLoading = false;

        this.result =
          response?.data || response;

        console.log(
          'HOROSCOPE MATCH RESULT',
          this.result
        );
      },

      error: (error) => {
        this.isLoading = false;

        console.error(
          'HOROSCOPE MATCH ERROR',
          error
        );

        const backendData =
          error?.error?.data;

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