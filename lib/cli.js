const readline = require("readline");

function start (odata, options) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: options.getPrompt()
	});
	rl.prompt();

	rl.on("line", (line) => {
		switch (line.trim()) {
			case "\\dt":
				console.log(odata.entitySets());
			break;
			case "\\q":
				rl.close();
			break;
			default:
				process.stdout.write(`Invalid command ${line.trim()}. Try \? for help.`);
			break;
		}
		rl.prompt();
	});
	rl.on("close", () => {
		process.stdout.write("Have a great day!\n");
		process.exit(0);
	});
}

module.exports = {
	"start" : start
};
