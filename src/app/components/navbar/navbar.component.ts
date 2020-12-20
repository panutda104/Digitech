import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Roles } from "./../../models/roles.enum";

import { StorageService } from "../../services/storage.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit {
  account = JSON.parse(localStorage.getItem("account"));

  constructor(private translate: TranslateService, private storageService: StorageService, private router: Router) {
    this.translate = translate;
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

  ngOnInit() {
    this.storageService.watchStorage().subscribe(() => {
      this.account = JSON.parse(localStorage.getItem("account"));
    });
  }

  isUser() {
    return this.account.user_role == Roles.Student;
  }

  isTeacher() {
    return this.account.user_role == Roles.Teacher;
  }

  logout() {
    this.storageService.removeItem("account");
    this.router.navigateByUrl("./index").then(() => {
      window.location.reload();
    });
  }
}
