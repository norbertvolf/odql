"use strict";

const url = require("url");

var options = {
	"prompt": "=# "
};

function parseArgs(argv) {
	var parsed = true;
	if (argv._.length > 0 && argv._.length < 3) {
		options.url = url.parse(argv._[0]);
		options.username = argv._[1];
	} else {
		parsed = false;
	}

	return parsed;
}

module.exports = {
	"parseArgs": parseArgs,
	"getUrl": function() {
		return url.format(options.url);
	},
	"getPrompt": function() {
		var tokens = options.url.pathname.split("/").filter((token) => {
			return token;
		});
		var lastToken = tokens[tokens.length - 1];
		return (lastToken ? lastToken : url.host) + options.prompt;
	}
};