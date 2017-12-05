"use strict";

const assert = require("assert");
const sinon = require("sinon");
const mock = require("mock-require");
const path = require("path");

describe("lib/options", function() {
	var fs;
	var options;

	beforeEach(function() {
		fs = {
			"existsSync": sinon.stub()
		};
		mock("fs", fs);
		options = mock.reRequire("../../../lib/options");
	});

	afterEach(function() {
		mock.stopAll();
	});

	describe("#configFilename", function() {
		it("Found configuration file in local directory", function() {
			fs.existsSync.returns(true);
			assert.strictEqual(options.configFilename(), ".odqlrc", "Local config filename returned");
		});
		it("Found configuration file in home directory", function() {
			fs.existsSync.onCall(0).returns(false);
			fs.existsSync.onCall(1).returns(true);
			assert.strictEqual(
				path.join(process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"], ".odqlrc"),
				options.configFilename(),
				"Config filename in home directory returned"
			);
		});
	});
});