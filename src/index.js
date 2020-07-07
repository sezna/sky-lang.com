const sky = require("sky-lang").default;
const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan')



const PORT = 1414;

let app = express();
app.use(morgan('combined'))
app.use(bodyParser.text());

app.post("/api/compile", (request, response) => {
        console.log("   ", request.body);
        let result = sky(request.body);
        response.json(result);
      });

app.get("/", (_, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log("Server listening on port " + PORT));
