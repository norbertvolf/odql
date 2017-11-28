"use strict";

const assert = require("assert");
const sinon = require("sinon");
const mock = require("mock-require");


describe("index", function() {
	before(function() {});

	afterEach(function() {
		mock.stopAll();
	});


	it("Should print help when argument parsing fails ", function() {
		var options = {
			"parseArgs": sinon.stub().returns(false)
		};
		var help = {
			"getHelp": sinon.stub()
		};
		var cli = {
			"log": sinon.stub()
		};
		mock("../../lib/options", options);
		mock("../../lib/help", help);
		mock("../../lib/cli", cli);

		mock.reRequire("../../index")();

		assert(options.parseArgs.called, "options.parseArgs method has been called");
		assert(help.getHelp.called, "help.getHelp  method has been called");
	});


	it("Should open the CLI help when argument parsing passing ", function() {
		var options = {
			"parseArgs": sinon.stub().returns(true),
			"getUrl": sinon.stub().returns("URL")
		};
		var odata = {
			"connect": sinon.stub().returns(Promise.resolve())
		};
		var cli = sinon.stub();
		mock("../../lib/options", options);
		mock("../../lib/odata", odata);
		mock("../../lib/cli", cli);

		mock.reRequire("../../index")();

		return odata.connect().then(function() {
			assert(options.parseArgs.called, "options.parseArgs method has been called");
			assert(odata.connect.calledWith("URL"), "pass url from options to the connect");
			assert(
				cli.args[0][0] === odata &&
				cli.args[0][1] === options,
				"options and odata instances passed to the cli module");
		});
	});

	it("Should print the CLI error when connection fails.", function(done) {
		var options = {
			"parseArgs": sinon.stub().returns(true),
			"getUrl": sinon.stub().returns("URL")
		};
		var odata = {
			"connect": sinon.stub().returns(Promise.reject("ERROR"))
		};
		var cli = {
			"error": function(err) {
				assert(options.parseArgs.called, "options.parseArgs method has been called");
				assert(odata.connect.calledWith("URL"), "pass url from options to the connect");
				assert(err === "ERROR");
				done();
			},
			"log": sinon.stub()
		};
		mock("../../lib/options", options);
		mock("../../lib/odata", odata);
		mock("../../lib/cli", cli);

		mock.reRequire("../../index")();
	});
});