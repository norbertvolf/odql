"use strict";

const request = require("request");
const _ = require("lodash");

function get(baseUrl, options, columnsAsked, entitySetDefinition) {
	return new Promise(function(resolve, reject) {
		request(
			get.createUrl(baseUrl, entitySetDefinition, columnsAsked),
			options,
			function(networkError, response, body) {
				if (networkError) {
					reject(networkError);
				} else {
					try {
						resolve(JSON.parse(body));
					} catch (parseError) {
						reject(parseError);
					}
				}
			}
		);
	});
}

get.createUrl = function(baseUrl, entitySetDefinition, columnsAsked) {
	var parameters = ["$format=json"];
	var columnsDefined = get.columnsDefined(entitySetDefinition);
	var columnsSelected = get.columnsSelected(columnsAsked, columnsDefined);

	if (columnsSelected.length === 0) {
		throw new Error(`Columns list of query ${entitySetDefinition.Name} is empty`);
	}

	parameters = get.parameterSelect(parameters, columnsSelected, columnsDefined);

	return [baseUrl, entitySetDefinition.Name].join("/") +
		"?" +
		parameters.join("&");
};

get.parameterSelect = function(parameters, columnsSelected, columnsDefined) {
	if (!_.isEqual(columnsSelected.sort(), columnsDefined.sort())) {
		parameters.push("$select=" + columnsSelected.join(","));
	}
	return parameters;
};

get.columnsDefined = function(entitySetDefinition) {
	return _.map(entitySetDefinition.Property, (Property) => {
		return Property.Name;
	});
};

get.columnsSelected = function(columnsAsked, columnsDefined) {
	return _.uniq(get.columnsNormalized(
		get.columnsExpanded(columnsAsked, columnsDefined),
		columnsDefined
	));
};

get.columnsExpanded = function(columnsAsked, columnsDefined) {
	return _.concat.apply(null, _.map(columnsAsked.map((columnAsked) => {
		return columnAsked === "*" ? columnsDefined : columnAsked;
	})));
};

get.columnsNormalized = function(columnsAsked, columnsDefined) {
	return columnsAsked.map((columnAsked) => {
		var filtered = _.filter(columnsDefined, (columnDefined) => {
			return columnDefined.toUpperCase() === columnAsked.toUpperCase();
		});
		if (filtered.length === 0) {
			throw new Error(`Column ${columnAsked} does not exists`);
		}
		return filtered[0];
	});
};

module.exports = get;