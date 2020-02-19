export class Grammar 
{
    constructor(gramgram : string){
        console.log("Heyo, constructor time");
        //console.log(gramgram);
        let mappy:Map<string, RegExp> = new Map();
        let g = gramgram.trim().split('\n');

        console.log(g);
        for (var i = 0; i < g.length; i++){
            //console.log("hey");
            let a = g[i].trim().split(' -> ');
            let s:string = a[0]
            if (a.length != 2) {
                //console.log(a);
                throw new Error("Did not seperate terminals and production correctly"+a);
            }
            
            try{
                //ToDo: Check for duplicate keys a[0]
                let rex = new RegExp(a[1]);
                if (mappy.has(a[0])){
                    throw new Error("you already have this token!"+ a[0])
                }
                //console.log(rex);
                mappy.set(a[0], rex);
             }catch(e){
                 //console.log();
                 throw new Error(e);
             }
        }
        
    }
}