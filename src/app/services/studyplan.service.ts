import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class StudyplanService {
  constructor(private http: HttpClient) {}

  async getStudyPlanByUserId(id) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getStudyPlanListByUserId.php", { user_id: id })
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async getStudyPlanById(id, user_id) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getStudyPlanById.php", { id: id, user_id: user_id })
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async createStudyPlan(data) {
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/createStudyPlan.php", data).toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async updateStudyPlan(data) {
    let result = await this.http.post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/updateStudyPlan.php", data).toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async removeStudyPlan(id, user_id) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/deleteStudyPlanById.php", {
        id: id,
        user_id: user_id,
      })
      .toPromise();

    if (result.status === 200) {
      // this.storageService.setItem("account", JSON.stringify(result.data));
      return true;
    } else {
      return false;
    }
  }

  async cancelStudyPlan(id, user_id) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/cancelStudyPlanById.php", {
        id: id,
        user_id: user_id,
      })
      .toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async getIsAvailableToApprove(user_id) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getIsAvailableToApprove.php", { user_id: user_id })
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async sendApproveStudyPlan(id, user_id) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/sendApproveStudyPlan.php", { id: id, user_id: user_id })
      .toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async sendAdviseStudyPlan(id, user_id) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/sendAdviseStudyPlan.php", { id: id, user_id: user_id })
      .toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async sendEditRequestStudyPlan(id, user_id, request_text) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/sendEditRequestStudyPlan.php", {
        id: id,
        user_id: user_id,
        request_text: request_text,
      })
      .toPromise();
    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async getStudyPlanRequest(id, user_id) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/getStudyPlanRequest.php", { id: id, user_id: user_id })
      .toPromise();

    if (result.status === 200) {
      return result.data;
    } else {
      return false;
    }
  }

  async updateApprovedStudentPlan(id, user_id) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/updateApprovedStudentPlan.php", { id: id, user_id: user_id })
      .toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async updateNotApprovedStudentPlan(id, user_id, comment) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/updateNotApprovedStudentPlan.php", {
        id: id,
        user_id: user_id,
        comment: comment,
      })
      .toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async updateAdvisedStudentPlan(id, user_id) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/updateAdvisedtudentPlan.php", { id: id, user_id: user_id })
      .toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async updateNotAdvisedStudentPlan(id, user_id, comment) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/updateNotAdvisedStudentPlan.php", {
        id: id,
        user_id: user_id,
        comment: comment,
      })
      .toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async updateApproveEditsStudentPlan(id, user_id) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/updateApproveEditsStudentPlan.php", { id: id, user_id: user_id })
      .toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }

  async updateNotApproveEditsStudentPlan(id, user_id, teacher_reject_text) {
    let result = await this.http
      .post<any>("https://digitech.sut.ac.th/Digitech-Plan-API/updateNotApproveEditsStudentPlan.php", {
        id: id,
        user_id: user_id,
        teacher_reject_text: teacher_reject_text,
      })
      .toPromise();

    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  }
}
