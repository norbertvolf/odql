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
			return options.username ? Cli.readPassword(options) : Promise.resolve(null);
		}).then((password) => {
			options.password = password;
			odata = new OData();
			return odata.connect(options);
		}).then(() => {
			cli = new Cli(odata);
			return cli.readHistory();
		}).then(() => {
			//Return cli and odata just for testing purpose
			return resolve({
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