"use strict";

const request = require("request");
const parseString = require("xml2js").parseString;

var metadata;

function connect(url) {
	return new Promise(function(resolve, reject) {
		var metadataUrl = `${url}/$metadata?format=json`;
		request(metadataUrl, function(networkError, response, body) {
			if (networkError) {
				reject(["Cannot load service metadata.\nNetwork error: \"%s\"", networkError.toString()]);
			} else {
				metadata = body;
				resolve(true);
				parseString(body, function(err, result) {
					if (err) {
						reject(["Cannot parse service metadata\n \"%s\"", err]);
					} else {
						metadata = result;
					}
				});
			}
		});
	});
}

function entitySets() {
	return metadata["edmx:Edmx"]["edmx:DataServices"][0].Schema[1].EntityContainer[0].EntitySet.map((entitySetDefinition) => {
		return entitySetDefinition.$.Name;
	});
}

module.exports = {
	"connect": connect,
	"entitySets": entitySets
};