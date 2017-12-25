"use strict";

const request = require("request");
const _ = require("lodash");

function get(baseUrl, options, columnsAsked, entitySetDefinition, limit) {
	return new Promise(function(resolve, reject) {
		request(
			get.createUrl(baseUrl, entitySetDefinition, columnsAsked, limit),
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

/**
 *
 * Generate url based on entity set definition, column selection and limit
 *
 * @param {String} baseUrl url of the service
 * @param {Object} entitySetDefinition is the definition of the entity set from metadata
 * @param {Array} columnsAsked is array of properties selected from entity set
 * @param {Object} limit is definition of SQL LIMIT OFFSET clause. Contains key limit and key offset
 *
 * @returns{String} url for the GET request
 */
get.createUrl = function(baseUrl, entitySetDefinition, columnsAsked, limit) {
	var parameters = ["$format=json"];
	var columnsDefined = get.columnsDefined(entitySetDefinition);
	var columnsSelected = get.columnsSelected(columnsAsked, columnsDefined);

	if (!_.isArray(columnsAsked) || columnsSelected.length === 0) {
		throw new Error(`Columns list for query based on ${entitySetDefinition.Name} is invalid or empty`);
	}

	get.parameterSelect(parameters, columnsSelected, columnsDefined);
	get.parameterTop(parameters, limit);
	get.parameterSkip(parameters, limit);

	return [baseUrl, entitySetDefinition.Name].join("/") +
		"?" +
		parameters.join("&");
};

/**
 *
 * Add skip parameter to parameters array (same behavior as  OFFSET in SQL)
 *
 * @param {Array} parameters is list of parameters for future URL
 * @param {Object} limit is definition of SQL LIMIT OFFSET clause. Contains key limit and key offset
 */
get.parameterSkip = function(parameters, limit) {
	if (_.isObject(limit) && limit.hasOwnProperty("offset") && limit.offset !== null) {
		if (isNaN(parseInt(limit.limit, 10))) {
			throw new Error("Offset parameter without limit or invalide limit parameter is not possible.");
		} else if (!isNaN(parseInt(limit.offset, 10))) {
			parameters.push("$skip=" + limit.offset);
		} else {
			throw new Error("Invalid offset parameter");
		}
	}
};

/**
 *
 * Add top parameter to parameters array (same behavior as  LIMIT in SQL)
 *
 * @param {Array} parameters is list of parameters for future URL
 * @param {Object} limit is definition of SQL LIMIT OFFSET clause. Contains key limit and key offset
 */
get.parameterTop = function(parameters, limit) {
	if (_.isObject(limit) && limit.hasOwnProperty("limit")) {
		if (!isNaN(parseInt(limit.limit, 10))) {
			parameters.push("$top=" + limit.limit);
		} else {
			throw new Error("Invalid limit parameter");
		}
	}
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