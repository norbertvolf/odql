const argv = require("minimist")(process.argv.slice(2));
const help = require("./lib/help");
const options = require("./lib/options");
const odata = require("./lib/odata");
const cli = require("./lib/cli");

if ( options.parseArgs(argv) ) {
	odata.connect(options.getUrl()).then(() => {
		cli.start(odata, options);
	}).catch((err) => {
		console.error(err);
	});
} else {
	help();
}
