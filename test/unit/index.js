"use strict";

const assert = require("assert");
const sinon = require("sinon");
const mock = require("mock-require");

describe("index", function() {
	var main;
	var options;
	var help;
	var odata;
	var cli;

	beforeEach(function() {
		options = {
			"read": sinon.stub(),
			"getUrl": sinon.stub().returns("URL")
		};
		help = {
			"getHelp": sinon.stub()
		};
		odata = sinon.stub();
		odata.prototype.connect = sinon.stub();
		cli = sinon.stub();
		cli.log = sinon.stub();
		cli.error = sinon.stub();

		mock("../../lib/options", options);
		mock("../../lib/odata", odata);
		mock("../../lib/help", help);
		mock("../../lib/cli", cli);
		main = mock.reRequire("../../index");
	});

	afterEach(function() {
		mock.stopAll();
	});

	it("Should print help when argument parsing fails ", function() {
		options.read.returns(Promise.reject({
			"name": "SHOW_HELP"
		}));
		return main().then(function() {
			assert(help.getHelp.called, "help.getHelp  method has been called");
		});
	});

	it("Should open the CLI help when argument parsing passing ", function() {
		options.read.returns(Promise.resolve());
		odata.prototype.connect = sinon.stub().returns(Promise.resolve());

		return main().then(function(instances) {
			assert.deepEqual(cli.args[0], [instances.odata, options], "options and odata instances passed to the cli module");
			assert(options.getUrl.called, "options asked fo getUrl");
			assert(instances.cli instanceof cli, "Cli is correctly created");
		});
	});

	it("Should print the CLI error when connection fails.", function() {
		var error = new Error("TEST");
		options.read.returns(Promise.resolve());
		odata.prototype.connect = sinon.stub().returns(Promise.reject(error));

		return main().then(function() {
			assert(cli.error.calledWithExactly(error.toString()), "Connect has reject with error");
		});
	});
});