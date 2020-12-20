import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ModuleService {
  constructor(private http: HttpClient) {}

  async getModules() {
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getModules.php", null).toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async createModule(data) {
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/createModule.php", data).toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async updateModule(data) {
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/updateModuleById.php", data).toPromise();

    if (result.status === 200) {
      // console.log(result);
      return true;
    } else {
      // console.log(result);
      return false;
    }
  }

  async removeModule(value) {
    let id = { id: value };
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/deleteModuleById.php", id).toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async getModulesByCareerId(value: string) {
    let id = { career_id: value };
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getModulesByCareerId.php", id)
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async getModulesByCourseId(value: string) {
    let id = { id: value };
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getModulesByCourseId.php", id)
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async getModuleOption() {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getModulesForOption.php", null)
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async getOptional() {
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getOptional.php", null).toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }
}
