"use strict";

const Cli = require("./cli");

module.exports = function(action, readlineInstance, odata) {
	switch (action.action) {
		case "LIST":
			Cli.log(JSON.stringify(odata.entitySets(), null, 2));
			break;
		case "QUIT":
			readlineInstance.close();
			break;
		default:
			Cli.error("Invalid command. Try \? for help.");
			break;
	}
};