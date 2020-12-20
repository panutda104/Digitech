import { Component, OnInit, Inject, HostListener } from "@angular/core";
import { ViewportScroller } from "@angular/common";
import { Syllabus } from "src/app/models/syllabus";
import { Scheme } from "src/app/models/scheme";
import { Course_Type } from "src/app/models/course_type";
import { Course_Group } from "src/app/models/course_group";
import { Course_Tranfer_Rule } from "src/app/models/course_tranfer_rule";
import { FormBuilder, FormControl } from "@angular/forms";
// import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { ToastrService } from "ngx-toastr";
import { ActivatedRoute } from "@angular/router";

import { ModuleService } from "src/app/services/module.service";
import { StudyplanService } from "src/app/services/studyplan.service";
import { ProgramService } from "src/app/services/program.service";
import { CareerService } from "src/app/services/career.service";

import { CareerPercentPipe } from "../../pipes/careerPercent.pipe";

import { AddAnotherCourseDialogComponent } from "./dialog/add-another-course-dialog/add-another-course-dialog.component";
import { EditRequestDialogComponent } from "./dialog/edit-request-dialog/edit-request-dialog.component";
import { RejectEditRequestDialogComponent } from "./dialog/reject-edit-request-dialog/reject-edit-request-dialog.component";

import { Router } from "@angular/router";
import { PlanStatus } from "src/app/models/plan-status.enum";
import { Roles } from "src/app/models/roles.enum";

