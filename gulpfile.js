/* global require */
/* eslint strict: ["error", "global"] */

"use strict";

var gulp = require("gulp");
var eslint = require("gulp-eslint");
var prettify = require("gulp-jsbeautifier");
var cache = require("gulp-cached");

//Define configuration
var jsFiles = ["index.js", "lib/**/*.js"];
var jsonFiles = [".eslintrc", ".jsbeautifyrc"];

gulp.task("prettifyJson", function() {
	return gulp.src(jsonFiles, {
			"base": "./"
		})
		.pipe(prettify({
			"indent_char": " ",
			"indent_level": 0,
			"indent_size": 2,
			"indent_with_tabs": false
		}))
		.pipe(gulp.dest("./"));
});

gulp.task("prettifyJs", function() {
	return gulp.src(jsFiles, {
			"base": "./"
		})
		.pipe(cache("jsbeautify"))
		.pipe(prettify({
			"config": ".jsbeautifyrc"
		}))
		.pipe(gulp.dest("./"))
});

gulp.task("lint", ["prettifyJs"], function() {
	return gulp.src(jsFiles, {
			"base": "./"
		})
		.pipe(eslint({
			"configFile": ".eslintrc",
			"rules": {}
		}))
		.pipe(eslint.format());
});

gulp.task("watch", function() {
	gulp.watch(jsFiles, {
		"debounceDelay": 1000
	}, ["lint"]);
	gulp.watch(jsonFiles, ["prettifyJson"]);
});

gulp.task("default", ["lint", "prettifyJson"]);