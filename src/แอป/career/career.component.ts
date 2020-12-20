import { Component, OnInit, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";
import { JsonconvertPipe } from "../pipes/jsonconvert.pipe";

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { CourseDialogComponent } from "../course-dialog/course-dialog.component";

@Component({
  selector: "app-career",
  templateUrl: "./career.component.html",
  styleUrls: ["./career.component.css"],
})
export class CareerComponent implements OnInit {
  career_list: any = [];

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private jsonconvert: JsonconvertPipe,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.GetCareer();
  }

  openCourseDialog(module_name_en, module_name_th, courses) {
    const dialogRef = this.dialog.open(CourseDialogComponent, {
      data: { module_name_en: module_name_en, module_name_th: module_name_th, courses: courses },
    });
    dialogRef.afterClosed().subscribe(() => {});
  }

  GetCareer() {
    let career_id;
    let career_type_id;
    // let list: any = JSON.parse(localStorage.getItem("list"));

    this.activatedRoute.queryParams.subscribe((params) => {
      career_id = params["career_id"];
      career_type_id = params["career_type_id"];
    });

    let jsondata: string = JSON.stringify({ career_id: career_id, career_type_id: career_type_id });

    this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getCareerById.php", jsondata, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })
      .subscribe({
        next: (data) => {
          if (data.status == "200") {
            this.career_list = data.data;
            // this.career_list.years = [this.career_list.years];
            // this.career_list = this.jsonconvert.transform(data.data);

            // if (this.career_list.years) {
            //   // group module_list by year
            //   let total = [];
            //   this.career_list.years.forEach((element) => {
            //     if (total.length > 0 && total[element.year]) {
            //       total[element.year] = total[element.year].concat(element["module_list"]);
            //     } else {
            //       total[element.year] = element["module_list"];
            //     }
            //   });

            //   this.career_list.years = [];

            //   for (let key in total) {
            //     this.career_list.years.push({
            //       year: key,
            //       module_list: total[key],
            //     });
            //   }

            // sort years by ASC
            this.career_list.years.sort(function (a, b) {
              return a.year - b.year;
            });
            // }
          } else {
            console.log(data);
          }
        },
        error: (error) => console.error("There was an error!", error),
      });
  }
}
