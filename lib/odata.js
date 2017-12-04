"use strict";

const request = require("request");
const parseString = require("xml2js").parseString;
const _ = require("lodash");

module.exports = (function() {
	var _metadata;
	var _url;

	function OData() {}

	OData.prototype.connect = function(url) {
		_url = url;
		return new Promise(function(resolve, reject) {
			var metadataUrl = `${_url}/$metadata?format=json`;
			request(metadataUrl, function(networkError, response, body) {
				if (networkError) {
					reject(["Cannot load service metadata.\nNetwork error: \"%s\"", networkError.toString()]);
				} else {
					parseString(body, function(err, result) {
						if (err) {
							reject(["Cannot parse service metadata\n \"%s\"", err]);
						} else {
							_metadata = OData.XMLToPlainObject(result);
							resolve(true);
						}
					});
				}
			});
		});
	};

	OData.XMLToPlainObject = function(obj) {
		function objectRecursion(nodeToConvert) {
			var nodeObject = {};

			if (_.isArray(nodeToConvert)) {
				nodeObject = _.map(nodeToConvert, objectRecursion);
			} else if (_.isObject(nodeToConvert)) {
				_.forIn(nodeToConvert, (nodeValue, nodeKey) => {
					if (nodeKey === "$") {
						_.forIn(nodeValue, (attrValue, attrKey) => {
							nodeObject[attrKey] = nodeToConvert.hasOwnProperty(attrKey) ? nodeToConvert[attrKey] : attrValue;
						});
					} else {
						nodeObject[nodeKey] = objectRecursion(nodeValue);
					}
				});
			} else {
				nodeObject = nodeToConvert;
			}
			return nodeObject;
		}
		return objectRecursion(obj);
	};

	OData.prototype.getSchemas = function(schemaName) {
		var filtered;
		var schemas = _.isArray(_metadata["edmx:Edmx"]["edmx:DataServices"][0].Schema) ?
			_metadata["edmx:Edmx"]["edmx:DataServices"][0].Schema : [];


		console.log(_metadata["edmx:Edmx"]["edmx:DataServices"][0]);

		if (_.isString(schemaName)) {
			filtered = schemas.filter((schema) => {
				return schema.Namespace === schemaName; // eslint-disable-line dot-notation
			});
			schemas = filtered;
		}

		return schemas;
	};

	OData.prototype.getEntitySets = function(entitySetName) {
		var filtered;
		var entitySets = [];

		this.getSchemas().forEach((schema) => {
			if (_.isArray(schema.EntityContainer)) {
				schema.EntityContainer.forEach((entityContainer) => {
					if (_.isArray(entityContainer.EntitySet)) {
						entityContainer.EntitySet.forEach(function(entitySet) {
							entitySets.push(entitySet);
						});
					}
				});
			}
		});

		if (_.isString(entitySetName)) {
			filtered = entitySets.filter((entitySet) => {
				return entitySet.Name === entitySetName; // eslint-disable-line dot-notation
			});
			entitySets = filtered;
		}
		return entitySets;
	};

	OData.prototype.getEntitySetDefinition = function(entitySetName) {
		var entitySet = this.getEntitySets(entitySetName);

		if (entitySet.length === 0) {
			throw new Error(`EntitySet ${entitySetName} does not exits.`);
		}

		return this.getEntityType(entitySet[0].EntityType);
	};

	OData.prototype.getEntityType = function(entityTypeName) {
		var entityType;
		var entityTypeParsedName = entityTypeName.split(".");
		var namespace = entityTypeParsedName[0];
		var name = entityTypeParsedName[1];
		var schema = this.getSchemas(namespace);

		if (schema.length === 0) {
			throw new Error(`Namespace ${namespace} does not exits.`);
		}

		entityType = schema[0].EntityType.filter((entityTypeDefinition) => {
			return entityTypeDefinition.Name === name;
		});

		if (entityType.length === 0) {
			throw new Error(`EntityType ${entityTypeName} does not exits.`);
		}

		return entityType[0];
	};

	return OData;
})();