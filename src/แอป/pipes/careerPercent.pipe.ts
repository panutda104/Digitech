import { Pipe, PipeTransform } from "@angular/core";
import "ts-polyfill/lib/es2017-object";

@Pipe({
  name: "careerpercent",
})
export class CareerPercentPipe implements PipeTransform {
  //Convert string to json array
  // for Digits 6 of ID
  async transform(coursePicked: any, data: any) {
    if (Object.keys(coursePicked).length) {
      let value = JSON.parse(JSON.stringify(data));

      Object.keys(value).forEach((key) => {
        if (!value[key]["trimesters"]) {
          data[key]["achieve_percent"] = Number(100);
          data[key]["current_percent"] = 0;
        } else {
          let percent = 0;
          let moduleCount = 0;
          Object.keys(value[key]["trimesters"]).forEach((key_) => {
            const filteredResult = Object.values(value[key]["trimesters"][key_]).filter((item) => {
              return item["module_essential"];
            });
            moduleCount += filteredResult.length;
          });

          Object.keys(value[key]["trimesters"]).forEach((key_) => {
            Object.values(value[key]["trimesters"][key_]).forEach((module) => {
              if (module["module_essential"]) {
                if (module["module_id"] in coursePicked) {
                  percent += 100 / moduleCount;
                } else {
                  if (module["courses"]) {
                    module["courses"].forEach((course) => {
                      if (course.course_id in coursePicked) {
                        percent += 100 / moduleCount / module["courses"].length;
                      }
                    });
                  }
                }
              }
            });
          });
          data[key]["achieve_percent"] = Number(percent.toFixed(0));
          data[key]["current_percent"] = 0;
        }
      });
    }
  }
}

// function accessArray(data) {
//   Object.keys(data).map((key) => {
//     if (data[key] && data[key].length > 10 && isJson(data[key])) {
//       data[key] = JSON.parse(data[key]);
//       accessArray(data[key]);
//     }
//   });
// }

// function isJson(str) {
//   try {
//     JSON.parse(str);
//   } catch (e) {
//     return false;
//   }
//   return true;
// }
