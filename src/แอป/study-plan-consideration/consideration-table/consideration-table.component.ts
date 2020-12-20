import { Component, OnInit, ViewChild, Input, ChangeDetectorRef } from "@angular/core";
import { MatPaginator, MatTableDataSource } from "@angular/material";
import { Router } from "@angular/router";
import { StudyplanService } from "src/app/services/studyplan.service";

import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { PlanStatus } from "src/app/models/plan-status.enum";
@Component({
  selector: "app-consideration-table",
  templateUrl: "./consideration-table.component.html",
  styleUrls: ["./consideration-table.component.css"],
})
export class ConsiderationTableComponent implements OnInit {
  faCheck = faCheck;

  displayedColumns: string[] = [
    "order",
    "student_id",
    "student_name",
    "career_1",
    "career_2",
    "career_3",
    "update_time",
    "button",
  ];
  dataSource = null;
  // dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

  @Input() data = null;

  filterBy = null;
  sortBy = null;
  keyword = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private cdRef: ChangeDetectorRef, private studyplanService: StudyplanService, private router: Router) {}

  ngOnInit() {
    // this.dataSource.paginator = this.paginator;
  }

  ngAfterViewChecked() {
    if (!this.dataSource && this.data) {
      this.dataSource = new MatTableDataSource<StudyPlan>(this.data);
      this.dataSource.paginator = this.paginator;
      this.cdRef.detectChanges();
    }
  }

  getCareer(value, order) {
    if (value && Object.keys(value).length >= order) {
      return Object.values(value)[order - 1];
    }
    return false;
  }

  async approveStudentPlan(id) {
    console.log("approveStudentPlan");
    if (await this.studyplanService.updateApprovedStudentPlan(id, JSON.parse(localStorage.getItem("account")).id)) {
    } else {
      console.log("reject");
    }
  }

  redirect() {
    this.router.navigate(["/study-plan-consideration"]);
  }

  // onSetDefaultTable() {
  //   this.dataSource = new MatTableDataSource<any>(this.list);
  //   this.dataSource.filterPredicate = (data: StudyPlan, filter: string) => {
  //     return data.study_plan_name.includes(filter) || this.getStatus(data.student_status).text.includes(filter);
  //   };
  //   this.dataSource.paginator = this.paginator;

  //   if (this.filterBy) {
  //     this.onFilter(this.filterBy);
  //   }
  //   if (this.sortBy) {
  //     this.onSort(this.sortBy);
  //   }
  //   if (this.keyword) {
  //     this.onFindKeyword(this.keyword);
  //   }
  // }

  // onFindKeyword(filterValue: string) {
  //   this.keyword = filterValue;
  //   if (filterValue) {
  //     this.dataSource.filterPredicate = (data: StudyPlan, filter: string) => {
  //       return data.study_plan_name.includes(filter);
  //     };
  //     this.dataSource.filter = filterValue;
  //     this.dataSource.data = this.dataSource.filteredData;
  //   } else {
  //     this.onSetDefaultTable();
  //   }
  // }

  // onFilter(filterValue) {
  //   this.filterBy = filterValue;
  //   if (filterValue) {
  //     this.dataSource.filterPredicate = (data: StudyPlan, filter: string) => {
  //       return data.student_status == filter;
  //     };
  //     this.dataSource.filter = filterValue;
  //     this.dataSource.data = this.dataSource.filteredData;
  //   } else {
  //     this.onSetDefaultTable();
  //   }
  // }
  // onSort(sort) {
  //   this.sortBy = sort;
  //   if (sort) {
  //     this.dataSource.data = this.dataSource.data.sort(function (a: any, b: any) {
  //       switch (sort) {
  //         case 1: {
  //           let a_: any = new Date(a.create_time);
  //           let b_: any = new Date(b.create_time);
  //           return a_ < b_ ? 1 : -1;
  //           break;
  //         }
  //         case 2: {
  //           let a_: any = new Date(a.create_time);
  //           let b_: any = new Date(b.create_time);
  //           return a_ < b_ ? -1 : 1;
  //           break;
  //         }
  //         case 3: {
  //           let a_: any = new Date(a.update_time);
  //           let b_: any = new Date(b.update_time);
  //           return a_ < b_ ? 1 : -1;
  //           break;
  //         }
  //         case 4: {
  //           let a_: any = new Date(a.update_time);
  //           let b_: any = new Date(b.update_time);
  //           return a_ < b_ ? -1 : 1;
  //           break;
  //         }
  //         default: {
  //           break;
  //         }
  //       }
  //     });
  //   } else {
  //     this.onSetDefaultTable();
  //   }
  // }

  isAvailableToAprrove(status) {
    return status == PlanStatus.PENDING_CONSIDERATION;
  }
}
export interface StudyPlan {
  id: string;
  study_plan_id: string;
  student_id: string;
  student_firstname: string;
  student_lastname: string;
  career: any;
  update_time: string;
}

// const ELEMENT_DATA: StudyPlan[] = [
//   {
//     student_id: "2",
//     student_name: "อนุรัตน์ ไพรอนันต์",
//     career_1: "xxx",
//     career_2: "xxx",
//     career_3: "xxx",
//     update_time: "xxx",
//   },
//   {
//     student_id: "3",
//     student_name: "นาวิน พรมพิทักษ์ ",
//     career_1: "xxx",
//     career_2: "xxx",
//     career_3: "xxx",
//     update_time: "xxx",
//   },
// ];
