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
			"url": "URL",
			"username": null,
			"password": null
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
			"message": "HELP"
		}));
		return main().then(function() {
			assert(help.getHelp.called, "help.getHelp  method has been called");
		});
	});

	it("Should print the CLI error when connection fails.", function() {
		var error = new Error("TEST");
		options.read.returns(Promise.resolve());
		odata.prototype.connect = sinon.stub().returns(Promise.reject(error));

		return main().then(function() {
			assert(cli.error.calledWithExactly(error), "Connect has reject with error");
		});
	});

	it("Should open the CLI help when argument parsing passing ", function() {
		options.read.returns(Promise.reject(new Error("HELP")));
		odata.prototype.connect = sinon.stub().returns(Promise.resolve());

		return main().then(function() {
			assert(cli.log.called && help.getHelp.called, "Help printed to stdout.");
		});
	});
});