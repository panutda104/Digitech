import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { MatPaginator, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSelect } from "@angular/material";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Roles } from "../../models/roles.enum";
import { CareerService } from "src/app/services/career.service";
import { CareerTypeService } from "src/app/services/careertype.service";
import { Career } from "src/app/models/career";
import { Syllabus } from "src/app/models/syllabus";
import { ReplaySubject, Subject } from "rxjs";
import { ModuleService } from "../../services/module.service";
import { takeUntil, take } from "rxjs/operators";

@Component({
  selector: "app-user-manage",
  templateUrl: "./career-manage.component.html",
  styleUrls: ["./career-manage.component.css"],
})
export class CareerManageComponent implements OnInit {
  dataSource;
  displayedColumns: string[] = ["id", "career_name_th", "career_detail_th", "button"];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private careerService: CareerService,
    public dialog: MatDialog,
    public moduleService: ModuleService,
    private careerTypeService: CareerTypeService
  ) {
    this.getCareer();
  }

  ngOnInit() {}

  async getCareer() {
    let career_data = await this.careerService.getAllCareer();
    this.dataSource = new MatTableDataSource<Career>(career_data);
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onOpenDialog(): void {
    const dialogRef = this.dialog.open(CareerEditorDialog, {
      data: { data: null, isDelete: false },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getCareer();
    });
  }

  async onEditCareer(data) {
    data.module_list = await this.moduleService.getModulesByCareerId(data.id);
    const dialogRef = this.dialog.open(CareerEditorDialog, {
      data: { data: data, isDelete: false },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getCareer();
    });
  }

  async onDelete(data) {
    //call career type of career
    let career_type_list = await this.careerTypeService.getCareerTypeByCareerId(data.id);

    const dialogRef = this.dialog.open(CareerEditorDialog, {
      data: { data: data, isDelete: true, career_type_list: career_type_list },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getCareer();
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
  selector: "career-manage-dialog",
  templateUrl: "./career-manage-dialog.html",
  styleUrls: ["./career-manage-dialog.css"],
})
export class CareerEditorDialog {
  submitted = false;
  isDelete = this.data.isDelete;
  career_type_list = this.data.career_type_list ? this.data.career_type_list : null;

  careerForm = this.fb.group({
    id: [this.data.data ? this.data.data.id : null],
    career_name_en: [this.data.data ? this.data.data.career_name_en : null, Validators.required],
    career_name_th: [this.data.data ? this.data.data.career_name_th : null, Validators.required],
    career_detail_en: [this.data.data ? this.data.data.career_detail_en : null],
    career_detail_th: [this.data.data ? this.data.data.career_detail_th : null],
    module_list: [this.data.data ? (this.data.data.module_list ? this.data.data.module_list : []) : []],
  });

  protected module_data;

  /** control for the selected course_data */
  public moduleCtrl: FormControl = new FormControl();

  /** control for the MatSelect filter keyword */
  public moduleFilterCtrl: FormControl = new FormControl();

  /** list of course_data filtered by search keyword */
  public filteredModules: ReplaySubject<any> = new ReplaySubject<any>(1);

  @ViewChild("singleSelect", {}) singleSelect: MatSelect;

  protected _onDestroy = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<CareerEditorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private careerService: CareerService,
    private moduleService: ModuleService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getModules();
  }

  ngAfterViewInit() {
    // this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  async getModules() {
    let module_data = await this.moduleService.getModules();

    if (this.careerForm.value.module_list.length > 0) {
      this.careerForm.value.module_list.forEach((value) => {
        module_data.forEach((item, index) => {
          if (item.id === value.id) module_data.splice(index, 1);
        });
      });
    }

    this.module_data = module_data;
    this.setInitialSelection();
  }

  setInitialSelection() {
    this.module_data.sort((a, b) => {
      return a.module_id - b.module_id;
    });

    // set initial selection
    this.moduleCtrl.setValue(this.module_data);

    // load the initial bank list
    this.filteredModules.next(this.module_data.slice());

    // listen for search field value changes
    this.moduleFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterModules();
    });
  }

  protected setInitialValue() {
    this.filteredModules.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
      // setting the compareWith property to a comparison function
      // triggers initializing the selection according to the initial value of
      // the form control (i.e. _initializeSelection())
      // this needs to be done after the filteredCourses are loaded initially
      // and after the mat-option elements are available
      this.singleSelect.compareWith = (a: any, b: any) => a && b && a.id === b.id;
    });
  }

  protected filterModules() {
    if (!this.module_data) {
      return;
    }

    // get the search keyword
    let search = this.moduleFilterCtrl.value;
    if (!search) {
      this.filteredModules.next(this.module_data.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the modules
    this.filteredModules.next(
      this.module_data.filter((module) => (module.module_id + " " + module.module_name_th).toLowerCase().indexOf(search) > -1)
    );
  }

  onNoClick() {
    this.dialogRef.close();
  }

  typeOf(value) {
    if ((value && value.length > 1) || (value && Array.isArray(value))) return true;
  }

  addModule(value): void {
    value.isEssential = false;
    this.careerForm.value.module_list.push(value);

    this.module_data.forEach((item, index) => {
      if (item.module_id === value.module_id) this.module_data.splice(index, 1);
    });
    this.setInitialSelection();
  }

  deleteModule(indexToRemove, value) {
    this.careerForm.value.module_list.splice(indexToRemove, 1);
    delete value.isEssential;
    this.module_data.push(value);

    this.setInitialSelection();
  }

  isEssentialModule(i) {
    this.careerForm.value.module_list[i].isEssential = !this.careerForm.value.module_list[i].isEssential;
    console.log(this.careerForm.value.module_list[i].isEssential);
  }

  async onCreate() {
    this.submitted = true;
    if (this.careerForm.valid) {
      if (await this.careerService.createCareer(this.careerForm.value)) {
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
    if (this.careerForm.valid) {
      if (await this.careerService.updateCareer(this.careerForm.value)) {
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
    if (await this.careerService.removeCareer(this.data.data.id)) {
      this.onNoClick();
    } else {
      this.toastr.error("Sorry, your update failed. Please try again.", null, {
        positionClass: "toast-top-center",
        closeButton: true,
      });
    }
  }

  get career_name_en() {
    return this.careerForm.get("career_name_en");
  }

  get career_name_th() {
    return this.careerForm.get("career_name_th");
  }

  get career_detail_en() {
    return this.careerForm.get("career_detail_en");
  }
  get career_detail_th() {
    return this.careerForm.get("career_detail_th");
  }
  get module_list() {
    return this.careerForm.get("module_list");
  }
}
