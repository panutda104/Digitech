import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Course } from "src/app/models/course";
import { CourseService } from "./../../../../services/course.service";

import { FormControl } from "@angular/forms";
import { MatSelect } from "@angular/material/select";
import { ReplaySubject, Subject } from "rxjs";
import { take, takeUntil } from "rxjs/operators";

@Component({
  selector: "app-add-another-course-dialog",
  templateUrl: "./add-another-course-dialog.component.html",
  styleUrls: ["./add-another-course-dialog.component.css"],
})
export class AddAnotherCourseDialogComponent implements OnInit {
  curricularCourses = null;

  protected course_data;

  /** control for the selected course_data */
  public courseCtrl: FormControl = new FormControl();

  /** control for the MatSelect filter keyword */
  public courseFilterCtrl: FormControl = new FormControl();

  /** list of course_data filtered by search keyword */
  public filteredCourses: ReplaySubject<any> = new ReplaySubject<any>(1);

  @ViewChild("singleSelect", {}) singleSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  courseList = [];

  constructor(
    public dialogRef: MatDialogRef<AddAnotherCourseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private courseService: CourseService
  ) {
    this.getCurricularCourses();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  onNoClick() {
    this.dialogRef.close();
  }

  async getCurricularCourses() {
    this.courseService.getCurricularCourses(this.data.syllabus_id).then((result) => {
      this.course_data = Object.values(result);
      this.setInitialSelection();
    });
  }

  setInitialSelection() {
    this.course_data.sort((a, b) => {
      return this.getCourseId(a) - this.getCourseId(b);
    });
    this.course_data.sort((a, b) => {
      return a.order - b.order;
    });

    // set initial selection
    this.courseCtrl.setValue(this.course_data);

    // load the initial course list
    this.filteredCourses.next(this.course_data.slice());

    // listen for search field value changes
    this.courseFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterCourses();
    });
  }

  protected setInitialValue() {
    this.filteredCourses.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
      this.singleSelect.compareWith = (a: any, b: any) => a && b && a.id === b.id;
    });
  }

  protected filterCourses() {
    if (!this.course_data) {
      return;
    }

    let search = this.courseFilterCtrl.value;
    if (!search) {
      this.filteredCourses.next(this.course_data.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the courses
    this.filteredCourses.next(
      this.course_data.filter(
        (course) => (this.getCourseId(course) + " " + this.getCourseName(course)).toLowerCase().indexOf(search) > -1
      )
    );
  }

  addCourseToList(value) {
    if (
      value &&
      !Array.isArray(value) &&
      this.courseList.findIndex((course) => this.getCourseId(course) == this.getCourseId(value)) == -1
    ) {
      this.courseList.push(value);
      this.course_data = this.course_data.filter((course) => this.getCourseId(course) !== this.getCourseId(value));
      this.setInitialSelection();
    }
  }

  deleteCourse(value) {
    this.courseList = this.courseList.filter((course) => this.getCourseId(course) !== this.getCourseId(value));
    this.course_data.push(value);
    this.setInitialSelection();
  }

  addCurricularCourses() {
    if (this.courseList.length) {
      this.dialogRef.close(this.courseList);
    }
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

  getCourseTrimester(value) {
    return "module_trimester" in value ? value.module_trimester : value.course_trimester;
  }
}
