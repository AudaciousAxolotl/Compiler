import {Token} from './Token'

declare var require:any;
let antlr4 = require('./antlr4')
let Lexer = require('./gramLexer.js').gramLexer;
let Parser = require('./gramParser.js').gramParser
let asmCode : string = "";
let labelCounter = 0; //made this in asm1

class ErrorHandler{
    syntaxError(rec:any, sym:any, line:number,
                column:number,msg:string,e:any){
        console.log("Syntax error:",msg,"on line",line,
                    "at column",column);
        throw new Error("Syntax error in ANTLR parse");
    }
}
//asm1

function ICE(){
    throw new Error("ICE is here to take away your mexicans");
}
function makeAsm( root: TreeNode ){
    asmCode = "";
    labelCounter = 0;
    emit("default rel");
    emit("section .text");
    emit("global main");
    emit("main:");
    programNodeCode(root);
    emit("ret");
    emit("section .data");
    return asmCode+"\n";
}

function emit( instr: string ){
    asmCode+=instr;
    asmCode+="\n";
}

function exprNodeCode(n: TreeNode){
    //expr -> NUM
    let d = parseInt( n.children[0].token.lexeme, 10 );
    emit( `mov rax, ${d}` );
}


function programNodeCode(n: TreeNode) {
    //program -> braceblock
    if( n.sym != "program" )
        ICE();
    braceblockNodeCode( n.children[1] );
}

function braceblockNodeCode(n: TreeNode){
    //braceblock -> LBR stmts RBR
    stmtsNodeCode(n.children[1]);
}

function stmtsNodeCode(n: TreeNode){
    //stmts -> stmt stmts | lambda
    console.log(n.children.length);
    if( n.children.length == 0 )
        return;
    stmtNodeCode(n.children[0]);
    stmtsNodeCode(n.children[1]);
}



function label(){
    let s = "lbl"+labelCounter;
    labelCounter++;
    return s;
}//<3

function loopNodeCode(n: TreeNode){
    //poopy stinky baby
    //loop -> WHILE LP expr RP bblock
    //Want to have something to keep track of the beginner of the loop
    var startofLoopLabel = label();
    emit(`${startofLoopLabel}:`);
    exprNodeCode(n.children[2]);
    var endloopLabel = label();
    emit("cmp rax, 0");
    emit(`je ${endloopLabel}`);
    braceblockNodeCode(n.children[4]);
    emit(`jmp ${startofLoopLabel}`);
    emit(`${endloopLabel}:`);
    

}

function condNodeCode(n: TreeNode){
    //cond -> IF LP expr RP braceblock |
    //  IF LP expr RP braceblock ELSE braceblock
    if( n.children.length === 5 ){
        //no 'else'
        exprNodeCode(n.children[2]);    //leaves result in rax
        emit("cmp rax, 0");
        var endifLabel = label();
        emit(`je ${endifLabel}`);
        braceblockNodeCode(n.children[4]);
        emit(`${endifLabel}:`);
    } else {
        exprNodeCode(n.children[2]);    //leaves result in rax
        emit("cmp rax, 0");
        var elseLabel = label();
        var endifLabel = label();
        emit(`je ${elseLabel}`);
        braceblockNodeCode(n.children[4]);
        emit(`jmp ${endifLabel}`);
        emit(`${elseLabel}:`);
        braceblockNodeCode(n.children[6]);
        emit(`${endifLabel}:`);
    }
}


function stmtNodeCode(n: TreeNode){
    //stmt -> cond | loop | return-stmt SEMI
    let c = n.children[0];
    switch( c.sym ){
        case "cond":
            condNodeCode(c); break;
        case "loop":
            loopNodeCode(c); break;
        case "return_stmt":
            console.log("poopooshit");
            returnstmtNodeCode(c); break;
        default:
            ICE();
    }
}

function returnstmtNodeCode(n: TreeNode){
    //return-stmt -> RETURN expr
    exprNodeCode( n.children[1] );
    //...move result from expr to rax...
    emit("ret");
}
//end asm1



class TreeNode{
    sym: string;
    token: Token;
    children: TreeNode[];
    constructor(sym: string,token: Token){
        this.sym=sym;
        this.token=token;
        this.children=[];
    }

    // addChild(node : TreeNode){
    //     this.children.push(node);
    // }

    toString(){
        function walk(n: any, callback: any){
            callback(n);
            n.children.forEach( (x:any) => {
                walk(x,callback);
            });
        }
        let L:string[] = [];
        L.push("digraph d{");
        L.push(`node [fontname="Helvetica",shape=box];`);
        let counter=0;
        walk(this, (n:any) => {
            n.NUMBER = "n"+(counter++);
            let tmp = n.sym;
            if( n.token ){
                tmp += "\n";
                tmp += n.token.lexeme;
            }
            tmp = tmp.replace(/&/g,"&amp;");
            tmp = tmp.replace(/</g,"&lt;");
            tmp = tmp.replace(/>/g,"&gt;");
            tmp = tmp.replace(/\n/g,"<br/>");
    
            L.push( `${n.NUMBER} [label=<${tmp}>];`);
        });
        walk(this, (n:any) => {
            n.children.forEach( (x:any) => {
                L.push( `${n.NUMBER} -> ${x.NUMBER};` );
            });
        });
        L.push("}");
        return L.join("\n");
    }
}

function walk(parser: any, node: any){
    let p: any = node.getPayload();
    if( p.ruleIndex === undefined ){
        let line: number = p.line;
        let lexeme: string = p.text;
        let ty: number = p.type;
        let sym: string = parser.symbolicNames[ty]
        if(sym === null )
            sym = lexeme.toUpperCase();
        let T = new Token( sym,line,lexeme )
        return new TreeNode( sym,T )
    } else {
        let idx: number = p.ruleIndex;
        let sym: string = parser.ruleNames[idx]
        let N = new TreeNode( sym, undefined )
        for(let i=0;i<node.getChildCount();++i){
            let child: any = node.getChild(i)
            N.children.push( walk( parser, child) );
        }
        return N;
    }
}

export function parse(txt: string) {

    let stream = new antlr4.InputStream(txt);
    let lexer = new Lexer(stream);
    let tokens = new antlr4.CommonTokenStream(lexer);
    let parser = new Parser(tokens);
    parser.buildParseTrees = true;

    let handler = new ErrorHandler();
    lexer.removeErrorListeners();
    lexer.addErrorListener( handler );
    parser.removeErrorListeners()
    parser.addErrorListener( handler );
    //this assumes your start symbol is 'start'
    let antlrroot = parser.program();
    let root : TreeNode = walk(parser,antlrroot);
    return makeAsm(root);
}