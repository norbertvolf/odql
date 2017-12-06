# This is a grammar for odql readline

main -> _ command _ {% function(d) {return d[1]; } %}

command ->  _ "\\dt" _ {% function(d) {return { "action": "LIST", "type" : "EntitySet" }; } %}
	|  _ "\\d" _ parameter _ {%
		function(d) {
			return {
				"action": "SHOW",
				"type" : "EntitySet",
				"entitySetName" : d[3].join("")
			};
		}
	%}
	|  _ "\\q" _ {% function(d) {return { "action": "QUIT" }; } %}
	|  _ "\\?" _ {% function(d) {return { "action": "HELP" }; } %}

parameter ->  _ [0-9A-Za-z_$]:+ _ {% function(d) {return d[1]; } %}

# Whitespace
_ -> [\s]:*     {% function(d) {return null; } %}
