"use strict";

module.exports = function(action, Cli, readlineInstance, odata) {
	switch (typeof action === "object" ? action.action : "") {
		case "LIST":
			Cli.log(JSON.stringify(odata.getEntitySets(), null, 2));
			break;
		case "QUIT":
			readlineInstance.close();
			break;
		default:
			Cli.error("Invalid command. Try \? for help.");
			break;
	}
};