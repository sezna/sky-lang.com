const sky = require("sky-lang").default;
const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");



const PORT = 1414;

let app = express();
app.use(bodyParser.text());

app.post("/api/compile", (request, response) => {
        console.log("requested code: ", request.body);
        let result = sky(request.body);
        response.json(result);
        console.log("responded with compiled message");
      });

app.get("/", (_, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log("Server listening on port " + PORT));
