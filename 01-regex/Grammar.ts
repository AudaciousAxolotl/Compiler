export class Grammar 
{
    constructor(gramgram : string){
        let g = gramgram.split('\n')
        let bBoi : Set<string> = new Set();
        g.forEach(element => {
            bBoi.add(element);
        });
        //print(g)
    }
}