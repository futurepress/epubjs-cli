import { core, Manifest } from "epubjs";
import JSZip from "jszip";
import { Liquid } from "liquidjs";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import mime from "mime-types";
import filerequest from "./filerequest.js";
import OPF_TEMPLATE from "./templates/opf_template.js";
import CONTAINER_TEMPLATE from "./templates/container_template.js";

global.window = new JSDOM("").window;
global.DOMParser = global.window.DOMParser;
global.XMLSerializer = global.window.XMLSerializer;

const templateEngine = new Liquid();

class ManifestToEpub {
	constructor(url, options={}) {
		this.settings = {
			contentDirectory: options.contentDirectory || "ops",
			opsFilename: options.opsFilename || "package.opf"
		};
		this.zip = new JSZip();
		this.zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

		if (url) {
			return this.create(url);
		}
	}

	async create(manifestUrl) {
		this.url = manifestUrl;
		this.manifest = new Manifest(manifestUrl, filerequest);
		await this.manifest.opened;

		this.data = {
			id: this.manifest.id || core.uuid(),
			manifest: [],
			sections: []
		};

		for (const [key, value] of this.manifest.metadata) {
			if (value) {
				this.data[key] = value;
			}
			if (value == "date") {
				this.data["datePublished"] = value;
				this.data["dateModified"] = value;
			}
		}

		let hasNav = false;
		let hasCoverImg = false;

		for (const [key, value] of this.manifest.uniqueResources) {
			let item = value.data;
			let dir = path.dirname(this.url);
			item.url = path.relative(dir, key);

			if (!item.encoding) {
				item.encoding = mime.lookup(item.url);
			}

			if (item.encoding === "text/html") {
				item.encoding = "application/xhtml+xml";
			}

			if (!hasNav && item.rel.includes("contents")) {
				item.properties = ["nav"];
				hasNav = true;
			}

			if (!hasCoverImg && item.rel.includes("cover-image")) {
				item.properties = ["cover-image"];
				hasCoverImg = true;
			}

			this.data.manifest.push(item);
		}

		for (const [, value] of this.manifest.readingOrder) {
			this.data.sections.push(value.data);
		}

		if (this.manifest.coverUrl) {
			this.data.cover = this.manifest.resources.get(this.manifest.coverUrl);
		}

		if (this.manifest.contents) {
			this.data.nav = this.manifest.resources.get(this.manifest.contents);
		}

		let meta = this.zip.folder("META-INF");

		let container = this.generateContainer(`${this.settings.contentDirectory}/${this.settings.opsFilename}`);
		meta.file("container.xml", container);

		let opf = this.generateOPF(this.data);
		const contentDir = this.zip.folder(this.settings.contentDirectory);
		contentDir.file(this.settings.opsFilename, opf);

		for (const [key] of this.manifest.uniqueResources) {
			let filePath = fileURLToPath(key);
			let dir = path.dirname(this.url);
			let relative = path.relative(dir, key);
			let content;

			if (path.extname(relative) === ".html") {
				content = await fs.promises.readFile(filePath, "utf-8");
				content = this.convertToXML(content);
			} else {
				content = await fs.promises.readFile(filePath);
			}

			contentDir.file(relative, content);
		}

		return this;
	}

	convertToXML(content) {
		const serializer = new XMLSerializer();
		const parser = new DOMParser();

		const doc = parser.parseFromString(content, "text/html");

		const pi = doc.createProcessingInstruction("xml", "version=\"1.0\" encoding=\"UTF-8\"");
		doc.insertBefore(pi, doc.firstChild);

		return serializer.serializeToString(doc);
	}

	generateOPF(pub) {
		const opfTemplate = templateEngine.parse(OPF_TEMPLATE);
		return templateEngine.renderSync(opfTemplate, pub);
	}

	generateContainer(opsPath) {
		const containerTemplate = templateEngine.parse(CONTAINER_TEMPLATE);
		return templateEngine.renderSync(containerTemplate, { opsPath });
	}

	async save() {
		return this.zip.generateAsync({
			type:"nodebuffer",
			streamFiles: false,
			compression: "DEFLATE",
			compressionOptions: {
				level: 9
			},
			mimeType: "application/epub+zip"
		});
	}
}

export default ManifestToEpub;
