import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User } from "../models/user";
import { map } from "rxjs/operators";
import { AbstractControl } from "@angular/forms";
import { StorageService } from "../services/storage.service";
import { BehaviorSubject, Observable } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient, private storageService: StorageService) {}

  public get currentUserValue(): User {
    return JSON.parse(localStorage.getItem("account"));
  }

  async createUser(user: User) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/createUser.php", user, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })
      .toPromise();

    if (result.status === 200) {
      // let account = { ...user };
      // delete account.user_password;
      // this.storageService.setItem("account", JSON.stringify(account));
      return true;
    } else {
      return false;
    }
  }

  async updateUser(user: User) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/updateUserById.php", user, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })
      .toPromise();

    if (result.status === 200) {
      // this.storageService.setItem("account", JSON.stringify(result.data));
      return true;
    } else {
      return false;
    }
  }

  async updateUserPassword(id, password) {
    let user = { ...password, id: id };
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/updateUserPasswordById.php", user, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })
      .toPromise();

    if (result.status === 200) {
      // this.storageService.setItem("account", JSON.stringify(result.data));
      return true;
    } else {
      return false;
    }
  }

  async removeUser(value: string) {
    let id = { id: value };
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/deleteUserById.php", id).toPromise();

    if (result.status === 200) {
      // this.storageService.setItem("account", JSON.stringify(result.data));
      return true;
    } else {
      return false;
    }
  }

  async login(value) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/login.php", value, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })
      .toPromise();

    if (result.status === 200) {
      this.storageService.setItem("account", JSON.stringify(result.data));
      return true;
    } else {
      return false;
    }
  }

  async getUserById(value: string) {
    let id = { id: value };
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getUserById.php", id).toPromise();

    if (result.status === 200) {
      this.storageService.setItem("account", JSON.stringify(result.data));
      return true;
    } else {
      return false;
    }
  }

  async getAllUser() {
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getUser.php", null).toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async getAdviser() {
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getAdviser.php", null).toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async getStudentByAdviserId(value: string) {
    let id = { id: value };
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getStudentByAdviserId.php", id)
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return [];
    }
  }
}
