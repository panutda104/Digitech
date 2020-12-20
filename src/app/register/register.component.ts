import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, AbstractControl } from "@angular/forms";
import { Validators } from "@angular/forms";
import { UserService } from "../services/user.service";
import { StorageService } from "../services/storage.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Roles } from "../models/roles.enum";

// import { userValidator } from "../validators/UserValidator";
@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent implements OnInit {
  submitted = false;
  registerForm;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private storageService: StorageService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      user_id: [
        null,
        {
          validators: [
            Validators.pattern("^[a-zA-Z][0-9]{7}$"),
            Validators.required,
            // userValidator,
          ],
          updateOn: "blur",
        },
      ],
      user_role: [Roles.Student],
      user_password: [null, Validators.required],
      user_firstname: [null, Validators.required],
      user_lastname: [null, Validators.required],
      user_email: [null, { validators: [Validators.email], updateOn: "blur" }],
      user_tel: [null, [Validators.pattern("^[0-9]*$"), Validators.maxLength(10)]],
      syllabus_id: [null, Validators.required],
    });
  }

  async OnSubmit() {
    this.submitted = true;
    if (this.registerForm.valid) {
      if (await this.userService.createUser(this.registerForm.value)) {
        // let account = { ...this.registerForm.value };
        // delete account.user_password;
        // this.storageService.setItem("account", JSON.stringify(account));
        this.router.navigateByUrl("./login").then(() => {
          window.location.reload();
        });
      } else {
        this.toastr.error("Sorry, your registration failed. Please try again.", null, {
          positionClass: "toast-top-center",
          closeButton: true,
        });
      }
    }
  }
  // async getUserTaken() {
  //   if (await this.userService.getUserId(this.user_id)) {
  //     return null;
  //   } else {
  //     return { user_taken: true };
  //   }
  // }
  get user_id() {
    return this.registerForm.get("user_id");
  }

  get user_password() {
    return this.registerForm.get("user_password");
  }

  get user_firstname() {
    return this.registerForm.get("user_firstname");
  }

  get user_lastname() {
    return this.registerForm.get("user_lastname");
  }
  get user_email() {
    return this.registerForm.get("user_email");
  }

  get user_tel() {
    return this.registerForm.get("user_tel");
  }

  get syllabus_id() {
    return this.registerForm.get("syllabus_id");
  }
}
