"use strict";
exports.__esModule = true;
var Tokenizer_1 = require("./Tokenizer");
var Grammar_1 = require("./Grammar");
var fs = require("fs");
function main() {
    var teststr = fs.readFileSync("tests.txt", "utf8");
    var tests = JSON.parse(teststr);
    var lastSpec;
    var G;
    var T;
    for (var i = 0; i < tests.length; ++i) {
        console.log("Test " + i);
        var spec = tests[i]["tokenSpec"];
        var inp = tests[i]["input"];
        var expected = tests[i]["expected"];
        if (spec !== lastSpec) {
            G = new Grammar_1.Grammar(spec);
            T = new Tokenizer_1.Tokenizer(G);
            console.log("Creating tokenizer for " + tests[i]["gname"] + "...");
            lastSpec = spec;
        }
        else {
            console.log("Reusing tokenizer...");
        }
        console.log("Input " + tests[i]["iname"]);
        T.setInput(inp);
        var j = 0;
        while (true) {
            var expectedToken = expected[j++];
            try {
                var tok = T.next();
                if (expectedToken === undefined) {
                    console.log("Did not expect to get token here");
                    return;
                }
                if (expectedToken.sym === "$" && tok.sym === "$") {
                    break;
                }
                if (tok.sym !== expectedToken.sym || tok.lexeme !== expectedToken.lexeme || tok.line !== expectedToken.line) {
                    console.log("Mismatch");
                    console.log("\tGot:", tok);
                    console.log("\tExpected:", expectedToken);
                    console.log("\tGrammar:");
                    console.log("" + spec);
                    return;
                }
            }
            catch (e) {
                if (e) {
                    if (expectedToken === undefined) {
                        //failure was expected
                        break;
                    }
                    else {
                        throw (e);
                    }
                }
            }
        }
    }
    console.log(tests.length + " tests OK");
}
main();
//# sourceMappingURL=testharness.js.map