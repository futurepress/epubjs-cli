# EpubJS-CLI

A CLI for creating ePubs from [W3C Publication Manifests](https://www.w3.org/TR/pub-manifest/).

## Installation

```
npm install -g epubjs-cli
```

## Creating an ePub

```
epubs-cli create ./path/to/manifest.jsonld -o mybook.epub
```

## Options

```
Usage: epubjs-cli [options] [command]

Create an Epub from a JSON Manifest

Options:
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  create [options] <inputPath>
  help [command]                display help for command
```
## Using with Nodejs

Input must be a file url.

```
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { ManifestToEpub } from "epubjs-cli";

let filePath = "./manifest.jsonld";
let url = pathToFileURL(filePath).href;

let epub = await new ManifestToEpub(url);
let file = await epub.save();

if (file) {
  writeFileSync("./mybook.epub", file);
}
```
