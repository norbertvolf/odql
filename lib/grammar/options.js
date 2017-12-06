// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "config$ebnf$1$subexpression$1", "symbols": ["group"]},
    {"name": "config$ebnf$1", "symbols": ["config$ebnf$1$subexpression$1"]},
    {"name": "config$ebnf$1$subexpression$2", "symbols": ["group"]},
    {"name": "config$ebnf$1", "symbols": ["config$ebnf$1", "config$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "config", "symbols": ["_", "config$ebnf$1", "_"], "postprocess": 
        function(d) {
        	var config = {};
        	d[1].forEach( (group) => {
        		Object.keys(group[0]).forEach((key) => {
        			config[key] = group[0][key];
        		});
        	});
        	return config;
        } },
    {"name": "group$string$1", "symbols": [{"literal":"a"}, {"literal":"l"}, {"literal":"i"}, {"literal":"a"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "group$ebnf$1$subexpression$1", "symbols": ["aliasProperty"]},
    {"name": "group$ebnf$1", "symbols": ["group$ebnf$1$subexpression$1"]},
    {"name": "group$ebnf$1$subexpression$2", "symbols": ["aliasProperty"]},
    {"name": "group$ebnf$1", "symbols": ["group$ebnf$1", "group$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "group", "symbols": ["_", {"literal":"["}, "group$string$1", {"literal":"]"}, "_", "group$ebnf$1", "_"], "postprocess": 
        function(d) {
        	var aliases = {
        	};
        
        	d[5].forEach((alias) => {
        		Object.keys(alias[0]).forEach((key) => {
        			aliases[key] = alias[0][key];
        		});
        	});
        	return {
        		"aliases" : aliases
        	};
        } },
    {"name": "group$string$2", "symbols": [{"literal":"l"}, {"literal":"a"}, {"literal":"y"}, {"literal":"o"}, {"literal":"u"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "group$ebnf$2", "symbols": []},
    {"name": "group$ebnf$2", "symbols": ["group$ebnf$2", "layoutProperty"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "group", "symbols": ["_", {"literal":"["}, "group$string$2", {"literal":"]"}, "_", "group$ebnf$2", "_"], "postprocess": 
        function(d) {
        	return {
        		"layout" : d[5][0]
        	};
        } },
    {"name": "aliasProperty$ebnf$1", "symbols": []},
    {"name": "aliasProperty$ebnf$1", "symbols": ["aliasProperty$ebnf$1", /[0-9A-Za-z_]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "aliasProperty", "symbols": ["_", "aliasProperty$ebnf$1", "_", {"literal":"="}, "_", "url", "_"], "postprocess": 	function(d) {
        	var token = {};
        	token[d[1].join("")] = d[5].join("");
        	return token;
        } },
    {"name": "layoutProperty$string$1", "symbols": [{"literal":"p"}, {"literal":"r"}, {"literal":"o"}, {"literal":"m"}, {"literal":"p"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "layoutProperty", "symbols": ["_", "layoutProperty$string$1", "_", {"literal":"="}, "_", "prompt", "_"], "postprocess": 
        function(d) {
        	return {
        		"prompt": d[5].join("")
        	};
        } },
    {"name": "prompt$ebnf$1", "symbols": []},
    {"name": "prompt$ebnf$1", "symbols": ["prompt$ebnf$1", /[0-9A-Za-z\/:#?$=><]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "prompt", "symbols": ["prompt$ebnf$1"], "postprocess": id},
    {"name": "url$ebnf$1", "symbols": []},
    {"name": "url$ebnf$1", "symbols": ["url$ebnf$1", /[0-9A-Za-z\/:#?$=.]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "url", "symbols": ["url$ebnf$1"], "postprocess": id},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s\n]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null; }}
]
  , ParserStart: "config"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
