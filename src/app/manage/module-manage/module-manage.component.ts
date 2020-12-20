import { Component, OnInit, ViewChild, Inject, Input } from "@angular/core";
import { MatPaginator, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { ModuleService } from "../../services/module.service";
import { FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Module } from "../../models/module";

import { FormControl } from "@angular/forms";
import { MatSelect } from "@angular/material/select";
import { ReplaySubject, Subject } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { CourseService } from "../../services/course.service";
import { CareerService } from "../../services/career.service";

import { Syllabus } from "src/app/models/syllabus";

@Component({
  selector: "app-module-manage",
  templateUrl: "./module-manage.component.html",
  styleUrls: ["./module-manage.component.css"],
})
export class ModuleManageComponent implements OnInit {
  dataSource;
  displayedColumns: string[] = ["id", "module_id", "module_name_th", "module_credit", "button"];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private moduleService: ModuleService,
    private courseService: CourseService,
    private careerService: CareerService,
    public dialog: MatDialog
  ) {
    this.getModules();
  }

  ngOnInit() {}

  async getModules() {
    let module_data = await this.moduleService.getModules();
    this.dataSource = new MatTableDataSource<Module>(module_data);
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onOpenDialog(): void {
    const dialogRef = this.dialog.open(ModuleEditorDialog, {
      data: { data: null, isDelete: false },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getModules();
    });
  }

  async onEditModule(data) {
    data.course_list = await this.courseService.getCoursesByModuleId(data.id);
    const dialogRef = this.dialog.open(ModuleEditorDialog, {
      data: { data: data, isDelete: false },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getModules();
    });
  }

  async onDeleteModule(data) {
    let career_list = await this.careerService.getCareerByModuleId(data.id);

    const dialogRef = this.dialog.open(ModuleEditorDialog, {
      data: { data: data, isDelete: true, career_list: career_list },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getModules();
    });
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }
}

@Component({
  selector: "module-manage-dialog",
  templateUrl: "./module-manage-dialog.html",
  styleUrls: ["./module-manage-dialog.css"],
})
export class ModuleEditorDialog {
  syllabus = [];
  submitted = false;
  isDelete = this.data.isDelete;
  career_list = this.data.career_list ? this.data.career_list : null;

  moduleForm = this.fb.group({
    id: [this.data.data ? this.data.data.id : null],
    module_id: [this.data.data ? this.data.data.module_id : null, Validators.required],
    module_name_en: [this.data.data ? this.data.data.module_name_en : null, Validators.required],
    module_name_th: [this.data.data ? this.data.data.module_name_th : null, Validators.required],
    module_detail_en: [this.data.data ? this.data.data.module_detail_en : null],
    module_detail_th: [this.data.data ? this.data.data.module_detail_th : null],
    module_credit: [this.data.data ? this.data.data.module_credit : null, Validators.required],
    module_syllabus: [this.data.data ? this.data.data.module_syllabus : null, Validators.required],
    module_year: [this.data.data ? Number(this.data.data.module_year) : null, Validators.required],
    module_trimester: [this.data.data ? Number(this.data.data.module_trimester) : null, Validators.required],
    course_list: [this.data.data ? (this.data.data.course_list ? this.data.data.course_list : []) : []],
  });

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

  constructor(
    public dialogRef: MatDialogRef<ModuleEditorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private moduleService: ModuleService,
    private courseService: CourseService,
    private toastr: ToastrService
  ) {
    for (let item of Object.values(Syllabus)) {
      this.syllabus.push(item);
    }
  }

  ngOnInit() {
    this.getCourses();
  }

  ngAfterViewInit() {
    // this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  async onCreate() {
    this.submitted = true;
    if (this.moduleForm.valid) {
      if (await this.moduleService.createModule(this.moduleForm.value)) {
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
    if (this.moduleForm.valid) {
      if (await this.moduleService.updateModule(this.moduleForm.value)) {
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
    if (await this.moduleService.removeModule(this.moduleForm.value.id)) {
      this.onNoClick();
    } else {
      this.toastr.error("Sorry, your update failed. Please try again.", null, {
        positionClass: "toast-top-center",
        closeButton: true,
      });
    }
  }

  async getCourses() {
    let course_data = await this.courseService.getCourses();

    //check course_list in moduleForm =>  for filter course_data
    if (this.moduleForm.value.course_list.length > 0) {
      this.moduleForm.value.course_list.forEach((value) => {
        course_data.forEach((item, index) => {
          if (item.id === value.id) course_data.splice(index, 1);
        });
      });
    }

    this.course_data = course_data;
    this.setInitialSelection();
  }

  setInitialSelection() {
    this.course_data.sort((a, b) => {
      return a.course_id - b.course_id;
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
      // setting the compareWith property to a comparison function
      // triggers initializing the selection according to the initial value of
      // the form control (i.e. _initializeSelection())
      // this needs to be done after the filteredCourses are loaded initially
      // and after the mat-option elements are available
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
      this.course_data.filter((course) => (course.course_id + " " + course.course_name_th).toLowerCase().indexOf(search) > -1)
    );
  }

  onNoClick() {
    this.dialogRef.close();
  }

  typeOf(value) {
    if ((value && value.length > 1) || (value && Array.isArray(value))) return true;
  }

  addCourse(value): void {
    this.moduleForm.value.course_list.push(value);

    this.course_data.forEach((item, index) => {
      if (item.course_id === value.course_id) this.course_data.splice(index, 1);
    });
    this.setInitialSelection();
  }

  // get back course to select choice
  deleteCourse(indexToRemove, value) {
    this.moduleForm.value.course_list.splice(indexToRemove, 1);
    this.course_data.push(value);
    this.setInitialSelection();
  }

  get module_id() {
    return this.moduleForm.get("module_id");
  }

  get module_name_en() {
    return this.moduleForm.get("module_name_en");
  }

  get module_name_th() {
    return this.moduleForm.get("module_name_th");
  }

  get module_detail_en() {
    return this.moduleForm.get("module_detail_en");
  }

  get module_detail_th() {
    return this.moduleForm.get("module_detail_th");
  }

  get module_credit() {
    return this.moduleForm.get("module_credit");
  }

  get module_syllabus() {
    return this.moduleForm.get("module_syllabus");
  }
  get module_year() {
    return this.moduleForm.get("module_year");
  }

  get module_trimester() {
    return this.moduleForm.get("module_trimester");
  }

  get course_list() {
    return this.moduleForm.get("course_list");
  }
}