import {
  faChevronLeft,
  faChevronDown,
  faCheckCircle,
  faCommentAlt,
  faTrash,
  faTimesCircle,
  faPlus,
  faPen,
  faCheck,
  faRedo,
  faEdit,
  faInfoCircle,
  faAngleUp,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material";
import { element } from "protractor";

@Component({
  selector: "app-plan-form",
  templateUrl: "./plan-form.component.html",
  styleUrls: ["./plan-form.component.css"],
})
export class PlanFormComponent implements OnInit {
  // panelOpenState = true;
  syllabus = [];
  scheme = [];
  allCareer = null;
  otherCareer = null;

  studyPlan = null;
  courseOption = null;
  moduleParent = null;
  coursePicked = {};

  courseOrder = [];
  courseTranfer = [];
  credit = [];
  creditValidate = false;
  careerPicked = null;
  pickedCareerFormPlan = null;

  summaryCredit = [];
  totalCredit = {
    total_major_credit: 0,
    total_current_credit: 0,
  };
  eachTrimesterCredit = {};

  availableToEditStudyPlan = false;
  availableToApprove = false;

  faChevronLeft = faChevronLeft;
  faChevronDown = faChevronDown;
  faCheckCircle = faCheckCircle;
  faCommentAlt = faCommentAlt;
  faTrash = faTrash;
  faTimesCircle = faTimesCircle;
  faPlus = faPlus;
  faPen = faPen;
  faCheck = faCheck;
  faRedo = faRedo;
  faEdit = faEdit;
  faInfoCircle = faInfoCircle;
  faAngleUp = faAngleUp;
  faShare = faShare;

  programForm = this.fb.group({
    id: null, // record id
    study_plan_id: null, // plan id
    study_plan_name: null,
    study_plan: null,
    scheme_id: 1, //"1","2"
    syllabus_id: JSON.parse(localStorage.getItem("account")).syllabus_id,
    student_id: JSON.parse(localStorage.getItem("account")).id,
    student_firstname: null,
    student_lastname: null,
    create_time: null,
    update_time: null,
    student_status: 1,
    teacher_status: 1,
    modify_status: 1,
    comment: null,
    edited_plan_id: null,
    edited_plan: null,
    student_request_text: null,
    teacher_reject_text: null,
  });

  selectedModuleForm: FormControl = new FormControl([]);

  pageYoffset = 0;
  @HostListener("window:scroll", ["$event"]) onScroll(event) {
    this.pageYoffset = window.pageYOffset;
  }

  constructor(
    private fb: FormBuilder,
    private programService: ProgramService,
    private moduleServide: ModuleService,
    private studyplanService: StudyplanService,
    private careerServive: CareerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private careerPercent: CareerPercentPipe,
    private scroll: ViewportScroller
  ) {
    for (let item of Object.values(Syllabus)) {
      this.syllabus.push(item);
    }
    for (let item of Object.values(Scheme)) {
      this.scheme.push(item);
    }
  }

  ngOnInit() {
    console.log("ngOnInit");

    this.careerServive.getAllCareerInPlanFormat(JSON.parse(localStorage.getItem("account")).syllabus_id).then((result) => {
      this.route.params.subscribe((params) => {
        this.availableToEditStudyPlan = params.id && params.edit == "edit";
        if (!this.isEmpty(params.id)) {
          this.getStudyPlan(params.id, result).then(() => {});
        } else {
          this.getProgram(
            {
              syllabus_id: JSON.parse(localStorage.getItem("account")).syllabus_id,
              scheme_id: 1,
            },
            result
          );
        }
      });

      this.getAvailableToApprove();
    });
  }

  setOnLoad() {
    // this.careerServive.getAllCareerInPlanFormat(JSON.parse(localStorage.getItem("account")).syllabus_id).then((result) => {
    this.getStudyPlan(this.programForm.value.id, this.allCareer).then(() => {
      this.getAvailableToApprove();
      this.scrollToTop();
    });

    // });
  }

  // --------------------------------------
  // set up plan
  // --------------------------------------

  getCareerPicked(value) {
    this.careerPicked = value;
    this.calOtherCareerPercent();
  }
  async getAvailableToApprove() {
    this.availableToApprove = await this.studyplanService.getIsAvailableToApprove(JSON.parse(localStorage.getItem("account")).id);
  }

  async getProgram(value, career) {
    this.programService.getProgram(value).then((program) => {
      if (program) {
        this.studyPlan = program.program_structure;
        this.credit = program.program_credit;

        //เก็บ course ที่ default มากับ plan
        this.calPickedCourse().then((result) => {
          if (result) {
            this.careerPercent.transform(result, career).then(() => {
              this.coursePicked = result;
              this.allCareer = career;

              this.otherCareer = Object.values(career)
                .filter((item: any) => item.achieve_percent > 0)
                .sort((a: any, b: any) => {
                  return b.achieve_percent - a.achieve_percent;
                });

              //ดึงข้อมูล option
              this.getCourseOption().then((result) => {
                this.courseOption = result["optional"];
                this.moduleParent = result["module_parent"];
                this.getSummaryCredit();
              });
            });
          }
        });
      }
    });
  }

  async getStudyPlan(id, career) {
    this.studyplanService.getStudyPlanById(id, JSON.parse(localStorage.getItem("account")).id).then((study_plan) => {
      if (study_plan) {
        this.programForm.patchValue({
          ...study_plan,
          study_plan_id: study_plan.study_plan_id,
          id: study_plan.id,
        });
        let study_plan_ = study_plan.study_plan;

        this.studyPlan = study_plan_.study_plan;
        this.credit = study_plan_.credit;
        this.courseOption = study_plan_.course_option;
        this.careerPicked = study_plan_.career;

        this.courseOrder = study_plan_.courseOrder ? study_plan_.courseOrder : [];

        //เก็บ course ที่ default มากับ plan
        this.calPickedCourse().then((result) => {
          if (result) {
            this.careerPercent.transform(result, career).then(() => {
              this.pickedCareerFormPlan = [];
              let careerPickedId = [];
              if (this.careerPicked) {
                Object.keys(this.careerPicked).forEach((item: any) => {
                  this.pickedCareerFormPlan.push({
                    ...career[item],
                    ...this.careerPicked[item],
                    expandable: true,
                  });
                  careerPickedId.push(item);
                });
                this.careerPicked = this.pickedCareerFormPlan;
              }

              this.otherCareer = Object.values(career)
                .filter((item: any) => !careerPickedId.includes(item.career_id) && item.achieve_percent > 0)
                .sort((a: any, b: any) => {
                  return b.achieve_percent - a.achieve_percent;
                });
            });
          }

          //assign with send prop to child
          this.coursePicked = result;
          this.allCareer = career;
          //ดึงข้อมูล option
          this.getCourseOption().then((result) => {
            // compare new option
            // this.courseOption = result_["optional"];
            this.moduleParent = result["module_parent"];
            this.getSummaryCredit();
          });
        });
      } else {
        this.toastr.error("Sorry, something wrong. Please try again.", null, {
          positionClass: "toast-top-center",
          closeButton: true,
        });
      }
    });
  }

  async getCourseOption() {
    let optional = await this.moduleServide.getOptional();
    return optional;
  }
  async calPickedCourse() {
    let coursePicked = {};
    let value_ = this.studyPlan;

    Object.keys(value_).forEach((year) => {
      Object.keys(value_[year]).forEach((trimester) => {
        Object.keys(
          Object.keys(value_[year][trimester])
            .filter((e) => e !== "credit")
            .reduce((obj, key) => {
              obj[key] = value_[year][trimester][key];
              return obj;
            }, {})
        ).forEach((item) => {
          value_[year][trimester][item]["courses"].forEach((item_) => {
            if (item_.isChecked) {
              let newCourse: coursePicked = {
                year: year,
                trimester: trimester,
                course_group: item,
                course_credit: this.getCourseCredit(item_),
                type_of_course: item_.type_of_course,
                courses: "courses" in item_ ? item_.courses : null,
              };

              coursePicked[this.getCourseId(item_)] = newCourse;
            }
          });
        });
      });
    });

    return coursePicked;
  }

  calOtherCareerPercent() {
    if (this.allCareer) {
      let careerPickedId = [];

      if (this.careerPicked) {
        this.careerPicked.forEach((item) => {
          careerPickedId.push(item.career_id);
        });
      }

      this.otherCareer = Object.values(this.allCareer).filter((item: any) => !careerPickedId.includes(item.career_id));

      if (this.coursePicked && this.otherCareer.length) {
        this.careerPercent.transform(this.coursePicked, this.otherCareer);
      }

      this.otherCareer = this.otherCareer
        .filter((item: any) => item.achieve_percent > 0)
        .sort((a: any, b: any) => {
          return b.achieve_percent - a.achieve_percent;
        });
    }
  }

  async onSaveProgram() {
    this.setProgramValue();
    if (this.programForm.value.id) {
      if (await this.studyplanService.updateStudyPlan(this.programForm.value)) {
        this.changeIsEditStudyPlan();
        this.setOnLoad();
        // console.log("success");
        // this.router.navigateByUrl("/study-plan");
      } else {
        this.toastr.error("Sorry, something wrong. Please try again.", null, {
          positionClass: "toast-top-center",
          closeButton: true,
        });
      }
    } else {
      this.studyplanService.createStudyPlan(this.programForm.value).then((result) => {
        if (result) {
          this.programForm.controls["id"].setValue(result);
          this.setOnLoad();
        } else {
          this.toastr.error("Sorry, your update failed. Please try again.", null, {
            positionClass: "toast-top-center",
            closeButton: true,
          });
        }
      });

      // if (await this.studyplanService.createStudyPlan(this.programForm.value)) {
      //   this.setOnLoad();
      //   // console.log("success");
      //   // this.router.navigateByUrl("/study-plan");
      // } else {
      //   this.toastr.error("Sorry, your update failed. Please try again.", null, {
      //     positionClass: "toast-top-center",
      //     closeButton: true,
      //   });
      // }
    }
  }

  setProgramValue() {
    this.programForm.patchValue({
      study_plan: {
        study_plan: this.setStudyPlan(this.studyPlan),
        credit: this.credit,
        course_option: this.courseOption,
        career: this.setCareer(),
        courseOrder: this.courseOrder.length ? this.courseOrder : null,
        courseTranfer: this.courseTranfer.length ? this.courseTranfer : null,
      },
    });
  }

  setCareer() {
    if (!this.careerPicked || Object.keys(this.careerPicked).length == 0) {
      return null;
    }
    let career_log = {};
    this.careerPicked.forEach((item) => {
      career_log[item.career_id] = {
        career_id: item.career_id,
        career_name_en: item.career_name_en,
        career_name_th: item.career_name_th,
        isDefault: item.isDefault,
        achieve_percent: item.achieve_percent,
      };
    });

    return career_log;
  }

  setStudyPlan(value) {
    //clear uncheck course out of plan
    let value_ = JSON.parse(JSON.stringify(value));
    Object.keys(value_).forEach((year) => {
      Object.keys(value_[year]).forEach((trimester) => {
        Object.keys(
          Object.keys(value_[year][trimester])
            .filter((e) => e !== "credit")
            .reduce((obj, key) => {
              obj[key] = value_[year][trimester][key];
              return obj;
            }, {})
        ).forEach((item) => {
          value_[year][trimester][item]["courses"] = value_[year][trimester][item]["courses"].filter((e) => e.isChecked);
        });
      });
    });

    return value_;
  }

  // --------------------------------------
  //           Teacher Section
  // --------------------------------------

  async approveStudentPlan() {
    if (
      await this.studyplanService.updateApprovedStudentPlan(
        this.programForm.value.id,
        JSON.parse(localStorage.getItem("account")).id
      )
    ) {
      const timeout = 750;
      const dialogRef = this.dialog.open(AlertDialog, {
        data: { success: true, text: "ดำเนินการเรียบร้อย" },
      });
      dialogRef.afterOpened().subscribe((_) => {
        setTimeout(() => {
          dialogRef.close();
          this.redirect();
        }, timeout);
      });
    } else {
      const dialogRef = this.dialog.open(AlertDialog, {
        data: { success: false, text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง" },
      });
      dialogRef.afterClosed().subscribe(() => {});
    }
  }

  async notApproveStudentPlan() {
    const dialogRef = this.dialog.open(RejectPlanDialog, {
      data: {
        isAboutApprove: true,
        student: this.programForm.value.student_firstname + " " + this.programForm.value.student_lastname,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.comment) {
          this.programForm.controls["comment"].setValue(result.comment);
        }

        this.studyplanService
          .updateNotApprovedStudentPlan(
            this.programForm.value.id,
            JSON.parse(localStorage.getItem("account")).id,
            this.programForm.value.comment
          )
          .then((result_) => {
            if (result_) {
              const timeout = 750;
              const dialogRef = this.dialog.open(AlertDialog, {
                data: { success: true, text: "ดำเนินการเรียบร้อย" },
              });
              dialogRef.afterOpened().subscribe((_) => {
                setTimeout(() => {
                  dialogRef.close();
                  this.redirect();
                }, timeout);
              });
            } else {
              const dialogRef = this.dialog.open(AlertDialog, {
                data: { success: false, text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง" },
              });
              dialogRef.afterClosed().subscribe(() => {});
            }
          });
      }
    });
  }

  async approveEditsStudentPlan() {
    if (
      await this.studyplanService.updateApproveEditsStudentPlan(
        this.programForm.value.id,
        JSON.parse(localStorage.getItem("account")).id
      )
    ) {
      const timeout = 750;
      const dialogRef = this.dialog.open(AlertDialog, {
        data: { success: true, text: "ดำเนินการเรียบร้อย" },
      });
      dialogRef.afterOpened().subscribe((_) => {
        setTimeout(() => {
          dialogRef.close();
          this.redirect();
        }, timeout);
      });
    } else {
      const dialogRef = this.dialog.open(AlertDialog, {
        data: { success: false, text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง" },
      });
      dialogRef.afterClosed().subscribe(() => {});
    }
  }

  async notApproveEditsStudentPlan() {
    const dialogRef = this.dialog.open(RejectEditRequestDialogComponent, {
      data: {
        student: this.programForm.value.student_firstname + " " + this.programForm.value.student_lastname,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.studyplanService
          .updateNotApproveEditsStudentPlan(
            this.programForm.value.id,
            JSON.parse(localStorage.getItem("account")).id,
            result.teacher_reject_text
          )
          .then((result_) => {
            if (result_) {
              const timeout = 750;
              const dialogRef = this.dialog.open(AlertDialog, {
                data: { success: true, text: "ดำเนินการเรียบร้อย" },
              });
              dialogRef.afterOpened().subscribe((_) => {
                setTimeout(() => {
                  dialogRef.close();
                  this.redirect();
                }, timeout);
              });
            } else {
              const dialogRef = this.dialog.open(AlertDialog, {
                data: { success: false, text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง" },
              });
              dialogRef.afterClosed().subscribe(() => {});
            }
          });
      }
    });
  }

  // --------------------------------------
  // manage select & option for plan
  // --------------------------------------

  getOptionEachType(trimester, type, courseType) {
    if (
      this.courseOption[trimester] &&
      type in this.courseOption[trimester] &&
      !this.isEmpty(this.courseOption[trimester][type])
    ) {
      return [
        ...this.courseOption[trimester][type].filter(
          (item) => courseType.includes(item.type_of_course) && !this.isPickedModuleAndIndependentCourse(item)
        ),
        ...this.courseOption[0][type].filter(
          (item) => courseType.includes(item.type_of_course) && !this.isPickedModuleAndIndependentCourse(item)
        ),
      ];
    }

    return [];
  }

  onClickCourseOption(year, trimester, courseGroup, type, course, checkByDefault) {
    if (this.isNotSpecifiedTrimester(course, trimester)) {
      return;
    }

    let course_ = course;

    if (this.isHasKey(this.studyPlan[year][trimester][courseGroup], type)) {
      let courseList = this.studyPlan[year][trimester][courseGroup][type];

      //ตรวจสอบ course ที่เลือกมาว่าควรเป็น module หรือไม่
      if (this.isShouldBeModuleInList(courseList, course)) {
        // หา module object จาก option เพื่อนำไปใส่ใน list
        course_ = this.courseOption[trimester]["courses"].find((item) => item.module_id == course.root_id);
        if (!course_) {
          course_ = this.courseOption[0]["courses"].find((item) => item.module_id == course.root_id);
        }
        course_["isChecked"] = false;
      }

      //ตรวจสอบว่า course ที่เลือกมานั้นมีอยู่ใน list ไหม
      let index = this.studyPlan[year][trimester][courseGroup][type].findIndex(
        (item) => this.getCourseId(item) == this.getCourseId(course_)
      );

      if (index > -1) {
        this.studyPlan[year][trimester][courseGroup][type][index]["isChecked"] = true;
        this.studyPlan[year][trimester][courseGroup][type][index]["isCheckedByCareer"] = checkByDefault;
      } else {
        this.studyPlan[year][trimester][courseGroup][type].push({
          ...course_,
          isChecked: true,
          isCheckedByCareer: checkByDefault,
        });
      }
    } else {
      this.studyPlan[year][trimester][courseGroup][type] = [{ ...course_, isChecked: true, isCheckedByCareer: checkByDefault }];
    }

    // เพิ่มใน course ที่ plan ( Add to course picked )
    // this.coursePicked = [...this.coursePicked, this.getCourseId(course_)];

    this.courseOrder.push(this.getCourseId(course_));

    let newCourse: coursePicked = {
      year: year,
      trimester: trimester,
      course_group: courseGroup,
      course_credit: this.getCourseCredit(course_),
      type_of_course: course_.type_of_course,
      courses: "courses" in course ? course_.courses : null,
    };

    this.coursePicked[this.getCourseId(course_)] = newCourse;

    this.onCleanCourseFromListAndOption(course_, false);

    this.getSummaryCredit();

    if (!checkByDefault) {
      //scroll to view
      setTimeout(() => {
        document.getElementById(year + trimester + courseGroup + this.getCourseId(course_)).scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      }, 250);
    }
  }

  onClickCourse(year, trimester, courseGroup, type, index, value) {
    // --------- CHECK ---------
    if (!this.studyPlan[year][trimester][courseGroup][type][index]["isChecked"]) {
      let value_ = value;
      let courseList = this.studyPlan[year][trimester][courseGroup][type];

      //ตรวจสอบ course ที่เลือกมาว่าควรเป็น module หรือไม่
      if (this.isShouldBeModuleInList(courseList, value_)) {
        // หา module object จาก option เพื่อนำไปใส่ใน list
        value_ = this.courseOption[trimester]["courses"].find((item) => item.module_id == value.root_id);
        if (!value_) {
          value_ = this.courseOption[0]["courses"].find((item) => item.module_id == value.root_id);
        }

        // course ที่จะนำไปเพิ่มใน list เป็น module, ต้องตรวจสอบ course parent แล้วลบออกก่อนจะเพิ่ม
        if ("module_id" in value_) {
          //ลบ parent จาก course ที่ plan ไว้
          this.moduleParent[value_.module_id].forEach((element) => {
            delete this.coursePicked[element];
            this.courseOrder.filter((item) => item !== element);
          });
          let index = this.studyPlan[year][trimester][courseGroup][type].findIndex(
            (item) => this.getCourseId(item) == this.getCourseId(value_)
          );

          if (index > -1) {
            this.studyPlan[year][trimester][courseGroup][type][index]["isChecked"] = true;
            this.studyPlan[year][trimester][courseGroup][type][index]["isCheckedByCareer"] = false;
          } else {
            this.studyPlan[year][trimester][courseGroup][type].push({
              ...value_,
              isChecked: true,
              isCheckedByCareer: false,
            });
          }
        }
      } else {
        this.studyPlan[year][trimester][courseGroup][type][index]["isChecked"] = true;
        this.studyPlan[year][trimester][courseGroup][type][index]["isCheckedByCareer"] = false;
      }

      // เพิ่มใน course ที่ plan ( Add to course picked )
      // this.coursePicked = [...this.coursePicked, this.getCourseId(value_)];
      this.courseOrder.push(this.getCourseId(value_));

      let newCourse: coursePicked = {
        year: year,
        trimester: trimester,
        course_group: courseGroup,
        course_credit: this.getCourseCredit(value_),
        type_of_course: value_.type_of_course,
        courses: "courses" in value_ ? value_.courses : null,
      };

      this.coursePicked[this.getCourseId(value_)] = newCourse;

      // Re-clean duplicate course all list
      this.onCleanCourseFromListAndOption(value_, false);

      // scroll to checked course
      setTimeout(() => {
        document.getElementById(year + trimester + courseGroup + this.getCourseId(value_)).scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      }, 200);
    } else {
      // --------- UN-CHECK ---------
      this.studyPlan[year][trimester][courseGroup][type][index]["isChecked"] = false;
      this.studyPlan[year][trimester][courseGroup][type][index]["isCheckedByCareer"] = false;

      //Remove out of course picked
      // this.coursePicked = this.coursePicked.filter((item) => item !== this.getCourseId(value));

      delete this.coursePicked[this.getCourseId(value)];
      this.courseOrder = this.courseOrder.filter((item) => item !== this.getCourseId(value));

      this.courseTranfer = this.courseTranfer.filter(
        (item) =>
          item.id !== this.getCourseId(value) &&
          !(this.moduleParent[this.getCourseId(value)] && this.moduleParent[this.getCourseId(value)].includes(item.id))
      );
    }

    this.getSummaryCredit();
  }

  onCleanCourseFromListAndOption(course, isClearAll) {
    let value_ = this.studyPlan;
    Object.keys(value_).forEach((year) => {
      Object.keys(value_[year]).forEach((trimester) => {
        Object.keys(
          Object.keys(value_[year][trimester])
            .filter((e) => e !== "credit")
            .reduce((obj, key) => {
              obj[key] = value_[year][trimester][key];
              return obj;
            }, {})
        ).forEach((item) => {
          value_[year][trimester][item]["courses"] = value_[year][trimester][item]["courses"].filter(
            (e) =>
              // clear parent โดย manual
              !((isClearAll ? true : !e.isChecked) && this.getCourseId(e) == this.getCourseId(course)) &&
              // clear parent โดย module เอง
              (this.isHasKey(course, "module_id") ? !this.moduleParent[course.module_id].includes(this.getCourseId(e)) : true) &&
              (this.isShouldBeModuleInPlan(course) ? this.getCourseId(e) !== course.root_id : true)
          );
        });
      });
    });

    if (this.isHasKey(course, "module_id")) {
      this.moduleParent[course.module_id].forEach((element) => {
        delete this.coursePicked[element];
        this.courseOrder = this.courseOrder.filter((item) => item !== element);
        this.courseTranfer = this.courseTranfer.filter((item) => item.id !== element);
      });
    }
  }

  onDefaultModuleByCareer(index) {
    if (!this.careerPicked[index].isDefault) {
      this.careerPicked[index].isDefault = true;
      Object.entries(this.careerPicked[index]["trimesters"]).forEach(([trimester, modules]) => {
        if (trimester.length) {
          Object.values(modules).forEach((module) => {
            if (
              module.module_essential &&
              !(module.module_id in this.coursePicked) &&
              !this.moduleParent[module.module_id].find((item) => item in this.coursePicked)
            ) {
              if (module.module_year == "0") {
                Object.values(module.courses).forEach((course: any) => {
                  if (!(course.course_id in this.coursePicked)) {
                    this.onClickCourseOption(
                      course.course_year,
                      course.course_trimester,
                      Course_Group[Number(Course_Type[Number(module.type_of_course)].course_group_id)],
                      "courses",
                      course,
                      true
                    );
                  }
                });
              } else {
                this.onClickCourseOption(
                  module.module_year,
                  trimester,
                  Course_Group[Number(Course_Type[Number(module.type_of_course)].course_group_id)],
                  "courses",
                  module,
                  true
                );
              }
            }
          });
        }
      });
    } else {
      this.careerPicked[index].isDefault = false;
      let checkedByOtherCareer = [];

      Object.keys(this.careerPicked)
        .filter((e) => e != index && this.careerPicked[e].isDefault)
        .forEach((key) => {
          Object.entries(this.careerPicked[key]["trimesters"]).forEach(([key_, trimester]) => {
            if (key_.length) {
              Object.values(trimester).forEach((module: any) => {
                if (module.module_essential) {
                  if (module.module_year == "0") {
                    Object.values(module.courses).forEach((course: any) => {
                      if (!checkedByOtherCareer.includes(course.course_id)) {
                        checkedByOtherCareer.push(course.course_id);
                      }
                    });
                  } else {
                    if (!checkedByOtherCareer.includes(module.module_id)) {
                      checkedByOtherCareer.push(module.module_id);
                    }
                  }
                }
              });
            }
          });
        });

      Object.entries(this.careerPicked[index]["trimesters"]).forEach(([key_, trimester]) => {
        if (key_.length) {
          Object.values(trimester).forEach((module) => {
            if (module.module_essential) {
              let work_id = [];
              if (module.module_year == "0") {
                Object.values(module.courses).forEach((course: any) => {
                  work_id.push(course.course_id);
                });
              } else {
                work_id.push(module.module_id);
              }

              work_id.forEach((id) => {
                if (id in this.coursePicked && !checkedByOtherCareer.includes(id)) {
                  let course_info = this.coursePicked[id];
                  let courseList = this.studyPlan[course_info.year][course_info.trimester][course_info.course_group]["courses"];

                  let index_ = courseList.findIndex((item) => this.getCourseId(item) == id);

                  if (index_ > -1) {
                    if (courseList[index_].isChecked) {
                      if (courseList[index_].isCheckedByCareer) {
                        courseList.splice(index_, 1);
                        delete this.coursePicked[id];
                        this.courseOrder = this.courseOrder.filter((item) => item !== id);
                        this.courseTranfer = this.courseTranfer.filter((item) => item.id !== id);
                      }
                    } else {
                      this.studyPlan[course_info.year][course_info.trimester][course_info.course_group]["courses"][
                        index_
                      ].isChecked = false;
                    }
                  }
                }
              });
            }
          });
        }
      });

      this.getSummaryCredit();
    }

    this.calOtherCareerPercent();
  }

  isShouldBeModuleInList(courseList, value) {
    if ("root_id" in value && value["root_id"]) {
      let moduleParent = this.moduleParent[value.root_id].filter((item) => item !== value.course_id);

      courseList.forEach((item) => {
        if ("root_id" in item && item.isChecked && moduleParent.includes(item.course_id)) {
          moduleParent.splice(moduleParent.indexOf(item.course_id), 1);
        }
      });

      if (this.isEmpty(moduleParent)) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  isShouldBeModuleInPlan(value) {
    if ("root_id" in value && value["root_id"]) {
      let moduleParent = this.moduleParent[value.root_id].filter((item) => !(item in this.coursePicked));
      if (this.isEmpty(moduleParent)) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  isModuleWasPickedByParent(value) {
    let moduleParent = this.moduleParent[value.module_id].filter((item) => !(item in this.coursePicked));
    if (this.isEmpty(moduleParent)) {
      return true;
    } else {
      return false;
    }
  }

  isPickedCourseOfModule(value) {
    if ("courses" in value) {
      // is module
      for (let item of value.courses) {
        if (item.course_id in this.coursePicked) {
          return true;
        }
      }
    } else {
      // is course
      if (value.course_id in this.coursePicked) {
        return true;
      }
    }

    return false;
  }

  isNotSpecifiedTrimester(value, trimester) {
    if (this.getCourseTrimester(value) == 0 || !this.getCourseTrimester(value).includes(trimester)) {
      return true;
    }

    return false;
  }

  isPickedModuleAndIndependentCourse(value) {
    if ("module_id" in value) {
      // is module
      if (value.module_id in this.coursePicked && !this.isModuleWasPickedByParent(value)) {
        return true;
      }
    } else {
      // is independent course
      if (!value.root_id && value.course_id in this.coursePicked) {
        return true;
      }
    }

    return false;
  }

  isDisabledCourse(value) {
    if (value.isChecked) return false;

    if ("courses" in value) {
      // is module
      for (let item of value.courses) {
        if (item.course_id in this.coursePicked) {
          return true;
        }
      }
    } else {
      // is course
      if ((value.root_id && value.root_id in this.coursePicked) || (!value.root_id && value.course_id in this.coursePicked)) {
        return true;
      }
    }

    return false;
  }

  checkCourseIsNotEmpty(value) {
    return value && value.courses.length > 0;
  }

  // --------------------------------------
  // credit calculate
  // --------------------------------------

  getTotalCreditEachTerm() {
    Object.entries(this.studyPlan).forEach(([year, year_value]) => {
      Object.keys(year_value).forEach((trimester) => {
        let totalCredit = 0;
        let allCourse = Object.keys(this.studyPlan[year][trimester])
          .filter((key) => key !== "credit")
          .reduce((obj, key) => {
            obj[key] = this.studyPlan[year][trimester][key];
            return obj;
          }, {});

        Object.values(allCourse).forEach((item) => {
          Object.values(item["courses"]).forEach((item_) => {
            if (item_["isChecked"]) totalCredit += Number(this.getCourseCredit(item_));
          });
        });

        this.eachTrimesterCredit = {
          ...this.eachTrimesterCredit,
          [year]: { ...this.eachTrimesterCredit[year], [trimester]: totalCredit },
        };
      });
    });
  }

  getSummaryCredit() {
    if (this.studyPlan) {
      this.getTotalCreditEachTerm();
    }

    if (this.credit) {
      let total_credit = 0;
      let total_arr = 0;

      Object.keys(this.credit).forEach((item) => {
        let major_credit = 0;
        let summary_major_credit = 0;
        Object.keys(this.credit[item]).forEach((item_) => {
          major_credit += Number(this.credit[item][item_]["credit"]);
          total_credit += Number(this.credit[item][item_]["credit"]);
          let totalCreditEachType = this.getTotalCreditEachType(this.credit[item][item_]["id"]);
          this.credit[item][item_]["summary_credit"] = totalCreditEachType;
          summary_major_credit += totalCreditEachType;
          total_arr += totalCreditEachType;
        });
        // credit แยก group
        this.summaryCredit[item] = {
          major_credit: major_credit,
          summary_major_credit: summary_major_credit,
        };
        // credit สรุป
        this.totalCredit = {
          total_major_credit: total_credit,
          total_current_credit: total_arr,
        };
      });

      this.calCourseTranfer();

      this.creditValidate = this.calSummaryCredit();
    }
    return [];
  }

  getTotalCreditEachType(id) {
    let totalCredit = 0;
    for (const key of Object.keys(this.coursePicked)) {
      if (this.coursePicked[key].type_of_course == id) {
        totalCredit += Number(this.getCourseCredit(this.coursePicked[key]));
      }
    }

    return totalCredit;
  }

  calCourseTranfer() {
    let free_elective_course: any = Object.values(this.credit["หมวดวิชาเลือกเสรี"]).find((item: any) => item.id == 7);

    if (this.courseOrder.length && this.isShouldTranfer()) {
      //by rule priority ตามความสำคัญแต่ละหมวด
      Object.values(Course_Tranfer_Rule).forEach((rule: any) => {
        let tranferCourse: any = Object.values(this.credit[Course_Type[rule.course_type].course_classification]).find(
          (item: any) => item.id == rule.course_type
        );

        // check ว่าหมวดนั้นหน่วยกิตเกิน
        if (Number(tranferCourse.summary_credit) > Number(tranferCourse.credit)) {
          if (rule.child_id) {
            rule.child_id.forEach((child_id) => {
              if (child_id in this.coursePicked) {
                const course_classification = Course_Type[this.coursePicked[child_id].type_of_course].course_classification;

                this.tranferCourseCredit(this.coursePicked[child_id], course_classification, tranferCourse, free_elective_course);

                this.calCourseTranfer();
              }
            });
          } else {
            const courseOrder = this.courseOrder
              .slice()
              .filter((item) => item in this.coursePicked && this.coursePicked[item].type_of_course == rule.course_type);

            const lastkey = courseOrder[courseOrder.length - 1];

            if (
              Number(tranferCourse.summary_credit) - Number(this.getCourseCredit(this.coursePicked[lastkey])) <
              Number(tranferCourse.credit)
            ) {
              if ("courses" in this.coursePicked[lastkey]) {
                const creditRequired =
                  Number(tranferCourse.credit) -
                  (Number(tranferCourse.summary_credit) - Number(this.getCourseCredit(this.coursePicked[lastkey])));

                let courses = this.coursePicked[lastkey].courses.slice();

                this.findCreditRequired(
                  courses.map((item) => this.getCourseCredit(item)),
                  creditRequired
                ).forEach((credit) => {
                  //array ที่หน่วยกิตพอดี ex. [3,3,2] => [3,2]
                  let course = courses.reverse().find((item) => this.getCourseCredit(item) == credit);
                  courses = courses.filter((item) => this.getCourseId(item) !== this.getCourseId(course));
                });

                //courses คือ array ของ course ที่จะ tranfer credit ex.[3]
                courses.forEach((item) => {
                  const course_classification = Course_Type[this.coursePicked[lastkey].type_of_course].course_classification;
                  this.tranferCourseCredit(item, course_classification, tranferCourse, free_elective_course);
                });

                this.calCourseTranfer();
              }
            } else {
              const course_classification = Course_Type[this.coursePicked[lastkey].type_of_course].course_classification;

              this.tranferCourseCredit(this.coursePicked[lastkey], course_classification, tranferCourse, free_elective_course);

              this.calCourseTranfer();
            }
          }
        }
      });
    }
  }

  findCreditRequired(arr, credit_required) {
    let result = this.generateCreditSubset(arr, 1)
      .filter((item) => {
        return item.reduce((a, b) => a + b, 0) - credit_required >= 0;
      })
      .sort(function (item_a, item_b) {
        return item_a.reduce((a, b) => a + b, 0) - item_b.reduce((a, b) => a + b, 0);
      });

    return result[0];
  }

  generateCreditSubset(arra, arra_size) {
    var result_set = [],
      result;

    for (var x = 0; x < Math.pow(2, arra.length); x++) {
      result = [];
      let i = arra.length - 1;
      do {
        if ((x & (1 << i)) !== 0) {
          result.push(arra[i]);
        }
      } while (i--);

      if (result.length >= arra_size && !result_set.some((item) => JSON.stringify(item) === JSON.stringify(result))) {
        result_set.push(result);
      }
    }

    return result_set;
  }

  tranferCourseCredit(id, course_classification, tranferCourse, freeElectiveCourse) {
    //ลบหน่วยกิตออกจาก credit class ตัวเอง
    tranferCourse.summary_credit -= Number(this.getCourseCredit(id));
    this.summaryCredit[course_classification].summary_major_credit -= Number(this.getCourseCredit(id));

    //บวกหน่วยกิตใน class หมวดวิชาเลือกเสรี
    freeElectiveCourse.summary_credit += Number(this.getCourseCredit(id));
    this.summaryCredit["หมวดวิชาเลือกเสรี"].summary_major_credit += Number(this.getCourseCredit(id));

    this.courseTranfer.push({
      id: this.getCourseId(id),
      course_credit: this.getCourseCredit(id),
      type_of_course: id.type_of_course,
    });
  }

  isShouldTranfer() {
    const free_elective_course: any = Object.values(this.credit["หมวดวิชาเลือกเสรี"]).find((item: any) => item.id == 7);

    if (Number(free_elective_course.summary_credit) < Number(free_elective_course.credit)) {
      return Object.values(Course_Tranfer_Rule).some((value: any) => {
        let type_of_course: any = Object.values(this.credit[Course_Type[value.course_type].course_classification]).find(
          (item: any) => item.id == value.course_type
        );

        return Number(type_of_course.summary_credit) > Number(type_of_course.credit);
      });
    } else {
      return false;
    }
  }

  calCompareCredit(value, total) {
    return value < total;
  }

  calSummaryCredit() {
    let validate = Object.values(this.credit).some((item: any) => {
      return Object.values(item).some((item_: any) => {
        return item_.summary_credit < item_.credit;
      });
    });

    return validate !== undefined ? !validate : false;
  }

  sortByBoolean(array, value) {
    array.sort((a: any, b: any) => {
      if (a[value] == b[value]) {
        return 0;
      }

      if (a[value]) {
        return -1;
      }

      if (b[value]) {
        return 1;
      }
    });
    return array;
  }

  getAllCourse(trimester) {
    let allCourse = [];
    Object.keys(trimester)
      .filter((key) => key !== "credit")
      .forEach((key) => {
        if (trimester[key].courses.length) {
          allCourse = [].concat(allCourse, trimester[key].courses);
        }
      });

    return allCourse;
  }

  getCourseId(value) {
    return "module_id" in value ? value.module_id : value.course_id;
  }

  getCourseName(value) {
    return "module_name_th" in value ? value.module_name_th : value.course_name_th;
  }

  getCourseCredit(value) {
    return "module_credit" in value ? value.module_credit : value.course_credit;
  }

  get id() {
    return this.programForm.get("id").value;
  }

  get scheme_id() {
    return this.programForm.get("scheme_id");
  }

  get syllabus_id() {
    return this.programForm.get("syllabus_id");
  }

  get study_plan_name() {
    return this.programForm.get("study_plan_name").value;
  }

  get study_plan_id() {
    return this.programForm.get("study_plan_id").value;
  }
  get study_plan_career() {
    return this.programForm.get("study_plan").value ? this.programForm.get("study_plan").value.career : null;
  }

  get student_firstname() {
    return this.programForm.get("student_firstname").value;
  }

  get student_lastname() {
    return this.programForm.get("student_lastname").value;
  }

  getProgrssBarStyle(value: string) {
    return {
      width: value + "%",
      opacity: value + "%",
    };
  }

  isHasKey(obj, key) {
    return key in obj && !this.isEmpty(obj[key]);
  }

  isEmpty(value) {
    return value.length == 0 || value == "";
  }

  isObjectEmpty(value) {
    return Object.keys(value).length == 0;
  }

  redirect() {
    if (this.isStudent()) {
      this.router.navigate(["/study-plan"]);
    } else if (this.isTeacher()) {
      this.router.navigate(["/study-plan-consideration"]);
    }
  }

  changeIsEditStudyPlan() {
    this.availableToEditStudyPlan = !this.availableToEditStudyPlan;
    this.scrollToTop();
  }

  isDraft() {
    this.programForm.value.student_status == PlanStatus.DRAFT;
  }

  getPlanStatusText() {
    switch (this.programForm.value.student_status) {
      case PlanStatus.APPROVED:
        return "แผนนี้ผ่านการอนุมัติแล้ว";
        break;
      case PlanStatus.PENDING_CONSIDERATION:
        return "แผนนี้อยู่ในระหว่างพิจารณาอนุมัติ";
        break;
      case PlanStatus.NOT_APPROVED:
        return "แผนนี้ไม่ผ่านการอนุมัติ";
        break;
      default:
        return;
    }
  }

  getPlanStatusColorStyle() {
    switch (this.programForm.value.student_status) {
      case PlanStatus.APPROVED:
        return "approved-breadcrumb";
        break;
      case PlanStatus.PENDING_CONSIDERATION:
        return "pending-breadcrumb";
        break;
      case PlanStatus.NOT_APPROVED:
        return "reject-breadcrumb";
        break;
      default:
        return;
    }
  }

  // -------------------- student --------------------

  isAvailableToEdit() {
    return this.programForm.value.student_status !== PlanStatus.APPROVED;
  }

  isAvailableToDelete() {
    return this.programForm.value.id && this.programForm.value.student_status !== PlanStatus.APPROVED;
  }

  isAvailableToSendApprove() {
    return this.availableToApprove && this.programForm.value.id && this.programForm.value.student_status == PlanStatus.DRAFT;
  }

  isAvailableToCancel() {
    return this.isStudent() && this.programForm.value.student_status == PlanStatus.PENDING_CONSIDERATION;
  }

  isAvailableToModifyRequest() {
    return (
      this.programForm.value.student_status == PlanStatus.APPROVED && this.programForm.value.modify_status == PlanStatus.DRAFT
    );
  }

  isAvailableToAprrove() {
    return (
      this.programForm.value.teacher_status == PlanStatus.PENDING_CONSIDERATION &&
      this.programForm.value.student_status == PlanStatus.PENDING_CONSIDERATION &&
      this.programForm.value.modify_status == PlanStatus.DRAFT
    );
  }

  isEditRequest() {
    return (
      this.programForm.value.teacher_status == PlanStatus.APPROVED &&
      this.programForm.value.student_status == PlanStatus.APPROVED &&
      this.programForm.value.modify_status == PlanStatus.PENDING_CONSIDERATION
    );
  }

  sendApproveStudyPlan() {
    if (this.creditValidate) {
      this.studyplanService
        .sendApproveStudyPlan(this.programForm.value.id, JSON.parse(localStorage.getItem("account")).id)
        .then((result) => {
          if (result) {
            const timeout = 750;
            const dialogRef = this.dialog.open(AlertDialog, {
              data: { success: true, text: "ดำเนินการเรียบร้อย" },
            });
            dialogRef.afterOpened().subscribe((_) => {
              setTimeout(() => {
                dialogRef.close();
                this.setOnLoad();
              }, timeout);
            });
          } else {
            const dialogRef = this.dialog.open(AlertDialog, {
              data: { success: false, text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง" },
            });
            dialogRef.afterClosed().subscribe(() => {});
          }
        });
    } else {
      const dialogRef = this.dialog.open(AlertDialog, {
        data: { success: false, text: "กรุณาตรวจสอบหน่วยกิต ให้ครบจำนวนตามหลักสูตร" },
      });
      dialogRef.afterClosed().subscribe(() => {});
    }
  }

  sendAdviseStudyPlan() {
    if (this.creditValidate) {
      this.studyplanService
        .sendAdviseStudyPlan(this.programForm.value.id, JSON.parse(localStorage.getItem("account")).id)
        .then((result) => {
          if (result) {
            const timeout = 750;
            const dialogRef = this.dialog.open(AlertDialog, {
              data: { success: true, text: "ดำเนินการเรียบร้อย" },
            });
            dialogRef.afterOpened().subscribe((_) => {
              setTimeout(() => {
                dialogRef.close();
                this.setOnLoad();
              }, timeout);
            });
          } else {
            const dialogRef = this.dialog.open(AlertDialog, {
              data: { success: false, text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง" },
            });
            dialogRef.afterClosed().subscribe(() => {});
          }
        });
    } else {
      const dialogRef = this.dialog.open(AlertDialog, {
        data: { success: false, text: "กรุณาตรวจสอบหน่วยกิต ให้ครบจำนวนตามหลักสูตร" },
      });
      dialogRef.afterClosed().subscribe(() => {});
    }
  }

  sendRequestEditStudyPlan(request_text) {
    this.studyplanService
      .sendEditRequestStudyPlan(this.programForm.value.id, JSON.parse(localStorage.getItem("account")).id, request_text)
      .then((result) => {
        if (result) {
          const timeout = 750;
          const dialogRef = this.dialog.open(AlertDialog, {
            data: { success: true, text: "ดำเนินการเรียบร้อย" },
          });
          dialogRef.afterOpened().subscribe((_) => {
            setTimeout(() => {
              dialogRef.close();
              this.setOnLoad();
            }, timeout);
          });
        } else {
          const dialogRef = this.dialog.open(AlertDialog, {
            data: { success: false, text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง" },
          });
          dialogRef.afterClosed().subscribe(() => {});
        }
      });
  }

  async onDeleteStudyPlan() {
    let id = this.programForm.value.id;
    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      data: { id: id, user_id: JSON.parse(localStorage.getItem("account")).id, text: "คุณต้องการลบแผนการเรียน" },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.studyplanService
          .removeStudyPlan(this.programForm.value.id, JSON.parse(localStorage.getItem("account")).id)
          .then((result_) => {
            if (result_) {
              const timeout = 750;
              const dialogRef = this.dialog.open(AlertDialog, {
                data: { success: true, text: "ลบแผนการเรียนเรียบร้อย" },
              });
              dialogRef.afterOpened().subscribe((_) => {
                setTimeout(() => {
                  dialogRef.close();
                  this.redirect();
                }, timeout);
              });
            } else {
              const dialogRef = this.dialog.open(AlertDialog, {
                data: { success: false, text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง" },
              });
              dialogRef.afterClosed().subscribe(() => {});
            }
          });
      }
    });
  }

  async onCancelStudyPlan() {
    let id = this.programForm.value.id;
    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      data: { id: id, user_id: JSON.parse(localStorage.getItem("account")).id, text: "คุณต้องการยกเลิกการขอพิจารณาแผนการเรียน" },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.studyplanService
          .cancelStudyPlan(this.programForm.value.id, JSON.parse(localStorage.getItem("account")).id)
          .then((result_) => {
            if (result_) {
              const timeout = 750;
              const dialogRef = this.dialog.open(AlertDialog, {
                data: { success: true, text: "ยกเลิกขอพิจรณาแผนการเรียนเรียบร้อย" },
              });
              dialogRef.afterOpened().subscribe((_) => {
                setTimeout(() => {
                  dialogRef.close();
                  this.redirect();
                }, timeout);
              });
            } else {
              const dialogRef = this.dialog.open(AlertDialog, {
                data: { success: false, text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง" },
              });
              dialogRef.afterClosed().subscribe(() => {});
            }
          });
      }
    });
  }

  isStudent() {
    return JSON.parse(localStorage.getItem("account")).user_role == Roles.Student;
  }

  isTeacher() {
    return JSON.parse(localStorage.getItem("account")).user_role == Roles.Teacher;
  }

  abeam(value) {
    console.log(value);
  }

  // --------------------------------------
  // add another course
  // --------------------------------------

  addAnotherCourse(): void {
    const dialogRef = this.dialog.open(AddAnotherCourseDialogComponent, {
      data: { syllabus_id: JSON.parse(localStorage.getItem("account")).syllabus_id },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.length) {
        result.forEach((course) => {
          this.getCourseTrimester(course).forEach((trimester: any) => {
            if (!this.isExistCourse(this.courseOption[trimester].courses, course)) {
              let course_ = course;
              delete course_.order;
              let moduleParent = [];
              if ("module_id" in course_) {
                course_.courses.forEach((item, key) => {
                  moduleParent.push(item.course_id);
                  course_["courses"][key]["root_id"] = course_.module_id;
                });
              } else {
                course_.root_id = null;
              }

              this.courseOption[trimester].courses.push(course_);
              this.moduleParent[this.getCourseId(course_)] = moduleParent.length ? moduleParent : null;
            }
          });
        });
      }
    });
  }

  // --------------------------------------
  // request edit plan
  // --------------------------------------

  onEditRequest(): void {
    const dialogRef = this.dialog.open(EditRequestDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.sendRequestEditStudyPlan(result);
        //   result.forEach((course) => {
        //     this.getCourseTrimester(course).forEach((trimester: any) => {
        //       if (!this.isExistCourse(this.courseOption[trimester].courses, course)) {
        //         let course_ = course;
        //         delete course_.order;
        //         let moduleParent = [];
        //         if ("module_id" in course_) {
        //           course_.courses.forEach((item, key) => {
        //             moduleParent.push(item.course_id);
        //             course_["courses"][key]["root_id"] = course_.module_id;
        //           });
        //         } else {
        //           course_.root_id = null;
        //         }
        //         this.courseOption[trimester].courses.push(course_);
        //         this.moduleParent[this.getCourseId(course_)] = moduleParent.length ? moduleParent : null;
        //       }
        //     });
        //   });
      }
    });
  }

  getCourseTrimester(value) {
    return "module_trimester" in value ? value.module_trimester : value.course_trimester;
  }

  isExistCourse(array, value) {
    return array.some((course) => {
      return this.getCourseId(course) == this.getCourseId(value);
    });
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

@Component({
  selector: "reject-plan-dialog",
  templateUrl: "./dialog/reject-plan-dialog.html",
  styleUrls: ["./dialog/reject-plan-dialog.css"],
})
export class RejectPlanDialog {
  faEdit = faEdit;
  faRedo = faRedo;

  isComment = false;
  commentText = "";

  constructor(
    public dialogRef: MatDialogRef<RejectPlanDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService
  ) {}

  onNoClick() {
    this.dialogRef.close();
  }

  isRejectWithComment() {
    this.isComment = true;
  }

  onRejectStudyPlan() {
    this.dialogRef.close({ comment: this.commentText });
  }
}

@Component({
  selector: "alert-form-dialog",
  templateUrl: "./dialog/alert-dialog.html",
  styleUrls: ["./dialog/alert-dialog.css"],
})
export class AlertDialog {
  isComment = false;
  commentText = "";

  constructor(
    public dialogRef: MatDialogRef<AlertDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService
  ) {}

  onNoClick() {
    this.dialogRef.close();
  }
}

@Component({
  selector: "confirm-delete-dialog",
  templateUrl: "../study-plan-dialog.html",
  styleUrls: ["../study-plan-dialog.css"],
})
export class ConfirmDeleteDialog {
  isComment = false;
  commentText = "";

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService
  ) {}

  onNoClick() {
    this.dialogRef.close();
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}

export interface coursePicked {
  year: string;
  trimester: string;
  course_group: string;
  course_credit: string;
  type_of_course: string;
  courses?: any;
}
