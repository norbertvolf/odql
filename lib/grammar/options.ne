# This is a grammar for odql config
config -> _ (group):+ _ {%
			function(d) {
				var config = {};
				d[1].forEach( (group) => {
					Object.keys(group[0]).forEach((key) => {
						config[key] = group[0][key];
					});
				});
				return config;
			} %}

group -> _ "[" "alias" "]"  _ (aliasProperty):+ _ {%
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
		} %}
	| _ "[" "layout" "]"  _ layoutProperty:* _ {%
		function(d) {
			return {
				"layout" : d[5][0]
			};
		} %}
	| _ "[" "network" "]"  _ networkProperty:* _ {%
		function(d) {
			return {
				"network" : d[5][0]
			};
		} %}
	| _ "[" "log" "]"  _ logProperty:* _ {%
		function(d) {
			return {
				"log" : d[5][0]
			};
		} %}

#Property tokens
aliasProperty -> _ [0-9A-Za-z_]:*  _ "=" _ url _ {%	function(d) {
			var token = {};
			token[d[1].join("")] = d[5].join("");
			return token;
		} %}

layoutProperty -> _ "prompt"  _ "=" _ prompt _ {%
		function(d) {
			return {
				"prompt": d[5].join("")
			};
		} %}
networkProperty -> _ "strict-ssl"  _ "=" _ boolean _ {%
		function(d) {
			return {
				"strictSSL": d[5]
			};
		} %}
logProperty -> _ "trace"  _ "=" _ boolean _ {%
		function(d) {
			return {
				"trace": d[5]
			};
		} %}


#Simple tokens
prompt -> [0-9A-Za-z/:#?$=><]:*    {% id %}
boolean -> "true"    {% function () { return true; }  %}
		|  "false"   {% function () { return false; }  %}

url -> [0-9A-Za-z/:#?$=._]:*         {% id %}
_ -> [\s\n]:*                      {% function(d) {return null; } %}