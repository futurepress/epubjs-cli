# EpubJS-CLI

A CLI for creating ePubs from [W3C Publication Manifests](https://www.w3.org/TR/pub-manifest/).

## Installation

```
npm install -g epubjs-cli
```

## Creating an ePub

```
epubjs-cli create ./path/to/manifest.jsonld -o mybook.epub
```

### With accessibility check

Run a [DAISY Ace](https://daisy.github.io/ace/) accessibility check after creating the ePub. Ace must be installed first with:

```
npm install @daisy/ace
```

Then use the `--check` flag:

```
epubjs-cli create ./path/to/manifest.jsonld -o mybook.epub --check
```

## Checking accessibility

Run an accessibility check on an existing ePub file (requires `@daisy/ace`):

```
epubjs-cli check mybook.epub
```

## Options

```
Usage: epubjs-cli [options] [command]

Create an Epub from a JSON Manifest

Options:
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  create [options] <inputPath>  Create an Epub from a manifest
  check <epubPath>              Run DAISY Ace accessibility check
  help [command]                display help for command
```

### Create options

```
  -o, --output [output]  Output file path
  -c, --check            Run accessibility check with DAISY Ace after creating
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

- `dateModified` -> `dcterms:modified`
- `id` -> `dc:identifier`
- `inLanguage` -> `dc:language`
- `dateModified` -> `dcterms:modified`
- `rights` -> `dc:rights`
- `creators[]` -> `dc:creator`
- `contributor[]` -> `dc:contributor`
- `title` -> `dc:title`
- `source` -> `dc:source`
- `subject` -> `dc:subject`
- `description` -> `dc:description`

## Epub specific information

- HTML items can include a `properties` array, which will be passed as spine item properties when converting to Epub.
- HTML items in the resources object will be included in the Epub spine element as non-linear spine items.
- `rel="cover"` -> identifies the cover spine item
- `rel="cover-image"` -> identifies the Epub cover image url
- `rel="contents"` -> identifies the Table of Contents / Nav for the Epub
