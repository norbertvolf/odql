"use strict";

const readline = require("readline");
const printf = require("printf");

function log() {
	process.stdout.write(printf.apply(null, Array.prototype.slice.call(arguments)));
}

function error() {
	process.stderr.write(printf.apply(null, Array.prototype.slice.call(arguments)));
}

function start(odata, options) {
	const rl = readline.createInterface({
		"input": process.stdin,
		"output": process.stdout,
		"prompt": options.getPrompt()
	});
	rl.prompt();

	rl.on("line", (line) => {
		switch (line.trim()) {
			case "\\dt":
				log(JSON.stringify(odata.entitySets(), null, 2));
				break;
			case "\\q":
				rl.close();
				break;
			default:
				error(`Invalid command ${line.trim()}. Try \? for help.`);
				break;
		}
		rl.prompt();
	});

	rl.on("close", () => {
		process.exit(0);
	});
}

module.exports = {
	"start": start,
	"log": log,
	"error": error
};