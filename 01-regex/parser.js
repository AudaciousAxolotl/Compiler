"use strict";
exports.__esModule = true;
var Token_1 = require("./Token");
var antlr4 = require('./antlr4');
var Lexer = require('./gramLexer.js').gramLexer;
var Parser = require('./gramParser.js').gramParser;
var ErrorHandler = /** @class */ (function () {
    function ErrorHandler() {
    }
    ErrorHandler.prototype.syntaxError = function (rec, sym, line, column, msg, e) {
        console.log("Syntax error:", msg, "on line", line, "at column", column);
        throw new Error("Syntax error in ANTLR parse");
    };
    return ErrorHandler;
}());
var TreeNode = /** @class */ (function () {
    function TreeNode(sym, token) {
        this.sym = sym;
        this.token = token;
        this.children = [];
    }
    TreeNode.prototype.toString = function () {
        function walk(n, callback) {
            callback(n);
            n.children.forEach(function (x) {
                walk(x, callback);
            });
        }
        var L = [];
        L.push("digraph d{");
        L.push("node [fontname=\"Helvetica\",shape=box];");
        var counter = 0;
        walk(this, function (n) {
            n.NUMBER = "n" + (counter++);
            var tmp = n.sym;
            if (n.token) {
                tmp += "\n";
                tmp += n.token.lexeme;
            }
            tmp = tmp.replace(/&/g, "&amp;");
            tmp = tmp.replace(/</g, "&lt;");
            tmp = tmp.replace(/>/g, "&gt;");
            tmp = tmp.replace(/\n/g, "<br/>");
            L.push(n.NUMBER + " [label=<" + tmp + ">];");
        });
        walk(this, function (n) {
            n.children.forEach(function (x) {
                L.push(n.NUMBER + " -> " + x.NUMBER + ";");
            });
        });
        L.push("}");
        return L.join("\n");
    };
    return TreeNode;
}());
function walk(parser, node) {
    var p = node.getPayload();
    if (p.ruleIndex === undefined) {
        var line = p.line;
        var lexeme = p.text;
        var ty = p.type;
        var sym = parser.symbolicNames[ty];
        if (sym === null)
            sym = lexeme.toUpperCase();
        var T = new Token_1.Token(sym, line, lexeme);
        return new TreeNode(sym, T);
    }
    else {
        var idx = p.ruleIndex;
        var sym = parser.ruleNames[idx];
        var N = new TreeNode(sym, undefined);
        for (var i = 0; i < node.getChildCount(); ++i) {
            var child = node.getChild(i);
            N.children.push(walk(parser, child));
        }
        return N;
    }
}
function parse(txt) {
    var stream = new antlr4.InputStream(txt);
    var lexer = new Lexer(stream);
    var tokens = new antlr4.CommonTokenStream(lexer);
    var parser = new Parser(tokens);
    parser.buildParseTrees = true;
    var handler = new ErrorHandler();
    lexer.removeErrorListeners();
    lexer.addErrorListener(handler);
    parser.removeErrorListeners();
    parser.addErrorListener(handler);
    //this assumes your start symbol is 'start'
    var antlrroot = parser.start();
    var root = walk(parser, antlrroot);
    return root.children[0];
}
exports.parse = parse;
//# sourceMappingURL=parser.js.map