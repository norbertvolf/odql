"use strict";

const _ = require("lodash");
const printf = require("printf");
var moduleFormatter = {};

/**
 * Use columne settings and table data to determine columns to show and
 * @private
 *
 * @param {Array} tableData is array of the records (record is object with keys named by
 * @param {Array} columnsSettings is array of definitions of columns.
 *
 * @returns {Array} normalized columns are only visible columns with computed widths
 *
 * You can use EntityType as column settings. See EntityType
 */
moduleFormatter.normalizeColumnSettings = function(tableData, columnsSettings = []) {
	var columnSettingsNormalized;
	var columnWidths = moduleFormatter.columnWidthsFromContent(tableData);

	if (_.isArray(columnsSettings)) {
		if (columnsSettings.length === 0) {
			columnSettingsNormalized = _.chain(columnWidths)
				.keys()
				.map((key) => {
					return {
						"Title": key,
						"Name": key,
						"Type": "Edm.String"
					};
				})
				.value();
		} else {
			columnSettingsNormalized = _.chain(columnsSettings)
				.map((columnSetting) => {
					if (!columnSetting.Name) {
						throw new Error("Name is not defined in the column settings.");
					}

					return _.assign({}, {
						"Title": columnSetting.Name
					}, columnSetting);
				})
				.filter((columnSetting) => {
					return columnWidths[columnSetting.Name];
				})
				.value();
		}
		_.forEach(columnSettingsNormalized, function(columnSetting) {
			var key = columnSetting.Name;
			var title = columnSetting.Title;
			columnSetting.CalculatedWidth = columnWidths[key] > title.length ? columnWidths[key] : title.length;
		});
	} else {
		throw new Error("Invalid column settings definition.");
	}
	return columnSettingsNormalized;
};

moduleFormatter.columnWidthsFromContent = function(tableData) {
	var normalizedValue;
	return _.reduce(tableData, (accumulator, row) => {
		_.forIn(row, (value, key) => {
			normalizedValue = value || "";
			if (accumulator[key] < normalizedValue.toString().length) {
				accumulator[key] = normalizedValue.toString().length;
			} else if (!accumulator[key]) {
				accumulator[key] = normalizedValue.toString().length;
			}
		});
		return accumulator;
	}, {});
};

moduleFormatter.horizontalLine = function(columnSettings) {
	return "-" + _.chain(columnSettings)
		.map((columnSetting) => {
			return "-".repeat(columnSetting.CalculatedWidth);
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
			return moduleFormatter.renderCenteredText(columnSetting.Title, columnSetting.CalculatedWidth);
		})
		.join(" | ")
		.value() + " ";
	return [titles, horizontalLine].join("\n");
};

moduleFormatter.printFormat = function(columnSettings) {
	var format;

	switch (columnSettings.Type) {
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

	switch (columnSettings.Type) {
		case "Edm.String":
			parameters.push(columnSettings.CalculatedWidth);
			break;
		default:
			parameters.push(columnSettings.CalculatedWidth);
	}
	return parameters;

};

moduleFormatter.renderRow = function(columnsSettings, row) {
	return " " +
		_.chain(columnsSettings)
		.map((columnSettings) => {
			return printf.apply(null, _.concat(
				moduleFormatter.printFormat(columnSettings),
				row[columnSettings.Name],
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

moduleFormatter.renderEntitySetContent = function(data, entitySetDefinition) {
	return [
		moduleFormatter.renderTable(data, entitySetDefinition.Property),
		printf("(%d %s)", data.length, data.length === 1 ? "row" : "rows")
	].join("\n");
};

moduleFormatter.renderModifiers = function(property) {
	var modifiers = [];
	if (property.Nullable === "false") {
		modifiers.push("not null");
	}
	return modifiers.join(" ");

};

moduleFormatter.renderEntitySetList = function(entitySets) {
	var columnSettings = moduleFormatter.normalizeColumnSettings(entitySets);
	var tableWidth = moduleFormatter.horizontalLine(columnSettings).length;
	return [
		moduleFormatter.renderCenteredText("List of EntitySets", tableWidth),
		moduleFormatter.renderTable(entitySets)
	].join("\n");
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