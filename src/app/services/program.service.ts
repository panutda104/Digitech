import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ProgramService {
  constructor(private http: HttpClient) {}

  async getProgram(value: any) {
    let result = await this.http
      .post<any>(
        "https://digitech.sut.ac.th/Digitech-Plan-API/getProgram.php",
        value
      )
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }
}
