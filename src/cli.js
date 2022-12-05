#!/usr/bin/env node
import { Command } from "commander";
import ora from "ora";

import fs, { writeFile, accessSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path, { extname } from "node:path";

import ManifestToEpub from "../src/epub.js";

const program = new Command();

program
	.name("epubjs-cli")
	.description("Create an Epub from a JSON Manifest")
	.version("0.1.0");

program.command("create")
	.argument("<inputPath>", "Input path")
	.option("-o, --output [output]", "Output")
	.action((input, options) => {
		let dir = process.cwd();
		let output;

		if (!input) {
			console.error("You must include an input path");
			process.exit(1);
		}

		if (input) {

			if ([".json", ".jsonld"].indexOf(extname(input)) === -1) {
				console.error("Must pass a json or jsonld file as input");
				process.exit(1);
			}

			try {
				accessSync(input, fs.F_OK);
			} catch (e) {
				console.error("Input cannot be found", e);
				process.exit(1);
			}
		}

		if (typeof(options.output) === "string") {
			output = path.resolve(dir, options.output);
		} else if (typeof(options.output) !== "undefined") {
			let name = path.basename(input, path.extname(input));
			output = "./" + name + ".epub";
		}


		const spinner = ora({
			spinner: "circleQuarters"
		});

		spinner.start("Converting: " + input);

		(async () => {
			let url = pathToFileURL(input).href;

			let epub = await new ManifestToEpub(url);

			let file = await epub.save();

			spinner.succeed("Generated");

			if (file && output) {
				writeFile(output, file, (err) => {
					if (err) throw err;
					spinner.succeed("Saved to " + output);
					process.exit(0);
				});
			} else if (file) {
				process.stdout.write(file);
			}

		})();
	});

program.parse(process.argv);


