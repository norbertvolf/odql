// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }


const moo = require("moo")

const CAMELIZATION = {
	"history size" : "historySize",
	"history file" : "historyFile",
	"strict ssl" : "strictSSL",
};

let lexer = moo.compile({
	prompt : /(?:prompt)\s*=/,
    trace  : /(?:trace)\s*=/,
	history_size : /(?:history)\s+(?:size)\s*=/,
	history_file : /(?:history)\s+(?:file)\s*=/,
	strict_ssl : /(?:strict)\s+(?:ssl)\s*=/,
    space: {match: /[\s]+/, lineBreaks: true},
	url: /https?:\/\/(?:[-a-zA-Z0-9@:%._\+~#=]{2,256}\.)+[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
    key: /(?:[a-zA-Z][^\s]*)\s*=/,
    true: "true",
    false: "false",
    integer: /-?(?:[1-9][0-9]+|[0-9])/,
    string: /(?:[^\s]+[^\n]*)/,
    "[alias]": "[alias]",
    "[ui]": "[ui]",
    "[network]": "[network]"
})

function extractKey(d) {
	return d[0].value.replace(/\s*=/, "");
}

function extractUiProperty(d) {
	return {
		group : "ui",
		key : CAMELIZATION[d[1][0]] ? CAMELIZATION[d[1][0]] : d[1][0],
		value : d[3]
	};
}

function extractNetworkProperty(d) {
	return {
		group : "network",
		key : CAMELIZATION[d[1][0]] ? CAMELIZATION[d[1][0]] : d[1][0],
		value : d[3]
	};
}

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "options$ebnf$1$subexpression$1", "symbols": ["alias"]},
    {"name": "options$ebnf$1$subexpression$1", "symbols": ["ui"]},
    {"name": "options$ebnf$1$subexpression$1", "symbols": ["network"]},
    {"name": "options$ebnf$1", "symbols": ["options$ebnf$1$subexpression$1"]},
    {"name": "options$ebnf$1$subexpression$2", "symbols": ["alias"]},
    {"name": "options$ebnf$1$subexpression$2", "symbols": ["ui"]},
    {"name": "options$ebnf$1$subexpression$2", "symbols": ["network"]},
    {"name": "options$ebnf$1", "symbols": ["options$ebnf$1", "options$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "options", "symbols": ["_", "options$ebnf$1", "_"], "postprocess":  function(d) {
        	return d[1];
        } },
    {"name": "alias$ebnf$1$subexpression$1", "symbols": ["aliasProperty"]},
    {"name": "alias$ebnf$1", "symbols": ["alias$ebnf$1$subexpression$1"]},
    {"name": "alias$ebnf$1$subexpression$2", "symbols": ["aliasProperty"]},
    {"name": "alias$ebnf$1", "symbols": ["alias$ebnf$1", "alias$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "alias", "symbols": [{"literal":"[alias]"}, "_", "alias$ebnf$1"], "postprocess": 
        function(d) {
        	return d[2];
        } },
    {"name": "ui$ebnf$1$subexpression$1", "symbols": ["uiProperty"]},
    {"name": "ui$ebnf$1", "symbols": ["ui$ebnf$1$subexpression$1"]},
    {"name": "ui$ebnf$1$subexpression$2", "symbols": ["uiProperty"]},
    {"name": "ui$ebnf$1", "symbols": ["ui$ebnf$1", "ui$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ui", "symbols": [{"literal":"[ui]"}, "_", "ui$ebnf$1"], "postprocess": 
        function(d) {
        	return d[2];
        } },
    {"name": "network$ebnf$1$subexpression$1", "symbols": ["networkProperty"]},
    {"name": "network$ebnf$1", "symbols": ["network$ebnf$1$subexpression$1"]},
    {"name": "network$ebnf$1$subexpression$2", "symbols": ["networkProperty"]},
    {"name": "network$ebnf$1", "symbols": ["network$ebnf$1", "network$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "network", "symbols": [{"literal":"[network]"}, "_", "network$ebnf$1"], "postprocess": 
        function(d) {
        	return d[2];
        } },
    {"name": "aliasProperty", "symbols": ["_", "key", "_", "url", "_"], "postprocess":  function(d) {
        	return {
        		group : "aliases",
        		key : d[1],
        		value : d[3]
        	};
        } },
    {"name": "uiProperty$subexpression$1", "symbols": ["prompt"]},
    {"name": "uiProperty$subexpression$1", "symbols": ["history_file"]},
    {"name": "uiProperty", "symbols": ["_", "uiProperty$subexpression$1", "_", "string", "_"], "postprocess": extractUiProperty},
    {"name": "uiProperty$subexpression$2", "symbols": ["trace"]},
    {"name": "uiProperty", "symbols": ["_", "uiProperty$subexpression$2", "_", "boolean", "_"], "postprocess": extractUiProperty},
    {"name": "uiProperty$subexpression$3", "symbols": ["history_size"]},
    {"name": "uiProperty", "symbols": ["_", "uiProperty$subexpression$3", "_", "integer", "_"], "postprocess": extractUiProperty},
    {"name": "networkProperty$subexpression$1", "symbols": ["strict_ssl"]},
    {"name": "networkProperty", "symbols": ["_", "networkProperty$subexpression$1", "_", "boolean", "_"], "postprocess": extractNetworkProperty},
    {"name": "prompt", "symbols": [(lexer.has("prompt") ? {type: "prompt"} : prompt)], "postprocess": extractKey},
    {"name": "trace", "symbols": [(lexer.has("trace") ? {type: "trace"} : trace)], "postprocess": extractKey},
    {"name": "history_size", "symbols": [(lexer.has("history_size") ? {type: "history_size"} : history_size)], "postprocess": extractKey},
    {"name": "history_file", "symbols": [(lexer.has("history_file") ? {type: "history_file"} : history_file)], "postprocess": extractKey},
    {"name": "strict_ssl", "symbols": [(lexer.has("strict_ssl") ? {type: "strict_ssl"} : strict_ssl)], "postprocess": extractKey},
    {"name": "key", "symbols": [(lexer.has("key") ? {type: "key"} : key)], "postprocess": extractKey},
    {"name": "string", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": function(d) { return d[0].value; }},
    {"name": "url", "symbols": [(lexer.has("url") ? {type: "url"} : url)], "postprocess": function(d) { return d[0].value; }},
    {"name": "integer", "symbols": [(lexer.has("integer") ? {type: "integer"} : integer)], "postprocess": function(d) { return parseInt(d[0].value, 10); }},
    {"name": "boolean", "symbols": [{"literal":"true"}], "postprocess": function () { return true; }},
    {"name": "boolean", "symbols": [{"literal":"false"}], "postprocess": function () { return false; }},
    {"name": "_", "symbols": []},
    {"name": "_", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": function(d) { return null; }}
]
  , ParserStart: "options"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
