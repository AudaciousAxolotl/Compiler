"use strict";
exports.__esModule = true;
var Grammar = /** @class */ (function () {
    function Grammar(gramgram) {
        console.log("Heyo, constructor time");
        //console.log(gramgram);
        var mappy = new Map();
        var g = gramgram.trim().split('\n');
        //console.log(g);
        var b;
        //console.log("poop)");
        for (var i = 0; i < g.length; i++) {
            //console.log("hey");
            var a = g[i].trim().split(' -> ');
            if (a.length != 2) {
                console.log(a);
                throw new Error("Did not seperate terminals and production correctly");
            }
            try {
                var rex = new RegExp(a[1]);
                console.log(rex);
                mappy.set(a[0], rex);
            }
            catch (e) {
                throw new Error(e);
            }
        }
        // console.log("b");
        // b.forEach(element => {
        //     console.log("c");
        //     console.log(element.toString());
        //     let rex = new RegExp(element);
        // });
    }
    return Grammar;
}());
exports.Grammar = Grammar;
//# sourceMappingURL=Grammar.js.map