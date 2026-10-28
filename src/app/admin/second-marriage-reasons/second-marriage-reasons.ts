import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MasterService } from '../../services/master.service';

declare const convertThis: any;


@Component({
  selector: 'app-second-marriage-reasons',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './second-marriage-reasons.html',
  styleUrl: './second-marriage-reasons.scss',
})
export class SecondMarriageReasons implements OnInit, OnDestroy {


  reasons:any[] = [];

  isLoading = false;

  showForm = false;

  isEdit = false;

  selectedId = '';

  isSaving = false;


  private subscriptions: Subscription[] = [];



  formData:any = {

    nameEn:'',
    nameTa:'',
    sortOrder:0,
    isActive:true

  };



  constructor(
    private masterService: MasterService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone
  ){}



  ngOnInit(): void {

    this.loadReasons();

  }



  ngOnDestroy(): void {

    this.subscriptions.forEach(
      sub => sub.unsubscribe()
    );

  }



  tamilTyping(event: KeyboardEvent): void {

    convertThis(event,4);


    setTimeout(()=>{

      const input =
      event.target as HTMLInputElement;


      this.formData.nameTa =
      input.value;


      this.cd.detectChanges();


    },0);


  }





  loadReasons(): void {


    this.isLoading = true;


    const sub =
    this.masterService.getSecondMarriageReasons()
    .subscribe({

      next:(res:any)=>{


        this.ngZone.run(()=>{


          this.reasons =
          res.data || [];


          this.isLoading=false;


          this.cd.detectChanges();


        });


      },


      error:(err)=>{


        console.error(
          "Second marriage reason load error",
          err
        );


        this.isLoading=false;


      }


    });



    this.subscriptions.push(sub);


  }





  openAddForm():void{


    this.showForm=true;

    this.isEdit=false;

    this.selectedId='';



    this.formData={

      nameEn:'',
      nameTa:'',
      sortOrder:0,
      isActive:true

    };


  }





  editReason(reason:any):void{


    this.showForm=true;

    this.isEdit=true;

    this.selectedId =
    reason._id;



    this.formData={

      nameEn: reason.nameEn || '',

      nameTa: reason.nameTa || '',

      sortOrder:
      reason.sortOrder ?? 0,

      isActive:
      reason.isActive ?? true

    };


  }





  closeForm():void{


    this.showForm=false;

    this.isEdit=false;

    this.selectedId='';


  }





  saveReason():void{


    if(!this.formData.nameEn.trim()){

      alert("Enter reason name");

      return;

    }


    this.isSaving=true;



    const apiCall =
    this.isEdit

    ?

    this.masterService.updateSecondMarriageReason(
      this.selectedId,
      this.formData
    )

    :

    this.masterService.createSecondMarriageReason(
      this.formData
    );




    const sub =
    apiCall.subscribe({


      next:()=>{


        this.ngZone.run(()=>{


          this.isSaving=false;

          this.closeForm();

          this.loadReasons();


        });


      },


      error:(err)=>{


        console.error(
          "Save reason error",
          err
        );


        this.isSaving=false;


      }


    });



    this.subscriptions.push(sub);


  }





  deleteReason(id:string):void{


    if(!confirm(
      "Delete this reason?"
    ))
    return;



    const sub =
    this.masterService.deleteSecondMarriageReason(id)
    .subscribe({


      next:()=>{


        this.loadReasons();


      },


      error:(err)=>{


        console.error(
          "Delete reason error",
          err
        );


      }


    });



    this.subscriptions.push(sub);


  }



}