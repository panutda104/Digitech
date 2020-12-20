import { Component, OnInit } from "@angular/core";

import { UserService } from "../services/user.service";
import { StorageService } from "../services/storage.service";
import { FormBuilder, FormControl, AbstractControl, FormGroup } from "@angular/forms";
import { Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { async } from "@angular/core/testing";
import { Syllabus } from "../models/syllabus";
import { Roles } from "../models/roles.enum";
@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit {
  account = JSON.parse(localStorage.getItem("account"));
  accountForm;
  passwordForm;

  new_password_focus = false;

  editGeneralForm = false;
  editPasswordForm = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private storageService: StorageService,
    private toastr: ToastrService
  ) {
    this.getAccountUser();
    this.onSetDefaultForm();
  }

  ngOnInit() {
    this.storageService.watchStorage().subscribe(() => {
      this.account = JSON.parse(localStorage.getItem("account"));
    });
  }

  async getAccountUser() {
    if (await this.userService.getUserById(this.account.id)) {
    } else {
      this.toastr.error("Sorry, your update failed. Please try again.", null, {
        positionClass: "toast-top-center",
        closeButton: true,
      });
    }
  }

  setDefaultGeneralForm() {
    this.editGeneralForm = false;
    this.onSetDefaultForm();
  }

  setDefaultPasswordForm() {
    this.editPasswordForm = false;
    this.onSetDefaultForm();
  }

  onEditGeneralForm() {
    this.editGeneralForm = !this.editGeneralForm;
  }

  onEditPasswordForm() {
    this.editPasswordForm = !this.editPasswordForm;
  }

  onSetDefaultForm() {
    this.accountForm = this.fb.group({
      id: [this.account.id],
      user_id: [this.account.user_id],
      user_role: [this.account.user_role],
      user_firstname: [this.account.user_firstname],
      user_lastname: [this.account.user_lastname],
      user_email: [this.account.user_email, { validators: [Validators.email], updateOn: "blur" }],
      user_tel: [this.account.user_tel, [Validators.pattern("^[0-9]*$"), Validators.maxLength(10)]],
      syllabus_id: [this.account.syllabus_id],
    });

    this.passwordForm = this.fb.group(
      {
        old_password: [null, Validators.required],
        new_password: [
          null,
          [Validators.required, Validators.pattern("^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\\D*\\d)[A-Za-z\\d!$%@#£€*?&]{8,}$")],
        ],
        confirm_password: [
          null,
          [Validators.required, Validators.pattern("^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\\D*\\d)[A-Za-z\\d!$%@#£€*?&]{8,}$")],
        ],
      },
      { validator: this.passwordMatcher("new_password", "confirm_password") }
    );
  }

  passwordMatcher(new_password: string, confirm_password: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[new_password];
      let passwordConfirmationInput = group.controls[confirm_password];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ notEquivalent: true });
      } else {
        return passwordConfirmationInput.setErrors(null);
      }
    };
  }

  async onSubmitGeneralForm() {
    if (this.accountForm.valid) {
      if (await this.userService.updateUser(this.accountForm.value)) {
        this.getAccountUser();
        this.onEditGeneralForm();
      } else {
        this.toastr.error("Sorry, your update failed. Please try again.", null, {
          positionClass: "toast-top-center",
          closeButton: true,
        });
      }
    }
  }

  async onSubmitPasswordForm() {
    if (this.passwordForm.valid) {
      if (await this.userService.updateUserPassword(this.account.id, this.passwordForm.value)) {
        this.getAccountUser();
        this.onEditPasswordForm();
      } else {
        this.toastr.error("Sorry, your password was incorrect. Please try again.", null, {
          positionClass: "toast-top-center",
          closeButton: true,
        });
      }
    } else {
      this.toastr.error("Sorry, your update failed. Please try again.", null, {
        positionClass: "toast-top-center",
        closeButton: true,
      });
    }
  }

  get user_id() {
    return this.accountForm.get("user_id");
  }

  get user_firstname() {
    return this.accountForm.get("user_firstname");
  }

  get user_lastname() {
    return this.accountForm.get("user_lastname");
  }
  get user_email() {
    return this.accountForm.get("user_email");
  }

  get user_tel() {
    return this.accountForm.get("user_tel");
  }
  get syllabus_id() {
    return Syllabus[this.account.syllabus_id].name_th + " (" + Syllabus[this.account.syllabus_id].name_en + ")";
  }

  get adviserName() {
    return this.account.adviser_firstname + " " + this.account.adviser_lastname;
  }

  get new_password() {
    return this.passwordForm.get("new_password");
  }

  get confirm_password() {
    return this.passwordForm.get("confirm_password");
  }

  get isAdmin() {
    return this.accountForm.get("user_role").value === Roles.Admin;
  }

  get isStudnt() {
    return this.accountForm.get("user_role").value === Roles.Student;
  }

  get isTeacher() {
    return this.accountForm.get("user_role").value === Roles.Teacher;
  }

  onNewPasswordFocus() {
    this.new_password_focus = true;
  }

  isLetter() {
    return this.passwordForm.get("new_password").value.match(/[a-zA-Z\u0E00-\u0E7F]+/g);
  }

  isDigit() {
    return this.passwordForm.get("new_password").value.match(/\d+/g);
  }

  isLowerAndUpperCase() {
    return this.passwordForm.get("new_password").value.match(/^(?=.*?[A-Z])(?=.*?[a-z])/g);
  }
}
