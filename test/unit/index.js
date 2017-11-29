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
			"parseArgs": sinon.stub().returns(false),
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
		mock("../../lib/cli", cli);
		mock("../../lib/options", options);
		mock("../../lib/help", help);
		mock("../../lib/cli", cli);
		main = mock.reRequire("../../index");
	});

	afterEach(function() {
		mock.stopAll();
	});

	it("Should print help when argument parsing fails ", function() {
		return main().then(function() {
			assert(options.parseArgs.called, "options.parseArgs method has been called");
			assert(help.getHelp.called, "help.getHelp  method has been called");
		});
	});

	it("Should open the CLI help when argument parsing passing ", function() {
		options.parseArgs = sinon.stub().returns(true);
		odata.prototype.connect = sinon.stub().returns(Promise.resolve());

		return main().then(function(instances) {
			assert(options.parseArgs.called, "options.parseArgs method has been called");
			assert(instances.odata.connect.calledWith("URL"), "pass url from options to the connect");
			assert.deepEqual(cli.args[0], [instances.odata, options], "options and odata instances passed to the cli module");
		});
	});

	it("Should print the CLI error when connection fails.", function() {
		options.parseArgs = sinon.stub().returns(true);
		odata.prototype.connect = sinon.stub().returns(Promise.reject("ERROR"));

		return main().then(function() {
			assert(options.parseArgs.called, "options.parseArgs method has been called");
			assert(odata.prototype.connect.calledWith("URL"), "pass url from options to the connect");
			assert(cli.error.calledWithExactly("ERROR"), "Connect has reject with error");
		});
	});
});