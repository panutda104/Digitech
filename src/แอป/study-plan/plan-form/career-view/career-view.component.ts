import { Component, OnInit, ViewChild, EventEmitter, Output, Input, ChangeDetectorRef } from "@angular/core";
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeNestedDataSource } from "@angular/material/tree";

import { MatDialog } from "@angular/material";
import { trigger, state, style, animate, transition, sequence } from "@angular/animations";
import { FormControl, FormBuilder } from "@angular/forms";
import { MatSelect } from "@angular/material/select";
import { ReplaySubject, Subject } from "rxjs";
import { take, takeUntil, isEmpty } from "rxjs/operators";
import { CareerService } from "src/app/services/career.service";
import { CareerPercentPipe } from "../../../pipes/careerPercent.pipe";

import { CourseDialogComponent } from "./../../../course-dialog/course-dialog.component";
import { faTimes, faChevronLeft, faChevronDown } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-career-view",
  templateUrl: "./career-view.component.html",
  styleUrls: ["./career-view.component.css"],
  animations: [
    trigger("slideVertical", [
      state(
        "*",
        style({
          height: 0,
        })
      ),
      state(
        "show",
        style({
          height: "*",
        })
      ),
      transition("* => *", [animate("300ms cubic-bezier(0.25, 0.8, 0.25, 1)")]),
    ]),
  ],
})
export class CareerViewComponent implements OnInit {
  @Input() allCareer = null;
  @Input() pickedCareerFormPlan = null;
  pickedCareerFormPlan_setup = false;
  @Input() coursePicked = {};
  previousCoursePicked = {};

  @Input() availableToEditStudyPlan = true;

  @Output() careerUpdated = new EventEmitter();
  @Output() defaultCareerIndex = new EventEmitter();

  faTimes = faTimes;
  faChevronLeft = faChevronLeft;
  faChevronDown = faChevronDown;

  recentNode = null;

  // career list from servie [ key : value ]
  protected careerList;
  // career list for plan [ array ] => " career option "
  protected careerData = [];

  /** control for the selected course_data */
  public careerCtrl: FormControl = new FormControl();

  /** control for the MatSelect filter keyword */
  public careerFilterCtrl: FormControl = new FormControl();

  /** list of course_data filtered by search keyword */
  public filteredCareer: ReplaySubject<any> = new ReplaySubject<any>(1);
  // public filteredCareer_DT: ReplaySubject<any> = new ReplaySubject<any>(1);
  // public filteredCareer_DC: ReplaySubject<any> = new ReplaySubject<any>(1);

  @ViewChild("singleSelect", {}) singleSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  treeControl = new NestedTreeControl<CareerList>((node) => this.getArrayFormat(node.trimesters));
  dataSource = new MatTreeNestedDataSource<CareerList>();
  // panelOpenState = true;

  constructor(
    private fb: FormBuilder,
    // private careerServive: CareerService,
    private cdRef: ChangeDetectorRef,
    private careerPercent: CareerPercentPipe,
    public dialog: MatDialog
  ) {
    // should get career list form favorite
  }

  hasChild = (_: number, node: CareerList) => node.expandable;

  ngOnInit() {}

  ngAfterViewInit() {
    // this.setInitialValue();
  }

  ngAfterViewChecked() {
    if (this.recentNode) {
      this.dataSource.data.forEach((node: any) => {
        if (node.career_name_en == this.recentNode) {
          this.treeControl.expand(node);
        }
      });
      this.recentNode = null;
      this.cdRef.detectChanges();
    }

    if (!this.careerData.length && this.allCareer) {
      for (let key in this.allCareer) {
        this.careerData.push(this.allCareer[key]);
      }
      this.setInitialSelection();
      this.cdRef.detectChanges();
    }

    //default career from plan
    if (
      !this.pickedCareerFormPlan_setup &&
      this.pickedCareerFormPlan && //default is >>  null
      this.careerData.length > 0
    ) {
      this.dataSource.data = this.pickedCareerFormPlan;

      this.careerData = this.careerData.filter(
        (value) => !this.pickedCareerFormPlan.find((element) => element.career_id == value.career_id)
      );

      this.setInitialSelection();
      this.pickedCareerFormPlan_setup = true;
      this.cdRef.detectChanges();
    }

    //when pick course on plan
    if (
      Object.keys(this.previousCoursePicked).length == 0 ||
      JSON.stringify(this.previousCoursePicked) !== JSON.stringify(this.coursePicked)
    ) {
      this.previousCoursePicked = JSON.parse(JSON.stringify(this.coursePicked));
      this.careerPercent.transform(this.coursePicked, this.dataSource.data);
      this.cdRef.detectChanges();
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  getArrayFormat(value) {
    if (!value) return value;
    let value_ = [];
    Object.keys(value).forEach((key) => {
      value_.push({ module_list: value[key], trimester: key });
    });
    return value_;
  }

  setInitialSelection() {
    this.careerData.sort((a, b) => {
      return a.career_id - b.career_id;
    });

    // set initial selection
    this.careerCtrl.setValue(this.careerData);

    // load the initial course list

    this.filteredCareer.next(this.careerData.slice());
    // this.filteredCareer_DT.next(this.careerData.slice().filter((career) => career.syllabus_id == 1));
    // this.filteredCareer_DC.next(this.careerData.slice().filter((career) => career.syllabus_id == 2));

    // listen for search field value changes
    this.careerFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterCareer();
    });
  }

