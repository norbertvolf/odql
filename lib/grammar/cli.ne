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
	|  _ "SELECT"i _ columnList _ "FROM"i _ entitySetName _ ";"{%
		function(d) {
			return {
				"action": "GET",
				"columnList" : d[3],
				"entitySetName" : d[7]
			};
		}
	%}
	|  _ "\\fJ" _ {% function(d) {return { "action": "SET_FORMATTER", type: "json" }; } %}
	|  _ "\\fT" _ {% function(d) {return { "action": "SET_FORMATTER", type: "terminal" }; } %}
	|  _ "\\q" _ {% function(d) {return { "action": "QUIT" }; } %}
	|  _ "\\?" _ {% function(d) {return { "action": "HELP" }; } %}

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

# Whitespace
_ -> [\s]:*     {% function(d) {return null; } %}
