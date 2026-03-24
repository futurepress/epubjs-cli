import { describe, it, before } from "node:test";
import assert from "node:assert";
import { pathToFileURL } from "node:url";
import JSZip from "jszip";
import ManifestToEpub from "../src/epub.js";

const manifestPath = "./examples/alice-manifest/manifest.jsonld";
const manifestUrl = pathToFileURL(manifestPath).href;

describe("ManifestToEpub integration", () => {
	let epub;
	let file;
	let zip;

	before(async () => {
		epub = await new ManifestToEpub(manifestUrl);
		file = await epub.save();
		zip = await JSZip.loadAsync(file);
	});

	it("resolves successfully", () => {
		assert.ok(epub);
		assert.ok(epub.data);
	});

	it("has expected data fields", () => {
		assert.ok(epub.data.id);
		assert.ok(epub.data.manifest.length > 0);
		assert.ok(epub.data.sections.length > 0);
		assert.equal(epub.data.creator, "Lewis Carroll");
	});

	it("save() returns a Buffer", () => {
		assert.ok(Buffer.isBuffer(file));
		assert.ok(file.length > 0);
	});

	it("ZIP contains mimetype file with correct content", async () => {
		const mimetype = zip.file("mimetype");
		assert.ok(mimetype, "mimetype file should exist");
		const content = await mimetype.async("string");
		assert.equal(content, "application/epub+zip");
	});

	it("ZIP contains META-INF/container.xml", () => {
		assert.ok(zip.file("META-INF/container.xml"), "container.xml should exist");
	});

	it("ZIP contains ops/package.opf", () => {
		assert.ok(zip.file("ops/package.opf"), "package.opf should exist");
	});

	it("ZIP contains content files from reading order", () => {
		assert.ok(zip.file("ops/content/titlepage.html"), "titlepage.html should exist");
		assert.ok(zip.file("ops/content/chapter_001.html"), "chapter_001.html should exist");
	});

	it("HTML files are converted to XHTML with XML PI", async () => {
		const chapter = zip.file("ops/content/chapter_001.html");
		const content = await chapter.async("string");
		assert.ok(content.startsWith("<?xml"), "should start with XML processing instruction");
	});

	it("HTML files have lang attribute injected", async () => {
		const chapter = zip.file("ops/content/chapter_001.html");
		const content = await chapter.async("string");
		assert.ok(content.includes("lang=\"en-US\""), "should have lang attribute");
	});

	it("package.opf contains accessibility metadata", async () => {
		const opf = zip.file("ops/package.opf");
		const content = await opf.async("string");
		assert.ok(content.includes("schema:accessMode"), "should have accessMode");
		assert.ok(content.includes("schema:accessibilityFeature"), "should have accessibilityFeature");
		assert.ok(content.includes("schema:accessibilityHazard"), "should have accessibilityHazard");
		assert.ok(content.includes("schema:accessibilitySummary"), "should have accessibilitySummary");
	});

	it("container.xml points to the OPF", async () => {
		const container = zip.file("META-INF/container.xml");
		const content = await container.async("string");
		assert.ok(content.includes("full-path=\"ops/package.opf\""));
	});
});
