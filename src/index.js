let sky = require("sky-lang").default;
let http = require("http");
let path = require("path");
let express = require("express");


const PORT = 1414;

let app = express();

app.post("/api/compile", (request, response) => {
        console.log("requestuested code: ", request.body);
        // at this point, `body` has the entire requestuest body stored in it as a string
        let result = sky(request.body);
        response.writeHead(200, { "Content-Type": "text/html" });
        res.json(result);
        console.log("responded with compiled message");
      });
app.get("/", (_, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log("Server listening on port " + PORT));
