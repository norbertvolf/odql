"use strict";

const request = require("request");
const parseString = require("xml2js").parseString;

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
					_metadata = body;
					resolve(true);
					parseString(body, function(err, result) {
						if (err) {
							reject(["Cannot parse service metadata\n \"%s\"", err]);
						} else {
							_metadata = result;
						}
					});
				}
			});
		});
	};

	OData.prototype.getEntitySets = function() {
		return _metadata["edmx:Edmx"]["edmx:DataServices"][0].Schema[1].EntityContainer[0].EntitySet.map((entitySetDefinition) => {
			return entitySetDefinition.$.Name;
		});
	};

	return OData;
})();