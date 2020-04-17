import {Token} from './Token'

declare var require:any;
let antlr4 = require('./antlr4')
let Lexer = require('./gramLexer.js').gramLexer;
let Parser = require('./gramParser.js').gramParser
let asmCode : string = "";
let labelCounter = 0; //made this in asm1

export enum VarType{
        INTEGER,
}

class ErrorHandler{
    syntaxError(rec:any, sym:any, line:number,
                column:number,msg:string,e:any){
        console.log("Syntax error:",msg,"on line",line,
                    "at column",column);
        throw new Error("Syntax error in ANTLR parse");
    }
}
//asm1

//asmexpr
function factorNodeCode( n: TreeNode) : VarType{
    //factor -> NUM | LP expr RP
    let child = n.children[0];
    switch( child.sym ){
        case "NUM":
            let v = parseInt( child.token.lexeme, 10 ); //the fact we can give the option for other types makes the bonus impossible
            emit(`push qword ${v}`)                         //because we can't tell what the type is
            return VarType.INTEGER; //synth
        case "LP":
            return exprNodeCode( n.children[1] );
        default:
            ICE(); //compiler made a boo boo if we hit this. If i get something that isn't a number or paranth, I did something wrong.
    }
}


function convertStackTopToZeroOrOneInteger(type: VarType){
    if( type == VarType.INTEGER ){
        emit("cmp qword [rsp], 0");
        emit("setne al");
        emit("movzx rax, al");
        emit("mov [rsp], rax");
    } else {
        throw new Error("What you got some wet code, convertStackTopToZero function called this");
    }
}

function exprNodeCode(n: TreeNode ) : VarType{
    return orexpNodeCode(n.children[0]);
}

function orexpNodeCode(n: TreeNode ): VarType{
    //orexp -> orexp OR andexp | andexp
    if( n.children.length === 1 )
        return andexpNodeCode(n.children[0]);
    else {
        let orexpType = orexpNodeCode( n.children[0] );
        convertStackTopToZeroOrOneInteger(orexpType);

        let lbl = label();
        emit("cmp qword [rsp], 0");
        emit(`jne ${lbl}`);
        emit("add rsp,8");      //discard left result (0)
        let andexpType = andexpNodeCode( n.children[2] );
        convertStackTopToZeroOrOneInteger(andexpType);
        emit(`${lbl}:`);
        return VarType.INTEGER;   //always integer, even if float operands
    }
}

function andexpNodeCode(n: TreeNode ) : VarType{
    //andexp AND notexp | notexp
    if( n.children.length === 1 )
        return notexpNodeCode(n.children[0]);
    else {
        let andexpType = andexpNodeCode( n.children[0] );
        convertStackTopToZeroOrOneInteger(andexpType);

        let lbl = label();
        emit("cmp qword [rsp], 0");
        emit(`je ${lbl}`);
        emit("add rsp,8");      //discard left result (0)
        let notexpType = notexpNodeCode( n.children[2] );
        convertStackTopToZeroOrOneInteger(notexpType);
        emit(`${lbl}:`);
        return VarType.INTEGER;   //always integer, even if float operands
    }
}

function notexpNodeCode(n: TreeNode ) : VarType{
    if(n.children.length === 1)
        return relexpNodeCode(n.children[0]);
    else {
        let notexpType = notexpNodeCode( n.children[1] );
        convertStackTopToZeroOrOneInteger(notexpType);

        let lbl = label();
        let lbl2 = label();
        emit("cmp qword [rsp], 0"); //if this is true, then we'll push a 1 to the stack. We want to change it to be the opposite of what it does
        emit(`je ${lbl}`); //If it's true, we want to push a 1 to the stack
        //we want to push a zero to the stack instead if we reach here
        emit("add rsp, 8");
        emit("push 0");
        emit(`jmp ${lbl2}`);
        emit(`${lbl}:`);
        emit("add rsp, 8");
        emit("push 1");
        emit(`${lbl2}:`);
        return VarType.INTEGER;
    
    }   

}

function relexpNodeCode(n: TreeNode ): VarType {
    //rel |rarr| sum RELOP sum | sum
    if( n.children.length === 1 )
        return sumNodeCode( n.children[0] );
    else {
        let sum1Type = sumNodeCode( n.children[0] );
        let sum2Type = sumNodeCode( n.children[2] );
        if( sum1Type !== VarType.INTEGER || sum2Type != VarType.INTEGER )
            throw new Error("Poo poo stinky on your relative expression");
        emit("pop rax");    //second operand
        //first operand is on stack
        emit("cmp [rsp],rax");    //do the compare
        switch( n.children[1].token.lexeme ){
            case ">=":   emit("setge al"); break;
            case "<=":   emit("setle al"); break;
            case ">":    emit("setg  al"); break;
            case "<":    emit("setl  al"); break;
            case "==":   emit("sete  al"); break;
            case "!=":   emit("setne al"); break;
            default:     ICE()
        }
        emit("movzx qword rax, al");   //move with zero extend
        emit("mov [rsp], rax");
        return VarType.INTEGER;
    }
}

function sumNodeCode(n: TreeNode ): VarType {
    //sum -> sum PLUS term | sum MINUS term | term
    console.log(n.children.length);
    console.log(n.children);
    if( n.children.length === 1 )
        return termNodeCode(n.children[0]);
    else{
        //...more code...
        let sumType = sumNodeCode( n.children[0] );
        let termType = termNodeCode( n.children[2] );
        if( sumType !== VarType.INTEGER || termType != VarType.INTEGER ){
            throw new Error("Your summation or term is not an integer");
        }
        emit("pop rbx");    //second operand
        emit("pop rax");    //first operand
        switch( n.children[1].sym ){
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

function termNodeCode(n: TreeNode ): VarType {
    if( n.children.length === 1 )
        return negNodeCode(n.children[0]);
    else{
        //...more code...
        let termType = termNodeCode( n.children[0] );
        let negType = negNodeCode( n.children[2] );
        if( termType !== VarType.INTEGER || negType != VarType.INTEGER ){
            throw new Error("Your summation or term is not an integer");
        }
        emit("pop rbx");    //second operand
        emit("pop rax");    //first operand
        emit("mov rdx, 0");
        switch( n.children[1].token.lexeme ){
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

function negNodeCode(n: TreeNode ) : VarType{
    if (n.children.length === 1)
        return factorNodeCode(n.children[0])
    else {
        let negType = negNodeCode(n.children[1]);
        if (negType != VarType.INTEGER){
            throw new Error("you no negate a intenger, you negate"+negType);
        }
        emit("pop rax");
        emit("neg rax");
        emit("push rax");
        return VarType.INTEGER;
    }
}

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
    console.log(n.children);
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
    emit("pop rax");
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
        emit("pop rax");
        emit("cmp rax, 0");
        var endifLabel = label();
        emit(`je ${endifLabel}`);
        braceblockNodeCode(n.children[4]);
        emit(`${endifLabel}:`);
    } else {
        exprNodeCode(n.children[2]);    //leaves result in rax
        emit("pop rax");
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
    emit("pop rax"); //exprsn
    emit("ret"); //expr
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