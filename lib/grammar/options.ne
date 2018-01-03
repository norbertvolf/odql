@{%

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
});

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

%}

@lexer lexer

# This is a grammar for odql config
options -> _ (alias | ui | network):+ _ {% function(d) {
	return d[1];
} %}

alias -> "[alias]"  _ (aliasProperty):+ {%
		function(d) {
			return d[2];
		} %}

ui -> "[ui]"  _ (uiProperty):+ {%
		function(d) {
			return d[2];
		} %}

network -> "[network]"  _ (networkProperty):+ {%
		function(d) {
			return d[2];
		} %}

#Alias properties
aliasProperty -> _ key  _ url _ {% function(d) {
			return {
				group : "aliases",
				key : d[1],
				value : d[3]
			};
		} %}

#UI properties
uiProperty -> _ (prompt | history_file) _ string _ {% extractUiProperty %}
		|  _ (trace) _ boolean _ {% extractUiProperty %}
		|  _ (history_size) _ integer _ {% extractUiProperty %}

#Network properties
networkProperty -> _ (strict_ssl)  _  boolean _ {% extractNetworkProperty %}

#Simple tokens
prompt -> %prompt {% extractKey %}
trace  -> %trace {% extractKey %}
history_size -> %history_size {% extractKey %}
history_file -> %history_file {% extractKey %}
strict_ssl -> %strict_ssl {% extractKey %}
key -> %key {% extractKey %}
string -> %string {% function(d) { return d[0].value; } %}
url -> %url {% function(d) { return d[0].value; } %}
integer -> %integer {% function(d) { return parseInt(d[0].value, 10); } %}
boolean -> "true"    {% function () { return true; }  %}
		|  "false"   {% function () { return false; }  %}
_ -> null | %space {% function(d) { return null; } %}