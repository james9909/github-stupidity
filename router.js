var api = require("./api");

module.exports = function(app) {

    // View endpoints
    app.get("/", function(req, res) {
        res.sendFile(__dirname + "/views/index.html");
    });

    // API endpoints
    app.get("/api/repo/calculate", function(req, res) {
        var repository = req.param("repository");
        api.calculateRepoStupidity(repository, function(data) {
            if (typeof data !== "object") {
                res.send({
                    success: 0,
                    message: data
                });
            } else {
                res.send({
                    success: 1,
                    data: data
                });
            }
        });
    });

    app.get("/api/language/calculate", function(req, res) {
        var language = req.param("language");
        api.calculateLanguageStupidity(language, function(data) {
            if (typeof data !== "object") {
                res.send({
                    success: 0,
                    message: data
                });
            } else {
                res.send({
                    success: 1,
                    data: data
                });
            }
        });
    });
};
