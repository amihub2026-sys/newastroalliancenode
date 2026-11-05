import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone,
  ApplicationRef
} from '@angular/core';
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
  private http: HttpClient,
  private appRef: ApplicationRef
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
  this.isLoading = true;
  this.profile = null;

  await Promise.all([
    this.loadThisaiIruppus(),
    this.loadProfile(code)
  ]);

  this.zone.run(() => {
    this.isLoading = false;
    this.cdr.detectChanges();
  });

  if (this.profile && typeof window !== 'undefined') {
    await this.printWhenReady();
  }
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

const token =
  typeof window !== 'undefined'
    ? localStorage.getItem('admin_token')
    : null;

if (!token) {
  throw new Error('Admin login token missing');
}

const result: any = await firstValueFrom(
  this.http.get(
    `${this.apiUrl}/profile/print/${encodeURIComponent(code)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
);

    this.zone.run(()=>{

    this.profile = result.data || result;

console.log('MONGO PRINT PROFILE', this.profile);

this.isLoading = false;

this.cdr.markForCheck();
this.cdr.detectChanges();
this.appRef.tick();

console.log('AFTER RENDER:', {
  loading: this.isLoading,
  profile: !!this.profile,
  printPage: !!document.querySelector('.print-page')
});


    


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
// Manual Print / Download PDF button
printReport(): void {
  if (
    typeof window === 'undefined' ||
    this.isLoading ||
    !this.profile
  ) {
    return;
  }

  window.print();
}


// Automatically print after complete report is ready

 // Automatically open Print after biodata is ready
async printWhenReady(): Promise<void> {

  if (
    typeof window === 'undefined' ||
    !this.profile
  ) {
    return;
  }

  // Update Angular view
this.zone.run(() => {
  this.isLoading = false;
  this.cdr.markForCheck();
  this.cdr.detectChanges();
  this.appRef.tick();
});

  // Wait for Angular to render the biodata
  let report: HTMLElement | null = null;

  for (let i = 0; i < 40; i++) {

    report = document.querySelector<HTMLElement>(
      '.print-page'
    );

    if (report) {
      break;
    }

    await new Promise<void>(resolve => {
      setTimeout(resolve, 100);
    });
  }

  if (!report) {
    console.error('Biodata print page not found');
    return;
  }

  // Wait for Tamil fonts
  if (document.fonts) {
    await document.fonts.ready;
  }

  // Wait for images, but not indefinitely
  const images = Array.from(
    report.querySelectorAll<HTMLImageElement>('img')
  );

  await Promise.all(
    images.map(img => {

      if (img.complete) {
        return Promise.resolve();
      }

      return new Promise<void>(resolve => {

        const timeout = setTimeout(() => {
          resolve();
        }, 3000);

        const finish = () => {
          clearTimeout(timeout);
          resolve();
        };

        img.addEventListener('load', finish, {
          once: true
        });

        img.addEventListener('error', finish, {
          once: true
        });

      });
    })
  );

  // Allow browser to finish layout
  await new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

  // Final check
  if (
    this.profile &&
    !this.isLoading &&
    document.querySelector('.print-page')
  ) {
    console.log('Biodata ready. Opening Print...');

    window.print();
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