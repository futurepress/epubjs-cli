import { describe, it } from "node:test";
import assert from "node:assert";
import ManifestToEpub from "../src/epub.js";

function createInstance() {
	return new ManifestToEpub();
}

describe("generateContainer", () => {
	it("produces valid XML with the correct full-path", () => {
		const epub = createInstance();
		const xml = epub.generateContainer("ops/package.opf");

		assert.ok(xml.includes("<?xml version=\"1.0\""));
		assert.ok(xml.includes("full-path=\"ops/package.opf\""));
		assert.ok(xml.includes("media-type=\"application/oebps-package+xml\""));
	});
});

describe("generateOPF", () => {
	it("renders minimal required metadata", () => {
		const epub = createInstance();
		const opf = epub.generateOPF({
			id: "test-id-123",
			inLanguage: "en-US",
			dateModified: "2024-01-01T00:00:00Z",
			manifest: [],
			sections: [],
			nonlinear: []
		});

		assert.ok(opf.includes("<dc:identifier id=\"pub-id\">test-id-123</dc:identifier>"));
		assert.ok(opf.includes("<dc:language>en-US</dc:language>"));
		assert.ok(opf.includes("<meta property=\"dcterms:modified\">2024-01-01T00:00:00Z</meta>"));
	});

	it("includes default accessibility metadata when none provided", () => {
		const epub = createInstance();
		const opf = epub.generateOPF({
			id: "test-id",
			manifest: [],
			sections: [],
			nonlinear: []
		});

		assert.ok(opf.includes("schema:accessMode"));
		assert.ok(opf.includes("schema:accessModeSufficient"));
		assert.ok(opf.includes("schema:accessibilityFeature"));
		assert.ok(opf.includes("schema:accessibilityHazard"));
		assert.ok(opf.includes("schema:accessibilitySummary"));
	});

	it("uses provided accessibility metadata instead of defaults", () => {
		const epub = createInstance();
		const opf = epub.generateOPF({
			id: "test-id",
			accessMode: "textual",
			accessModeSufficient: "textual",
			accessibilityFeature: ["tableOfContents", "readingOrder"],
			accessibilityHazard: ["noFlashingHazard"],
			accessibilitySummary: "Fully accessible.",
			manifest: [],
			sections: [],
			nonlinear: []
		});

		assert.ok(opf.includes(">textual</meta>"));
		assert.ok(opf.includes(">tableOfContents</meta>"));
		assert.ok(opf.includes(">readingOrder</meta>"));
		assert.ok(opf.includes(">noFlashingHazard</meta>"));
		assert.ok(opf.includes(">Fully accessible.</meta>"));
		// defaults should not appear
		assert.ok(!opf.includes(">structuralNavigation</meta>"));
		assert.ok(!opf.includes(">none</meta>"));
	});

	it("renders creator as string", () => {
		const epub = createInstance();
		const opf = epub.generateOPF({
			id: "test-id",
			creator: "Jane Doe",
			manifest: [],
			sections: [],
			nonlinear: []
		});

		assert.ok(opf.includes("<dc:creator>Jane Doe</dc:creator>"));
	});

	it("renders creator with name property", () => {
		const epub = createInstance();
		const opf = epub.generateOPF({
			id: "test-id",
			creator: { name: "Jane Doe" },
			manifest: [],
			sections: [],
			nonlinear: []
		});

		assert.ok(opf.includes("<dc:creator>Jane Doe</dc:creator>"));
	});

	it("renders contributors", () => {
		const epub = createInstance();
		const opf = epub.generateOPF({
			id: "test-id",
			contributor: ["Alice", { name: "Bob" }],
			manifest: [],
			sections: [],
			nonlinear: []
		});

		assert.ok(opf.includes("<dc:contributor>Alice</dc:contributor>"));
		assert.ok(opf.includes("<dc:contributor>Bob</dc:contributor>"));
	});

	it("renders title, rights, source, subject, description", () => {
		const epub = createInstance();
		const opf = epub.generateOPF({
			id: "test-id",
			title: "My Book",
			rights: "CC BY 4.0",
			source: "http://example.com",
			subject: "Fiction",
			description: "A <great> book",
			manifest: [],
			sections: [],
			nonlinear: []
		});

		assert.ok(opf.includes("<dc:title>My Book</dc:title>"));
		assert.ok(opf.includes("<dc:rights>CC BY 4.0</dc:rights>"));
		assert.ok(opf.includes("<dc:source>http://example.com</dc:source>"));
		assert.ok(opf.includes("<dc:subject>Fiction</dc:subject>"));
		assert.ok(opf.includes("<dc:description>"));
	});

	it("renders manifest items with properties", () => {
		const epub = createInstance();
		const opf = epub.generateOPF({
			id: "test-id",
			manifest: [
				{ id: "nav", url: "toc.html", encoding: "application/xhtml+xml", properties: ["nav"] },
				{ id: "ch1", url: "ch1.html", encoding: "application/xhtml+xml", properties: [] }
			],
			sections: [],
			nonlinear: []
		});

		assert.ok(opf.includes("properties=\"nav\""));
		// Item without properties should not have properties attribute
		assert.ok(opf.includes("id=\"ch1\" href=\"ch1.html\" media-type=\"application/xhtml+xml\" />"));
	});

	it("renders spine with linear and nonlinear itemrefs", () => {
		const epub = createInstance();
		const opf = epub.generateOPF({
			id: "test-id",
			manifest: [],
			sections: [{ id: "ch1" }, { id: "ch2" }],
			nonlinear: [{ id: "appendix" }]
		});

		assert.ok(opf.includes("<itemref linear=\"yes\" idref=\"ch1\"/>"));
		assert.ok(opf.includes("<itemref linear=\"yes\" idref=\"ch2\"/>"));
		assert.ok(opf.includes("<itemref linear=\"no\" idref=\"appendix\"/>"));
	});

	it("defaults language to en-US when not provided", () => {
		const epub = createInstance();
		const opf = epub.generateOPF({
			id: "test-id",
			manifest: [],
			sections: [],
			nonlinear: []
		});

		assert.ok(opf.includes("xml:lang=\"en-US\""));
		assert.ok(opf.includes("<dc:language>en-US</dc:language>"));
	});
});
