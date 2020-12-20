import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class StorageService {
  constructor() {}

  private storageSub = new Subject<String>();

  watchStorage(): Observable<any> {
    return this.storageSub.asObservable();
  }

  setItem(key: string, data: any) {
    localStorage.setItem(key, data);
    this.storageSub.next("changed");
  }

  removeItem(key) {
    localStorage.removeItem(key);
    this.storageSub.next("changed");
  }
}
