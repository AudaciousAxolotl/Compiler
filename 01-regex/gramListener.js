// Generated from gram.txt by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by gramParser.
function gramListener() {
	antlr4.tree.ParseTreeListener.call(this);
	return this;
}

gramListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
gramListener.prototype.constructor = gramListener;

// Enter a parse tree produced by gramParser#program.
gramListener.prototype.enterProgram = function(ctx) {
};

// Exit a parse tree produced by gramParser#program.
gramListener.prototype.exitProgram = function(ctx) {
};


// Enter a parse tree produced by gramParser#stmts.
gramListener.prototype.enterStmts = function(ctx) {
};

// Exit a parse tree produced by gramParser#stmts.
gramListener.prototype.exitStmts = function(ctx) {
};


// Enter a parse tree produced by gramParser#stmt.
gramListener.prototype.enterStmt = function(ctx) {
};

// Exit a parse tree produced by gramParser#stmt.
gramListener.prototype.exitStmt = function(ctx) {
};


// Enter a parse tree produced by gramParser#loop.
gramListener.prototype.enterLoop = function(ctx) {
};

// Exit a parse tree produced by gramParser#loop.
gramListener.prototype.exitLoop = function(ctx) {
};


// Enter a parse tree produced by gramParser#cond.
gramListener.prototype.enterCond = function(ctx) {
};

// Exit a parse tree produced by gramParser#cond.
gramListener.prototype.exitCond = function(ctx) {
};


// Enter a parse tree produced by gramParser#braceblock.
gramListener.prototype.enterBraceblock = function(ctx) {
};

// Exit a parse tree produced by gramParser#braceblock.
gramListener.prototype.exitBraceblock = function(ctx) {
};


// Enter a parse tree produced by gramParser#return_stmt.
gramListener.prototype.enterReturn_stmt = function(ctx) {
};

// Exit a parse tree produced by gramParser#return_stmt.
gramListener.prototype.exitReturn_stmt = function(ctx) {
};


// Enter a parse tree produced by gramParser#expr.
gramListener.prototype.enterExpr = function(ctx) {
};

// Exit a parse tree produced by gramParser#expr.
gramListener.prototype.exitExpr = function(ctx) {
};


// Enter a parse tree produced by gramParser#orexp.
gramListener.prototype.enterOrexp = function(ctx) {
};

// Exit a parse tree produced by gramParser#orexp.
gramListener.prototype.exitOrexp = function(ctx) {
};


// Enter a parse tree produced by gramParser#andexp.
gramListener.prototype.enterAndexp = function(ctx) {
};

// Exit a parse tree produced by gramParser#andexp.
gramListener.prototype.exitAndexp = function(ctx) {
};


// Enter a parse tree produced by gramParser#notexp.
gramListener.prototype.enterNotexp = function(ctx) {
};

// Exit a parse tree produced by gramParser#notexp.
gramListener.prototype.exitNotexp = function(ctx) {
};


// Enter a parse tree produced by gramParser#rel.
gramListener.prototype.enterRel = function(ctx) {
};

// Exit a parse tree produced by gramParser#rel.
gramListener.prototype.exitRel = function(ctx) {
};


// Enter a parse tree produced by gramParser#sum.
gramListener.prototype.enterSum = function(ctx) {
};

// Exit a parse tree produced by gramParser#sum.
gramListener.prototype.exitSum = function(ctx) {
};


// Enter a parse tree produced by gramParser#term.
gramListener.prototype.enterTerm = function(ctx) {
};

// Exit a parse tree produced by gramParser#term.
gramListener.prototype.exitTerm = function(ctx) {
};


// Enter a parse tree produced by gramParser#neg.
gramListener.prototype.enterNeg = function(ctx) {
};

// Exit a parse tree produced by gramParser#neg.
gramListener.prototype.exitNeg = function(ctx) {
};


// Enter a parse tree produced by gramParser#factor.
gramListener.prototype.enterFactor = function(ctx) {
};

// Exit a parse tree produced by gramParser#factor.
gramListener.prototype.exitFactor = function(ctx) {
};


// Enter a parse tree produced by gramParser#var_decl_list.
gramListener.prototype.enterVar_decl_list = function(ctx) {
};

// Exit a parse tree produced by gramParser#var_decl_list.
gramListener.prototype.exitVar_decl_list = function(ctx) {
};


// Enter a parse tree produced by gramParser#var_decl.
gramListener.prototype.enterVar_decl = function(ctx) {
};

// Exit a parse tree produced by gramParser#var_decl.
gramListener.prototype.exitVar_decl = function(ctx) {
};


// Enter a parse tree produced by gramParser#assign.
gramListener.prototype.enterAssign = function(ctx) {
};

// Exit a parse tree produced by gramParser#assign.
gramListener.prototype.exitAssign = function(ctx) {
};


// Enter a parse tree produced by gramParser#func_call.
gramListener.prototype.enterFunc_call = function(ctx) {
};

// Exit a parse tree produced by gramParser#func_call.
gramListener.prototype.exitFunc_call = function(ctx) {
};


// Enter a parse tree produced by gramParser#user_func_call.
gramListener.prototype.enterUser_func_call = function(ctx) {
};

// Exit a parse tree produced by gramParser#user_func_call.
gramListener.prototype.exitUser_func_call = function(ctx) {
};


// Enter a parse tree produced by gramParser#optional_exprlist.
gramListener.prototype.enterOptional_exprlist = function(ctx) {
};

// Exit a parse tree produced by gramParser#optional_exprlist.
gramListener.prototype.exitOptional_exprlist = function(ctx) {
};


// Enter a parse tree produced by gramParser#exprlist.
gramListener.prototype.enterExprlist = function(ctx) {
};

// Exit a parse tree produced by gramParser#exprlist.
gramListener.prototype.exitExprlist = function(ctx) {
};


// Enter a parse tree produced by gramParser#builtin_func_call.
gramListener.prototype.enterBuiltin_func_call = function(ctx) {
};

// Exit a parse tree produced by gramParser#builtin_func_call.
gramListener.prototype.exitBuiltin_func_call = function(ctx) {
};



exports.gramListener = gramListener;