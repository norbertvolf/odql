// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "main", "symbols": ["_", "command", "_"], "postprocess": function(d) {return d[1]; }},
    {"name": "command$string$1", "symbols": [{"literal":"\\"}, {"literal":"d"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "command", "symbols": ["_", "command$string$1", "_"], "postprocess": function(d) {return { "action": "LIST", "type" : "EntitySet" }; }},
    {"name": "command$string$2", "symbols": [{"literal":"\\"}, {"literal":"q"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "command", "symbols": ["_", "command$string$2", "_"], "postprocess": function(d) {return { "action": "QUIT" }; }},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null; }}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
