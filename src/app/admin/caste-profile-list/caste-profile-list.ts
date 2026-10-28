import { Component, OnInit} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MasterService } from '../../services/master.service';
import { ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
@Component({
  selector: 'app-caste-profile-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './caste-profile-list.html',
  styleUrls: ['./caste-profile-list.scss']
})
export class CasteProfileList implements OnInit {
currentLang = 'en';
profiles: any[] = [];

maleProfiles:any[] = [];

femaleProfiles:any[] = [];


// pagination

malePaginatedProfiles:any[] = [];

femalePaginatedProfiles:any[] = [];

malePage = 1;

femalePage = 1;

pageSize = 10;

openSection = '';
isLoading = true;

  casteId = '';

constructor(
  private route: ActivatedRoute,
  private masterService: MasterService,
  @Inject(PLATFORM_ID) private platformId: Object,
  private cdr: ChangeDetectorRef
) {}
ngOnInit(): void {


  if(isPlatformBrowser(this.platformId)) {

    this.currentLang =
      localStorage.getItem('tm_language') || 'en';


    window.addEventListener(
      'app-language-changed',
      (event:any)=>{

        this.currentLang = event.detail;

        this.cdr.detectChanges();

      }
    );

  }


  this.casteId =
  this.route.snapshot.paramMap.get('id') || '';


  this.loadProfiles();

}
  loadProfiles(): void {

    this.isLoading = true;

    this.masterService.getProfilesByCaste(this.casteId)
      .subscribe({

next: (res:any) => {

console.log("CASTE PROFILE RESPONSE:",res);


this.profiles = res.data || [];
console.log(
 "ALL GENDER VALUES",
 this.profiles.map(
   p => p.basic?.gender
 )
);
if(this.profiles.length > 0){

 console.log(
  "PROFILE BASIC:",
  this.profiles[0].basic
 );

 console.log(
  "GENDER:",
  this.profiles[0].basic?.gender
 );

}

// Male profiles

this.maleProfiles =
this.profiles.filter(profile => {

  const gender =
    profile.basic?.gender;


  const value =
    typeof gender === 'object'
      ? (
          gender.en ||
          gender.ta
        )
      : gender;


  return (
    value === 'Male' ||
    value === 'male' ||
    value === 'ஆண்'
  );

});
// Female profiles

this.femaleProfiles =
this.profiles.filter(profile => {

  const gender =
    profile.basic?.gender;


  const value =
    typeof gender === 'object'
      ? (
          gender.en ||
          gender.ta
        )
      : gender;


  return (
    value === 'Female' ||
    value === 'female' ||
    value === 'பெண்'
  );

});
// load first page

this.updateMalePagination();

this.updateFemalePagination();


this.isLoading = false;




},
error: (err) => {

  console.error(err);

  this.isLoading = false;


}
      });

  }
updateMalePagination(){

  const start =
  (this.malePage - 1) * this.pageSize;


  this.malePaginatedProfiles =
  this.maleProfiles.slice(
    start,
    start + this.pageSize
  );

}



updateFemalePagination(){

  const start =
  (this.femalePage - 1) * this.pageSize;


  this.femalePaginatedProfiles =
  this.femaleProfiles.slice(
    start,
    start + this.pageSize
  );

}



malePages(){

  return Math.ceil(
    this.maleProfiles.length /
    this.pageSize
  );

}



femalePages(){

  return Math.ceil(
    this.femaleProfiles.length /
    this.pageSize
  );

}



changeMalePage(page:number){

  this.malePage = page;

  this.updateMalePagination();

}



changeFemalePage(page:number){

  this.femalePage = page;

  this.updateFemalePagination();

}
toggleSection(section:string){

  if(this.openSection === section){

    this.openSection = '';

  }
  else{

    this.openSection = section;

  }

}
}