"use strict";
exports.__esModule = true;
var Token_1 = require("./Token");
var antlr4 = require('./antlr4');
var Lexer = require('./gramLexer.js').gramLexer;
var Parser = require('./gramParser.js').gramParser;
var asmCode = "";
var labelCounter = 0; //made this in asm1
var VarType;
(function (VarType) {
    VarType[VarType["INTEGER"] = 0] = "INTEGER";
})(VarType = exports.VarType || (exports.VarType = {}));
var ErrorHandler = /** @class */ (function () {
    function ErrorHandler() {
    }
    ErrorHandler.prototype.syntaxError = function (rec, sym, line, column, msg, e) {
        console.log("Syntax error:", msg, "on line", line, "at column", column);
        throw new Error("Syntax error in ANTLR parse");
    };
    return ErrorHandler;
}());
//asm1
//asmexpr
function factorNodeCode(n) {
    //factor -> NUM | LP expr RP
    var child = n.children[0];
    switch (child.sym) {
        case "NUM":
            var v = parseInt(child.token.lexeme, 10); //the fact we can give the option for other types makes the bonus impossible
            emit("push qword " + v); //because we can't tell what the type is
            return VarType.INTEGER; //synth
        case "LP":
            return exprNodeCode(n.children[1]);
        default:
            ICE(); //compiler made a boo boo if we hit this. If i get something that isn't a number or paranth, I did something wrong.
    }
}
function convertStackTopToZeroOrOneInteger(type) {
    if (type == VarType.INTEGER) {
        emit("cmp qword [rsp], 0");
        emit("setne al");
        emit("movzx rax, al");
        emit("mov [rsp], rax");
    }
    else {
        throw new Error("What you got some wet code, convertStackTopToZero function called this");
    }
}
function exprNodeCode(n) {
    return orexpNodeCode(n.children[0]);
}
function orexpNodeCode(n) {
    //orexp -> orexp OR andexp | andexp
    if (n.children.length === 1)
        return andexpNodeCode(n.children[0]);
    else {
        var orexpType = orexpNodeCode(n.children[0]);
        convertStackTopToZeroOrOneInteger(orexpType);
        var lbl = label();
        emit("cmp qword [rsp], 0");
        emit("jne " + lbl);
        emit("add rsp,8"); //discard left result (0)
        var andexpType = andexpNodeCode(n.children[2]);
        convertStackTopToZeroOrOneInteger(andexpType);
        emit(lbl + ":");
        return VarType.INTEGER; //always integer, even if float operands
    }
}
function andexpNodeCode(n) {
    //andexp AND notexp | notexp
    if (n.children.length === 1)
        return notexpNodeCode(n.children[0]);
    else {
        var andexpType = andexpNodeCode(n.children[0]);
        convertStackTopToZeroOrOneInteger(andexpType);
        var lbl = label();
        emit("cmp qword [rsp], 0");
        emit("je " + lbl);
        emit("add rsp,8"); //discard left result (0)
        var notexpType = notexpNodeCode(n.children[2]);
        convertStackTopToZeroOrOneInteger(notexpType);
        emit(lbl + ":");
        return VarType.INTEGER; //always integer, even if float operands
    }
}
function notexpNodeCode(n) {
    if (n.children.length === 1)
        return relexpNodeCode(n.children[0]);
    else {
        var notexpType = notexpNodeCode(n.children[1]);
        convertStackTopToZeroOrOneInteger(notexpType);
        var lbl = label();
        var lbl2 = label();
        emit("cmp qword [rsp], 0"); //if this is true, then we'll push a 1 to the stack. We want to change it to be the opposite of what it does
        emit("je " + lbl); //If it's true, we want to push a 1 to the stack
        //we want to push a zero to the stack instead if we reach here
        emit("add rsp, 8");
        emit("push 0");
        emit("jmp " + lbl2);
        emit(lbl + ":");
        emit("add rsp, 8");
        emit("push 1");
        emit(lbl2 + ":");
        return VarType.INTEGER;
    }
}
function relexpNodeCode(n) {
    //rel |rarr| sum RELOP sum | sum
    if (n.children.length === 1)
        return sumNodeCode(n.children[0]);
    else {
        var sum1Type = sumNodeCode(n.children[0]);
        var sum2Type = sumNodeCode(n.children[2]);
        if (sum1Type !== VarType.INTEGER || sum2Type != VarType.INTEGER)
            throw new Error("Poo poo stinky on your relative expression");
        emit("pop rax"); //second operand
        //first operand is on stack
        emit("cmp [rsp],rax"); //do the compare
        switch (n.children[1].token.lexeme) {
            case ">=":
                emit("setge al");
                break;
            case "<=":
                emit("setle al");
                break;
            case ">":
                emit("setg  al");
                break;
            case "<":
                emit("setl  al");
                break;
            case "==":
                emit("sete  al");
                break;
            case "!=":
                emit("setne al");
                break;
            default: ICE();
        }
        emit("movzx qword rax, al"); //move with zero extend
        emit("mov [rsp], rax");
        return VarType.INTEGER;
    }
}
function sumNodeCode(n) {
    //sum -> sum PLUS term | sum MINUS term | term
    console.log(n.children.length);
    console.log(n.children);
    if (n.children.length === 1)
        return termNodeCode(n.children[0]);
    else {
        //...more code...
        var sumType = sumNodeCode(n.children[0]);
        var termType = termNodeCode(n.children[2]);
        if (sumType !== VarType.INTEGER || termType != VarType.INTEGER) {
            throw new Error("Your summation or term is not an integer");
        }
        emit("pop rbx"); //second operand
        emit("pop rax"); //first operand
        switch (n.children[1].sym) {
            case "PLUS":
                emit("add rax, rbx");
                break;
            case "MINUS":
                emit("sub rax, rbx");
                break;
            default:
                ICE();
        }
        emit("push rax");
        return VarType.INTEGER;
    }
}
function termNodeCode(n) {
    if (n.children.length === 1)
        return negNodeCode(n.children[0]);
    else {
        //...more code...
        var termType = termNodeCode(n.children[0]);
        var negType = negNodeCode(n.children[2]);
        if (termType !== VarType.INTEGER || negType != VarType.INTEGER) {
            throw new Error("Your summation or term is not an integer");
        }
        emit("pop rbx"); //second operand
        emit("pop rax"); //first operand
        emit("mov rdx, 0");
        switch (n.children[1].token.lexeme) {
            case "*":
                emit("imul rbx");
                break;
            case "%":
                emit("idiv rbx");
                emit("mov rax, rdx");
                break;
            case "/":
                emit("idiv rbx");
                break;
            default:
                ICE();
        }
        emit("push rax");
        return VarType.INTEGER;
    }
}
function negNodeCode(n) {
    if (n.children.length === 1)
        return factorNodeCode(n.children[0]);
    else {
        var negType = negNodeCode(n.children[1]);
        if (negType != VarType.INTEGER) {
            throw new Error("you no negate a intenger, you negate" + negType);
        }
        emit("pop rax");
        emit("neg rax");
        emit("push rax");
        return VarType.INTEGER;
    }
}
function ICE() {
    throw new Error("ICE is here to take away your mexicans");
}
function makeAsm(root) {
    asmCode = "";
    labelCounter = 0;
    emit("default rel");
    emit("section .text");
    emit("global main");
    emit("main:");
    programNodeCode(root);
    emit("ret");
    emit("section .data");
    return asmCode + "\n";
}
function emit(instr) {
    asmCode += instr;
    asmCode += "\n";
}
function programNodeCode(n) {
    //program -> braceblock
    if (n.sym != "program")
        ICE();
    braceblockNodeCode(n.children[1]);
}
function braceblockNodeCode(n) {
    //braceblock -> LBR stmts RBR
    stmtsNodeCode(n.children[1]);
}
function stmtsNodeCode(n) {
    //stmts -> stmt stmts | lambda
    console.log(n.children);
    if (n.children.length == 0)
        return;
    stmtNodeCode(n.children[0]);
    stmtsNodeCode(n.children[1]);
}
function label() {
    var s = "lbl" + labelCounter;
    labelCounter++;
    return s;
}
function loopNodeCode(n) {
    //poopy stinky baby
    //loop -> WHILE LP expr RP bblock
    //Want to have something to keep track of the beginner of the loop
    var startofLoopLabel = label();
    emit(startofLoopLabel + ":");
    exprNodeCode(n.children[2]);
    var endloopLabel = label();
    emit("pop rax");
    emit("cmp rax, 0");
    emit("je " + endloopLabel);
    braceblockNodeCode(n.children[4]);
    emit("jmp " + startofLoopLabel);
    emit(endloopLabel + ":");
}
function condNodeCode(n) {
    //cond -> IF LP expr RP braceblock |
    //  IF LP expr RP braceblock ELSE braceblock
    if (n.children.length === 5) {
        //no 'else'
        exprNodeCode(n.children[2]); //leaves result in rax
        emit("pop rax");
        emit("cmp rax, 0");
        var endifLabel = label();
        emit("je " + endifLabel);
        braceblockNodeCode(n.children[4]);
        emit(endifLabel + ":");
    }
    else {
        exprNodeCode(n.children[2]); //leaves result in rax
        emit("pop rax");
        emit("cmp rax, 0");
        var elseLabel = label();
        var endifLabel = label();
        emit("je " + elseLabel);
        braceblockNodeCode(n.children[4]);
        emit("jmp " + endifLabel);
        emit(elseLabel + ":");
        braceblockNodeCode(n.children[6]);
        emit(endifLabel + ":");
    }
}
function stmtNodeCode(n) {
    //stmt -> cond | loop | return-stmt SEMI
    var c = n.children[0];
    switch (c.sym) {
        case "cond":
            condNodeCode(c);
            break;
        case "loop":
            loopNodeCode(c);
            break;
        case "return_stmt":
            console.log("poopooshit");
            returnstmtNodeCode(c);
            break;
        default:
            ICE();
    }
}
function returnstmtNodeCode(n) {
    //return-stmt -> RETURN expr
    exprNodeCode(n.children[1]);
    emit("pop rax"); //exprsn
    emit("ret"); //expr
}
//end asm1
var TreeNode = /** @class */ (function () {
    function TreeNode(sym, token) {
        this.sym = sym;
        this.token = token;
        this.children = [];
    }
    // addChild(node : TreeNode){
    //     this.children.push(node);
    // }
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
    var antlrroot = parser.program();
    var root = walk(parser, antlrroot);
    return makeAsm(root);
}
exports.parse = parse;
//# sourceMappingURL=parser.js.map