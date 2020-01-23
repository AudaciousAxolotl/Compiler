"use strict";
exports.__esModule = true;
var fs = require("fs");
var Grammar_1 = require("./Grammar");
function main() {
    var data = fs.readFileSync("tests.txt", "utf8");
    var tests = JSON.parse(data);
    for (var i = 0; i < tests.length; ++i) {
        var name_1 = tests[i]["name"];
        var ok = tests[i]["ok"];
        var grammar = tests[i]["grammar"];
        var accepted = false;
        try {
            var G = new Grammar_1.Grammar(grammar);
            accepted = true;
        }
        catch (e) {
        }
        if (ok) {
            if (!accepted) {
                console.log("Rejected valid grammar " + name_1);
                return;
            }
        }
        else {
            if (accepted) {
                console.log("Accepted invalid grammar " + name_1);
                return;
            }
        }
    }
    console.log("All tests OK");
    return true;
}
main();
