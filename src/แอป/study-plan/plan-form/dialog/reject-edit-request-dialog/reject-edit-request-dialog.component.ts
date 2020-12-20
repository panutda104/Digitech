import { Component, OnInit, Inject } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material";

import { faRedo } from "@fortawesome/free-solid-svg-icons";
@Component({
  selector: "app-reject-edit-request-dialog",
  templateUrl: "./reject-edit-request-dialog.component.html",
  styleUrls: ["./reject-edit-request-dialog.component.css"],
})
export class RejectEditRequestDialogComponent implements OnInit {
  faRedo = faRedo;

  isComment = false;
  teacher_reject_text = null;

  constructor(
    public dialogRef: MatDialogRef<RejectEditRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService
  ) {}

  onNoClick() {
    this.dialogRef.close();
  }

  isRejectWithComment() {
    this.isComment = true;
  }

  onRejectEditsStudyPlan() {
    this.dialogRef.close({ teacher_reject_text: this.teacher_reject_text });
  }

  ngOnInit() {}
}
