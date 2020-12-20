import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { MatPaginator, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { CourseService } from "../../services/course.service";
import { ModuleService } from "../../services/module.service";
import { FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Course } from "../../models/course";

@Component({
  selector: "app-course-manage",
  templateUrl: "./course-manage.component.html",
  styleUrls: ["./course-manage.component.css"],
})
export class CourseManageComponent implements OnInit {
  dataSource;

  // column in table
  displayedColumns: string[] = ["id", "course_id", "course_name_th", "course_credit", "button"];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private courseService: CourseService, public dialog: MatDialog, private moduleService: ModuleService) {
    //get all course data
    this.getCourses();
  }

  ngOnInit() {}

  // call service
  async getCourses() {
    let course_data = await this.courseService.getCourses();
    this.dataSource = new MatTableDataSource<Course>(course_data);
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // create button
  onOpenDialog(): void {
    const dialogRef = this.dialog.open(CourseEditorDialog, {
      data: { data: null, isDelete: false },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getCourses();
    });
  }

  // edit button
  onEditCourse(data): void {
    const dialogRef = this.dialog.open(CourseEditorDialog, {
      data: { data: data, isDelete: false },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getCourses();
    });
  }

  //delete button
  async onDeleteCourse(data) {
    //call module of course
    let module_list = await this.moduleService.getModulesByCourseId(data.id);

    const dialogRef = this.dialog.open(CourseEditorDialog, {
      data: { data: data, isDelete: true, module_list: module_list },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getCourses();
    });
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }
}

@Component({
  selector: "course-manage-dialog",
  templateUrl: "./course-manage-dialog.html",
  styleUrls: ["./course-manage-dialog.css"],
})
export class CourseEditorDialog {
  submitted = false;
  isDelete = this.data.isDelete;
  module_list = this.data.module_list ? this.data.module_list : null;

  courseForm = this.fb.group({
    id: [this.data.data ? this.data.data.id : null],
    course_id: [this.data.data ? this.data.data.course_id : null, Validators.required],
    course_name_en: [this.data.data ? this.data.data.course_name_en : null, Validators.required],
    course_name_th: [this.data.data ? this.data.data.course_name_th : null, Validators.required],
    course_detail_en: [this.data.data ? this.data.data.course_detail_en : null],
    course_detail_th: [this.data.data ? this.data.data.course_detail_th : null],
    course_credit: [this.data.data ? this.data.data.course_credit : null, Validators.required],
    course_credit_hour: [this.data.data ? this.data.data.course_credit_hour : null, Validators.required],
    course_trimester: [this.data.data ? Number(this.data.data.course_trimester) : null, Validators.required],
    course_year: [this.data.data ? Number(this.data.data.course_year) : null, Validators.required],
  });

  constructor(
    public dialogRef: MatDialogRef<CourseEditorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private courseService: CourseService,
    private toastr: ToastrService
  ) {}

  onNoClick() {
    this.dialogRef.close();
  }

  async onCreate() {
    this.submitted = true;
    if (this.courseForm.valid) {
      if (await this.courseService.createCourse(this.courseForm.value)) {
        this.onNoClick();
      } else {
        this.toastr.error("Sorry, your update failed. Please try again.", null, {
          positionClass: "toast-top-center",
          closeButton: true,
        });
      }
    }
  }

  async onUpdate() {
    this.submitted = true;
    if (this.courseForm.valid) {
      if (await this.courseService.updateCourse(this.courseForm.value)) {
        this.onNoClick();
      } else {
        this.toastr.error("Sorry, your update failed. Please try again.", null, {
          positionClass: "toast-top-center",
          closeButton: true,
        });
      }
    }
  }

  async onRemoveConfirm() {
    if (await this.courseService.removeCourse(this.data.data.id)) {
      this.onNoClick();
    } else {
      this.toastr.error("Sorry, your update failed. Please try again.", null, {
        positionClass: "toast-top-center",
        closeButton: true,
      });
    }
  }

  get course_id() {
    return this.courseForm.get("course_id");
  }

  get course_name_en() {
    return this.courseForm.get("course_name_en");
  }

  get course_name_th() {
    return this.courseForm.get("course_name_th");
  }

  get course_detail_en() {
    return this.courseForm.get("course_detail_en");
  }

  get course_detail_th() {
    return this.courseForm.get("course_detail_th");
  }

  get course_credit() {
    return this.courseForm.get("course_credit");
  }

  get course_credit_hour() {
    return this.courseForm.get("course_credit_hour");
  }
}
