"use strict";

const assert = require("assert");
const sinon = require("sinon");
const mock = require("mock-require");

describe("lib/cli", function() {
	var Cli;
	var cliInstance;
	var process;
	var options;
	var readline;
	var printf;
	var processAction;
	var nearley;
	var grammar;

	beforeEach(function() {
		process = {
			"exit": sinon.stub(),
			"stdout": {
				"write": sinon.stub()
			},
			"stderr": {
				"write": sinon.stub()
			}
		};
		options = {
			"getPrompt": sinon.stub().returns("PROMPT")
		};
		readline = {
			"createInterface": sinon.stub().returns({
				"prompt": sinon.stub(),
				"on": sinon.stub()
			})
		};
		nearley = {
			"Parser": function() {
				this.results = ["ACTION"];
			},
			"Grammar": {
				"fromCompiled": sinon.stub().returns("COMPILED_GRAMMAR")
			}
		};
		nearley.Parser.prototype.feed = sinon.stub();
		sinon.spy(nearley, "Parser");

		grammar = {
			"name": "GRAMMAR"
		};
		printf = sinon.stub().returns("TEST");
		processAction = sinon.stub();

		mock("process", process);
		mock("readline", readline);
		mock("printf", printf);
		mock("nearley", nearley);
		mock("../../../lib/grammar", grammar);
		mock("../../../lib/process-action", processAction);

		Cli = mock.reRequire("../../../lib/cli");
		cliInstance = new Cli("ODATA", options);
	});

	afterEach(function() {
		mock.stopAll();
	});

	it("#constructor", function() {
		assert(cliInstance, "Command line interface class instancied");
		assert.deepEqual(readline.createInterface.args[0][0], {
			"input": process.stdin,
			"output": process.stdout,
			"prompt": "PROMPT"
		}, "Readline instance create with correct parameters.");
		assert(readline.createInterface().prompt.called, "Prompt initiated.");
		assert(readline.createInterface().on.calledWith("line"), "Line event registered.");
		assert(readline.createInterface().on.calledWith("close"), "Close event registered.");
	});
	it("#log", function() {
		mock.reRequire("../../../lib/cli").log("TEST", "IS", "OK");
		assert(process.stdout.write.calledWithExactly("TEST"), "output format printf passed to the stdout");
		assert(printf.calledWithExactly("TEST", "IS", "OK"), "input parameters are copied to the printf");
	});
	it("#error", function() {
		mock.reRequire("../../../lib/cli").error("TEST", "IS", "OK");
		assert(process.stderr.write.calledWithExactly("TEST"), "output format printf passed to the stderr");
		assert(printf.calledWithExactly("TEST", "IS", "OK"), "input parameters are copied to the printf");
	});
	it(".handlerClose", function() {
		cliInstance.handlerClose();
		assert(process.exit.calledWithExactly(0), "Exits the process.");
	});
	it(".handlerLine", function() {
		var readlineInstance = readline.createInterface({
			"input": process.stdin,
			"output": process.stdout,
			"prompt": options.getPrompt()
		});
		cliInstance.handlerLine(readlineInstance, "ODATA", "LINE");
		assert(nearley.Parser.prototype.feed.calledWithExactly("LINE"), "Parser fried by line.");
		assert(nearley.Grammar.fromCompiled.calledWithExactly(grammar), "Grammar correctly compiled.");
		assert(nearley.Parser.calledWithExactly("COMPILED_GRAMMAR"), "Grammar passed to parser.");
		assert(processAction.calledWithExactly("ACTION", Cli, readlineInstance, "ODATA"), "Action correctly called.");
		assert(readlineInstance.prompt.called, "Prompt called again.");
	});
});