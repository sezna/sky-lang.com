const sky = require("sky-lang").default;
const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const PORT = 1414;

let app = express();
app.use(morgan("combined"));
app.use(bodyParser.text());

app.post("/api/compile", (request, response) => {
  console.log("   ", request.body);
  let result = sky(request.body);
  // TODO if (result.isValid)
  let reqId = uuidv4();
  fs.writeFile(`compiled/xml/${reqId}.xml`, result, err => {
    if (err) throw err;
    let command = `musicxml2ly compiled/xml/${reqId}.xml --output=compiled/ly/${reqId}.ly`;
    exec(command, (err, stdout, stderr) => {
      if (err) throw err;
      let command = `lilypond --output=compiled/pdf/${reqId} compiled/ly/${reqId}.ly`;
      exec(command, (err, stdout, stderr) => {
        if (err) throw err;
        let file = fs.createReadStream(`compiled/pdf/${reqId}.pdf`);
        let stat = fs.statSync(`compiled/pdf/${reqId}.pdf`);
        response.setHeader("Content-Length", stat.size);
        response.setHeader("Content-Type", "application/pdf");
        response.setHeader(
          "Content-Disposition",
          "attachment; filename=quote.pdf"
        );
        file.pipe(response);
      });
    });
  });
});

app.get("/", (_, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log("Server listening on port " + PORT));
