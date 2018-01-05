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
const PROPERTIES = {
	"prompt": {
		"value": "ui.serviceName",
		"writable": false,
		"enumerable": true,
		"configurable": false
	},
	"url": {
		"value": "url",
		"writable": false,
		"enumerable": true,
		"configurable": false
	},
	"formatter": {
		"value": "ui.formatter",
		"writable": true,
		"enumerable": true,
		"configurable": false
	},
	"username": {
		"value": "username",
		"writable": false,
		"enumerable": true,
		"configurable": false
	},
	"password": {
		"value": "password",
		"writable": true,
		"enumerable": true,
		"configurable": false
	},
	"strictSSL": {
		"value": "network.strictSSL",
		"writable": false,
		"enumerable": true,
		"configurable": false
	},
	"trace": {
		"value": "ui.trace",
		"writable": false,
		"enumerable": true,
		"configurable": false
	},
	"historyFile": {
		"value": "ui.historyFile",
		"writable": false,
		"enumerable": true,
		"configurable": false
	},
	"historySize": {
		"value": "ui.historySize",
		"writable": false,
		"enumerable": true,
		"configurable": false
	}
};

var moduleOptions = {};

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

/**
 * Post process optioins
 *  1. Convert alias to real url
 *  2. Find history file path
 *  3. Generate service name for prompt
 *
 * @param {Object} preOptions - statically merged options from arguments and configuration file
 *
 * @returns {Object} processed options
 */
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

	if (preOptions.ui) {
		preOptions.ui.serviceName = moduleOptions.getServiceName(preOptions) + preOptions.ui.prompt;
	}

	return preOptions;
};

/**
 * Define getters/setters for the option properties
 *
 * @param {Object} propertyTemplates - object with options properties definition
 * @param {Object} options - options determined configuration file and from arguments
 */
moduleOptions.defineProperties = function(propertyTemplates, options) {
	_.forEach(propertyTemplates, (propertyTemplate, propertyName) => {
		var propertyDefinition = _.clone(propertyTemplate);
		propertyDefinition.value = _.get(options, propertyDefinition.value);
		Object.defineProperty(moduleOptions, propertyName, propertyDefinition);
	});
};

/**
 * Generate service name to show them in the prompt
 * @private
 *
 * @param {Object} options is object with currect configurations
 *
 * @returns {String} generated service name
 */
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

/**
 * Read options from application arguments and from
 * configuration file
 * @public
 *
 * @param {Object} argv shell arguments processed by  minimist library
 *
 * @returns {Promise} generated service name
 */
moduleOptions.read = function(argv) {
	return new Promise((resolve, reject) => {
		moduleOptions.configOptions().then(function(optionsConfig) {
			var optionsArgs = {};
			var preOptions = {};
			if (argv._.length > 0) {
				optionsArgs.url = argv._[0];
				optionsArgs.username = argv._[1] || null;
				preOptions = moduleOptions.postProcessOptions(_.merge(DEFAULT_OPTIONS, optionsConfig, optionsArgs));
				moduleOptions.defineProperties(PROPERTIES, preOptions);
				resolve(moduleOptions);
			} else {
				reject(new Error("HELP"));
			}
		}).catch((err) => {
			reject(err);
		});
	});
};

module.exports = moduleOptions;