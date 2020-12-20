import { Component, OnInit } from "@angular/core";
import { StorageService } from "../../services/storage.service";
import { Roles } from "../../models/roles.enum";

import { faUserEdit, faList } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit {
  user_role = this.getUserRole();
  faUserEdit = faUserEdit;
  faList = faList;

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    this.storageService.watchStorage().subscribe(() => {
      this.user_role = this.getUserRole();
    });
  }

  getUserRole() {
    return localStorage.getItem("account") ? JSON.parse(localStorage.getItem("account")).user_role : null;
  }

  get isAdmin() {
    return this.user_role && this.user_role === Roles.Admin;
  }

  get isUser() {
    return this.user_role && this.user_role === Roles.Student;
  }

  get isTeacher() {
    return this.user_role && this.user_role === Roles.Teacher;
  }
}
