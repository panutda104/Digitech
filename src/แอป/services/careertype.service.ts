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
export class CareerTypeService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  public get currentUserValue(): User {
    return JSON.parse(localStorage.getItem("account"));
  }

  async createCareerType(user: User) {
    let result = await this.http
      .post<any>(
        "https://digitech.sut.ac.th/Digitech-Plan-API/createCareerType.php",
        user,
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      )
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

  async updateCareerType(user: User) {
    let result = await this.http
      .post<any>(
        "https://digitech.sut.ac.th/Digitech-Plan-API/updateCareerTypeById.php",
        user,
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      )
      .toPromise();

    if (result.status === 200) {
      // this.storageService.setItem("account", JSON.stringify(result.data));
      return true;
    } else {
      return false;
    }
  }

  async removeCareerType(value: string) {
    let id = { id: value };
    let result = await this.http
      .post<any>(
        "https://digitech.sut.ac.th/Digitech-Plan-API/deleteCareerTypeById.php",
        id
      )
      .toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async getCareerTypeById(value: string) {
    let id = { id: value };
    let result = await this.http
      .post<any>(
        "https://digitech.sut.ac.th/Digitech-Plan-API/getCareerTypeById.php",
        id
      )
      .toPromise();

    if (result.status === 200) {
      this.storageService.setItem("account", JSON.stringify(result.data));
      return true;
    } else {
      return false;
    }
  }

  async getAllCareerType() {
    let result = await this.http
      .post<any>(
        "https://digitech.sut.ac.th/Digitech-Plan-API/getCareerType.php",
        null
      )
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async getCareerTypeByCareerId(value: string) {
    let id = { id: value };
    let result = await this.http
      .post<any>(
        "https://digitech.sut.ac.th/Digitech-Plan-API/getCareerTypeByCareerId.php",
        id
      )
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }
}
