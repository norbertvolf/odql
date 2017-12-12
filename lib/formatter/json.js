"use strict";

var moduleFormatter = {};

moduleFormatter.renderTable = function(tableData) {
	return JSON.stringify(tableData, null, 2);
};

moduleFormatter.renderEntitySetDefinition = function(enititySetDefintion) {
	return JSON.stringify(enititySetDefintion, null, 2);
};

module.exports = moduleFormatter;