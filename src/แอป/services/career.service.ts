import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Career } from "../models/career";
import { map } from "rxjs/operators";
import { AbstractControl } from "@angular/forms";
import { StorageService } from "../services/storage.service";
import { BehaviorSubject, Observable } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class CareerService {
  constructor(private http: HttpClient, private storageService: StorageService) {}

  public get currentUserValue(): Career {
    return JSON.parse(localStorage.getItem("career"));
  }

  async createCareer(user: Career) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/createCareer.php", user, {
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

  async updateCareer(career: Career) {
    console.log(career);
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/updateCareerById.php", career, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })
      .toPromise();

    if (result.status === 200) {
      // this.storageService.setItem("career", JSON.stringify(result.data));
      return true;
    } else {
      return false;
    }
  }

  async removeCareer(value: string) {
    let id = { id: value };
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/deleteCareerById.php", id).toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async getCareerById(value: string) {
    let id = { id: value };
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getCareerById.php", id).toPromise();

    if (result.status === 200) {
      this.storageService.setItem("career", JSON.stringify(result.data));
      return true;
    } else {
      return false;
    }
  }

  async getAllCareer() {
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getCareer.php", null).toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async getAllCareerInPlanFormat(value: string) {
    let syllabus_id = { syllabus_id: value };
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getCareerInfo_.php", syllabus_id, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })
      .toPromise();

    if (result.status === 200) {
      // console.log(result.data);
      let value = result.data;

      return value;
    } else {
      return false;
    }
  }

  async getCareerByCareerTypeId(value) {
    let id = { career_type_id: value };
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getCareerByCareerTypeId.php", id)
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async getCareerByModuleId(value: string) {
    let id = { module_id: value };
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getCareerByModuleId.php", id)
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }
}
