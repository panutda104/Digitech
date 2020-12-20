import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator, MatDialog, MatTableDataSource } from "@angular/material";
import { UserService } from "../../services/user.service";
@Component({
  selector: "app-adviser",
  templateUrl: "./adviser.component.html",
  styleUrls: ["./adviser.component.css"],
})
export class AdviserComponent implements OnInit {
  displayedColumns: string[] = ["id", "user_id", "user_firstname", "user_lastname", "button"];

  student_dataSource;
  adviser_data = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private userService: UserService, public dialog: MatDialog) {}

  ngOnInit() {
    this.getAdviser();
  }

  async getAdviser() {
    this.userService.getAdviser().then((result) => {
      this.adviser_data = result;
    });
  }

  async getStudent(value) {
    let user_data = await this.userService.getStudentByAdviserId(value);

    this.student_dataSource = new MatTableDataSource<any>(user_data);
    this.student_dataSource.paginator = this.paginator;
  }
}
