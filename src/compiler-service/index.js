let sky = require("sky-lang").default;
var http = require("http");

const PORT = 1414;

function handleRequest(request, response) {
  switch (request.method) {
    case "POST":
      if (request.body && request.body.sourceCode) {
        let result = sky(request.body.sourceCode);
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(JSON.stringify(result));
        console.log("responded with compiled message");
      } else {
        response.writeHead(400, { "Content-Type": "text/html" });
        response.end("Malformed request");
        console.log("bad request");
      }
    break;
  default:
      response.writeHead(400, { "Content-Type": "text/html" });
      response.end("Malformed request");
      console.log("bad request");
  }
}


let server = http.createServer(handleRequest);
server.listen(PORT, () => console.log("Server listening on port " + PORT));
