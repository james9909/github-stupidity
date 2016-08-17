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

function setRepositoryResults(results) {
    $("#results_body").empty();
    if (results.success === 1) {
        var data = results.data;
        $("#status").text("Success");
        $("#status").css({color: "green"});
        $("#name").text(data.name);
        $("#results_body").append("<div><b>Stars:</b> " + data.stars + "</div>");
        $("#results_body").append("<div><b>Forks:</b> " + data.forks + "</div>");
        $("#results_body").append("<div><b>Contributors:</b> " + data.contributors + "</div>");
        $("#results_body").append("<div><b>Stupidity:</b> " + data.stupidity + "%</div>");
    } else {
        $("#status").text(results.message);
        $("#status").css({color: "red"});
    }
    showResultsHeading("slow");
    showResultsBody("slow");
}

function setLanguageResults(results) {
    $("#results_body").empty();
    if (results.success === 1) {
        var data = results.data;
        $("#status").text("Success");
        $("#status").css({color: "green"});
        $("#name").text(data.language);
        var repos = data["repos"];
        var sum = 0;
        for (var repo in repos) {
            $("#results_body").append("<div><b>" + repos[repo].name + "</b>: " + repos[repo].stupidity + "%</div>");
            sum += parseFloat(repos[repo].stupidity);
        }
        var average = (sum / repos.length).toFixed(2);
        $("#results_body").append("<div><b>Average stupidity</b>: " + average + "%</div>");
    } else {
        $("#status").text(results.message);
        $("#status").css({color: "red"});
    }

    showResultsHeading("slow");
    showResultsBody("slow");
}

function calculateRepository() {
    var repository = $("#repositoryInput").val();
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
        setRepositoryResults(result);
        $(input).removeAttr("disabled");
    }, function(jqXHR) {
        setRepositoryResults({success: 0, message: "Could not contact the api."});
        $(input).removeAttr("disabled");
    });
}

function calculateLanguage() {
    var language = $("#languageInput").val();
    if (language === "") {
        alert("Please select a language");
        return;
    }

    var data = {};
    data["language"] = language;

    var input = $("#submitLanguage");
    $(input).attr("disabled", "disabled");

    hideResultsHeading("fast");
    hideResultsBody("fast");

    apiCall("GET", "/api/language/calculate", data, function(result) {
        setLanguageResults(result);
        $(input).removeAttr("disabled");
    }, function(jqXHR) {
        setLanguageResults({success: 0, message: "Could not contact the api."});
        $(input).removeAttr("disabled");
    });

}

