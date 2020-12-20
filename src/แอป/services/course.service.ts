import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Course } from "../models/course";

@Injectable({
  providedIn: "root",
})
export class CourseService {
  constructor(private http: HttpClient) {}

  async getCourses() {
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getCourses.php", null).toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return [];
    }
  }

  async getCurricularCourses(syllabus_id) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getCurricularCourses.php", { syllabus_id: syllabus_id })
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async createCourse(course: Course) {
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/createCourse.php", course).toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async updateCourse(course: Course) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/updateCourseById.php", course)
      .toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async removeCourse(value: string) {
    let id = { id: value };
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/deleteCourseById.php", id).toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async getCoursesByModuleId(value: string) {
    let id = { module_id: value };
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getCoursesByModuleId.php", id)
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }
}
