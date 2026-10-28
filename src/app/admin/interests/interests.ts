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
  selector: 'app-interests',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './interests.html',

  styleUrls: ['./interests.scss'],



})
export class Interests
implements OnInit{
apiUrl = environment.apiUrl;
constructor(
  private http: HttpClient,
  private cd: ChangeDetectorRef
) {}

  interests: any[] = [];
filteredInterests: any[] = [];
interestUsers: any[] = [];

  searchTerm = '';


  selectedHistory: any[] = [];

  selectedSender: any = null;



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
  await this.loadInterests();
}

openHistory(
  item: any,
  event?: Event
): void {

  event?.preventDefault();

  event?.stopPropagation();

this.selectedSender =
    item.from_profile;

this.selectedHistory =
 this.interests.filter(x =>
   x.from_profile?.profile_id ===
   item.from_profile?.profile_id
 ||
   x.to_profile?.profile_id ===
   item.from_profile?.profile_id
 );

  this.cd.detectChanges();

}
async loadInterests(): Promise<void> {

  this.isLoading = true;

  try {

    const res:any = await firstValueFrom(
      this.http.get(
        `${this.apiUrl}/interests/history`
      )
    );


    this.interests = res.data || [];


    this.prepareInterestUsers();


  }
  catch(error){

    console.error(
      "Interest history error",
      error
    );

  }


  this.isLoading=false;

  this.cd.detectChanges();

}
prepareInterestUsers(): void {

  const grouped = new Map();

  for (const item of this.interests) {

if (!item.from_profile && !item.to_profile) {
  continue;
}

const profile =
 item.from_profile || item.to_profile;

const code =
 profile?.profile_code;

    if (!grouped.has(code)) {

grouped.set(code, {

        from_profile: profile,

        sent: 0,

        received: 0,

        accepted: 0,

        pending: 0,

        rejected: 0,

        history: []
      });
    }

    const user =
      grouped.get(code);

    user.sent++;
const status =
 item.status || item.status_code;


if(status === 'accepted'){
  user.accepted++;
}


if(status === 'pending'){
  user.pending++;
}


if(status === 'rejected'){
  user.rejected++;
}

    user.history.push(item);
  }

  for (const item of this.interests) {

    const receiverCode =
item.to_profile?.profile_code

    if (
      receiverCode &&
      grouped.has(receiverCode)
    ) {

      grouped.get(receiverCode)
        .received++;
    }
  }

  this.interestUsers =
    Array.from(grouped.values());

let result =
  [...this.interestUsers];

if (this.searchTerm) {

  result = result.filter(item =>

    item.from_profile?.full_name
      ?.toLowerCase()
      .includes(
        this.searchTerm.toLowerCase()
      )

    ||

    item.from_profile?.profile_code
      ?.toLowerCase()
      .includes(
        this.searchTerm.toLowerCase()
      )
  );
}

this.filteredInterests = result;
}

  getStatus(status: string): string {

    switch (status) {

      case 'pending':
        return 'Pending';

      case 'accepted':
        return 'Accepted';

      case 'rejected':
        return 'Rejected';

      default:
        return 'Unknown';
    }
  }
trackByProfile(
  index: number,
  item: any
): string {

 return item.from_profile?.profile_code;

}
trackByHistory(
  index: number,
  item: any
): string {

  return item._id;

}

}
