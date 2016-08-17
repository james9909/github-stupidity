$("#results_heading").hide();
$("#results_body").hide();

function apiCall(method, url, data, callback_success, callback_fail) {
    $.ajax({
        type: method,
        url: url,
        datatype: "json",
        data: data
    }).done(function(result) {
        if (callback_success) callback_success(result);
    }).error(function(jqXHR) {
        if (callback_fail) callback_fail(jqXHR);
    });
}

function changeForm(option) {
    switch (option.value) {
        case "Language":
            $("#languageForm").show();
            $("#repositoryForm").hide();
            break;
        case "Repository":
            $("#repositoryForm").show();
            $("#languageForm").hide();
            break;
        default:
            alert("Invalid selection");
    }
}

function hideResultsHeading(speed) {
    $("#results_heading").slideUp(speed);
}

function showResultsHeading(speed) {
    $("#results_heading").slideDown(speed);
}

function hideResultsBody(speed) {
    $("#results_body").slideUp(speed);
}

function showResultsBody(speed) {
    $("#results_body").slideDown(speed);
}

function setRepositoryResults(success, data) {
    if (success === 1) {
        $("#status").text("Success");
        $("#status").css({color: "green"});
        $("#name").text(data.name);
        $("#results_body").empty();
        $("#results_body").append("<div><b>Stars:</b> " + data.stars + "</div>");
        $("#results_body").append("<div><b>Forks:</b> " + data.forks + "</div>");
        $("#results_body").append("<div><b>Contributors:</b> " + data.contributors + "</div>");
        $("#results_body").append("<div><b>Stupidity:</b> " + data.stupidity + "%</div>");
    } else {
        $("#status").text("Failed");
        $("#status").css({color: "red"});
    }
    showResultsHeading("slow");
    showResultsBody("slow");
}

function calculateRepository() {
    var repository = $("#repository").val();
    if (repository === "") {
        alert("Please input a repository");
        return;
    }

    $("#name").text(repository);

    var data = {};
    data["repository"] = repository;

    var input = $("#submitRepository");
    $(input).attr("disabled", "disabled");

    hideResultsHeading("fast");
    hideResultsBody("fast");

    apiCall("GET", "/api/repo/calculate", data, function(result) {
        console.log(result);
        setRepositoryResults(result.success, result.data);
        $(input).removeAttr("disabled");
    }, function(jqXHR) {
        console.log(jqXHR);
        $(input).removeAttr("disabled");
    });
}
