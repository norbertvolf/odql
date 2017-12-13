"use strict";

const request = require("request");
const parseString = require("xml2js").parseString;
const _ = require("lodash");
const odataGet = require("./odata/get");

const STATUS_CODES = {
	"100": "Continue",
	"101": "Switching Protocols",
	"200": "OK",
	"201": "Created",
	"202": "Accepted",
	"203": "Non-Authoritative Information",
	"204": "No Content",
	"205": "Reset Content",
	"206": "Partial Content",
	"300": "Multiple Choices",
	"301": "Moved Permanently",
	"302": "Found",
	"303": "See Other",
	"304": "Not Modified",
	"307": "Temporary Redirect",
	"308": "Permanent Redirect",
	"400": "Bad Request",
	"401": "Unauthorized",
	"403": "Forbidden",
	"404": "Not Found",
	"405": "Method Not Allowed",
	"406": "Not Acceptable",
	"407": "Proxy Authentication Required",
	"408": "Request Timeout",
	"409": "Conflict",
	"410": "Gone",
	"411": "Length Required",
	"412": "Precondition Failed",
	"413": "Payload Too Large",
	"414": "URI Too Long",
	"415": "Unsupported Media Type",
	"416": "Range Not Satisfiable",
	"417": "Expectation Failed",
	"426": "Upgrade Required",
	"428": "Precondition Required",
	"429": "Too Many Requests",
	"431": "Request Header Fields Too Large",
	"451": "Unavailable For Legal Reasons",
	"500": "Internal Server Error",
	"501": "Not Implemented",
	"502": "Bad Gateway",
	"503": "Service Unavailable",
	"504": "Gateway Timeout",
	"505": "HTTP Version Not Supported",
	"511": "Network Authentication Required"
};

module.exports = (function() {
	var _metadata;
	var _options;

	function OData() {}

	OData.prototype.get = function(columnList, entitySetName) {
		var entitySet = this.getEntitySetDefinition(entitySetName);
		return odataGet(
			_options.getUrl(),
			this.requestOptions(_options),
			columnList,
			entitySet
		);
	};

	OData.prototype.requestOptions = function(options) {
		var optionsForRequest = {};

		optionsForRequest.strictSSL = options.getStrictSSL();

		if (options.getUsername()) {
			optionsForRequest.auth = {
				"user": options.getUsername(),
				"pass": options.getPassword(),
				"sendImmediately": false
			};
		}
		return optionsForRequest;
	};

	OData.prototype.connect = function(options) {
		_options = options;
		return new Promise(function(resolve, reject) {
			var metadataUrl = `${options.getUrl()}/$metadata?format=json`;
			request(metadataUrl, this.requestOptions(options), function(networkError, response, body) {
				if (networkError) {
					reject(["Cannot load service metadata.\nNetwork %s", networkError.toString()]);
				} else if (response.statusCode === 200) {
					parseString(body, function(err, result) {
						if (err) {
							reject(["Cannot parse service metadata\n \"%s\"", err]);
						} else {
							_metadata = OData.XMLToPlainObject(result);
							resolve(true);
						}
					});
				} else {
					reject(`Invalide response: Status code ${response.statusCode} - ${STATUS_CODES[response.statusCode.toString() || ""]}`);
				}
			});
		}.bind(this));
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
							entitySets.push(_.assign({
								"Namespace": schema.Namespace
							}, entitySet));
						});
					}
				});
			}
		});

		if (_.isString(entitySetName)) {
			filtered = entitySets.filter((entitySet) => {
				return entitySet.Name.toUpperCase() === entitySetName.toUpperCase();
			});
			entitySets = filtered;
		}
		return entitySets;
	};

	OData.prototype.getEntitySetDefinition = function(entitySetName) {
		var entitySet = this.getEntitySets(entitySetName);

		if (entitySet.length === 0) {
			throw new Error(`EntitySet ${entitySetName} does not exits.  `);
		}

		return _.assign({}, this.getEntityType(entitySet[0].EntityType), {
			"Name": entitySet[0].Name
		});
	};

	OData.prototype.getEntityType = function(entityTypeName) {
		var entityType;
		var entityTypeParsedName = entityTypeName.split(".");
		var namespace = entityTypeParsedName[0];
		var name = entityTypeParsedName[1];
		var schema = this.getSchemas(namespace);

		if (schema.length === 0) {
			throw new Error(`
					Namespace $ {
						namespace
					}
					does not exits.
					`);
		}

		entityType = schema[0].EntityType.filter((entityTypeDefinition) => {
			return entityTypeDefinition.Name === name;
		});

		if (entityType.length === 0) {
			throw new Error(`
					EntityType $ {
						entityTypeName
					}
					does not exits.
					`);
		}

		return entityType[0];
	};

	return OData;
})();