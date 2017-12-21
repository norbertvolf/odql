"use strict";

const assert = require("assert");
const mock = require("mock-require");

describe("lib/formatter/terminal", function() {
	var formatter;

	beforeEach(function() {
		formatter = mock.reRequire("../../../../lib/formatter/terminal");
	});

	afterEach(function() {
		mock.stopAll();
	});

	describe("#normalizeColumnSettings", function() {
		it("Throw Error if columnSettings is not array ", function() {
			assert.throws(() => {
				formatter.normalizeColumnSettings([], {});
			}, Error);
			assert.throws(() => {
				formatter.normalizeColumnSettings([], 1);
			}, Error);
			assert.throws(() => {
				formatter.normalizeColumnSettings([], "");
			}, Error);
			assert.throws(() => {
				formatter.normalizeColumnSettings([], true);
			}, Error);
		});

		it("Generate default column settings if columnsettings is not specified", function() {
			assert.deepEqual(
				formatter.normalizeColumnSettings([{
					"colA": "0123456789"
				}]), [{
					"Title": "colA",
					"Name": "colA",
					"Type": "Edm.String",
					"CalculatedWidth": 10
				}], "Key is shorter than recordset content");
			assert.deepEqual(
				formatter.normalizeColumnSettings([{
					"colA0123456789": "0123456789"
				}]), [{
					"Title": "colA0123456789",
					"Name": "colA0123456789",
					"Type": "Edm.String",
					"CalculatedWidth": 14
				}], "Key is longer than recordset content");
		});

		it("Normalize passed column settings by recordseet", function() {
			assert.deepEqual(
				formatter.normalizeColumnSettings([{
					"colA": "0123456789"
				}], [{
					"Name": "colA",
					"Type": "Edm.Int32"
				}, {
					"Name": "colB",
					"Type": "Edm.String"
				}]), [{
					"Title": "colA",
					"Name": "colA",
					"Type": "Edm.Int32",
					"CalculatedWidth": 10
				}], "Normalized settings contains only values from recordset");
		});
	});

	describe("#renderCenteredText", function() {
		it("Text has lesser length than width", function() {
			assert.strictEqual(formatter.renderCenteredText("TEST", 10), "   TEST   ");
			assert.strictEqual(formatter.renderCenteredText("TEST", 9), "   TEST  ");
			assert.strictEqual(formatter.renderCenteredText("TEST", 13), "     TEST    ");
		});
		it("Text has same length as width", function() {
			assert.strictEqual(formatter.renderCenteredText("TEST", 4), "TEST");
			assert.strictEqual(formatter.renderCenteredText("TESTTESTTESTT", 13), "TESTTESTTESTT");
		});
		it("Text has greater length than width", function() {
			assert.strictEqual(formatter.renderCenteredText("TEST", 3), "TEST");
		});
	});
});