const express = require("express"),
  app = express(),
  fs = require("fs"),
  shell = require("shelljs"),
  // Modify the folder path in which responses need to be stored
  folderPath = "./Responses/",
  defaultFileExtension = "json", // Change the default file extension
  bodyParser = require("body-parser"),
  DEFAULT_MODE = "writeFile",
  request = require("request-promise-native"),
  path = require("path");
var file = require("./helper/downloadPDF");
var jsonFormat = require("json-format");
// Create the folder path in case it doesn't exist

var config = {
  type: "space",
  size: 2,
};

app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const removeDir = function (path) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path);

    if (files.length > 0) {
      files.forEach(function (filename) {
        if (fs.statSync(path + "/" + filename).isDirectory()) {
          removeDir(path + "/" + filename);
        } else {
          fs.unlinkSync(path + "/" + filename);
        }
      });
      fs.rmdirSync(path);
    } else {
      fs.rmdirSync(path);
    }
  } else {
    console.log("Directory path not found.");
  }
};
app.post("/write/:id", async (req, res) => {
  const { id } = req.params;
  if (fs.existsSync(path.join(folderPath + id))) {
    removeDir(path.join(folderPath + id));
  }

  let extension = req.body.fileExtension || defaultFileExtension,
    fsMode = req.body.mode || DEFAULT_MODE;
  (uniqueIdentifier = req.body.uniqueIdentifier
    ? typeof req.body.uniqueIdentifier === "boolean"
      ? Date.now()
      : req.body.uniqueIdentifier
    : false),
    (filename = `${req.body.requestName}${uniqueIdentifier || ""}`),
    (filePath = `${path.join(folderPath + id + "/", filename)}.${extension}`);
  let body = {};

  try {
    fs.mkdirSync(path.join(folderPath, id));
  } catch (err) {
    console.log(err);
  }

  let options = {
    method: "POST",
    url: `http://18.191.244.144:5000/api/aap/test/${id}?token=99a5df41-4036-4f97-a960-0e792e17e072`,
    headers: {
      "Content-Type": "application/json",
      // 'x-api-key': `${Config.SubmitApi.ApiKey}`,
    },
    body: null,
  };

  try {
    body = await request.post(options);
  } catch (err) {
    console.log(err);
  }

  file.downloadPDF(
    `http://18.191.244.144:5000/api/application/pdf/${id}?token=99a5df41-4036-4f97-a960-0e792e17e072`,
    id,
    "ClientApplication"
  );

  file.downloadPDF(
    `http://18.191.244.144:5000/api/application/advisor/pdf/${id}?token=99a5df41-4036-4f97-a960-0e792e17e072`,
    id,
    "AdvisorReport"
  );

  fs[fsMode](filePath, jsonFormat(JSON.parse(body), config), (err) => {
    if (err) {
      console.log(err);
      res.send("Error");
    } else {
      res.send(JSON.parse(body));
    }
  });
});

app.listen(3000, () => {
  console.log(
    `Data is being stored at location: ${path.join(process.cwd(), folderPath)}`
  );
});
