const request = require("request-promise-native");
const fs = require("fs");
const folderPath = "./Responses/"
const path = require("path");
const downloadPDF = async (url,id , name) => {

let optionsAdvisorPDF = {
    method: "GET",
    url: url,
    headers: {
      "Content-Type": "application/pdf"
    },
  
  };

  try {
    
      await request
      .get(optionsAdvisorPDF)
      .pipe(
        fs.createWriteStream(
          `${path.join(folderPath + id + "/", name)}.pdf`
        )
      );

  } catch (err) {
    console.log(err);
  }

}

module.exports = {
    downloadPDF
}