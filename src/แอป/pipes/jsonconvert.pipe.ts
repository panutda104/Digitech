import { Pipe, PipeTransform } from "@angular/core";
import "ts-polyfill/lib/es2017-object";

@Pipe({
  name: "jsonconvert",
})
export class JsonconvertPipe implements PipeTransform {
  //Convert string to json array
  // for Digits 6 of ID
  transform(data: any): any {
    if (Array.isArray(data)) {
      Object.keys(data).map((i) => {
        accessArray(data[i]);
      });
    } else {
      accessArray(data);
    }
    return data;
  }
}

function accessArray(data) {
  Object.keys(data).map((key) => {
    if (data[key] && data[key].length > 10 && isJson(data[key])) {
      data[key] = JSON.parse(data[key]);
      accessArray(data[key]);
    }
  });
}

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
