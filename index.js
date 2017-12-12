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
		options.read(argv).then(() => {
			odata = new OData();
			return odata.connect(options.getUrl());
		}).then(() => {
			cli = new Cli(odata, options);
			resolve({
				"cli": cli,
				"odata": odata
			});
		}).catch(function(err) {
			if (err.message === "HELP") {
				Cli.log(help.getHelp());
			} else {
				Cli.error(err);
			}
			resolve();
		});
	});
};