"use strict";

const assert = require("assert");
const mock = require("mock-require");

describe("lib/odata", function() {
	var OData;

	beforeEach(function() {
		OData = mock.reRequire("../../../lib/odata");
	});

	afterEach(function() {
		mock.stopAll();
	});

	describe("#XMLToPlainObject", function() {
		it("Invalid inputs", function() {
			assert.deepEqual(OData.XMLToPlainObject({}), {}, "Empty object returns empty object");
			assert.deepEqual(OData.XMLToPlainObject([]), [], "Empty array returns empty array");
			assert.deepEqual(OData.XMLToPlainObject(null), null, "Null returns empty null");
			assert.deepEqual(OData.XMLToPlainObject(undefined), undefined, "Undefined returns undefined");
			assert.deepEqual(OData.XMLToPlainObject(0), 0, "Number returns number");
			assert.deepEqual(OData.XMLToPlainObject("TEST"), "TEST", "String returns string");
		});
		it("Convert objects", function() {
			var input;

			assert.deepEqual(OData.XMLToPlainObject({
				"a": 1
			}), {
				"a": 1
			}, "Do not touch object without attributes");

			input = {
				"$": {
					"attr": "ATTR"
				},
				"a": 1
			};
			assert.deepEqual(OData.XMLToPlainObject(input), {
				"attr": "ATTR",
				"a": 1
			}, "Move attributes to object");
			assert.deepEqual(input, {
				"$": {
					"attr": "ATTR"
				},
				"a": 1
			}, "Do not touch original object");
		});
		it("Convert arrays", function() {
			var input;

			assert.deepEqual(OData.XMLToPlainObject(["a", {
				"a": 1
			}]), ["a", {
				"a": 1
			}], "Do not touch array without attributes");

			input = [{
				"$": {
					"attr": "ATTR"
				},
				"a": 1
			}, {
				"$": {
					"attr": "ATTR"
				},
				"a": 1
			}];

			assert.deepEqual(OData.XMLToPlainObject(input), [{
				"attr": "ATTR",
				"a": 1
			}, {
				"attr": "ATTR",
				"a": 1
			}], "Convert attributes");
			assert.deepEqual(input, [{
				"$": {
					"attr": "ATTR"
				},
				"a": 1
			}, {
				"$": {
					"attr": "ATTR"
				},
				"a": 1
			}], "Do not touch array original array");


			assert.deepEqual(JSON.stringify(OData.XMLToPlainObject({
				"deepArray": [{
					"$": {
						"attr": "ATTR"
					},
					"a": 1
				}, {
					"$": {
						"attr": "ATTR"
					},
					"a": 1
				}]
			})), JSON.stringify({
				"deepArray": [{
					"attr": "ATTR",
					"a": 1
				}, {
					"attr": "ATTR",
					"a": 1
				}]
			}), "Convert array in the deep");

		});
	});
});