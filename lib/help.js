"use strict";

const help = `
odql is the OData interactive terminal.


Usage:
  odql [OPTION]... [URL [USERNAME]]

`;

function getHelp() {
	return help;
}


module.exports = {
	"getHelp": getHelp
};