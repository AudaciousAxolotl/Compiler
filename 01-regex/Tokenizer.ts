import {Token} from "./Token"
import {Grammar} from "./Grammar"

export class Tokenizer{
    grammar: Grammar;
    inputData: string;
    currentLine: number;
    idx: number;    //index of next unparsed char in inputData
    previous: Token;
    cur: Token;


    constructor( grammar: Grammar ){
        this.grammar = grammar;
        this.previous = undefined;
        this.cur = undefined;
    }
    setInput( inputData: string ){
        // ...prepare for new parse...
        this.inputData = inputData
        this.currentLine = 1;
        this.idx = 0;
        console.log("starting new: " + inputData);
    }
    next(): Token {
        if (this.idx >= this.inputData.length-1){

            return new Token(undefined, this.currentLine, "$");
        }

        // ...return next token...
        // ...advance this.idx...
        // ...adjust this.currentLine...
        for( let k of this.grammar.mappy.keys()) {
            console.log("k is " + k);
            let e = this.grammar.mappy.get(k)
            console.log("e is " +e);
            e.lastIndex = this.idx;
            let m = e.exec(this.inputData);
            if (m != undefined){
                let lexy = m[0];                
                console.log(lexy);
                console.log("with key " + k);
                this.idx += lexy.length;
                //the proper newline
                let t = this.currentLine;
                let pe = lexy.split('\n');
                this.currentLine += pe.length-1;

                if(k != 'WHITESPACE' && k != 'COMMENT') {
                    let token = new Token(k, t, lexy );
                    this.previous = this.cur;
                    this.cur = token;
                    return token;
                } else {
                   return this.next();
                }
            }
        }
        throw new Error("no matchy was foundy for" + this.inputData.substr(this.idx) + " at line " + this.currentLine);
    }
}