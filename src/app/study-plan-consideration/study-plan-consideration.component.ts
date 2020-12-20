import { Component, OnInit } from "@angular/core";
import { StudyplanService } from "src/app/services/studyplan.service";
import { PlanStatus } from "src/app/models/plan-status.enum";

@Component({
  selector: "app-study-plan-consideration",
  templateUrl: "./study-plan-consideration.component.html",
  styleUrls: ["./study-plan-consideration.component.css"],
})
export class StudyPlanConsiderationComponent implements OnInit {
  requestList = null;
  constructor(private studyplanService: StudyplanService) {}

  ngOnInit() {
    if (!this.requestList) {
      this.getStudyPlanRequest();
    }
  }

  async getStudyPlanRequest() {
    this.requestList = await this.studyplanService.getStudyPlanRequest(134, 134);
  }

  isPendingConsideration() {
    return this.requestList.approveRequest.filter(
      (item: any) =>
        item.teacher_status == PlanStatus.PENDING_CONSIDERATION && item.student_status == PlanStatus.PENDING_CONSIDERATION
    );
  }

  isEditRequest() {
    return this.requestList.approveRequest.filter(
      (item: any) =>
        item.teacher_status == PlanStatus.APPROVED &&
        item.student_status == PlanStatus.APPROVED &&
        item.modify_status == PlanStatus.PENDING_CONSIDERATION
    );
  }

  isApproved() {
    return this.requestList.approveRequest.filter(
      (item: any) =>
        item.teacher_status == PlanStatus.APPROVED &&
        item.student_status == PlanStatus.APPROVED &&
        (item.modify_status == PlanStatus.DRAFT || item.modify_status == PlanStatus.NOT_APPROVED)
    );
  }

  isNotApproved() {
    return this.requestList.approveRequest.filter(
      (item: any) =>
        item.teacher_status == PlanStatus.NOT_APPROVED &&
        (item.student_status == PlanStatus.NOT_APPROVED || item.student_status == PlanStatus.CANCEL)
    );
  }

  isCancelApproved() {
    return this.requestList.approveRequest.filter(
      (item: any) => item.teacher_status == PlanStatus.APPROVED && item.student_status == PlanStatus.CANCEL
    );
  }

  // DRAFT = "1",
  // PENDING_CONSIDERATION = "2",
  // APPROVED = "3",
  // NOT_APPROVED = "4",
  // CANCEL = "5",
}
