import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { MatPaginator, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { ToastrService } from "ngx-toastr";

import { StudyplanService } from "src/app/services/studyplan.service";

import { ActivatedRoute } from "@angular/router";

import { faPen, faCheckCircle, faCommentAlt, faTimes, faTrash, faCopy } from "@fortawesome/free-solid-svg-icons";

import { PlanStatus } from "src/app/models/plan-status.enum";
import { Time } from "@angular/common";

@Component({
  selector: "app-study-plan",
  templateUrl: "./study-plan.component.html",
  styleUrls: ["./study-plan.component.css"],
})
export class StudyPlanComponent implements OnInit {
  dataSource;
  displayedColumns: string[] = ["order", "study_plan_name", "student_status", "create_time", "update_time", "button"];
  list = [];
  availableToApprove = false;

  faPen = faPen;
  faCheckCircle = faCheckCircle;
  faCommentAlt = faCommentAlt;
  faTimes = faTimes;
  faTrash = faTrash;
  faCopy = faCopy;

  filterBy = null;
  sortBy = null;
  keyword = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private studyplanService: StudyplanService,
    private toastr: ToastrService
  ) {
    this.getStudyPlanList();
  }

  ngOnInit() {}

  async getStudyPlanList() {
    this.list = await this.studyplanService.getStudyPlanByUserId(JSON.parse(localStorage.getItem("account")).id);
    // this.availableToApprove = await this.studyplanService.getIsAvailableToApprove(JSON.parse(localStorage.getItem("account")).id);
    this.onSetDefaultTable();
  }

  isAvailableToEdit(student_status, modify_status) {
    return student_status !== PlanStatus.APPROVED;
  }

  isAvailableToCancel(student_status, modify_status) {
    return student_status == PlanStatus.PENDING_CONSIDERATION;
  }

  isAvailableToDelete(student_status, modify_status) {
    return student_status !== PlanStatus.APPROVED;
  }

  onSetDefaultTable() {
    this.dataSource = new MatTableDataSource<any>(this.list);
    this.dataSource.filterPredicate = (data: StudyPlan, filter: string) => {
      return data.study_plan_name.includes(filter) || this.getStudentStatus(data.student_status).text.includes(filter);
    };
    this.dataSource.paginator = this.paginator;

    if (this.filterBy) {
      this.onFilter(this.filterBy);
    }
    if (this.sortBy) {
      this.onSort(this.sortBy);
    }
    if (this.keyword) {
      this.onFindKeyword(this.keyword);
    }
  }

  onFindKeyword(filterValue: string) {
    this.keyword = filterValue;
    if (filterValue) {
      this.dataSource.filterPredicate = (data: StudyPlan, filter: string) => {
        return data.study_plan_name.includes(filter);
      };
      this.dataSource.filter = filterValue;
      this.dataSource.data = this.dataSource.filteredData;
    } else {
      this.onSetDefaultTable();
    }
  }

  onFilter(filterValue) {
    this.filterBy = filterValue;
    if (filterValue) {
      this.dataSource.filterPredicate = (data: StudyPlan, filter: string) => {
        return data.student_status == filter;
      };
      this.dataSource.filter = filterValue;
      this.dataSource.data = this.dataSource.filteredData;
    } else {
      this.onSetDefaultTable();
    }
  }
  onSort(sort) {
    this.sortBy = sort;
    if (sort) {
      this.dataSource.data = this.dataSource.data.sort(function (a: any, b: any) {
        switch (sort) {
          case 1: {
            let a_: any = new Date(a.create_time);
            let b_: any = new Date(b.create_time);
            return a_ < b_ ? 1 : -1;
            break;
          }
          case 2: {
            let a_: any = new Date(a.create_time);
            let b_: any = new Date(b.create_time);
            return a_ < b_ ? -1 : 1;
            break;
          }
          case 3: {
            let a_: any = new Date(a.update_time);
            let b_: any = new Date(b.update_time);
            return a_ < b_ ? 1 : -1;
            break;
          }
          case 4: {
            let a_: any = new Date(a.update_time);
            let b_: any = new Date(b.update_time);
            return a_ < b_ ? -1 : 1;
            break;
          }
          default: {
            break;
          }
        }
      });
    } else {
      this.onSetDefaultTable();
    }
  }

  onDeleteStudyPlan(id): void {
    // const dialogRef = this.dialog.open(StudyPlanDialog, {
    //   data: { id: id, user_id: JSON.parse(localStorage.getItem("account")).id },
    // });
    // dialogRef.afterClosed().subscribe(() => {
    //   this.getStudyPlanList();
    // });

    const dialogRef = this.dialog.open(StudyPlanDialog, {
      data: { id: id, user_id: JSON.parse(localStorage.getItem("account")).id, text: "คุณต้องการลบแผนการเรียน" },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.studyplanService.removeStudyPlan(id, JSON.parse(localStorage.getItem("account")).id).then((result_) => {
          if (result_) {
            this.getStudyPlanList();
          } else {
            this.toastr.error("Sorry, your update failed. Please try again.", null, {
              positionClass: "toast-top-center",
              closeButton: true,
            });
          }
          // if (result_) {
          //   const timeout = 750;
          //   const dialogRef = this.dialog.open(AlertDialog, {
          //     data: { success: true, text: "ลบแผนการเรียนเรียบร้อย" },
          //   });
          //   dialogRef.afterOpened().subscribe((_) => {
          //     setTimeout(() => {
          //       dialogRef.close();
          //       this.redirect();
          //     }, timeout);
          //   });
          // } else {
          //   const dialogRef = this.dialog.open(AlertDialog, {
          //     data: { success: false, text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง" },
          //   });
          //   dialogRef.afterClosed().subscribe(() => {});
          // }
        });
      }
    });
  }

  async onCancelStudyPlan(id) {
    const dialogRef = this.dialog.open(StudyPlanDialog, {
      data: { id: id, user_id: JSON.parse(localStorage.getItem("account")).id, text: "คุณต้องการยกเลิกการขอพิจารณาแผนการเรียน" },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.studyplanService.cancelStudyPlan(id, JSON.parse(localStorage.getItem("account")).id).then((result_) => {
          if (result_) {
            this.getStudyPlanList();
          } else {
            this.toastr.error("Sorry, your update failed. Please try again.", null, {
              positionClass: "toast-top-center",
              closeButton: true,
            });
          }
        });
      }
    });

    // const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
    //   data: { id: id, user_id: JSON.parse(localStorage.getItem("account")).id, text: "คุณต้องการยกเลิกการขอพิจารณาแผนการเรียน" },
    // });
    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     this.studyplanService
    //       .cancelStudyPlan(this.programForm.value.id, JSON.parse(localStorage.getItem("account")).id)
    //       .then((result_) => {
    //         if (result_) {
    //           const timeout = 750;
    //           const dialogRef = this.dialog.open(AlertDialog, {
    //             data: { success: true, text: "ยกเลิกขอพิจรณาแผนการเรียนเรียบร้อย" },
    //           });
    //           dialogRef.afterOpened().subscribe((_) => {
    //             setTimeout(() => {
    //               dialogRef.close();
    //               this.redirect();
    //             }, timeout);
    //           });
    //         } else {
    //           const dialogRef = this.dialog.open(AlertDialog, {
    //             data: { success: false, text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง" },
    //           });
    //           dialogRef.afterClosed().subscribe(() => {});
    //         }
    //       });
    //   }
    // });
  }

  onDuplicateStudyPlan(id) {}

  getStudentStatus(status) {
    let result = { style: "", text: "" };

    switch (status) {
      case PlanStatus.DRAFT:
        result.style = "draft-status";
        result.text = "แบบร่าง";
        break;
      case PlanStatus.PENDING_CONSIDERATION:
        result.style = "pending-consideration-status";
        result.text = "รอพิจารณา";
        break;
      case PlanStatus.APPROVED:
        result.style = "approved-status";
        result.text = "อนุมัติ";
        break;
      case PlanStatus.NOT_APPROVED:
        result.style = "not-approved-status";
        result.text = "ไม่อนุมัติ";
        break;
      default:
        console.log("default");
        break;
    }

    return result;
  }

  getModifyStatus(status) {
    switch (status) {
      case PlanStatus.PENDING_CONSIDERATION:
        return "อยู่ระหว่างพิจารณาขอแก้ไขแผน";
        // result.style = "pending-consideration-status";
        // result.text = "รอพิจารณา";
        break;
      case PlanStatus.APPROVED:
        return "อนุมัติแก้ไขแผน";
        // result.style = "approved-status";
        // result.text = "อนุมัติ";
        break;
      case PlanStatus.NOT_APPROVED:
        return "ไม่อนุมัติแก้ไขแผน";
        // result.style = "not-approved-status";
        // result.text = "ไม่อนุมัติ";
        break;
      default:
        console.log("default");
        break;
    }
  }
}

@Component({
  selector: "study-plan-dialog",
  templateUrl: "./study-plan-dialog.html",
  styleUrls: ["./study-plan-dialog.css"],
})
export class StudyPlanDialog {
  constructor(
    public dialogRef: MatDialogRef<StudyPlanDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService,
    private studyplanService: StudyplanService
  ) {}
  onNoClick() {
    this.dialogRef.close();
  }
  // async onRemoveConfirm() {
  //   if (await this.studyplanService.removeStudyPlan(this.data.id, this.data.user_id)) {
  //     this.onNoClick();
  //   } else {
  //     this.toastr.error("Sorry, your update failed. Please try again.", null, {
  //       positionClass: "toast-top-center",
  //       closeButton: true,
  //     });
  //   }
  // }

  onConfirm() {
    this.dialogRef.close(true);
  }
}

export interface StudyPlan {
  id: string;
  study_plan_name: string;
  student_status: any;
  create_time: Time;
  update_time: Time;
}
