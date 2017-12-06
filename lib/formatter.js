"use strict";

const _ = require("lodash");
const printf = require("printf");
var moduleFormatter = {};

moduleFormatter.columnWidthsFromContent = function(tableData) {
	return _.reduce(tableData, (accumulator, row) => {
		_.forIn(row, (value, key) => {
			if (accumulator[key] < value.toString().length) {
				accumulator[key] = value.toString().length;
			} else if (!accumulator[key]) {
				accumulator[key] = value.toString().length;
			}
		});
		return accumulator;
	}, {});
};

moduleFormatter.normalizeColumnSettings = function(tableData, columnsSettings = []) {
	var columnSettingsNormalized;
	var columnWidths;

	if (_.isArray(columnsSettings)) {
		columnWidths = moduleFormatter.columnWidthsFromContent(tableData);
		if (columnsSettings.length === 0) {
			columnSettingsNormalized = _.chain(columnWidths)
				.keys()
				.map((key) => {
					return {
						"title": key,
						"name": key,
						"width": columnWidths[key],
						"type": "Edm.String"
					};
				})
				.value();
		} else {
			_.map(columnsSettings, (columnSettings) => {
				if (!columnSettings.name) {
					throw new Error("Name is not defined in the column settings.");
				} else {
					return _.assign({}, columnWidths[columnSettings.name], {
						"title": columnSettings.name
					}, columnSettings);
				}
			});
		}
	} else {
		throw new Error("Invalid column settings definition.");
	}
	return columnSettingsNormalized;
};

moduleFormatter.horizontalLine = function(columnSettings) {
	return "-" + _.chain(columnSettings)
		.map((columnSetting) => {
			return "-".repeat(columnSetting.width);
		})
		.join("-+-")
		.value() + "-";
};

moduleFormatter.renderCenteredText = function(text, width) {
	return printf(
		"%-*s",
		printf("%*s", text, Math.round(text.length / 2) + Math.round(width / 2)),
		width
	);
};

moduleFormatter.renderHeader = function(columnSettings) {
	var horizontalLine = moduleFormatter.horizontalLine(columnSettings);
	var titles = " " +
		_.chain(columnSettings)
		.map((columnSetting) => {
			return moduleFormatter.renderCenteredText(columnSetting.title, columnSetting.width);
		})
		.join(" | ")
		.value() + " ";
	return [titles, horizontalLine].join("\n");
};

moduleFormatter.printFormat = function(columnSettings) {
	var format;

	switch (columnSettings.type) {
		case "Edm.String":
			format = "%-*s";
			break;
		default:
			format = "%-*s";
	}
	return format;
};

moduleFormatter.printParameters = function(columnSettings) {
	var parameters = [];

	switch (columnSettings.type) {
		case "Edm.String":
			parameters.push(columnSettings.width);
			break;
		default:
			parameters.push(columnSettings.width);
	}
	return parameters;

};

moduleFormatter.renderRow = function(columnsSettings, row) {
	return " " +
		_.chain(columnsSettings)
		.map((columnSettings) => {
			return printf.apply(null, _.concat(
				moduleFormatter.printFormat(columnSettings),
				row[columnSettings.name],
				moduleFormatter.printParameters(columnSettings)
			));
		})
		.join(" | ")
		.value() + " ";
};

moduleFormatter.renderTable = function(tableData, columnsSettings = []) {
	var settings;

	if (!_.isArray(tableData)) {
		throw new Error("Data for formatArray is not Array.");
	}

	settings = moduleFormatter.normalizeColumnSettings(tableData, columnsSettings);

	return _.concat(
		moduleFormatter.renderHeader(settings),
		_.map(tableData, moduleFormatter.renderRow.bind(null, settings))
	).join("\n");
};

moduleFormatter.renderModifiers = function(property) {
	var modifiers = [];
	if (property.Nullable === "false") {
		modifiers.push("not null");
	}
	return modifiers.join(" ");

};

/* eslint-disable complexity */
moduleFormatter.renderType = function(property) {
	var type = [];
	switch (property.Type) {
		case "Edm.Decimal":
			type.push("numeric");
			type.push(`(${property.Precision},${property.Scale})`);
			break;
		case "Edm.String":
			type.push(property.FixedLength === "false" ? "character varying" : "character");
			type.push(!isNaN(parseInt(property.MaxLength, 10)) ? `(${property.MaxLength})` : "");
			break;
		case "Edm.Int32":
			type.push("integer");
			break;
		case "Edm.Int16":
			type.push("smallint");
			break;
		default:
			type.push(property.Type.substring(4).toLowerCase());
	}
	return type.join("");
};
/* eslint-enable complexity */

moduleFormatter.renderEntitySetDefinition = function(enititySetDefintion) {
	var properties = _.map(enititySetDefintion.Property, (property) => {
		return {
			"Property": property.Name,
			"Type": moduleFormatter.renderType(property),
			"Modifiers": moduleFormatter.renderModifiers(property)
		};
	});
	var columnSettings = moduleFormatter.normalizeColumnSettings(properties);
	var tableWidth = moduleFormatter.horizontalLine(columnSettings).length;
	var keyRefs = _.map(enititySetDefintion.Key[0].PropertyRef, (propertyRef) => {
		return propertyRef.Name;
	});
	var isKeyRefs = keyRefs.length > 0;
	var navigationProperties = _.map(enititySetDefintion.NavigationProperty, (navigationProperty) => {
		return `    EntitySet: ${navigationProperty.ToRole}` +
			`  Relationship: ${navigationProperty.Relationship} `;
	});
	var isNavigationProperties = navigationProperties.length > 0;

	return _.concat(
		moduleFormatter.renderCenteredText(enititySetDefintion.Name, tableWidth),
		moduleFormatter.renderTable(properties),
		isKeyRefs ? ["Key properties:\n    " + keyRefs.join(", ")] : [],
		isNavigationProperties ? ["Navigation properties: \n" + navigationProperties.join("\n")] : []
	).join("\n");
};

module.exports = moduleFormatter;