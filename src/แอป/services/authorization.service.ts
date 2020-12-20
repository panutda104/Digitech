import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AuthorizationService {
  constructor() {}

  isLoggedIn() {
    if (localStorage.getItem("account")) {
      return true;
    }
    return false;
  }

  isAccess() {}
}
