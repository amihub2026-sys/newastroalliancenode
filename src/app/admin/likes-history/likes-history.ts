import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule,
DatePipe
} from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-likes-history',
  standalone: true,

  imports: [
    CommonModule,
    DatePipe
  ],

  templateUrl: './likes-history.html',
  styleUrls: ['./likes-history.scss']
})

export class LikesHistory implements OnInit {
apiUrl = environment.apiUrl;
  users: any[] = [];

  selectedHistory: any[] = [];

  usersWhoLiked: any[] = [];

  selectedUser: any = null;

  isLoading = true;


constructor(
  private http: HttpClient,
  private cdr: ChangeDetectorRef
) {}
  get currentLang(): 'en' | 'ta' {

  if (typeof window === 'undefined') {
    return 'en';
  }

  const lang =
    localStorage.getItem('tm_language');

  return lang === 'ta'
    ? 'ta'
    : 'en';
}

txt(en: string, ta: string): string {

  return this.currentLang === 'ta'
    ? ta
    : en;
}

v(en: any, ta: any): string {

  if (this.currentLang === 'ta') {

    return ta || en || '-';
  }

  return en || '-';
}

  async ngOnInit() {
    await this.loadUsers();
  }

 currentPage = 1;

pageSize = 10;

totalPages = 1;
async loadUsers(){

  this.isLoading = true;

  try {

    const res:any = await firstValueFrom(
      this.http.get(
        `${this.apiUrl}/admin/likes-history`

      )
    );

    this.users = res.data || [];

  }
  catch(error){

    console.error(
      "Like history error",
      error
    );

  }

  this.isLoading=false;

  this.cdr.detectChanges();

}
nextPage() {

  if (this.currentPage < this.totalPages) {

    this.currentPage++;

    this.loadUsers();
  }
}

previousPage() {

  if (this.currentPage > 1) {

    this.currentPage--;

    this.loadUsers();
  }
}

async viewHistory(user: any, event?: Event) {

  event?.preventDefault();
  event?.stopPropagation();


  if (
    this.selectedUser?.profile_id === user.profile_id
  ) {

    this.selectedUser = null;
    this.selectedHistory = [];
    this.usersWhoLiked = [];

    return;
  }


  this.selectedUser = user;

  this.selectedHistory = [];
  this.usersWhoLiked = [];


  try {

    const res:any = await firstValueFrom(

      this.http.get(
 `${this.apiUrl}/admin/likes-history/${user.profile_id}`

      )

    );


    this.selectedHistory =
      res.sent || [];


    this.usersWhoLiked =
      res.received || [];


  }
  catch(error){

    console.error(
      "History load error",
      error
    );

  }


  this.cdr.detectChanges();

}
trackByLike(
 index:number,
 item:any
):string {
 return item.profile_code;
}

}
