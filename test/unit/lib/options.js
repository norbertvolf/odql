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

	describe("#parseConfig", () => {
		it("Property prompt", function() {
			assert.deepEqual(options.parseConfig("[ui]\n\tprompt = #> "), {
				"ui": {
					"prompt": "#>"
				}
			}, "Corectly parsed valid prompt definition");
		});
		it("Aliases", () => {
			assert.deepEqual(options.parseConfig(
					"[alias]\n\tmss = https://odata.services.com/test/\n\tms = http://odata.services.com/test/\n"), {
					"aliases": {
						"mss": "https://odata.services.com/test/",
						"ms": "http://odata.services.com/test/"
					}
				},
				"More aliases are correctly parsed"
			);
			assert.deepEqual(options.parseConfig(
					"[alias]\n\tmss = https://odata.services.com/test/\n\t"), {
					"aliases": {
						"mss": "https://odata.services.com/test/"
					}
				},
				"One alias is correctly parsed"
			);
			assert.deepEqual(options.parseConfig(
					"[alias]\n\t"), {},
				"Empty alias return object"
			);
			assert.throws(() => {
					options.parseConfig("[alias]\n\tmss = htt<<<ps://odata.services.com/test/\n\t");
				},
				Error,
				"Invalid url throws error"
			);
		});
		it("Full config", () => {
			var config =
				"[ui]\n" +
				"    prompt = #>\n" +
				"[alias]\n" +
				"    northwind = http://services.odata.org/northwind/northwind.svc/\n";
			var result = {
				"ui": {
					"prompt": "#>"
				},
				"aliases": {
					"northwind": "http://services.odata.org/northwind/northwind.svc/"
				}
			};
			assert.deepEqual(options.parseConfig(config), result, "Full config correctly processed");
		});
	});

	describe("#getServiceName", function() {
		it("Found alias", function() {
			assert.strictEqual(options.getServiceName({
				"alias": "SERVICE_NAME"
			}), "SERVICE_NAME");
		});
		it("Get servicename from url", function() {
			assert.strictEqual(options.getServiceName({
				"url": "http://services.odata.org/northwind/SERVICE_NAME/"
			}), "SERVICE_NAME");
		});
	});

	describe("#postProcessOptions", function() {
		it("Found alias", function() {
			assert.deepEqual(options.postProcessOptions({
				"url": "northwind",
				"aliases": {
					"northwind": "http://services.odata.org/northwind/SERVICE_NAME/"
				}
			}), {
				"alias": "northwind",
				"url": "http://services.odata.org/northwind/SERVICE_NAME/",
				"aliases": {
					"northwind": "http://services.odata.org/northwind/SERVICE_NAME/"
				}
			});
		});

		it("Invalid url", function() {
			assert.throws(() => {
				options.postProcessOptions({
					"url": "northwind"
				});
			}, Error);
		});
	});

	describe("#findHistoryFile", function() {
		it("Absolute path", function() {
			assert.strictEqual(options.findHistoryFile("/etc/.history"), "/etc/.history");
		});

		it("Relative path", function() {
			sinon.stub(options, "configFilename").returns("/home/.odqlrc");
			assert.strictEqual(options.findHistoryFile(".history"), "/home/.history");
			options.configFilename.restore();
		});
	});


});