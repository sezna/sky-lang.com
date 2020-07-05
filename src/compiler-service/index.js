let sky = require("sky-lang").default;
var http = require("http");

const PORT = 1414;

function handleRequest(request, response) {
  switch (request.method) {
    case "POST":
      let body = [];
      request.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        console.log("requested code: ", body);
        // at this point, `body` has the entire request body stored in it as a string
        let result = sky(body);
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(JSON.stringify(result));
        console.log("responded with compiled message");
      });
    break;
  default:
      response.writeHead(400, { "Content-Type": "text/html" });
      response.end("Malformed request");
      console.log("bad request: method not supported");
  }
}


let server = http.createServer(handleRequest);
server.listen(PORT, () => console.log("Server listening on port " + PORT));
