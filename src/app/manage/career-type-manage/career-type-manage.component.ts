import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { MatPaginator, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSelect } from "@angular/material";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Roles } from "../../models/roles.enum";
import { CareerTypeService } from "src/app/services/careertype.service";
import { CareerService } from "src/app/services/career.service";
import { CareerType } from "src/app/models/career-type";
import { Syllabus } from "src/app/models/syllabus";
import { ReplaySubject, Subject } from "rxjs";
import { takeUntil, take } from "rxjs/operators";

@Component({
  selector: "app-user-manage",
  templateUrl: "./career-type-manage.component.html",
  styleUrls: ["./career-type-manage.component.css"],
})
export class CareerTypeManageComponent implements OnInit {
  dataSource;
  displayedColumns: string[] = ["id", "career_type_name_en", "career_type_name_th", "button"];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private careerTypeService: CareerTypeService, private careerService: CareerService, public dialog: MatDialog) {
    this.getCareerType();
  }

  ngOnInit() {}

  async getCareerType() {
    let careertype_data = await this.careerTypeService.getAllCareerType();
    this.dataSource = new MatTableDataSource<CareerType>(careertype_data);
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onOpenDialog(): void {
    const dialogRef = this.dialog.open(CareertypeEditorDialog, {
      data: { data: null, isDelete: false },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getCareerType();
    });
  }

  async onEditCareerType(data) {
    data.career_list = await this.careerService.getCareerByCareerTypeId(data.id);

    console.log(data);
    const dialogRef = this.dialog.open(CareertypeEditorDialog, {
      data: { data: data, isDelete: false },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getCareerType();
    });
  }

  onDelete(data): void {
    const dialogRef = this.dialog.open(CareertypeEditorDialog, {
      data: { data: data, isDelete: true },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getCareerType();
    });
  }

  getsyllabusName(id) {
    return Object.keys(Syllabus).filter((item) => {
      if (Syllabus[item] == id) return item;
    })[0];
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }
}

@Component({
  selector: "career-type-manage-dialog",
  templateUrl: "./career-type-manage-dialog.html",
  styleUrls: ["./career-type-manage-dialog.css"],
})
export class CareertypeEditorDialog {
  submitted = false;
  syllabus = [];
  isDelete = this.data.isDelete;
  careerTypeForm = this.fb.group({
    id: [this.data.data ? this.data.data.id : null],
    career_type_name_en: [this.data.data ? this.data.data.career_type_name_en : null, Validators.required],
    career_type_name_th: [this.data.data ? this.data.data.career_type_name_th : null, Validators.required],
    career_type_detail_en: [this.data.data ? this.data.data.career_type_detail_en : null],
    career_type_detail_th: [this.data.data ? this.data.data.career_type_detail_th : null],
    career_type_syllabus: [this.data.data ? this.data.data.career_type_syllabus : null, Validators.required],
    career_list: [this.data.data ? (this.data.data.career_list ? this.data.data.career_list : []) : []],
  });

  protected career_data;

  /** control for the selected course_data */
  public careerCtrl: FormControl = new FormControl();

  /** control for the MatSelect filter keyword */
  public careerFilterCtrl: FormControl = new FormControl();

  /** list of course_data filtered by search keyword */
  public filteredCareers: ReplaySubject<any> = new ReplaySubject<any>(1);

  @ViewChild("singleSelect", {}) singleSelect: MatSelect;

  protected _onDestroy = new Subject<void>();
  constructor(
    public dialogRef: MatDialogRef<CareertypeEditorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private careertypeService: CareerTypeService,
    private toastr: ToastrService,
    private careerService: CareerService
  ) {
    for (let item of Object.values(Syllabus)) {
      this.syllabus.push(item);
    }
  }

  ngOnInit() {
    this.getCareers();
  }
  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  async getCareers() {
    let career_data = await this.careerService.getAllCareer();
    if (this.careerTypeForm.value.career_list.length > 0) {
      this.careerTypeForm.value.career_list.forEach((value) => {
        career_data.forEach((item, index) => {
          if (item.id === value.id) career_data.splice(index, 1);
        });
      });
    }
    this.career_data = career_data;
    this.setInitialSelection();
  }

  setInitialSelection() {
    this.career_data.sort((a, b) => {
      return a.id - b.id;
    });

    // set initial selection
    this.careerCtrl.setValue(this.career_data);

    // load the initial bank list
    this.filteredCareers.next(this.career_data.slice());

    // listen for search field value changes
    this.careerFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterCareers();
    });
  }

  protected setInitialValue() {
    this.filteredCareers.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
      // setting the compareWith property to a comparison function
      // triggers initializing the selection according to the initial value of
      // the form control (i.e. _initializeSelection())
      // this needs to be done after the filteredCourses are loaded initially
      // and after the mat-option elements are available
      this.singleSelect.compareWith = (a: any, b: any) => a && b && a.id === b.id;
    });
  }

  protected filterCareers() {
    if (!this.career_data) {
      return;
    }

    // get the search keyword
    let search = this.careerFilterCtrl.value;
    if (!search) {
      this.filteredCareers.next(this.career_data.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the careers
    this.filteredCareers.next(this.career_data.filter((career) => career.career_name_en.toLowerCase().indexOf(search) > -1));
  }

  onNoClick() {
    this.dialogRef.close();
  }

  typeOf(value) {
    if ((value && value.length > 1) || (value && Array.isArray(value))) return true;
  }

  addCareer(value): void {
    this.careerTypeForm.value.career_list.push(value);

    this.career_data.forEach((item, index) => {
      if (item.id === value.id) this.career_data.splice(index, 1);
    });
    this.setInitialSelection();
  }

  deleteCareer(indexToRemove, value) {
    this.careerTypeForm.value.career_list.splice(indexToRemove, 1);
    this.career_data.push(value);

    this.setInitialSelection();
  }

  async onCreate() {
    this.submitted = true;
    if (this.careerTypeForm.valid) {
      if (await this.careertypeService.createCareerType(this.careerTypeForm.value)) {
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
    if (this.careerTypeForm.valid) {
      if (await this.careertypeService.updateCareerType(this.careerTypeForm.value)) {
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
    if (await this.careertypeService.removeCareerType(this.data.data.id)) {
      this.onNoClick();
    } else {
      this.toastr.error("Sorry, your update failed. Please try again.", null, {
        positionClass: "toast-top-center",
        closeButton: true,
      });
    }
  }

  get id() {
    return this.careerTypeForm.get("id");
  }
  get career_type_name_en() {
    return this.careerTypeForm.get("career_type_name_en");
  }
  get career_type_name_th() {
    return this.careerTypeForm.get("career_type_name_th");
  }
  get career_type_detail_en() {
    return this.careerTypeForm.get("career_type_detail_en");
  }
  get career_type_detail_th() {
    return this.careerTypeForm.get("career_type_detail_th");
  }
  get career_type_syllabus() {
    return this.careerTypeForm.get("career_type_syllabus");
  }

  get career_list() {
    return this.careerTypeForm.get("career_list");
  }
}
