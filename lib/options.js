"use strict";

const url = require("url");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");

const CONFIG_FILENAME = ".odqlrc";
const DEFAULT_OPTIONS = {
	"prompt": "=# "
};

var options;
var instanceOptions = {};


instanceOptions.configRead = function(fileName) {
	return new Promise(function(resolve, reject) {
		fs.readFile(fileName, {
			"encoding": "utf-8"
		}, function(fileAccessError, data) {
			if (fileAccessError) {
				reject(fileAccessError);
			} else {
				try {
					resolve(JSON.parse(data));
				} catch (parseError) {
					reject(parseError);
				}
			}
		});
	});
};

instanceOptions.configFilename = function() {
	var fileName;
	var homePathFileName = path.join(process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"], CONFIG_FILENAME);

	if (fs.existsSync(CONFIG_FILENAME)) {
		fileName = CONFIG_FILENAME;
	} else if (fs.existsSync(homePathFileName)) {
		fileName = homePathFileName;
	}
	return fileName;
};

instanceOptions.configOptions = function() {
	var fileName = instanceOptions.configFilename();
	var promise;

	if (fileName) {
		promise = instanceOptions.configRead(fileName);
	} else {
		promise = Promise.resolve({});
	}
	return promise;
};

instanceOptions.read = function(argv) {
	return new Promise((resolve, reject) => {
		instanceOptions.configOptions().then(function(optionsConfig) {
			var optionsArgs = {};
			if (argv._.length > 0 && argv._.length < 3) {
				optionsArgs.url = url.parse(argv._[0]);
				optionsArgs.username = argv._[1];
				options = _.assign(DEFAULT_OPTIONS, optionsConfig, optionsArgs);
				resolve(options);
			} else {
				reject(new Error("HELP"));
			}
		}).catch((err) => {
			reject(err);
		});
	});
};

instanceOptions.getUrl = function() {
	return url.format(options.url);
};

instanceOptions.getPrompt = function() {
	var tokens = options.url.pathname.split("/").filter((token) => {
		return token;
	});
	var lastToken = tokens[tokens.length - 1];
	return (lastToken ? lastToken : url.host) + options.prompt;
};

module.exports = instanceOptions;