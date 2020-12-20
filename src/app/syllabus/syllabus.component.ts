import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";
import { JsonconvertPipe } from "../pipes/jsonconvert.pipe";

@Component({
  selector: "app-syllabus",
  templateUrl: "./syllabus.component.html",
  styleUrls: ["./syllabus.component.css"],
})
export class SyllabusComponent implements OnInit {
  syllabus_info;
  careerType_list: any = [];

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, private jsonconvert: JsonconvertPipe) {}

  ngOnInit() {
    this.GetSyllabus();
  }

  GetSyllabus() {
    let syllabus_id;
    // let list: any = JSON.parse(localStorage.getItem("list"));

    this.activatedRoute.queryParams.subscribe((params) => {
      syllabus_id = params["syllabus_id"];
    });

    let jsondata: string = JSON.stringify({ syllabus_id: syllabus_id });

    this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getSyllabusById.php", jsondata, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })
      .subscribe({
        next: (data) => {
          if (data.status == "200") {
            this.syllabus_info = data.data;
            this.careerType_list = this.syllabus_info.career_type_list;
          } else {
            console.log(data);
          }
        },
        error: (error) => console.error("There was an error!", error),
      });
  }
}
