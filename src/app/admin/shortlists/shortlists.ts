import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-shortlists',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './shortlists.html',
  styleUrls: ['./shortlists.scss']
})
export class Shortlists
implements OnInit {
  apiUrl = environment.apiUrl;
constructor(
  private http: HttpClient,
  private cd: ChangeDetectorRef
) {}

  shortlists: any[] = [];

  filteredShortlists: any[] = [];

  selectedHistory: any[] = [];

  selectedUser: any = null;

  searchTerm = '';

  isLoading = false;
get currentLang(): 'en' | 'ta' {

  if (
    typeof window === 'undefined'
  ) {
    return 'en';
  }

  return (
    localStorage.getItem(
      'tm_language'
    ) as 'en' | 'ta'
  ) || 'en';
}
  async ngOnInit(): Promise<void> {

    await this.loadShortlists();
  }
async loadShortlists(): Promise<void> {

  this.isLoading = true;

  try {


    const res:any = await firstValueFrom(

      this.http.get(
        `${this.apiUrl}/shortlists/history`
      )

    );


    this.shortlists = res.data || [];


    this.filterShortlists();


  }
  catch(error){

    console.error(
      "Shortlist history error",
      error
    );

  }


  this.isLoading = false;

  this.cd.detectChanges();

}
filterShortlists(): void {

  let result = [...this.shortlists];


  if (this.searchTerm.trim()) {

    const search =
      this.searchTerm.toLowerCase();


    result = result.filter(item => {

      return (

        item.from_profile?.full_name
          ?.toLowerCase()
          .includes(search)

        ||

        item.from_profile?.profile_code
          ?.toLowerCase()
          .includes(search)

      );

    });

  }


  this.filteredShortlists = result;

}
openHistory(item: any, event?: Event): void {

  event?.preventDefault();
  event?.stopPropagation();

  this.selectedUser = item;

this.selectedHistory =
this.shortlists.filter(s =>

  s.from_profile?.profile_code ===
  item.from_profile?.profile_code

);

  this.cd.detectChanges();
}
}
