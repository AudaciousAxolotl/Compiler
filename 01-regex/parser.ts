import {Token} from './Token'
//<3
declare var require:any;
let antlr4 = require('./antlr4')
let Lexer = require('./gramLexer.js').gramLexer;
let Parser = require('./gramParser.js').gramParser

class ErrorHandler{
    syntaxError(rec:any, sym:any, line:number,
                column:number,msg:string,e:any){
        console.log("Syntax error:",msg,"on line",line,
                    "at column",column);
        throw new Error("Syntax error in ANTLR parse");
    }
}

class TreeNode{
    sym: string;
    token: Token;
    children: TreeNode[];
    constructor(sym: string,token: Token){
        this.sym=sym;
        this.token=token;
        this.children=[];
    }
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
    let antlrroot = parser.start();
    let root : TreeNode = walk(parser,antlrroot);
    return root.children[0];
}