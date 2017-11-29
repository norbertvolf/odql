"use strict";

const argv = require("minimist")(process.argv.slice(2));
const help = require("./lib/help");
const options = require("./lib/options");
const OData = require("./lib/odata");
const Cli = require("./lib/cli");

module.exports = function() {
	var cli;
	var odata;

	return new Promise(function(resolve) {
		if (options.parseArgs(argv)) {
			odata = new OData();
			odata.connect(options.getUrl()).then(() => {
				cli = new Cli(odata, options);
				resolve({
					"cli": cli,
					"odata": odata
				});
			}).catch(function() {
				Cli.error.apply(null, Array.prototype.slice.call(arguments));
				resolve();
			});
		} else {
			Cli.log(help.getHelp());
			resolve();
		}
		return {
			"cli": cli,
			"odata": odata
		};
	});
};