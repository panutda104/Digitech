import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { MatPaginator, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { UserService } from "../../services/user.service";
import { FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Roles } from "../../models/roles.enum";
import { User } from "../../models/user";

@Component({
  selector: "app-user-manage",
  templateUrl: "./user-manage.component.html",
  styleUrls: ["./user-manage.component.css"],
})
export class UserManageComponent implements OnInit {
  displayedColumns: string[] = [
    "id",
    "user_id",
    "user_role",
    "user_firstname",
    "user_lastname",
    "user_email",
    "user_tel",
    "syllabus_id",
    "button",
  ];

  value;
  dataSource;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private userService: UserService, public dialog: MatDialog) {
    this.getUser();
  }

  ngOnInit() {}

  async getUser() {
    let user_data = await this.userService.getAllUser();
    for (let i in user_data) {
      user_data[i].user_role = this.getRoleName(user_data[i].user_role);
    }

    this.dataSource = new MatTableDataSource<User>(user_data);
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onOpenDialog(): void {
    const dialogRef = this.dialog.open(UserEditorDialog, {
      data: { data: null, isDelete: false },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getUser();
    });
  }

  onEdit(data): void {
    const dialogRef = this.dialog.open(UserEditorDialog, {
      data: { data: data, isDelete: false },
    });
    console.log(data);

    dialogRef.afterClosed().subscribe(() => {
      this.getUser();
    });
  }

  onDelete(data): void {
    const dialogRef = this.dialog.open(UserEditorDialog, {
      data: { data: data, isDelete: true },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getUser();
    });
  }

  getRoleName(role) {
    return Object.keys(Roles).filter((item) => {
      if (Roles[item] == role) return item;
    })[0];
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }
}

@Component({
  selector: "user-manage-dialog",
  templateUrl: "./user-manage-dialog.html",
  styleUrls: ["./user-manage-dialog.css"],
})
export class UserEditorDialog {
  submitted = false;
  roles = [];
  isDelete = this.data.isDelete;
  accountForm = this.fb.group({
    id: [this.data.data ? this.data.data.id : null],
    user_id: [
      this.data.data ? this.data.data.user_id : null,
      {
        validators: [
          Validators.pattern("^[a-zA-Z][0-9]{7}$"),
          Validators.required,
          // userValidator,
        ],
        updateOn: "blur",
      },
    ],
    user_role: [this.data.data ? Roles[this.data.data.user_role] : Roles.Student, Validators.required],
    user_firstname: [this.data.data ? this.data.data.user_firstname : null, Validators.required],
    user_lastname: [this.data.data ? this.data.data.user_lastname : null, Validators.required],
    user_email: [this.data.data ? this.data.data.user_email : null, { validators: [Validators.email], updateOn: "blur" }],
    user_tel: [this.data.data ? this.data.data.user_tel : null, [Validators.pattern("^[0-9]*$"), Validators.maxLength(10)]],
    syllabus_id: [this.data.data ? this.data.data.syllabus_id : null, Validators.required],
  });

  constructor(
    public dialogRef: MatDialogRef<UserEditorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    for (let key of Object.keys(Roles)) {
      this.roles.push({ key: key, value: Roles[key] });
    }
  }

  onNoClick() {
    this.dialogRef.close();
  }

  async onCreate() {
    this.submitted = true;
    if (this.accountForm.valid) {
      if (await this.userService.createUser(this.accountForm.value)) {
        this.onNoClick();
      } else {
        this.toastr.error("Sorry, your update failed. Please try again.", null, {
          positionClass: "toast-top-center",
          closeButton: true,
        });
      }
    }
  }

  async onUpdate() {
    this.submitted = true;
    if (this.accountForm.valid) {
      if (await this.userService.updateUser(this.accountForm.value)) {
        this.onNoClick();
      } else {
        this.toastr.error("Sorry, your update failed. Please try again.", null, {
          positionClass: "toast-top-center",
          closeButton: true,
        });
      }
    }
  }

  async onRemoveConfirm() {
    if (await this.userService.removeUser(this.data.data.id)) {
      this.onNoClick();
    } else {
      this.toastr.error("Sorry, your update failed. Please try again.", null, {
        positionClass: "toast-top-center",
        closeButton: true,
      });
    }
  }

  get user_id() {
    return this.accountForm.get("user_id");
  }

  get user_firstname() {
    return this.accountForm.get("user_firstname");
  }

  get user_lastname() {
    return this.accountForm.get("user_lastname");
  }
  get user_email() {
    return this.accountForm.get("user_email");
  }

  get user_tel() {
    return this.accountForm.get("user_tel");
  }

  get syllabus_id() {
    return this.accountForm.get("syllabus_id");
  }
}
