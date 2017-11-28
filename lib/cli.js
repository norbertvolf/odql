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
	readlineInstance.on("line", this.handlerLine.bind(this, readlineInstance, odata));
	readlineInstance.on("close", this.handlerClose.bind(this));
}

Cli.log = function() {
	process.stdout.write(printf.apply(null, Array.prototype.slice.call(arguments)));
};

Cli.error = function() {
	process.stderr.write(printf.apply(null, Array.prototype.slice.call(arguments)));
};

Cli.prototype.handlerLine = function(readlineInstance, odata, line) {
	var nearleyParser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
	nearleyParser.feed(line);
	processAction(nearleyParser.results[0], Cli, readlineInstance, odata);
	readlineInstance.prompt();
};

Cli.prototype.handlerClose = function() {
	process.exit(0);
};

module.exports = Cli;