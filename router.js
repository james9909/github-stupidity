var api = require("./api");

module.exports = function(app) {

    // View endpoints
    app.get("/", function(req, res) {
        res.sendFile(__dirname + "/views/index.html");
    });

    // API endpoints
    app.get("/api/repo/calculate", function(req, res) {
        var repository = req.query.repository;
        api.calculateRepoStupidity(repository).then(function(data) {
            res.send({
                success: 1,
                data: data
            })
        }, function(err) {
            res.send({
                success: 0,
                message: err.message
            });
        });
    });

    app.get("/api/language/calculate", function(req, res) {
        var language = req.query.language;
        api.calculateLanguageStupidity(language).then(function(data) {
            res.send({
                success: 1,
                data: data
            });
        }, function(err) {
            if (err.message === "Invalid field.") {
                // Invalid language
                res.send({
                    success: 0,
                    message: "Invalid language."
                });
            } else {
                res.send({
                    success: 0,
                    message: err.message
                });
            }
        });
    });
};