var languages = ["ABAP", "AGS Script", "AMPL", "ANTLR", "API Blueprint", "APL", "ASN.1", "ASP", "ATS", "ActionScript", "Ada", "Agda", "Alloy", "Alpine Abuild", "Ant Build System", "ApacheConf", "Apex", "Apollo Guidance Computer", "AppleScript", "Arc", "Arduino", "AsciiDoc", "AspectJ", "Assembly", "Augeas", "AutoHotkey", "AutoIt", "Awk", "Batchfile", "Befunge", "Bison", "BitBake", "Blade", "BlitzBasic", "BlitzMax", "Bluespec", "Boo", "Brainfuck", "Brightscript", "Bro", "C", "C#", "C++", "C2hs Haskell", "CLIPS", "CMake", "COBOL", "COLLADA", "CSS", "CSV", "Cap'n Proto", "CartoCSS", "Ceylon", "Chapel", "Charity", "ChucK", "Cirru", "Clarion", "Clean", "Click", "Clojure", "CoffeeScript", "ColdFusion", "ColdFusion CFC", "Common Lisp", "Component Pascal", "Cool", "Coq", "Creole", "Crystal", "Csound", "Csound Document", "Csound Score", "Cucumber", "Cuda", "Cycript", "Cython", "D", "DIGITAL Command Language", "DM", "DNS Zone", "DTrace", "Darcs Patch", "Dart", "Diff", "Dockerfile", "Dogescript", "Dylan", "E", "ECL", "ECLiPSe", "EJS", "EQ", "Eagle", "Ecere Projects", "Eiffel", "Elixir", "Elm", "Emacs Lisp", "EmberScript", "Erlang", "F#", "FLUX", "FORTRAN", "Factor", "Fancy", "Fantom", "Filterscript", "Formatted", "Forth", "FreeMarker", "Frege", "GAMS", "GAP", "GAS", "GCC Machine Description", "GDB", "GDScript", "GLSL", "Game Maker Language", "Genshi", "Gentoo Ebuild", "Gentoo Eclass", "Gettext Catalog", "Glyph", "Gnuplot", "Go", "Golo", "Gosu", "Grace", "Gradle", "Grammatical Framework", "Graph Modeling Language", "GraphQL", "Graphviz (DOT)", "Groff", "Groovy", "Groovy Server Pages", "HCL", "HLSL", "HTML", "HTML+Django", "HTML+ECR", "HTML+EEX", "HTML+ERB", "HTML+PHP", "HTTP", "Hack", "Haml", "Handlebars", "Harbour", "Haskell", "Haxe", "Hy", "HyPhy", "IDL", "IGOR Pro", "INI", "IRC log", "Idris", "Inform 7", "Inno Setup", "Io", "Ioke", "Isabelle", "Isabelle ROOT", "J", "JFlex", "JSON", "JSON5", "JSONLD", "JSONiq", "JSX", "Jade", "Jasmin", "Java", "Java Server Pages", "JavaScript", "Julia", "Jupyter Notebook", "KRL", "KiCad", "Kit", "Kotlin", "LFE", "LLVM", "LOLCODE", "LSL", "LabVIEW", "Lasso", "Latte", "Lean", "Less", "Lex", "LilyPond", "Limbo", "Linker Script", "Linux Kernel Module", "Liquid", "Literate Agda", "Literate CoffeeScript", "Literate Haskell", "LiveScript", "Logos", "Logtalk", "LookML", "LoomScript", "Lua", "M", "M4", "M4Sugar", "MAXScript", "MTML", "MUF", "Makefile", "Mako", "Markdown", "Mask", "Mathematica", "Matlab", "Maven POM", "Max", "MediaWiki", "Mercury", "Metal", "MiniD # Legacy", "Mirah", "Modelica", "Module Management System", "Monkey", "Moocode", "MoonScript", "Myghty", "NCL", "NL", "NSIS", "Nemerle", "NetLinx", "NetLinx+ERB", "NetLogo", "NewLisp", "Nginx", "Nimrod", "Ninja", "Nit", "Nix", "Nu", "NumPy", "OCaml", "ObjDump", "Omgrofl", "Opa", "Opal", "OpenCL", "OpenEdge ABL", "OpenRC runscript", "OpenSCAD", "Org", "Ox", "Oxygene", "Oz", "PAWN", "PHP", "#Oracle", "PLSQL", "#Postgres", "PLpgSQL", "Pan", "Papyrus", "Parrot", "Parrot Assembly", "Parrot Internal Representation", "Pascal", "Perl", "Perl6", "Pickle", "PicoLisp", "PigLatin", "Pike", "Pod", "PogoScript", "Pony", "PostScript", "PowerBuilder", "PowerShell", "Processing", "Prolog", "Propeller Spin", "Protocol Buffer", "Public Key", "Puppet", "Pure Data", "PureBasic", "PureScript", "Python", "Python traceback", "QML", "QMake", "R", "RAML", "RDoc", "REALbasic", "REXX", "RHTML", "RMarkdown", "RUNOFF", "Racket", "Ragel in Ruby Host", "Raw token data", "Rebol", "Red", "Redcode", "Ren'Py", "RenderScript", "RobotFramework", "Rouge", "Ruby", "Rust", "SAS", "SCSS", "SMT", "SPARQL", "SQF", "SQL", "#IBM DB2", "SQLPL", "SRecode Template", "STON", "SVG", "Sage", "SaltStack", "Sass", "Scala", "Scaml", "Scheme", "Scilab", "Self", "Shell", "ShellSession", "Shen", "Slash", "Slim", "Smali", "Smalltalk", "Smarty", "SourcePawn", "Squirrel", "Stan", "Standard ML", "Stata", "Stylus", "SubRip Text", "SuperCollider", "Swift", "SystemVerilog", "TLA", "TOML", "TXL", "Tcl", "Tcsh", "TeX", "Tea", "Terra", "Text", "Textile", "Thrift", "Turing", "Turtle", "Twig", "TypeScript", "Unified Parallel C", "Unity3D Asset", "Uno", "UnrealScript", "UrWeb", "VCL", "VHDL", "Vala", "Verilog", "VimL", "Visual Basic", "Volt", "Vue", "Wavefront Material", "Wavefront Object", "Web Ontology Language", "WebIDL", "World of Warcraft Addon Data", "X10", "XC", "XML", "XPages", "XProc", "XQuery", "XS", "XSLT", "Xojo", "Xtend", "YAML", "YANG", "Yacc", "Zephir", "Zimpl", "desktop", "eC", "edn", "fish", "mupad", "nesC", "ooc", "reStructuredText", "wisp", "xBase"];

$("#languageInput").typeahead({
    source: languages
});
