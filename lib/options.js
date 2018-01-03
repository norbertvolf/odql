"use strict";

const url = require("url");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const nearley = require("nearley");
const grammar = require("./grammar/options");

const CONFIG_FILENAME = ".odqlrc";
const DEFAULT_OPTIONS = {
	"ui": {
		"prompt": "=# ",
		"formatter": "terminal",
		"historyFile": ".odql_history",
		"historySize": 100,
		"trace": false
	},
	"network": {
		"strictSSL": true
	}
};

var moduleOptions = {};
var storeOptions = {};

moduleOptions.parseConfig = function(content) {
	var config = {};
	var nearleyParser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
	nearleyParser.feed(content);
	_.forEach(nearleyParser.results[0], (group) => {
		_.forEach(group[0], (property) => {
			config[property[0].group] = config[property[0].group] || {};
			config[property[0].group][property[0].key] = _.isString(property[0].value) ? property[0].value.trim() : property[0].value;
		});
	});
	return config;
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
					resolve(_.merge({}, {
						"ui": {
							"configFile": fileName
						}
					}, moduleOptions.parseConfig(data)));
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

/**
 * Determine path to the history file. History file is defined by relative
 * path to the current config file name or by the absolute path
 * @private
 *
 * @param {String} historyFile absolute or relative path filename
 *
 * @returns {String} absolute path to the history file
 */
moduleOptions.findHistoryFile = function(historyFile) {
	var historyFileProcessed;
	var historyPath;

	if (path.isAbsolute(historyFile)) {
		historyFileProcessed = historyFile;
	} else {
		historyPath = path.dirname(moduleOptions.configFilename());
		historyFileProcessed = path.join(historyPath, historyFile);
	}

	return historyFileProcessed;
};

moduleOptions.configOptions = function() {
	var fileName = moduleOptions.configFilename();
	var promise;
	if (fileName) {
		promise = moduleOptions.configRead(fileName);
	} else {
		promise = Promise.resolve({
			"ui": {
				"configFile": fileName
			}
		});
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

	if (preOptions.ui && preOptions.ui.historyFile) {
		preOptions.ui.historyFile = moduleOptions.findHistoryFile(preOptions.ui.historyFile);
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
	return moduleOptions.getServiceName(storeOptions) + storeOptions.ui.prompt;
};

moduleOptions.getFormatter = function() {
	return storeOptions.ui.formatter;
};

moduleOptions.setFormatter = function(formatter) {
	storeOptions.ui.formatter = formatter;
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

moduleOptions.getTrace = function() {
	return !!storeOptions.ui.trace;
};

moduleOptions.getHistoryFile = function() {
	return storeOptions.ui.historyFile;
};

moduleOptions.getHistorySize = function() {
	return storeOptions.ui.historySize;
};

module.exports = moduleOptions;