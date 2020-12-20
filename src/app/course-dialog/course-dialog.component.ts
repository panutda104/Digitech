import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { MatPaginator, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "app-course-dialog",
  templateUrl: "./course-dialog.component.html",
  styleUrls: ["./course-dialog.component.css"],
})
export class CourseDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<CourseDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(this.data);
  }

  onNoClick() {
    this.dialogRef.close();
  }

  ngOnInit() {}
}
