"use strict";
exports.__esModule = true;
var Grammar = /** @class */ (function () {
    function Grammar(gramgram) {
        this.mappy = new Map();
        //console.log("Heyo, constructor time");
        var g = gramgram.trim().split('\n\n');
        //For regex creation
        for (var i = 0; i < g.length; i++) {
            //console.log("hey");
            var a = g[i].trim().split(' -> ');
            var s = a[0].trim();
            if (a.length != 2) {
                //console.log(a);
                throw new Error("Did not seperate terminals and production correctly" + a);
            }
            try {
                //ToDo: Check for duplicate keys a[0]
                var rex = new RegExp(a[1].trim(), "gy");
                if (this.mappy.has(a[0].trim())) { //if it's already in the map
                    throw new Error("you already have this token!" + a[0].trim());
                }
                //console.log(rex);
                this.mappy.set(a[0].trim(), rex);
            }
            catch (e) {
                //console.log();
                throw new Error(e);
            }
        }
        this.mappy.set("WHITESPACE", new RegExp("\\s+", "gy"));
        //console.log(this.mappy);
    }
    return Grammar;
}());
exports.Grammar = Grammar;
//# sourceMappingURL=Grammar.js.map