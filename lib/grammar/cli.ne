# This is a grammar for odql readline

@{%
	const _ = require("lodash");
%}

#Terminal
main -> _ command _ {% function(d) {return d[1]; } %}

command ->  _ "\\dt" _ {% function(d) {return { "action": "LIST", "type" : "EntitySet" }; } %}
	|  _ "\\d" _ entitySetName _ {%
		function(d) {
			return {
				"action": "SHOW",
				"type" : "EntitySet",
				"entitySetName" : d[3]
			};
		}
	%}
	|  _ "SELECT"i _ columnList _ "FROM"i _ entitySetName _ LIMIT:? _ ";"{%
		function(d) {
			return {
				"action": "GET",
				"columnList" : d[3],
				"entitySetName" : d[7],
				"limit" : d[9]
			};
		}
	%}
	|  _ "\\fJ" _ {% function(d) {return { "action": "SET_FORMATTER", type: "json" }; } %}
	|  _ "\\fT" _ {% function(d) {return { "action": "SET_FORMATTER", type: "terminal" }; } %}
	|  _ "\\q" _ {% function(d) {return { "action": "QUIT" }; } %}
	|  _ "\\?" _ {% function(d) {return { "action": "HELP" }; } %}

#Keywords

LIMIT ->  _ "LIMIT"i _ integer _ ("OFFSET"i _ integer):? _ {%
	function(d) {
		return {
			limit : ! isNaN(d[3]) ? parseInt(d[3], 10) : null,
			offset : d[5] && ! isNaN(d[5][2]) ? parseInt(d[5][2], 10) : null
		};
	}
%}

#Tokens
entitySetName ->  _ [0-9A-Za-z_]:* _ {%
	function(d) {
		return _.join(d[1], "");
	}
%}
columnList ->  _ column _ ("," _ column):* _ {%
	function(d) {
		return _.concat(d[1], d[3]);
	}
%}
column ->  _ ([0-9A-Za-z_]:+ | "*") _ {%
	function(d) {
		return _.join(d[1][0], "");
	}
%}

integer ->  _ ([0-9]:+) _ {%
	function(d) {
		return _.join(d[1][0], "");
	}
%}


# Whitespace
_ -> [\s]:*     {% function(d) {return null; } %}
