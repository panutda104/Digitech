import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastrModule } from "ngx-toastr";
import {
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatTableModule,
  MatButtonModule,
  MatListModule,
  MatExpansionModule,
  MatMenuModule,
  MatIconModule,
  MatPaginatorModule,
  MatDialogModule,
  MatCardModule,
  MatTreeModule,
  MatCheckboxModule,
  MatProgressBarModule,
  MatTabsModule,
} from "@angular/material";

import { NgxMatSelectSearchModule } from "ngx-mat-select-search";

import { JsonconvertPipe } from "./pipes/jsonconvert.pipe";
import { CareerPercentPipe } from "./pipes/careerPercent.pipe";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { IndexComponent } from "./index/index.component";
import { LoginComponent } from "./login/login.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { FooterComponent } from "./components/footer/footer.component";
import { SyllabusComponent } from "./syllabus/syllabus.component";
import { CareerComponent } from "./career/career.component";

import { RegisterComponent } from "./register/register.component";
import { ProfileComponent } from "./profile/profile.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { UserManageComponent, UserEditorDialog } from "./manage/user-manage/user-manage.component";
import { CourseManageComponent, CourseEditorDialog } from "./manage/course-manage/course-manage.component";
import { CareerManageComponent, CareerEditorDialog } from "./manage/career-manage/career-manage.component";
import { CareerTypeManageComponent, CareertypeEditorDialog } from "./manage/career-type-manage/career-type-manage.component";
import { SpecialCourseManageComponent } from "./manage/special-course-manage/special-course-manage.component";
import { ModuleManageComponent, ModuleEditorDialog } from "./manage/module-manage/module-manage.component";
import { StudyPlanComponent, StudyPlanDialog } from "./study-plan/study-plan.component";
import {
  PlanFormComponent,
  RejectPlanDialog,
  AlertDialog,
  ConfirmDeleteDialog,
} from "./study-plan/plan-form/plan-form.component";
import { CareerViewComponent } from "./study-plan/plan-form/career-view/career-view.component";
import { CourseDialogComponent } from "./course-dialog/course-dialog.component";
import { StudyPlanConsiderationComponent } from "./study-plan-consideration/study-plan-consideration.component";
import { ConsiderationTableComponent } from "./study-plan-consideration/consideration-table/consideration-table.component";

import { SafePipeModule } from "safe-pipe";
import { AddAnotherCourseDialogComponent } from "./study-plan/plan-form/dialog/add-another-course-dialog/add-another-course-dialog.component";
import { AdviserComponent } from "./manage/adviser/adviser.component";
import { EditRequestDialogComponent } from "./study-plan/plan-form/dialog/edit-request-dialog/edit-request-dialog.component";
import { RejectEditRequestDialogComponent } from "./study-plan/plan-form/dialog/reject-edit-request-dialog/reject-edit-request-dialog.component";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
@NgModule({
  declarations: [
    AppComponent,
    JsonconvertPipe,
    CareerPercentPipe,
    NavbarComponent,
    IndexComponent,
    LoginComponent,
    FooterComponent,
    SyllabusComponent,
    CareerComponent,
    RegisterComponent,
    ProfileComponent,
    SidebarComponent,
    UserManageComponent,
    UserEditorDialog,
    CareertypeEditorDialog,
    ModuleEditorDialog,
    CareerEditorDialog,
    CourseManageComponent,
    CourseEditorDialog,
    ModuleManageComponent,
    CareerManageComponent,
    CareerTypeManageComponent,
    StudyPlanComponent,
    StudyPlanDialog,
    PlanFormComponent,
    RejectPlanDialog,
    AlertDialog,
    ConfirmDeleteDialog,
    CareerViewComponent,
    CourseDialogComponent,
    SpecialCourseManageComponent,
    StudyPlanConsiderationComponent,
    ConsiderationTableComponent,
    AddAnotherCourseDialogComponent,
    AdviserComponent,
    EditRequestDialogComponent,
    RejectEditRequestDialogComponent,
  ],
  entryComponents: [
    UserEditorDialog,
    CareertypeEditorDialog,
    ModuleEditorDialog,
    CourseEditorDialog,
    CareerEditorDialog,
    StudyPlanDialog,
    CourseDialogComponent,
    AddAnotherCourseDialogComponent,
    RejectPlanDialog,
    AlertDialog,
    ConfirmDeleteDialog,
    EditRequestDialogComponent,
    RejectEditRequestDialogComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FontAwesomeModule,
    TranslateModule.forRoot({
      // defaultLanguage: "th",
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatDialogModule,
    NgxMatSelectSearchModule,
    MatSelectModule,
    MatCardModule,
    MatTreeModule,
    MatMenuModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatListModule,
    MatProgressBarModule,
    MatTabsModule,
    // MatButtonModule,
    SafePipeModule,
  ],
  providers: [JsonconvertPipe, CareerPercentPipe, { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } }],
  bootstrap: [AppComponent],
})
export class AppModule {}
