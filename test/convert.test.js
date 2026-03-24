import { describe, it } from "node:test";
import assert from "node:assert";
import ManifestToEpub from "../src/epub.js";

function createInstance(lang) {
	const epub = new ManifestToEpub();
	epub.data = { inLanguage: lang || "en-US" };
	return epub;
}

describe("convertToXML", () => {
	it("output starts with XML processing instruction", () => {
		const epub = createInstance();
		const result = epub.convertToXML("<html><head></head><body><p>Hello</p></body></html>");

		assert.ok(result.startsWith("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"));
	});

	it("adds lang and xml:lang from inLanguage", () => {
		const epub = createInstance("fr");
		const result = epub.convertToXML("<html><head></head><body><p>Bonjour</p></body></html>");

		assert.ok(result.includes("lang=\"fr\""));
		assert.ok(result.includes("xml:lang=\"fr\""));
	});

	it("preserves existing lang attribute", () => {
		const epub = createInstance("en-US");
		const result = epub.convertToXML("<html lang=\"de\"><head></head><body><p>Hallo</p></body></html>");

		// The original lang="de" should be kept, not overwritten to en-US
		assert.match(result, /lang="de"/);
	});

	it("defaults to en-US when inLanguage is not set", () => {
		const epub = new ManifestToEpub();
		epub.data = {};
		const result = epub.convertToXML("<html><head></head><body></body></html>");

		assert.ok(result.includes("lang=\"en-US\""));
	});

	it("serializes self-closing tags properly", () => {
		const epub = createInstance();
		const result = epub.convertToXML("<html><head></head><body><br><img src=\"test.jpg\" alt=\"test\"></body></html>");

		assert.ok(result.includes("<br"));
		assert.ok(result.includes("<img"));
		assert.ok(result.includes("alt=\"test\""));
	});
});
