const process = require("process");
const help = `
odql is the OData interactive terminal.


Usage:
  odql [OPTION]... [URL [USERNAME]]

`

function printHelp () {
	process.stdout.write(help);
}


module.exports = printHelp;

