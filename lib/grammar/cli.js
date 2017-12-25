// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

	const _ = require("lodash");
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "main", "symbols": ["_", "command", "_"], "postprocess": function(d) {return d[1]; }},
    {"name": "command$string$1", "symbols": [{"literal":"\\"}, {"literal":"d"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "command", "symbols": ["_", "command$string$1", "_"], "postprocess": function(d) {return { "action": "LIST", "type" : "EntitySet" }; }},
    {"name": "command$string$2", "symbols": [{"literal":"\\"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "command", "symbols": ["_", "command$string$2", "_", "entitySetName", "_"], "postprocess": 
        function(d) {
        	return {
        		"action": "SHOW",
        		"type" : "EntitySet",
        		"entitySetName" : d[3]
        	};
        }
        	},
    {"name": "command$subexpression$1", "symbols": [/[sS]/, /[eE]/, /[lL]/, /[eE]/, /[cC]/, /[tT]/], "postprocess": function (d) {return d.join(""); }},
    {"name": "command$subexpression$2", "symbols": [/[fF]/, /[rR]/, /[oO]/, /[mM]/], "postprocess": function (d) {return d.join(""); }},
    {"name": "command$ebnf$1", "symbols": ["LIMIT"], "postprocess": id},
    {"name": "command$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "command", "symbols": ["_", "command$subexpression$1", "_", "columnList", "_", "command$subexpression$2", "_", "entitySetName", "_", "command$ebnf$1", "_", {"literal":";"}], "postprocess": 
        function(d) {
        	return {
        		"action": "GET",
        		"columnList" : d[3],
        		"entitySetName" : d[7],
        		"limit" : d[9]
        	};
        }
        	},
    {"name": "command$string$3", "symbols": [{"literal":"\\"}, {"literal":"f"}, {"literal":"J"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "command", "symbols": ["_", "command$string$3", "_"], "postprocess": function(d) {return { "action": "SET_FORMATTER", type: "json" }; }},
    {"name": "command$string$4", "symbols": [{"literal":"\\"}, {"literal":"f"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "command", "symbols": ["_", "command$string$4", "_"], "postprocess": function(d) {return { "action": "SET_FORMATTER", type: "terminal" }; }},
    {"name": "command$string$5", "symbols": [{"literal":"\\"}, {"literal":"q"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "command", "symbols": ["_", "command$string$5", "_"], "postprocess": function(d) {return { "action": "QUIT" }; }},
    {"name": "command$string$6", "symbols": [{"literal":"\\"}, {"literal":"?"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "command", "symbols": ["_", "command$string$6", "_"], "postprocess": function(d) {return { "action": "HELP" }; }},
    {"name": "LIMIT$subexpression$1", "symbols": [/[lL]/, /[iI]/, /[mM]/, /[iI]/, /[tT]/], "postprocess": function (d) {return d.join(""); }},
    {"name": "LIMIT$ebnf$1$subexpression$1$subexpression$1", "symbols": [/[oO]/, /[fF]/, /[fF]/, /[sS]/, /[eE]/, /[tT]/], "postprocess": function (d) {return d.join(""); }},
    {"name": "LIMIT$ebnf$1$subexpression$1", "symbols": ["LIMIT$ebnf$1$subexpression$1$subexpression$1", "_", "integer"]},
    {"name": "LIMIT$ebnf$1", "symbols": ["LIMIT$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "LIMIT$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "LIMIT", "symbols": ["_", "LIMIT$subexpression$1", "_", "integer", "_", "LIMIT$ebnf$1", "_"], "postprocess": 
        function(d) {
        	return {
        		limit : ! isNaN(d[3]) ? parseInt(d[3], 10) : null,
        		offset : d[5] && ! isNaN(d[5][2]) ? parseInt(d[5][2], 10) : null
        	};
        }
        },
    {"name": "entitySetName$ebnf$1", "symbols": []},
    {"name": "entitySetName$ebnf$1", "symbols": ["entitySetName$ebnf$1", /[0-9A-Za-z_]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "entitySetName", "symbols": ["_", "entitySetName$ebnf$1", "_"], "postprocess": 
        function(d) {
        	return _.join(d[1], "");
        }
        },
    {"name": "columnList$ebnf$1", "symbols": []},
    {"name": "columnList$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "column"]},
    {"name": "columnList$ebnf$1", "symbols": ["columnList$ebnf$1", "columnList$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "columnList", "symbols": ["_", "column", "_", "columnList$ebnf$1", "_"], "postprocess": 
        function(d) {
        	return _.concat(d[1], d[3]);
        }
        },
    {"name": "column$subexpression$1$ebnf$1", "symbols": [/[0-9A-Za-z_]/]},
    {"name": "column$subexpression$1$ebnf$1", "symbols": ["column$subexpression$1$ebnf$1", /[0-9A-Za-z_]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "column$subexpression$1", "symbols": ["column$subexpression$1$ebnf$1"]},
    {"name": "column$subexpression$1", "symbols": [{"literal":"*"}]},
    {"name": "column", "symbols": ["_", "column$subexpression$1", "_"], "postprocess": 
        function(d) {
        	return _.join(d[1][0], "");
        }
        },
    {"name": "integer$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "integer$subexpression$1$ebnf$1", "symbols": ["integer$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "integer$subexpression$1", "symbols": ["integer$subexpression$1$ebnf$1"]},
    {"name": "integer", "symbols": ["_", "integer$subexpression$1", "_"], "postprocess": 
        function(d) {
        	return _.join(d[1][0], "");
        }
        },
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
