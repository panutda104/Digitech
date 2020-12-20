import { Injectable } from "@angular/core";
import { UserService } from "../services/user.service";
import { Roles } from "../models/roles.enum";
import {
  Router,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable, from } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.userService.currentUserValue;
    if (currentUser) {
      // check if route is restricted by role
      if (
        route.data &&
        route.data.roles.indexOf(currentUser.user_role) === -1
      ) {
        // role not authorised so redirect to home page
        this.router.navigate(["/"]);
        return false;
      }
      // authorised so return true
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(
      ["/login"] //, { queryParams: { returnUrl: state.url } }
    );
    return false;
  }
}
