"use strict";

const formatter = require("./formatter");

module.exports = function(action, Cli, readlineInstance, odata) {
	switch (typeof action === "object" ? action.action : "") {
		case "LIST":
			Cli.log(formatter.renderTable(odata.getEntitySets()));
			break;
		case "QUIT":
			readlineInstance.close();
			break;
		case "SHOW":
			//Cli.log(JSON.stringify(odata.getEntitySetDefinition(action.entitySetName), null, 2));
			Cli.log(formatter.renderEntitySetDefinition(odata.getEntitySetDefinition(action.entitySetName)));
			break;
		default:
			Cli.error("Invalid command. Try \? for help.");
			break;
	}
};