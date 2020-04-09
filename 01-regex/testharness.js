"use strict";
exports.__esModule = true;
var Grammar_1 = require("./Grammar");
var fs = require("fs");
function main() {
    var teststr = fs.readFileSync("tests.txt", "utf8");
    var tests = JSON.parse(teststr);
    var G;
    for (var i = 0; i < tests.length; ++i) {
        console.log("Test " + i);
        var spec = tests[i]["spec"];
        var valid = tests[i]["valid"];
        var name_1 = tests[i]["name"];
        try {
            var G_1 = new Grammar_1.Grammar(spec);
            if (valid) {
            }
            else {
                console.log("Reported grammar " + name_1 + " as valid, but it's not.");
                return;
            }
        }
        catch (e) {
            if (valid) {
                console.log("Reported grammar " + name_1 + " as invalid, but it's valid.");
                console.log(e);
                return;
            }
            else {
            }
        }
    }
    console.log(tests.length + " tests OK");
}
main();
//# sourceMappingURL=testharness.js.map