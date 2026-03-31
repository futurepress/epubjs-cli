#!/usr/bin/env node
import { Command } from "commander";
import ora from "ora";

import fs, { accessSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import path, { extname } from "node:path";
import { execFile } from "node:child_process";

import ManifestToEpub from "../src/epub.js";

function runAceCheck(epubPath, spinner) {
	return new Promise((resolve, reject) => {
		let aceBin = path.resolve(
			path.dirname(fileURLToPath(import.meta.url)),
			"../node_modules/.bin/ace"
		);

		try {
			accessSync(aceBin, fs.F_OK);
		} catch (e) {
			reject(new Error(
				"@daisy/ace is not installed. Install it with: npm install @daisy/ace"
			));
			return;
		}

		spinner.start("Running accessibility check: " + epubPath);

		execFile(aceBin, [epubPath], (error, stdout, stderr) => {
			if (error) {
				spinner.fail("Accessibility check failed");
				if (stderr) {
					console.error(stderr);
				}
				if (stdout) {
					console.error(stdout);
				}
				reject(error);
				return;
			}

			spinner.succeed("Accessibility check passed");
			if (stdout) {
				process.stdout.write(stdout);
			}
			resolve();
		});
	});
}

const program = new Command();

program
	.name("epubjs-cli")
	.description("Create an Epub from a JSON Manifest")
	.version("0.1.0");

program.command("create")
	.argument("<inputPath>", "Input path")
	.option("-o, --output [output]", "Output")
	.option("-c, --check", "Accessibility check")
	.action((input, options) => {
		let dir = process.cwd();
		let output;

		if (!input) {
			console.error("You must include an input path");
			process.exit(1);
		}

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
			try {
				let url = pathToFileURL(input).href;

				let epub = await new ManifestToEpub(url);

				let file = await epub.save();

				spinner.succeed("Generated");

				if (file && output) {
					await fs.promises.writeFile(output, file);
					spinner.succeed("Saved to " + output);

					if (options.check) {
						await runAceCheck(output, spinner);
					}

					process.exit(0);
				} else if (file) {
					process.stdout.write(file);
				}
			} catch (err) {
				spinner.fail("Failed to create EPUB");
				console.error(err);
				process.exit(1);
			}
		})();
	});

program.command("check")
	.argument("<epubPath>", "Path to EPUB file")
	.action((epubPath) => {
		try {
			accessSync(epubPath, fs.F_OK);
		} catch (e) {
			console.error("EPUB file cannot be found", e);
			process.exit(1);
		}

		if (extname(epubPath) !== ".epub") {
			console.error("Must pass an .epub file");
			process.exit(1);
		}

		const spinner = ora({
			spinner: "circleQuarters"
		});

		(async () => {
			try {
				await runAceCheck(path.resolve(epubPath), spinner);
				process.exit(0);
			} catch (err) {
				process.exit(1);
			}
		})();
	});

program.parse(process.argv);
