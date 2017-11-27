"use strict";

function parser(line) {
	var retval = null;
	switch (line.trim()) {
		case "\\dt":
			retval = {
				"action": "LIST",
				"type": "EntitySet"
			};
			break;
		case "\\q":
			retval = {
				"action": "QUIT"
			};
			break;
	}
	return retval;
}


module.exports = parser;