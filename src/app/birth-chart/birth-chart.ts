import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-birth-chart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './birth-chart.html',
  styleUrls: ['./birth-chart.scss']
})
export class BirthChart {

 brideForm = {
  dateOfBirth: '',
  timeOfBirth: '',
  placeOfBirth: '',
  latitude: null as number | null,
  longitude: null as number | null,
  timezone: 'Asia/Kolkata'
};

groomForm = {
  dateOfBirth: '',
  timeOfBirth: '',
  placeOfBirth: '',
  latitude: null as number | null,
  longitude: null as number | null,
  timezone: 'Asia/Kolkata'
};

  isLoading = false;
  errorMessage = '';
  result: any = null;

  bridePlaceResults: any[] = [];
groomPlaceResults: any[] = [];

bridePlaceLoading = false;
groomPlaceLoading = false;

async searchBridePlace(): Promise<void> {
  const query =
    this.brideForm.placeOfBirth.trim();

  this.bridePlaceResults = [];

  if (query.length < 2) {
    return;
  }

  this.bridePlaceLoading = true;

  try {
    const response = await fetch(
      `${environment.apiUrl}/geo-places/search?q=${encodeURIComponent(query)}&limit=5`
    );

    const data = await response.json();

    if (
      response.ok &&
      data.success === true
    ) {
      this.bridePlaceResults =
        data.results || [];
    }

  } catch (error) {
    console.error(
      'BRIDE PLACE SEARCH ERROR:',
      error
    );

  } finally {
    this.bridePlaceLoading = false;
  }
}
async searchGroomPlace(): Promise<void> {
  const query =
    this.groomForm.placeOfBirth.trim();

  this.groomPlaceResults = [];

  if (query.length < 2) {
    return;
  }

  this.groomPlaceLoading = true;

  try {
    const response = await fetch(
      `${environment.apiUrl}/geo-places/search?q=${encodeURIComponent(query)}&limit=5`
    );

    const data = await response.json();

    if (
      response.ok &&
      data.success === true
    ) {
      this.groomPlaceResults =
        data.results || [];
    }

  } catch (error) {
    console.error(
      'GROOM PLACE SEARCH ERROR:',
      error
    );

  } finally {
    this.groomPlaceLoading = false;
  }
}
selectBridePlace(place: any): void {
  this.brideForm.placeOfBirth =
    place.name;

  this.brideForm.latitude =
    Number(place.latitude);

  this.brideForm.longitude =
    Number(place.longitude);

  this.brideForm.timezone =
    place.timezone || 'Asia/Kolkata';

  this.bridePlaceResults = [];
}


selectGroomPlace(place: any): void {
  this.groomForm.placeOfBirth =
    place.name;

  this.groomForm.latitude =
    Number(place.latitude);

  this.groomForm.longitude =
    Number(place.longitude);

  this.groomForm.timezone =
    place.timezone || 'Asia/Kolkata';

  this.groomPlaceResults = [];
}
getHouse(
  houses: any[] = [],
  houseNumber: number
): any {
  return (
    houses.find(
      house =>
        house.house === houseNumber
    ) || null
  );
}
get chartSections(): any[] {
  if (!this.result) {
    return [];
  }

  return [
    {
      title: 'Bride Rasi Chart / மணமகள் ராசி கட்டம்',
      centerTitle: 'Bride Rasi',
      houses: this.result?.bride?.rasiChart?.houses || [],
      lagnam: this.result?.bride?.birthDetails?.lagnam || ''
    },
    {
      title: 'Bride Navamsa Chart / மணமகள் நவாம்ச கட்டம்',
      centerTitle: 'Bride Navamsa',
      houses: this.result?.bride?.navamsaChart?.houses || [],
      lagnam: this.result?.bride?.navamsaChart?.lagnam?.rasi || ''
    },
    {
      title: 'Groom Rasi Chart / மணமகன் ராசி கட்டம்',
      centerTitle: 'Groom Rasi',
      houses: this.result?.groom?.rasiChart?.houses || [],
      lagnam: this.result?.groom?.birthDetails?.lagnam || ''
    },
    {
      title: 'Groom Navamsa Chart / மணமகன் நவாம்ச கட்டம்',
      centerTitle: 'Groom Navamsa',
      houses: this.result?.groom?.navamsaChart?.houses || [],
      lagnam: this.result?.groom?.navamsaChart?.lagnam?.rasi || ''
    }
  ];
}
async calculateBirthChart(): Promise<void> {

  this.errorMessage = '';
  this.result = null;

  if (
    !this.brideForm.dateOfBirth ||
    !this.brideForm.timeOfBirth ||
    !this.brideForm.placeOfBirth ||
    this.brideForm.latitude === null ||
    this.brideForm.longitude === null ||
    !this.groomForm.dateOfBirth ||
    !this.groomForm.timeOfBirth ||
    !this.groomForm.placeOfBirth ||
    this.groomForm.latitude === null ||
    this.groomForm.longitude === null
  ) {
    this.errorMessage =
      'Please enter complete Bride and Groom birth details.';
    return;
  }

  this.isLoading = true;

  try {

    const payload = {
      bride: {
        ...this.brideForm,
        targetDate: new Date().toISOString()
      },

      groom: {
        ...this.groomForm,
        targetDate: new Date().toISOString()
      }
    };

    const response = await fetch(
      `${environment.apiUrl}/horoscope-box/analyze`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      this.errorMessage =
        data.message ||
        'Unable to calculate horoscope matching.';
      return;
    }

    this.result = data;

  } catch (error) {

    console.error(
      'HOROSCOPE MATCHING ERROR:',
      error
    );

    this.errorMessage =
      'Unable to connect to astrology server.';

  } finally {
    this.isLoading = false;
  }
}
}
