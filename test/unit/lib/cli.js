/* eslint no-console: 0 */
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
	var fs;

	beforeEach(function() {
		process = {
			"exit": sinon.stub(),
			"stdout": {},
			"stdin": {},
			"stderr": {
				"write": sinon.stub()
			}
		};
		options = {
			"prompt": "PROMPT",
			"trace": false
		};
		readline = {
			"createInterface": sinon.stub().returns({
				"prompt": sinon.stub(),
				"on": sinon.stub()
			})
		};
		fs = {};
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
		mock("fs", fs);
		mock("../../../lib/options", options);
		mock("../../../lib/grammar/cli", grammar);
		mock("../../../lib/process-action", processAction);

		Cli = mock.reRequire("../../../lib/cli");
		cliInstance = new Cli("ODATA");
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

	describe("#error", function() {
		it("Pass arguments as standard parameters", function() {
			Cli.error("TEST", "IS", "OK");
			assert.strictEqual(process.stderr.write.args[0][0], "TEST IS OK\n", "Error message printed correctly");
		});
		it("Pass arguments as array", function() {
			Cli.error(["TEST", "IS", "OK"]);
			assert.strictEqual(process.stderr.write.args[0][0], "TEST IS OK\n", "Error message printed correctly");
		});
		it("Pass arguments as error", function() {
			var err = new Error("TEST");
			err.stack = "STACK";
			Cli.error(err);
			assert.strictEqual(process.stderr.write.args[0][0], "TEST\n", "Error object printed correctly");
		});
		it("Pass arguments as error with trace option on", function() {
			var err = new Error("TEST");
			err.stack = "STACK";
			options.trace = true;
			Cli.error(err);
			assert.strictEqual(process.stderr.write.args[0][0], "TEST\nSTACK\n", "Error object printed correctly");
		});
	});

	it(".handlerClose", function() {
		cliInstance.handlerClose();
		assert(process.exit.calledWithExactly(0), "Exits the process.");
	});

	describe(".handlerLine", function() {
		it("Line successfuly parsed", function() {
			var readlineInstance = readline.createInterface({
				"input": process.stdin,
				"output": process.stdout,
				"prompt": options.prompt
			});

			sinon.stub(cliInstance, "saveHistory");
			cliInstance.handlerLine(readlineInstance, "ODATA", "LINE");
			assert(nearley.Parser.prototype.feed.calledWithExactly("LINE"), "Parser fried by line.");
			assert(nearley.Grammar.fromCompiled.calledWithExactly(grammar), "Grammar correctly compiled.");
			assert(nearley.Parser.calledWithExactly("COMPILED_GRAMMAR"), "Grammar passed to parser.");
			assert(processAction.calledWithExactly("ACTION", Cli, readlineInstance, "ODATA", options), "Action correctly called.");
			assert(readlineInstance.prompt.called, "Prompt called again.");
		});

		it("Line parsed fails", function() {
			var readlineInstance = readline.createInterface({
				"input": process.stdin,
				"output": process.stdout,
				"prompt": options.prompt
			});
			nearley.Parser.prototype.feed = sinon.stub().throws({
				"offset": 1,
				"message": "ERROR"
			});

			sinon.stub(Cli, "log");
			cliInstance.handlerLine(readlineInstance, "ODATA", "LINE");
			assert(readlineInstance.prompt.called, "Prompt called again.");
			assert.deepEqual(Cli.log.args[0], ["-------^\n"], "Printed error marker.");
			assert.deepEqual(Cli.log.args[1], ["ERROR"], "Printed error marker.");
		});
	});

	describe("#readPassword", function() {
		it("Promise successfully created", function() {
			process.stdout.write = sinon.stub();
			process.stdin.resume = sinon.stub();
			process.stdin.on = sinon.stub();
			process.stdin.setRawMode = sinon.stub();
			process.stdin.setEncoding = sinon.stub();

			Cli.readPassword();

			assert(process.stdout.write.calledWithExactly("Password: "));
			assert(process.stdin.resume.calledTwice);
			assert(process.stdin.setRawMode.calledWithExactly(true));
			assert(process.stdin.setEncoding.calledWithExactly("utf8"));
		});

		it("Correct password readed from stdin", function(done) {
			process.stdout.write = sinon.stub();
			process.stdin.resume = sinon.stub();
			process.stdin.pause = sinon.stub();
			process.stdin.removeAllListeners = sinon.stub();
			process.stdin.on = function(type, eventHandler) {
				setTimeout(function() {
					eventHandler("password");
					eventHandler("\n");
				}, 0);
			};
			process.stdin.setRawMode = sinon.stub();
			process.stdin.setEncoding = sinon.stub();

			Cli.readPassword().then(function(password) {
				assert.equal(password, "password");
				assert.ok(process.stdin.pause.calledOnce);
				assert.deepEqual(process.stdin.setRawMode.args, [
					[true],
					[false]
				], "Enabled raw mode and disable raw mode after the password is readed.");
				assert.ok(process.stdin.removeAllListeners.calledOnce);
				assert.ok(process.stdin.removeAllListeners.calledWithExactly("data"), "Remove listeners in the end.");
				assert.deepEqual(process.stdout.write.args, [
					["Password: "],
					["*"],
					["\n"]
				], "Print prompt, asterisk and EOL");
				done();
			});
		});

		it("Reject when user stop password input", function(done) {
			process.stdout.write = sinon.stub();
			process.stdin.resume = sinon.stub();
			process.stdin.pause = sinon.stub();
			process.stdin.removeAllListeners = sinon.stub();
			process.stdin.on = function(type, eventHandler) {
				setTimeout(function() {
					eventHandler("\u0003");
				}, 0);
			};
			process.stdin.setRawMode = sinon.stub();
			process.stdin.setEncoding = sinon.stub();

			Cli.readPassword().catch(function(err) {
				assert.equal(err.message, "Password entering stopped.", "Read password rejected with correct message");
				assert.ok(process.stdin.pause.calledOnce);
				assert.deepEqual(process.stdin.setRawMode.args, [
					[true],
					[false]
				], "Enabled raw mode and disable raw mode after the password is readed.");
				assert.ok(process.stdin.removeAllListeners.calledOnce);
				assert.ok(process.stdin.removeAllListeners.calledWithExactly("data"), "Remove listeners in the end.");
				done();
			});
		});
	});

	describe("#saveHistory", function() {
		it("History correctly saved", function(done) {
			options.historyFile = "HISTORY_FILE_PATH";
			fs.writeFile = sinon.stub();
			cliInstance.saveHistory([]).then(() => {
				assert.ok(fs.writeFile.calledWith("HISTORY_FILE_PATH", "[]"));
				done();
			});
			fs.writeFile.args[0][2]();
		});
		it("History file access error", function(done) {
			options.historyFile = "HISTORY_FILE_PATH";
			fs.writeFile = sinon.stub();
			cliInstance.saveHistory([]).catch((err) => {
				assert.strictEqual(err, "ERROR");
				done();
			});
			fs.writeFile.args[0][2]("ERROR");
		});
	});

	describe("#readHistory", function() {
		it("Keep history array if history file does not exists", function(done) {
			var readlineInstance = {
				"history": []
			};
			fs.existsSync = sinon.stub().returns(false);
			options.historyFile = "HISTORY_FILE_PATH";
			cliInstance.readHistory(readlineInstance).then((history) => {
				assert.deepEqual(readlineInstance.history, history);
				assert.deepEqual(history, []);
				done();
			});
		});
		it("Read history successfully", function(done) {
			var readlineInstance = {
				"history": []
			};
			options.historyFile = "HISTORY_FILE_PATH";
			fs.existsSync = sinon.stub().returns(true);
			fs.readFile = sinon.stub();

			Cli.prototype.readHistory.call(cliInstance, readlineInstance).then((history) => {
				assert.deepEqual(readlineInstance.history, history);
				assert.deepEqual(history, ["HISTORY_ITEM"]);
				done();
			});
			fs.readFile.args[0][2](undefined, "[\"HISTORY_ITEM\"]");
		});

		it("Try to read history file with invalid content", function(done) {
			var readlineInstance = {
				"history": []
			};
			options.historyFile = "HISTORY_FILE_PATH";
			fs.existsSync = sinon.stub().returns(true);
			fs.readFile = sinon.stub();

			Cli.prototype.readHistory.call(cliInstance, readlineInstance).then((history) => {
				assert.deepEqual(readlineInstance.history, history);
				assert.deepEqual(history, []);
				done();
			});
			fs.readFile.args[0][2](undefined, "[HISTORY_ITEM]");
		});

		it("Try to read history with file access error", function(done) {
			var readlineInstance = {
				"history": []
			};
			options.historyFile = "HISTORY_FILE_PATH";
			fs.existsSync = sinon.stub().returns(true);
			fs.readFile = sinon.stub();

			Cli.prototype.readHistory.call(cliInstance, readlineInstance).catch((err) => {
				assert.deepEqual(err, "ERROR");
				done();
			});
			fs.readFile.args[0][2]("ERROR", "[HISTORY_ITEM]");
		});
	});
});