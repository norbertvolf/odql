"use strict";

const readline = require("readline");
const printf = require("printf");
const process = require("process");
const processAction = require("./process-action");
const nearley = require("nearley");
const grammar = require("./grammar.js");

function Cli(odata, options) {
	var readlineInstance = readline.createInterface({
		"input": process.stdin,
		"output": process.stdout,
		"prompt": options.getPrompt()
	});
	readlineInstance.prompt();
	readlineInstance.on("line", this.handlerLine.bind(this, readlineInstance, odata, options));
	readlineInstance.on("close", this.handlerClose.bind(this));
}

Cli.log = function() {
	console.log(printf.apply(null, Array.prototype.slice.call(arguments))); // eslint-disable-line no-console
};

Cli.error = function() {
	console.error(printf.apply(null, Array.prototype.slice.call(arguments))); // eslint-disable-line no-console
};

Cli.prototype.handlerLine = function(readlineInstance, odata, options, line) {
	var nearleyParser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
	try {
		nearleyParser.feed(line);
		processAction(nearleyParser.results[0], Cli, readlineInstance, odata);
	} catch (e) {
		if (e.offset) {
			Cli.log(new Array(options.getPrompt().length + e.offset + 1).join("-") + "^\n");
			Cli.log(e.message);
		} else {
			Cli.log(e.toString());
		}
	}
	readlineInstance.prompt();
};

Cli.prototype.handlerClose = function() {
	process.exit(0);
};

module.exports = Cli;