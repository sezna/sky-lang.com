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
let cacheHits = 0;
let cacheMisses = 0;
let validProgs = 0;
let invalidProgs = 0;

app.use(morgan("combined"));
app.use(bodyParser.json());

app.use("/compiled", express.static("compiled"));
app.use("/", express.static("frontend"));

app.post("/api/compile/pdf", (request, response) => {
  let result = sky(request.body.code);
  // TODO if (result.isValid)
  let reqId = simpleHash(request.body.code);
  // check if this has been compiled already
  if (fs.existsSync(`compiled/pdf/${reqId}.pdf`)) {
    response.send(`/compiled/pdf/${reqId}.pdf`);
    response.end();
  } else {
    // if it has not been compiled already, compile it.
    fs.writeFile(`compiled/xml/${reqId}.xml`, result, (err) => {
      if (err) console.log(err);
      let command = `musicxml2ly --no-beaming compiled/xml/${reqId}.xml --output=compiled/ly/${reqId}.ly`;
      exec(command, (err, stdout, stderr) => {
        if (err) console.log(err);
        let command = `lilypond --output=compiled/pdf/${reqId} compiled/ly/${reqId}.ly`;
        exec(command, (err, stdout, stderr) => {
          if (err) console.log(err);
          response.send(`/compiled/pdf/${reqId}.pdf`);
          response.end();
        });
      });
    });
  }
});

app.post("/api/compile/png", (request, response) => {
  let code = request.body.code;
  let reqId = simpleHash(code);
  // check if this has been compiled already
  if ((cacheHits + cacheMisses) % 10 === 0) {
    console.log(`INFO: cache hits: ${cacheHits}, cache misses: ${cacheMisses}`);
  }
  if ((validProgs + invalidProgs) % 5 == 0) {
    console.log(
      `INFO: valid progs: ${validProgs}, invalidProgs: ${invalidProgs}`
    );
  }
  if (fs.existsSync(`compiled/png/${reqId}.png`)) {
    cacheHits++;
    response.json({
      isOk: true,
      content: `/compiled/png/${reqId}.png`,
    });
    response.end();
  } else {
    cacheMisses++;
    // if it has not been compiled already, compile it.
    let result = sky(code);
    if (result.isOk) {
      validProgs++;
      result = result.renderedXml;
    } else {
      invalidProgs++;
      response.json({
        isOk: false,
        content: `Error on line ${result.err.line}, column ${result.err.column}: 
${result.err.reason}`,
        line: result.err.line,
        column: result.err.column,
      });
      response.end();
      return;
    }
    fs.writeFile(`compiled/xml/${reqId}.xml`, result, (err) => {
      if (err) console.log(err);
      let command = `musicxml2ly --no-beaming compiled/xml/${reqId}.xml --output=compiled/ly/${reqId}.ly`;
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
            response.json({
              isOk: true,
              content: `/compiled/png/${reqId}.png`,
            });
            response.end();
          });
        });
      });
    });
  }
});

app.listen(PORT, () => console.log("Server listening on port " + PORT));

function simpleHash(input) {
  var hash = 0;
  if (input.length === 0) {
    return hash;
  }
  for (var i = 0; i < input.length; i++) {
    var char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
