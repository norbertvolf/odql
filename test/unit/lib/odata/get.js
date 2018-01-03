"use strict";

const assert = require("assert");
const mock = require("mock-require");
const sinon = require("sinon");

describe("lib/odata/get", function() {
	var get;
	var testEnitySet;

	beforeEach(function() {
		get = mock.reRequire("../../../../lib/odata/get");
		testEnitySet = {
			"Name": "TestEntitySet",
			"Property": [{
					"Name": "TestID",
					"Type": "Edm.Int32",
					"Nullable": "false"
				},
				{
					"Name": "TestDescription",
					"Type": "Edm.String",
					"Nullable": "false",
					"MaxLength": "50",
					"FixedLength": "true",
					"Unicode": "true"
				}
			],
			"NavigationProperty": [{
				"Name": "Territories",
				"Relationship": "NorthwindModel.FK_Territories_Test",
				"ToRole": "Territories",
				"FromRole": "Test"
			}]
		};
	});

	afterEach(function() {});

	describe("#createUrl", function() {
		it("Get data in JSON format", function() {
			assert(get.createUrl("", testEnitySet, ["*"], {}).match(/\$format=json/) !== null);
		});
		it("Column definition is mandatory", function() {
			assert.throws(() => {
				get.createUrl("", testEnitySet, [], {});
			}, Error, "Empty array is invalid.");
			assert.throws(() => {
				get.createUrl("", testEnitySet, null, {});
			}, Error, "Non array parameter is invalid.");
		});
		it("EntitySet is part of the url", function() {
			assert(get.createUrl("", testEnitySet, ["*"], {}).match(/TestEntitySet/));
		});
		it("Function additional parameters generators called", function() {
			sinon.spy(get, "parameterSelect");
			sinon.spy(get, "parameterTop");
			sinon.spy(get, "parameterSkip");
			get.createUrl("", testEnitySet, ["*"], {});
			assert.ok(get.parameterSelect.calledOnce);
			assert.ok(get.parameterTop.calledOnce);
			assert.ok(get.parameterSkip.calledOnce);
		});
	});

	describe("#prameterSkip", function() {
		it("Pass correct value", function() {
			var parameters = [];
			get.parameterSkip(parameters, {
				"limit": 10
			});
			assert.deepEqual(parameters, [], "Limit without offset is correct and does not add skip to the url");

			get.parameterSkip(parameters, {
				"limit": 10,
				"offset": null
			});
			assert.deepEqual(parameters, [], "Limit without offset is correct and does not add skip to the url");


			get.parameterSkip(parameters, {
				"limit": 10,
				"offset": "10"
			});
			assert.deepEqual(parameters, ["$skip=10"], "Limit without offset is correct and does not add skip to the url");
		});
		it("Reject invalid value", function() {
			var parameters = [];
			assert.throws(() => {
				get.parameterSkip(parameters, {
					"limit": 10,
					"offset": "bab"
				});
			}, Error, "Invalid offset parameter");

			assert.throws(() => {
				get.parameterSkip(parameters, {
					"offset": 10
				});
			}, Error, "Offset without limit");
		});
	});

	describe("#parameterTop", function() {
		it("Pass correct value", function() {
			var parameters = [];
			get.parameterTop(parameters, {});
			assert.deepEqual(parameters, [], "Limit without limit key is correct and does not add top parameter to the url");
			get.parameterTop(parameters, {
				"tests": "tests"
			});
			assert.deepEqual(parameters, [], "Limit without limit key (but with some other key) is correct and does not add top parameter to the url");
			get.parameterTop(parameters, {
				"limit": 10
			});
			assert.deepEqual(parameters, ["$top=10"], "Correct limit add $limit parameter to the array");
		});
		it("Reject invalid value", function() {
			var parameters = [];
			assert.throws(() => {
				get.parameterTop(parameters, {
					"limit": null
				});
			}, Error, "Invalid limit parameter");
		});
	});
});