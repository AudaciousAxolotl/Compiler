"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
var Token_1 = require("./Token");
var Tokenizer = /** @class */ (function () {
    function Tokenizer(grammar) {
        this.grammar = grammar;
        this.previous = undefined;
        this.cur = undefined;
    }
    Tokenizer.prototype.setInput = function (inputData) {
        // ...prepare for new parse...
        this.inputData = inputData;
        this.currentLine = 1;
        this.idx = 0;
        console.log("starting new: " + inputData);
    };
    Tokenizer.prototype.next = function () {
        var e_1, _a;
        if (this.idx >= this.inputData.length - 1) {
            return new Token_1.Token("$", undefined, this.currentLine);
        }
        try {
            // ...return next token...
            // ...advance this.idx...
            // ...adjust this.currentLine...
            for (var _b = __values(this.grammar.mappy.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var k = _c.value;
                console.log("k is " + k);
                var e = this.grammar.mappy.get(k);
                console.log("e is " + e);
                e.lastIndex = this.idx;
                var m = e.exec(this.inputData);
                if (m != undefined) {
                    var lexy = m[0];
                    console.log(lexy);
                    console.log("with key " + k);
                    this.idx += lexy.length;
                    //the proper newline
                    var t = this.currentLine;
                    var pe = lexy.split('\n');
                    this.currentLine += pe.length - 1;
                    if (k != 'WHITESPACE' && k != 'COMMENT') {
                        var token = new Token_1.Token(k, lexy, t);
                        this.previous = this.cur;
                        this.cur = token;
                        return token;
                    }
                    else {
                        return this.next();
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        throw new Error("no matchy was foundy for" + this.inputData.substr(this.idx) + " at line " + this.currentLine);
    };
    return Tokenizer;
}());
exports.Tokenizer = Tokenizer;
//# sourceMappingURL=Tokenizer.js.map