"use strict";

const argv = require("minimist")(process.argv.slice(2));
const help = require("./lib/help");
const options = require("./lib/options");
const odata = require("./lib/odata");
const cli = require("./lib/cli");

module.exports = function() {
	if (options.parseArgs(argv)) {
		odata.connect(options.getUrl()).then(() => {
			cli.start(odata, options);
		}).catch(function() {
			cli.error.apply(null, Array.prototype.slice.call(arguments));
		});
	} else {
		help.getHelp();
	}
};