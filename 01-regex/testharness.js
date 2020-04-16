"use strict";
exports.__esModule = true;
//to start at a given test number, change this
var startAt = 1;
//to stop early, change this
var endAt = 99999;
//set this to true to get more status messages
var VERBOSE = false;
var asmfile = "xyz.asm";
var objfile = "xyz.o";
var exefile = "xyz.exe";
var ReturnStatus = /** @class */ (function () {
    function ReturnStatus(x) {
        this.msg = x;
    }
    ReturnStatus.prototype.toString = function () {
        return this.msg;
    };
    return ReturnStatus;
}());
var NEVER_RETURN = new ReturnStatus("No return");
var DONT_CARE = new ReturnStatus("Don't care");
var fs = require("fs");
var subprocess = require("child_process");
var path = require("path");
var exetools_1 = require("./exetools");
var parser_1 = require("./parser");
function unlink(s) {
    try {
        fs.unlinkSync(s);
    }
    catch (e) {
    }
}
function fmt(i) {
    var ii;
    if (i < 10)
        ii = "   " + i;
    else if (i < 100)
        ii = "  " + i;
    else if (i < 1000)
        ii = " " + i;
    else
        ii = "" + i;
    return ii;
}
//like the Unix (tm) nl utility: Number Lines
function nl(x) {
    x = x.replace(/\r\n/g, "\n");
    var tmp = x.split("\n");
    for (var i = 1; i <= tmp.length; ++i) {
        var txt = /(.*?)\s*$/.exec(tmp[i - 1])[1];
        console.log(fmt(i) + " | " + txt);
    }
}
function access(path) {
    try {
        fs.accessSync(path);
        return true;
    }
    catch (e) {
        return false;
    }
}
function codepointToString(codepoint) {
    //http://crocodillon.com/blog/parsing-emoji-unicode-in-javascript
    var offset = codepoint - 0x10000;
    var offsethi = (offset >> 10) + 0xd800;
    var offsetlo = 0xdc00 + (offset & 0x3ff);
    var sepchar = String.fromCharCode(offsethi) + String.fromCharCode(offsetlo) + " ";
    //variant selector: monochrome: https://stackoverflow.com/questions/32915485/how-to-prevent-unicode-characters-from-rendering-as-emoji-in-html-from-javascrip
    //sepchar += "\ufe0e";
    return sepchar;
}
//newline symbol
var NEWLINE = "\u23ce";
var SEP = "-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=";
var badEmoji = "";
var goodEmoji = "";
if (process.platform === "linux") {
    //too bad unicode doesn't work on Windows...
    badEmoji = codepointToString(0x1f630); // 0x1f644 0x1f9d0 0x1f92a 
    goodEmoji = codepointToString(0x1f601);
}
else {
    badEmoji = ":-(";
    goodEmoji = ":-)";
}
var numCases = [];
var numOK = [];
var numBad = [];
var groupsThatCannotContinue = [];
//list of test cases, sorted by bonus number
//within a bonus number, cases appear in the order
//they were encountered in the input file
var workqueue = [];
//next item to take from the workqueue
var nextItemIndex = 0;
function good(group, counter) {
    ++numOK[group];
    var txt = (group === 0) ? "Test" : "Bonus";
    console.log(counter + ": " + txt + " OK");
    scheduleNextRun(false);
}
function bad(group, counter) {
    ++numBad[group];
    groupsThatCannotContinue[group] = true;
    var txt = (group === 0) ? "Test" : "Bonus";
    console.log(counter + ": " + txt + " failed");
    if (group === 0) {
        scheduleNextRun(true);
    }
    else {
        scheduleNextRun(false);
    }
}
function skip(counter, quiet) {
    if (!quiet)
        console.log(counter + ": Test skipped");
    scheduleNextRun(false);
}
function scheduleNextRun(giveUp) {
    if (!giveUp && nextItemIndex < workqueue.length) {
        setTimeout(runOneTestcase, 0);
    }
    else {
        printSummary();
        exetools_1.quitAsync();
    }
}
function ITE(msg) {
    console.log("Internal test error: " + msg);
    exetools_1.quitAsync();
}
function printSummary() {
    for (var i = 0; i < numCases.length; ++i) {
        if (numCases[i] === undefined)
            continue;
        //~ console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        //~ console.log("@                          @");
        //~ console.log("@     GROUP "+i+"               @");
        //~ console.log("@                          @");
        //~ console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        var s1 = "", s2 = "", s3 = "";
        if (i === 0) {
            s1 = "Total non-bonus tests:     ";
            s2 = "Total non-bonus tests OK:  ";
            s3 = "Total non-bonus tests bad: ";
        }
        else {
            s1 = "Bonus group " + i + ": Tests:      ";
            s2 = "Bonus group " + i + ": OK:         ";
            s3 = "Bonus group " + i + ": Bad:        ";
        }
        process.stderr.write(s1 + " " + numCases[i] + "\n");
        process.stderr.write(s2 + " " + numOK[i] + "   " + ((numOK[i] == numCases[i]) ? goodEmoji : badEmoji) + "\n");
        process.stderr.write(s3 + " " + numBad[i] + "\n");
    }
}
function runOneTestcase() {
    var testcase = workqueue[nextItemIndex++];
    var testcaseNumber = nextItemIndex; //after it's incremented, so first test is 1
    if (groupsThatCannotContinue[testcase.bonus]) {
        skip(testcaseNumber, true);
        return;
    }
    if (testcaseNumber < startAt) {
        skip(testcaseNumber, true);
        return;
    }
    console.log(SEP);
    console.log("Test " + nextItemIndex + " of " + workqueue.length);
    if (testcaseNumber > endAt) {
        skip(testcaseNumber, false);
        return;
    }
    unlink(asmfile);
    unlink(objfile);
    unlink(exefile);
    var input = testcase["code"];
    var syntaxOK = testcase["syntaxOK"];
    var expectedReturn = testcase["returns"];
    var expectedStdout = testcase["output"];
    var outputfiles = testcase["outputfiles"];
    var stdin = testcase["input"];
    var group = testcase["bonus"];
    if (syntaxOK === undefined)
        syntaxOK = true;
    if (expectedReturn === undefined)
        expectedReturn = DONT_CARE;
    if (expectedReturn === null)
        expectedReturn = NEVER_RETURN;
    if (expectedStdout === undefined)
        expectedStdout = "";
    if (outputfiles === undefined)
        outputfiles = [];
    if (group === undefined)
        group = 0;
    if (stdin === undefined)
        stdin = "";
    var actualReturn;
    var actualStdout = "";
    var asm;
    if (!group)
        group = 0;
    if (!syntaxOK && expectedReturn !== NEVER_RETURN && expectedReturn !== DONT_CARE) {
        ITE("syntaxOK=false but expectedReturn acts like it returns");
        return;
    }
    var printStatus = function () {
        console.log("------------------------------");
        console.log("Input:");
        nl(input);
        console.log("------------------------------");
        console.log("Assembly code:");
        try {
            var asmdata = fs.readFileSync(asmfile, "utf8");
            nl(asmdata);
        }
        catch (e) {
            console.log("(no assembly output file)");
        }
        console.log("------------------------------");
        console.log("Actual return code:  ", actualReturn);
        console.log("Expected return code:", expectedReturn);
        console.log("------------------------------");
        var exp;
        if (expectedStdout !== null)
            exp = expectedStdout.replace(/\n/g, NEWLINE);
        else
            exp = "<don't care>";
        console.log("Expected stdout: " + exp);
        console.log("Actual stdout:   " + actualStdout.replace(/\n/g, NEWLINE));
        console.log("------------------------------");
        outputfiles.forEach(function (spec) {
            var fname = spec[0];
            var econtents = spec[1];
            console.log("Output file: ", fname);
            console.log("Expected contents: " + econtents.replace(/\n/g, NEWLINE));
            if (!access(fname))
                console.log("Actual contents:   <missing>");
            else {
                var acontents = fs.readFileSync(fname, "utf8");
                console.log("Actual contents:   " + acontents.replace(/\n/g, NEWLINE));
            }
            console.log("------------------------------");
        });
    };
    function reportError(e) {
        console.log(e);
        printStatus();
        bad(group, testcaseNumber);
        return;
    }
    try {
        asm = parser_1.parse(input);
        if (!syntaxOK) {
            console.log("Accepted invalid input");
            console.log("------------------------------");
            console.log("Input:");
            nl(input);
            console.log("------------------------------");
            bad(group, testcaseNumber);
            return;
        }
    }
    catch (e) {
        console.log(e.message);
        if (!syntaxOK) {
            //OK; we expect this will not compile
            good(group, testcaseNumber);
            return;
        }
        else {
            //this should have compiled
            console.log(e);
            console.log("------------------------------");
            console.log("Input:");
            nl(input);
            console.log("------------------------------");
            bad(group, testcaseNumber);
            return;
        }
    }
    console.log("Parse OK");
    fs.writeFileSync(asmfile, asm);
    exetools_1.assembleAsync(asmfile, objfile, function (err) {
        if (err) {
            reportError("Assemble error: " + err);
            return;
        }
        console.log("Assemble OK");
        exetools_1.linkAsync(objfile, exefile, function (err) {
            if (err) {
                reportError("Link error: " + err);
                return;
            }
            console.log("Link OK");
            var ex = "." + path.sep + exefile;
            var opts = {
                stdio: ["pipe", "pipe", "inherit"],
                shell: false,
                timeout: 1000,
                input: (stdin ? stdin : "")
            };
            var rv;
            try {
                rv = subprocess.spawnSync(ex, [], opts);
            }
            catch (e) {
                rv = { error: e };
            }
            if (rv.error) {
                if (rv.error.errno === "ETIMEDOUT" || rv.error.code === "ETIMEDOUT")
                    actualReturn = NEVER_RETURN;
                else {
                    reportError(rv.error);
                    return;
                }
            }
            else if (rv.signal) {
                reportError("Program caught signal: " + rv.signal);
                return;
            }
            else {
                actualReturn = rv.status;
                if (actualReturn === null) {
                    ITE("Internal test error: " + rv);
                    return;
                }
            }
            if (rv.stdout && rv.stdout.length > 0)
                actualStdout = rv.stdout + "";
            if (actualStdout !== "")
                console.log(actualStdout);
            if (expectedReturn !== DONT_CARE && actualReturn !== expectedReturn) {
                reportError("Return value mismatch");
                return;
            }
            if (expectedStdout === null) {
                //don't care what stdout is
            }
            else {
                actualStdout = actualStdout.replace(/\r\n/g, "\n");
                var nowIndex = expectedStdout.indexOf("${now}");
                if (nowIndex !== -1) {
                    //make sure strings are identical up to point of date
                    for (var i_1 = 0; i_1 < nowIndex; ++i_1) {
                        if (actualStdout[i_1] !== expectedStdout[i_1]) {
                            reportError("Stdout mismatch");
                            return;
                        }
                    }
                    var i = actualStdout.indexOf("\n", nowIndex);
                    if (i === -1)
                        i = actualStdout.length;
                    var date1 = Date.parse(actualStdout.substring(nowIndex, i));
                    var actualRest = actualStdout.substring(i);
                    var date2 = Date.now();
                    var delta = Math.abs(date1 - date2);
                    if (delta > 5000) {
                        reportError("Stdout mismatch: dates: " + date1 + " and " + date2);
                        return;
                    }
                    console.log("Note: Dates matched with delta of " + delta + " (now=" + new Date() + ")");
                    var expectedRest = expectedStdout.substring(nowIndex + "${now}".length);
                    if (actualRest !== expectedRest) {
                        reportError("Stdout mismatch");
                        return;
                    }
                }
                else {
                    if (actualStdout !== expectedStdout) {
                        reportError("Stdout mismatch");
                        return;
                    }
                }
            }
            if (outputfiles) {
                outputfiles.forEach(function (spec) {
                    var fname = spec[0];
                    var econtents = spec[1];
                    if (!access(fname)) {
                        reportError("Expected to find output file " + fname + " but did not");
                        return;
                    }
                    var acontents = fs.readFileSync(fname, "utf8");
                    if (econtents !== acontents) {
                        reportError("File mismatch");
                        return;
                    }
                });
            }
            if (VERBOSE)
                printStatus();
            good(group, testcaseNumber);
            return;
        });
    });
}
function main() {
    var inputfile = "inputs.json";
    var indata = fs.readFileSync(inputfile, "utf8");
    indata = indata.replace(/\r\n/g, "\n");
    indata = indata.replace(/''((.|\n)*?)''/g, function (x) {
        x = x.substr(3);
        x = x.substr(0, x.length - 3);
        x = x.replace(/\\/g, "\\\\");
        x = x.replace(/\n/g, "\\n");
        x = x.replace(/"/g, '\\"');
        x = '"' + x + '"';
        return x;
    });
    //quick syntax check on 'indata'
    try {
        JSON.parse(indata);
    }
    catch (e) {
        var tmp = indata.split("\n");
        var total = 0;
        for (var i = 0; i < tmp.length; ++i) {
            console.log(fmt(total) + " - " + tmp[i]);
            total += tmp[i].length + 1;
        }
        throw (e);
    }
    //now parse it for real
    var inputs = JSON.parse(indata);
    var cases = [];
    inputs.forEach(function (testcase) {
        var bonus = testcase["bonus"];
        if (!bonus)
            bonus = 0; //not a bonus
        testcase["bonus"] = bonus; //convert null or undefined or false to zero
        if (cases[bonus] === undefined) {
            cases[bonus] = [];
            numCases[bonus] = 0;
            numOK[bonus] = 0;
            numBad[bonus] = 0;
        }
        cases[bonus].push(testcase);
        numCases[bonus]++;
    });
    for (var i = 0; i < cases.length; ++i) {
        if (cases[i]) {
            cases[i].forEach(function (testcase) {
                workqueue.push(testcase);
            });
        }
    }
    runOneTestcase();
}
if (require.main === module) {
    if (process.argv.length === 4) {
        startAt = parseInt(process.argv[2], 10);
        endAt = parseInt(process.argv[3], 10);
        console.log("Starting at", startAt, "and ending at", endAt);
        main();
    }
    else if (process.argv.length === 3) {
        var input = fs.readFileSync(process.argv[2]);
        var asm = parser_1.parse(input);
        fs.writeFileSync(asmfile, asm);
        exetools_1.assemble(asmfile, objfile);
        exetools_1.link(objfile, exefile);
        console.log("Executable is in", exefile);
    }
    else {
        main();
    }
}
//# sourceMappingURL=testharness.js.map