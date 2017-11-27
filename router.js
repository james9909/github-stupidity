var api = require("./api");

module.exports = function(app) {

    // View endpoints
    app.get("/", function(req, res) {
        res.sendFile(__dirname + "/views/index.html");
    });

    // API endpoints
    app.get("/api/repo/calculate", function(req, res) {
        var repository = req.query.repository;
        api.calculateRepoStupidity(repository, function(err, data) {
            if (err) {
                res.send({
                    success: 0,
                    message: err.message
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
        var language = req.query.language;
        api.calculateLanguageStupidity(language, function(err, data) {
            if (err) {
                res.send({
                    success: 0,
                    message: err.message
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
