import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router'
import { AuthenticationService } from '../services/authentication.service';
import { AzureBlobStorageService } from '../services/azure-storage-blob.service';
import { DisplayNotesService } from '../services/displayNotes.service';

export interface DialogData {
  comment: string;
  rating: number;
}
@Component({
  selector: 'app-display-notes',
  templateUrl: './display-notes.component.html',
  styleUrls: ['./display-notes.component.css']
})
export class DisplayNotesComponent implements OnInit {
  resultsArray:any []=[];
  subject!:string|null;
  comment!: string;
  rating!: string;
  constructor(private route: ActivatedRoute, private displayNotesService:DisplayNotesService, private azureService:AzureBlobStorageService,public dialog: MatDialog,private auth:AuthenticationService) { }

  ngOnInit(): void {
    this.subject = this.route.snapshot.paramMap.get('subject');
    console.log(this.subject);
    this.displayNotesService.getNotes(this.subject).subscribe((res) => {
      console.log(res.blobs);
      this.resultsArray=res.blobs;
    }, (err) => {
      console.error(err);}
    );
  }


  openFile(file:any){
    this.azureService.downloadPDF(file.url,file.sasToken, file.name, blob => {
      let url = window.URL.createObjectURL(blob);
      window.open(url);
    })
  }

  openDialog(notes:any): void {
    const dialogRef = this.dialog.open(DialogOverviewDialog, {
      width: '300px',
      data: { comment: "", rating:0},
    });

    dialogRef.afterClosed().subscribe(result => {
      const info={
        "rating":result.rating,
        "comment":result.comment
      }
      console.log(result);
      const user=this.auth.getUserDetails();
      this.displayNotesService.addReview(info,notes,user?._id,user?.username).subscribe();
    });
  }


}

@Component({
  selector: 'dialog-overview-example-dialog',
  template: `<h1 mat-dialog-title>Add your Review</h1>
  <div mat-dialog-content>
    <p>Give ratings</p>
    <mat-form-field>
    <mat-select  [(ngModel)]="selectedChoice">
        <mat-option disabled>Choose your ratings</mat-option>
        <mat-option value="1"> 1 - Very Poor</mat-option>
        <mat-option value="2"> 2 - Poor</mat-option>
        <mat-option value="3"> 3 - Good</mat-option>
        <mat-option value="4"> 4 - Vey Good</mat-option>
        <mat-option value="5"> 5 - Excellent </mat-option>
    </mat-select>
    </mat-form-field>
    <p>Add a comment</p>
    <mat-form-field appearance="fill">
    <mat-label>Write your comment</mat-label>
    <textarea matInput [(ngModel)]="comment"></textarea>
    </mat-form-field>

  </div>
  <div mat-dialog-actions>
    <button mat-button (click)="dialogRef.close()">Cancel</button>
    <button mat-button (click)="submit()">Submit</button>
  </div>`,
})
export class DialogOverviewDialog {
  selectedChoice!: number;
  comment!:String;
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  submit(): void {
    this.dialogRef.close({"rating":this.selectedChoice,"comment":this.comment});
  }
}
