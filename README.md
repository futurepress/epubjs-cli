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
## Publication Manifests

A publication manifest is a JSON-LD serialized document that allows for expressing information about a digital publication, and providing URLs to the resource that publication requires. It's defined by the [W3C Publication Manifests](https://www.w3.org/TR/pub-manifest/) standard. It mostly maps nicely to elements in the Epub OPF XML document.

## Adding Metadata

The manifest can support any schema.org metadata but when converting to Epub there are a few important ones that will be included in the generated `package.opf`.

* `dateModified` -> `dcterms:modified`
* `id` -> `dc:identifier`
* `inLanguage` -> `dc:language`
* `dateModified` -> `dcterms:modified` 
* `rights` -> `dc:rights`
* `creators[]` -> `dc:creator`
* `contributor[]` -> `dc:contributor`
* `title` -> `dc:title`
* `source` -> `dc:source`
* `subject` -> `dc:subject`
* `description` -> `dc:description`

## Epub specific information

* HTML items can include a `properties` array, which will be passed as spine item properties when converting to Epub.
* HTML items in the resources object will be included in the Epub spine element as non-linear spine items.
* `rel="cover"` -> identifies the cover spine item
* `rel="cover-image"` -> identifies the Epub cover image url
* `rel="contents"` -> identifies the Table of Contents / Nav for the Epub