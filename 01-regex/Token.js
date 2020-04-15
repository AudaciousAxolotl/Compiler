"use strict";
exports.__esModule = true;
var Token = /** @class */ (function () {
    function Token(sym, line, lexeme) {
        this.sym = sym;
        this.line = line;
        this.lexeme = lexeme;
    }
    Token.prototype.toString = function () {
        return this.sym + " " + this.line + " " + this.lexeme;
    };
    return Token;
}());
exports.Token = Token;
//# sourceMappingURL=Token.js.map