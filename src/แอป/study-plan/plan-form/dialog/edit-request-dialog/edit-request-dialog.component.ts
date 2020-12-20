import { Component, OnInit } from "@angular/core";

import { ToastrService } from "ngx-toastr";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material";
import { faShare } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-edit-request-dialog",
  templateUrl: "./edit-request-dialog.component.html",
  styleUrls: ["./edit-request-dialog.component.css"],
})
export class EditRequestDialogComponent implements OnInit {
  faShare = faShare;
  requestText = null;

  constructor(public dialogRef: MatDialogRef<EditRequestDialogComponent>, private toastr: ToastrService) {}

  onNoClick() {
    this.dialogRef.close();
  }

  isRequest() {
    this.dialogRef.close({ requestText: this.requestText });
  }
  ngOnInit() {}
}
