# This is a grammar for odql readline
@{%

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

%}

@lexer lexer

#Terminal
main -> _ command _ {% function(d) {return d[1]; } %}

#Commands
command ->  _ actionListEntitySet _ {% extractAction %}
	| _ actionShowEntitySet _ {% extractAction %}
	| _ actionSetFormatter _ {% extractAction %}
	| _ actionQuit _ {% extractAction %}
	| _ actionHelp _ {% extractAction %}
	| _ SELECT _ columnList _ FROM _ entitySet _ LIMITOFFSET:? _ DELIMITER {%
		function(d) {
			return {
				"action": "GET",
				"columnList" : d[3],
				"entitySetName" : d[7],
				"limit" : d[9]
			};
		}
	%}

#Keywords
LIMITOFFSET ->  _ LIMIT _ integer _ (OFFSET _ integer):? _ {%
	function(d) {
		return {
			limit : ! isNaN(d[3]) ? parseInt(d[3], 10) : null,
			offset : d[5] && ! isNaN(d[5][2]) ? parseInt(d[5][2], 10) : null
		};
	}
%}

#Combined tokend
columnList ->  _ column _ ("," _ column):* _ {%
	function(d) {
		return _.concat(d[1], d[3]);
	}
%}

#Actions
actionListEntitySet -> %actionListEntitySet {% function(d) {
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
} %}
actionShowEntitySet -> %actionShowEntitySet {% function(d) {
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
} %}
actionSetFormatter  -> %actionSetFormatter {% function(d) {
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
} %}
actionQuit          -> %actionQuit {% function(d) { return { "action": "QUIT" }; } %}
actionHelp          -> %actionHelp {% function(d) { return { "action": "HELP" }; } %}


#Keywords
SELECT    -> %SELECT {% function(d) { return d[0].value; } %}
FROM      -> %FROM {% function(d) { return d[0].value; } %}
LIMIT     -> %LIMIT {% function(d) { return d[0].value; } %}
OFFSET    -> %OFFSET {% function(d) { return d[0].value; } %}
DELIMITER -> %DELIMITER {% function(d) { return d[0].value; } %}

#Simple tokens
column -> %column {% function(d) { return d[0].value; } %}
entitySet -> %entitySet {% function(d) { return d[0].value; } %}
integer -> %integer {% function(d) { return parseInt(d[0].value, 10); } %}
_ -> null | %space {% function(d) { return null; } %}
