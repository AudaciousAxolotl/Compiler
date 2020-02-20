

export class Grammar 
{
    mappy:Map<string, RegExp> = new Map();

    constructor(gramgram : string){
        //console.log("Heyo, constructor time");
        //console.log(gramgram);
        let g = gramgram.trim().split('\n');


        //console.log(g);
        for (var i = 0; i < g.length; i++){
            //console.log("hey");
            let a = g[i].trim().split(' -> ');
            let s:string = a[0].trim()
            if (a.length != 2) {
                //console.log(a);
                throw new Error("Did not seperate terminals and production correctly"+a);
            }
            
            try{
                //ToDo: Check for duplicate keys a[0]
                let rex = new RegExp(a[1].trim(),"gy");
                if (this.mappy.has(a[0].trim())){
                    throw new Error("you already have this token!"+ a[0].trim())
                }
                //console.log(rex);
                this.mappy.set(a[0].trim(), rex);
             }catch(e){
                 //console.log();
                 throw new Error(e);
             }
        }
        this.mappy.set("WHITESPACE", new RegExp("\\s+", "gy"));
        //console.log(this.mappy);
    }
}