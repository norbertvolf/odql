// Generated automatically by nearley, version 2.13.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }


const moo = require("moo");
const _ = require("lodash");

let lexer = moo.compile({
	actionListEntitySet : /(?:\\dt\s+[A-Za-z_][A-Za-z_*]+|\\dt\s+[*]|\\dt\s*)/,
	actionShowEntitySet : /(?:\\d\s+[A-Za-z_]+)/,
	actionQuit : /(?:\\q)/,
	actionSetFormatter : /(?:\\format)(?:\s+[A-Za-z_]+)/,
	actionHelp : /(?:\\\?)/,
	SELECT : /[Ss][Ee][Ll][Ee][Cc][Tt]/,
	FROM : /[Ff][Rr][Oo][Mm]/,
	LIMIT : /[Ll][Ii][Mm][Ii][Tt]/,
	OFFSET : /[Oo][Ff][Ff][Ss][Ee][Tt]/,
	DELIMITER : /;/,
    integer: /(?:[1-9][0-9]+|[0-9])/,
	entitySet : /(?:[0-9A-Za-z_]+)/,
	column : /(?:[0-9A-Za-z_]+|[*])/,
    space: {match: /[\s]+/, lineBreaks: true}
});

function extractActionParameter(d) {
	return _.merge({}, d[1], { parameter : d[3] });
}

function extractAction(d) {
	return d[1];
}

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["_", "command", "_"], "postprocess": function(d) {return d[1]; }},
    {"name": "command", "symbols": ["_", "actionListEntitySet", "_"], "postprocess": extractAction},
    {"name": "command", "symbols": ["_", "actionShowEntitySet", "_"], "postprocess": extractAction},
    {"name": "command", "symbols": ["_", "actionSetFormatter", "_"], "postprocess": extractAction},
    {"name": "command", "symbols": ["_", "actionQuit", "_"], "postprocess": extractAction},
    {"name": "command", "symbols": ["_", "actionHelp", "_"], "postprocess": extractAction},
    {"name": "command$ebnf$1", "symbols": ["LIMITOFFSET"], "postprocess": id},
    {"name": "command$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "command", "symbols": ["_", "SELECT", "_", "columnList", "_", "FROM", "_", "entitySet", "_", "command$ebnf$1", "_", "DELIMITER"], "postprocess": 
        function(d) {
        	return {
        		"action": "GET",
        		"columnList" : d[3],
        		"entitySetName" : d[7],
        		"limit" : d[9]
        	};
        }
        	},
    {"name": "LIMITOFFSET$ebnf$1$subexpression$1", "symbols": ["OFFSET", "_", "integer"]},
    {"name": "LIMITOFFSET$ebnf$1", "symbols": ["LIMITOFFSET$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "LIMITOFFSET$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "LIMITOFFSET", "symbols": ["_", "LIMIT", "_", "integer", "_", "LIMITOFFSET$ebnf$1", "_"], "postprocess": 
        function(d) {
        	return {
        		limit : ! isNaN(d[3]) ? parseInt(d[3], 10) : null,
        		offset : d[5] && ! isNaN(d[5][2]) ? parseInt(d[5][2], 10) : null
        	};
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
    {"name": "actionListEntitySet", "symbols": [(lexer.has("actionListEntitySet") ? {type: "actionListEntitySet"} : actionListEntitySet)], "postprocess":  function(d) {
        	var parameter;
        	var match
        
        	if ( match = d[0].value.match(/\\dt\s+([A-Za-z_][A-Za-z_*]+)/) ) {
        		parameter = match[1];
        	} else {
        		parameter = null;
        	}
        	return {
        		"action": "LIST",
        		"type" : "EntitySet",
        		"parameter" : parameter
        	};
        } },
    {"name": "actionShowEntitySet", "symbols": [(lexer.has("actionShowEntitySet") ? {type: "actionShowEntitySet"} : actionShowEntitySet)], "postprocess":  function(d) {
        	var parameter;
        	var match
        	if ( match = d[0].value.match(/\\d\s+([A-Za-z_]+)/) ) {
        		parameter = match[1];
        	} else {
        		throw new Error("EntitySet name parameter missing.");
        	}
        	return {
        		"action": "SHOW",
        		"type" : "EntitySet",
        		"parameter" : parameter
        	};
        } },
    {"name": "actionSetFormatter", "symbols": [(lexer.has("actionSetFormatter") ? {type: "actionSetFormatter"} : actionSetFormatter)], "postprocess":  function(d) {
        	var parameter;
        	var match
        	if ( match = d[0].value.match(/json|terminal/) ) {
        		parameter = match[0];
        	} else {
        		throw new Error("Invalid format parameter. Only value \"terminal\" or \"json\" is possible.");
        	}
        	return {
        		"action": "FORMAT",
        		"parameter": parameter
        	};
        } },
    {"name": "actionQuit", "symbols": [(lexer.has("actionQuit") ? {type: "actionQuit"} : actionQuit)], "postprocess": function(d) { return { "action": "QUIT" }; }},
    {"name": "actionHelp", "symbols": [(lexer.has("actionHelp") ? {type: "actionHelp"} : actionHelp)], "postprocess": function(d) { return { "action": "HELP" }; }},
    {"name": "SELECT", "symbols": [(lexer.has("SELECT") ? {type: "SELECT"} : SELECT)], "postprocess": function(d) { return d[0].value; }},
    {"name": "FROM", "symbols": [(lexer.has("FROM") ? {type: "FROM"} : FROM)], "postprocess": function(d) { return d[0].value; }},
    {"name": "LIMIT", "symbols": [(lexer.has("LIMIT") ? {type: "LIMIT"} : LIMIT)], "postprocess": function(d) { return d[0].value; }},
    {"name": "OFFSET", "symbols": [(lexer.has("OFFSET") ? {type: "OFFSET"} : OFFSET)], "postprocess": function(d) { return d[0].value; }},
    {"name": "DELIMITER", "symbols": [(lexer.has("DELIMITER") ? {type: "DELIMITER"} : DELIMITER)], "postprocess": function(d) { return d[0].value; }},
    {"name": "column", "symbols": [(lexer.has("column") ? {type: "column"} : column)], "postprocess": function(d) { return d[0].value; }},
    {"name": "entitySet", "symbols": [(lexer.has("entitySet") ? {type: "entitySet"} : entitySet)], "postprocess": function(d) { return d[0].value; }},
    {"name": "integer", "symbols": [(lexer.has("integer") ? {type: "integer"} : integer)], "postprocess": function(d) { return parseInt(d[0].value, 10); }},
    {"name": "_", "symbols": []},
    {"name": "_", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": function(d) { return null; }}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
