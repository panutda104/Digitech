import { AbstractControl } from "@angular/forms";
import { UserService } from "../services/user.service";

export function userValidator(control: AbstractControl) {
  if (control.value == "") {
    return { user_taken: true };
  }

  return null;
}

// import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
// import { UserService } from "../services/user.service";

// export async function ValidateUser(
//   control: AbstractControl,
//   user: UserService
// ) {
//   if (await user.getUserId(control.value)) {
//     return null;
//   } else {
//     return { user_taken: true };
//   }
// }
