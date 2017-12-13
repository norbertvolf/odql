"use strict";

const url = require("url");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const nearley = require("nearley");
const grammar = require("./grammar/options");

const CONFIG_FILENAME = ".odqlrc";
const DEFAULT_OPTIONS = {
	"layout": {
		"prompt": "=# ",
		"formatter": "terminal"
	},
	"network": {
		"strictSSL": true
	}
};

var moduleOptions = {};
var storeOptions = {};

moduleOptions.parseConfig = function(content) {
	var nearleyParser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
	nearleyParser.feed(content);
	return nearleyParser.results[0];
};

moduleOptions.configRead = function(fileName) {
	return new Promise(function(resolve, reject) {
		fs.readFile(fileName, {
			"encoding": "utf-8"
		}, function(fileAccessError, data) {
			if (fileAccessError) {
				reject(fileAccessError);
			} else {
				try {
					resolve(moduleOptions.parseConfig(data));
				} catch (parseError) {
					reject(parseError.toString());
				}
			}
		});
	});
};

moduleOptions.configFilename = function() {
	var fileName;
	var homePathFileName = path.join(process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"], CONFIG_FILENAME);

	if (fs.existsSync(CONFIG_FILENAME)) {
		fileName = CONFIG_FILENAME;
	} else if (fs.existsSync(homePathFileName)) {
		fileName = homePathFileName;
	}
	return fileName;
};

moduleOptions.configOptions = function() {
	var fileName = moduleOptions.configFilename();
	var promise;

	if (fileName) {
		promise = moduleOptions.configRead(fileName);
	} else {
		promise = Promise.resolve({});
	}
	return promise;
};

moduleOptions.postProcessOptions = function(preOptions) {
	var parsedUrl;

	if (preOptions.aliases && preOptions.aliases[preOptions.url]) {
		preOptions.alias = preOptions.url;
		preOptions.url = preOptions.aliases[preOptions.url];
	} else {
		parsedUrl = url.parse(preOptions.url);
		if (parsedUrl.host === null) {
			throw new Error("Missing host in service url.");
		}
	}

	return preOptions;
};

moduleOptions.read = function(argv) {
	return new Promise((resolve, reject) => {
		moduleOptions.configOptions().then(function(optionsConfig) {
			var optionsArgs = {};
			if (argv._.length > 0) {
				optionsArgs.url = argv._[0];
				optionsArgs.username = argv._[1] || null;
				resolve(storeOptions = moduleOptions.postProcessOptions(_.merge(DEFAULT_OPTIONS, optionsConfig, optionsArgs)));
			} else {
				reject(new Error("HELP"));
			}
		}).catch((err) => {
			reject(err);
		});
	});
};

moduleOptions.getUrl = function() {
	return storeOptions.url;
};

moduleOptions.getServiceName = function(options) {
	var serviceName = options.alias;
	var parsedUrl;
	var tokens;

	if (!serviceName) {
		parsedUrl = url.parse(options.url);
		tokens = parsedUrl.pathname.split("/").filter((token) => {
			return token;
		});
		serviceName = tokens[tokens.length - 1];
	}

	return serviceName;
};

moduleOptions.getPrompt = function() {
	return moduleOptions.getServiceName(storeOptions) + storeOptions.layout.prompt;
};

moduleOptions.getFormatter = function() {
	return storeOptions.layout.formatter;
};

moduleOptions.setFormatter = function(formatter) {
	storeOptions.layout.formatter = formatter;
	return formatter;
};

moduleOptions.getUsername = function() {
	return storeOptions.username;
};

moduleOptions.getPassword = function() {
	return storeOptions.password;
};

moduleOptions.setPassword = function(password) {
	storeOptions.password = password;
	return password;
};

moduleOptions.getStrictSSL = function() {
	return !!storeOptions.network.strictSSL;
};

module.exports = moduleOptions;