var express = require("express");

var api = require("./api");
var router = require("./router");

var app = express();

app.set("port", (process.env.PORT || 5000));

app.use(express.static("public"));
router(app);

app.listen(app.get("port"), function() {
    console.log("[*] Server started on port " + app.get("port"));
});
