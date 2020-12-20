import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./guards/auth.guard";
import { Roles } from "./models/roles.enum";

import { IndexComponent } from "./index/index.component";
import { SyllabusComponent } from "./syllabus/syllabus.component";
import { CareerComponent } from "./career/career.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ProfileComponent } from "./profile/profile.component";
import { UserManageComponent } from "./manage/user-manage/user-manage.component";

import { AdviserComponent } from "./manage/adviser/adviser.component";
import { CareerManageComponent } from "./manage/career-manage/career-manage.component";
import { CareerTypeManageComponent } from "./manage/career-type-manage/career-type-manage.component";
import { CourseManageComponent } from "./manage/course-manage/course-manage.component";
import { ModuleManageComponent } from "./manage/module-manage/module-manage.component";
import { SpecialCourseManageComponent } from "./manage/special-course-manage/special-course-manage.component";
import { StudyPlanComponent } from "./study-plan/study-plan.component";
import { PlanFormComponent } from "./study-plan/plan-form/plan-form.component";
import { StudyPlanConsiderationComponent } from "./study-plan-consideration/study-plan-consideration.component";
import { from } from "rxjs";

const routes: Routes = [
  { path: "", component: IndexComponent },
  { path: "syllabus", component: SyllabusComponent },
  { path: "career", component: CareerComponent },
  { path: "login", component: LoginComponent },
  // { path: "register", component: RegisterComponent },
  {
    path: "profile",
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { roles: [Roles.Admin, Roles.Student, Roles.Teacher] },
  },
  {
    path: "adviser-manage",
    component: AdviserComponent,
    canActivate: [AuthGuard],
    data: { roles: [Roles.Admin] },
  },
  {
    path: "user-manage",
    component: UserManageComponent,
    canActivate: [AuthGuard],
    data: { roles: [Roles.Admin] },
  },
  {
    path: "career-type-manage",
    component: CareerTypeManageComponent,
    canActivate: [AuthGuard],
    data: { roles: [Roles.Admin] },
  },
  {
    path: "career-manage",
    component: CareerManageComponent,
    canActivate: [AuthGuard],
    data: { roles: [Roles.Admin] },
  },
  {
    path: "module-manage",
    component: ModuleManageComponent,
    canActivate: [AuthGuard],
    data: { roles: [Roles.Admin] },
  },
  {
    path: "course-manage",
    component: CourseManageComponent,
    canActivate: [AuthGuard],
    data: { roles: [Roles.Admin] },
  },
  {
    path: "special-course-manage",
    component: SpecialCourseManageComponent,
    canActivate: [AuthGuard],
    data: { roles: [Roles.Admin] },
  },
  {
    path: "study-plan",
    children: [
      { path: "", component: StudyPlanComponent },
      { path: "plan-form/:id", component: PlanFormComponent },
      { path: "plan-form/:id/:edit", component: PlanFormComponent },
    ],
    canActivate: [AuthGuard],
    data: { roles: [Roles.Student, Roles.Teacher] },
  },
  {
    path: "study-plan-consideration",
    children: [{ path: "", component: StudyPlanConsiderationComponent }],
    canActivate: [AuthGuard],
    data: { roles: [Roles.Teacher] },
  },
  { path: "**", redirectTo: "", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
