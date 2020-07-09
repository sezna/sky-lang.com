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

app.use("/compiled", express.static("compiled"));
app.post("/api/compile/pdf", (request, response) => {
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
        response.send(`/compiled/pdf/${reqId}.pdf`);
        response.end();
      });
    });
  });
});

app.post("/api/compile/png", (request, response) => {
  let result = sky(request.body);
  if (result.isOk) {
    result = result.renderedXml;
  } else {
    response.json({
      isOk: false,
      content: `Error on line ${result.err.line}, column ${result.err.column}: 
${result.err.reason}`})
    response.end();
    return;
  }
  let reqId = uuidv4();
  fs.writeFile(`compiled/xml/${reqId}.xml`, result, err => {
    if (err) console.log(err);
    let command = `musicxml2ly compiled/xml/${reqId}.xml --output=compiled/ly/${reqId}.ly`;
    exec(command, (err, stdout, stderr) => {
      if (err) console.log(err);
      // add cropping preamble to file
      let croppingPreamble = `\\paper {
indent = 0\\mm
line-width = 110\\mm
oddHeaderMarkup = ""
evenHeaderMarkup = ""
oddFooterMarkup = ""
evenFooterMarkup = ""
}
`;
      let command = `echo '${croppingPreamble}' | cat - compiled/ly/${reqId}.ly > compiled/ly/${reqId}.tmp.ly && mv compiled/ly/${reqId}.tmp.ly compiled/ly/${reqId}.ly`;
      exec(command, (err, stdout, stderr) => {
        let command = `lilypond -dbackend=eps -dno-gs-load-fonts -dinclude-eps-fonts --png --output=compiled/png/${reqId} compiled/ly/${reqId}.ly`;
        exec(command, (err, stdout, stderr) => {
          if (err) console.log(err);
          console.log("sending png");
          response.json({ isOk: true, content: `/compiled/png/${reqId}.png`});
          response.end();
        });
      });
    });
  });
});

app.get("/", (_, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log("Server listening on port " + PORT));