  protected setInitialValue() {
    this.filteredCareer.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
      // setting the compareWith property to a comparison function
      // triggers initializing the selection according to the initial value of
      // the form control (i.e. _initializeSelection())
      // this needs to be done after the filteredCourses are loaded initially
      // and after the mat-option elements are available
      this.singleSelect.compareWith = (a: any, b: any) => a && b && a.id === b.id;
    });
    // this.filteredCareer_DT.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
    //   this.singleSelect.compareWith = (a: any, b: any) => a && b && a.id === b.id;
    // });
    // this.filteredCareer_DC.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
    //   this.singleSelect.compareWith = (a: any, b: any) => a && b && a.id === b.id;
    // });
  }

  protected filterCareer() {
    if (!this.careerData) {
      return;
    }

    let search = this.careerFilterCtrl.value;
    if (!search) {
      this.filteredCareer.next(this.careerData.slice());
      // this.filteredCareer_DC.next(this.careerData.slice().filter((career) => career.syllabus_id == 2));
      // this.filteredCareer_DT.next(this.careerData.slice().filter((career) => career.syllabus_id == 1));
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the courses
    this.filteredCareer.next(this.careerData.filter((career) => career.career_name_en.toLowerCase().indexOf(search) > -1));
    // this.filteredCareer_DC.next(
    //   this.careerData.filter((career) => career.syllabus_id == 2 && career.career_name_en.toLowerCase().indexOf(search) > -1)
    // );
    // this.filteredCareer_DT.next(
    //   this.careerData.filter((career) => career.syllabus_id == 1 && career.career_name_en.toLowerCase().indexOf(search) > -1)
    // );
  }

  addCareer(value: any) {
    if (!Array.isArray(value)) {
      if (!value.trimesters) {
        value.trimesters = { nonmodule: false };
      }

      // let value_: CareerList = { ...value };
      let career_log = this.dataSource.data;
      this.dataSource = new MatTreeNestedDataSource<CareerList>();
      career_log.push({ ...value, expandable: true, isDefault: false, achieve_percent: 0, current_percent: 0 });
      this.dataSource.data = career_log;

      this.careerData = this.careerData.filter((item) => item.career_id !== value.career_id);

      this.careerPercent.transform(this.coursePicked, this.dataSource.data);
      this.careerUpdated.emit(this.dataSource.data);
      this.setInitialSelection();

      this.recentNode = value.career_name_en;
      // 'toggle ' + node.career_name_en
    }
  }

  deleteCareer(value) {
    let value_ = value;
    let career_log = this.dataSource.data;

    career_log.forEach((item, index) => {
      if (item.career_id === value_.career_id) career_log.splice(index, 1);
    });

    this.dataSource = new MatTreeNestedDataSource<CareerList>();
    this.dataSource.data = career_log;

    delete value_.isDefault;
    delete value_.expandable;
    this.careerData.push(value_);

    this.careerUpdated.emit(this.dataSource.data);
    this.setInitialSelection();
  }

  onDefaultByCareer(value) {
    let index = this.dataSource.data.indexOf(value);

    // this.careerUpdated.emit(this.dataSource.data);
    this.defaultCareerIndex.emit(index);
    // this.dataSource.data[index].isDefault = !this.dataSource.data[index].isDefault;
  }

  getProgrssBarStyle(value: string) {
    return {
      width: value + "%",
      opacity: value + "%",
    };
  }

  openCourseDialog(module_name_en, module_name_th, courses) {
    const dialogRef = this.dialog.open(CourseDialogComponent, {
      data: { module_name_en: module_name_en, module_name_th: module_name_th, courses: courses },
    });
    dialogRef.afterClosed().subscribe(() => {});
  }
}

interface CareerList {
  career_id: string;
  career_name_en: string;
  trimesters?: any;
  expandable: true;
  isDefault: boolean;
}
