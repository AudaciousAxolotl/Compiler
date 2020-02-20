"use strict";
exports.__esModule = true;
var Token = /** @class */ (function () {
    function Token(sym, lexeme, line) {
        this.sym = sym;
        this.lexeme = lexeme;
        this.line = line;
    }
    Token.prototype.toString = function () {
        var sym = this.sym.padStart(20, ' ');
        var line = "" + this.line;
        line = line.padEnd(4, ' ');
        return "[" + sym + " " + line + " " + this.lexeme + "]";
    };
    return Token;
}());
exports.Token = Token;
//# sourceMappingURL=Token.js.map