import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { UserService } from "../services/user.service";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm;
  submitted = false;
  hide = true;
  constructor(private fb: FormBuilder, private userService: UserService, private toastr: ToastrService, private router: Router) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required],
    });
  }

  async OnLogin() {
    this.submitted = true;
    if (this.loginForm.valid) {
      if (await this.userService.login(this.loginForm.value)) {
        this.router.navigateByUrl("/profile");
      } else {
        this.toastr.error("Sorry, your login failed. Please try again.", null, {
          positionClass: "toast-top-center",
          closeButton: true,
        });
      }
    } else {
      console.log("login false");
    }
  }
}
