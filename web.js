var express = require('express');

var app = express.createServer(express.logger());

var htmlFile = function(filename) {
    var fs = require('fs');
    var enc = 'utf-8';
    var buffer = new Buffer(fs.readFileSync(filename),enc);
    return buffer.toString(enc);
}

var indexFile = function(request, response) {
    response.send(htmlFile("index.html"));
}

var readHtml = function(request, response) {
    response.send(htmlFile(request.path));
}

app.get("/", indexFile);
app.get("/index.html", indexFile);
app.get("/test.html", readHtml);

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log("Listening on " + port);
});
