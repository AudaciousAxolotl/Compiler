export class Grammar 
{
    constructor(gramgram : string){
        console.log("Heyo, constructor time");
        //console.log(gramgram);
        let mappy:Map<string, RegExp> = new Map()
        let g = gramgram.trim().split('\n');
        //console.log(g);
        let b:string[];
        //console.log("poop)");
        for (var i = 0; i < g.length; i++){
            //console.log("hey");
            let a = g[i].trim().split(' -> ');
            if (a.length != 2) {
                console.log(a);
                throw new Error("Did not seperate terminals and production correctly");
                
            }
            try{
                //ToDo: Check for duplicate keys a[0]
                let rex = new RegExp(a[1]);
                console.log(rex);
                mappy.set(a[0], rex);
            }catch(e){
                console.log();
                throw new Error(e);
            }
        }
        
    }
}