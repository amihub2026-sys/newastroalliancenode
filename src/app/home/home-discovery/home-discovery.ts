import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../../core/services/language.service';
import { PublicProfile, toPublicProfile } from '../../free-search/models/search.models';
import { PublicCard } from '../../shared/public-card/public-card';

@Component({selector:'app-home-discovery',standalone:true,imports:[CommonModule,RouterLink,PublicCard],templateUrl:'./home-discovery.html',styleUrl:'./home-discovery.scss'})
export class HomeDiscovery implements OnInit {
 private http=inject(HttpClient);
 private language=inject(LanguageService);
 private destroyRef=inject(DestroyRef);
 error=false;
 readonly origin=environment.apiUrl.replace(/\/api\/?$/,'');
 profiles:PublicProfile[]=[];
 loading=true;
 get lang(){return this.language.currentLang;}
 t(en:string,ta:string){return this.lang==='ta'?ta:en;}
 ngOnInit(){this.load();}
 load():void {
   this.loading=true; this.error=false;
   this.http.get<any>(`${environment.apiUrl}/profile`).pipe(timeout(12000),takeUntilDestroyed(this.destroyRef)).subscribe({next:(res)=>{
     const raw=Array.isArray(res?.data)?res.data:Array.isArray(res?.profiles)?res.profiles:[];
     this.profiles=raw.map((item:unknown)=>toPublicProfile(item,this.origin)).filter((p:PublicProfile|null):p is PublicProfile=>!!p).sort((a: PublicProfile, b: PublicProfile) => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0)).slice(0,8);
     this.loading=false;
   },error:()=>{this.loading=false;this.error=true;this.profiles=[];}});
 }
}