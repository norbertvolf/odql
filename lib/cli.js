"use strict";

const readline = require("readline");
const process = require("process");
const processAction = require("./process-action");
const nearley = require("nearley");
const grammar = require("./grammar/cli");
const _ = require("lodash");
const util = require("util");

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
	process.stdout.write(util.format.apply(this, arguments) + "\n");
};

Cli.error = function() {
	var args = _.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments);
	if (args[0] instanceof Error) {
		args[0] = `${args[0].message}\n` + (args[0].stack || "");
	}
	process.stderr.write(util.format.apply(this, args) + "\n");
};

Cli.prototype.handlerLine = function(readlineInstance, odata, options, line) {
	var nearleyParser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
	try {
		nearleyParser.feed(line);
		processAction(nearleyParser.results[0], Cli, readlineInstance, odata, options);
	} catch (e) {
		if (e.offset) {
			Cli.log(new Array(options.getPrompt().length + e.offset + 1).join("-") + "^\n");
			Cli.log(e.message);
		} else {
			Cli.error(e);
		}
		readlineInstance.prompt();
	}
};

Cli.prototype.handlerClose = function() {
	process.exit(0);
};

module.exports = Cli;