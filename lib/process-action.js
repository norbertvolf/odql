"use strict";

const _ = require("lodash");

const ACTIONS = {
	"LIST": "list",
	"QUIT": "quit",
	"SHOW": "show",
	"GET": "get",
	"FORMAT": "setFormatter"
};

function formatter(options) {
	return require("./formatter/" + options.formatter);
}

function process(action, Cli, readlineInstance) {
	if (typeof action === "object" && ACTIONS[action.action]) {
		process[ACTIONS[action.action]].apply(null, Array.prototype.slice.call(arguments));
	} else {
		Cli.error("Invalid command. Try \? for help.");
		readlineInstance.prompt();
	}
}

process.list = function(action, Cli, readlineInstance, odata, options) {
	Cli.log(formatter(options).renderEntitySetList(odata.getEntitySets(action.parameter)));
	readlineInstance.prompt();
};

process.quit = function(action, Cli, readlineInstance) {
	readlineInstance.close();
};

process.show = function(action, Cli, readlineInstance, odata, options) {
	Cli.log(formatter(options).renderEntitySetDefinition(odata.getEntitySetDefinition(action.parameter)));
	readlineInstance.prompt();
};

process.get = function(action, Cli, readlineInstance, odata, options) {
	odata.get(action.columnList, action.entitySetName, action.limit).then((result) => {
		var recordSet = result.value || result.d.results;
		if (!_.isArray(recordSet)) {
			throw new Error("Invalid content in the odata response.");
		}
		Cli.log(formatter(options).renderEntitySetContent(recordSet, odata.getEntitySetDefinition(action.entitySetName)));
		readlineInstance.prompt();
	}).catch((e) => {
		Cli.error(e);
		readlineInstance.prompt();
	});
};

process.setFormatter = function(action, Cli, readlineInstance, odata, options) {
	options.formatter = action.parameter;
	Cli.log(`Swited to formatter ${action.parameter}`);
	readlineInstance.prompt();
};

module.exports = process;