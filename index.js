"use strict";

const argv = require("minimist")(process.argv.slice(2));
const help = require("./lib/help");
const options = require("./lib/options");
const odata = require("./lib/odata");
const Cli = require("./lib/cli");

module.exports = function() {
	var cli;
	if (options.parseArgs(argv)) {
		odata.connect(options.getUrl()).then(() => {
			cli = new Cli(odata, options);
		}).catch(function() {
			Cli.error.apply(null, Array.prototype.slice.call(arguments));
		});
	} else {
		Cli.log(help.getHelp());
	}
	return cli;
};