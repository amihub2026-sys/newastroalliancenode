import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile-print',
  standalone: true,
  imports: [
  CommonModule
],
  templateUrl: './profile-print.html',
  styleUrl: './profile-print.scss',
})
export class ProfilePrint implements OnInit {
  profile: any = null;
  isLoading = true;
  today = new Date();
  withPhoto = false;
  withAddress = true;
  apiUrl = environment.apiUrl;
  thisaiIruppuOptions: any[] = [];
constructor(
  private route: ActivatedRoute,
  private cdr: ChangeDetectorRef,
  private zone: NgZone,
  private http: HttpClient
) {}
// removeFavicon(): void {

//   if (typeof document === 'undefined') return;

//   const favicons = document.querySelectorAll(
//     "link[rel*='icon']"
//   );

//   favicons.forEach(icon => {
//     icon.remove();
//   });


//   const emptyFavicon = document.createElement('link');

//   emptyFavicon.rel = 'icon';

//   emptyFavicon.href =
//     'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"></svg>';


//   document.head.appendChild(emptyFavicon);

// }
ngOnInit(): void {

    // this.removeFavicon();


 this.route.paramMap.subscribe(async params => {

    const code = params.get('code') || '';

    const type = params.get('type') || 'normal';


    this.withPhoto =
      type === 'photo' ||
      type === 'photo-address';


    this.withAddress =
      type === 'address' ||
      type === 'photo-address';


    console.log(
      "PRINT TYPE:",
      type,
      "CODE:",
      code
    );


  if (code) {
  await this.loadThisaiIruppus();
  await this.loadProfile(code);
}

  });

}
async loadThisaiIruppus(): Promise<void> {
  try {
    const result: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/masters/thisai-iruppus`)
    );

    this.thisaiIruppuOptions = result?.data || [];
  } catch (error) {
    console.log('THISAI IRUPPU LOAD ERROR', error);
    this.thisaiIruppuOptions = [];
  }
}
getThisaiIruppuTamil(value: string): string {

  if (!value) return '-';

  const match = this.thisaiIruppuOptions.find(
    (item: any) => item.nameEn === value
  );

  return match?.nameTa || value;
}
async loadProfile(code:string): Promise<void>{

  try {

    const result:any = await firstValueFrom(
      this.http.get(
        `${this.apiUrl}/profile/print/${code}`
      )
    );


    this.zone.run(()=>{

      this.profile = result.data || result;

      console.log(
        "MONGO PRINT PROFILE",
        this.profile
      );


      this.isLoading=false;

      this.cdr.detectChanges();


      if(typeof window !== 'undefined' && this.profile){

        setTimeout(()=>{

          const loadingText =
          document.querySelector('.print-loading');


          if(!loadingText){

            window.print();

          }


        },2000);

      }


    });


  }
  catch(error){

    console.log(
      "PRINT LOAD ERROR",
      error
    );

    this.zone.run(()=>{

      this.profile=null;
      this.isLoading=false;

    });

  }

}
v(en: any, ta: any): string {
  return ta || en || '-';
}
formatBirthTime(time: string): string {

  if (!time) return '-';


  if(
    time.includes('AM') ||
    time.includes('PM')
  ){
    return time;
  }


  const parts = time.split(':');

  let hour = Number(parts[0]);

  const minute = parts[1] || '00';


  const ampm = hour >= 12 ? 'PM' : 'AM';


  hour = hour % 12;

  if(hour === 0){
    hour = 12;
  }


  return `${hour}:${minute} ${ampm}`;

}
formatThisaiIruppu(value: string): string {
  return (value || '')
    .replaceAll('வருடம்', 'வ')
    .replaceAll('மாதம்', 'மா')
    .replaceAll('நாள்', 'நா')
    .replaceAll('Year', 'Y')
    .replaceAll('Month', 'M')
    .replaceAll('Day', 'D');
}

getRasiChart(): string[] {

  const chart = this.profile?.rasi_chart;

  if (!chart) return Array(12).fill('');

  if (Array.isArray(chart)) {
    return chart;
  }

  try {
    const parsed = JSON.parse(chart);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return Array(12).fill('');
  } catch {
    return Array(12).fill('');
  }
}

getAmsamChart(): string[] {

  const chart = this.profile?.amsam_chart;

  if (!chart) return Array(12).fill('');

  if (Array.isArray(chart)) {
    return chart;
  }

  try {
    const parsed = JSON.parse(chart);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return Array(12).fill('');
  } catch {
    return Array(12).fill('');
  }
}
}