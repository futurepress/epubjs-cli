import { core, url } from "epubjs";
import fs from "node:fs";
import {fileURLToPath} from "node:url";

const { isXml, parse } = core;
const { extension } = url;

async function filerequest(url, type, options={}) {
	let filePath = fileURLToPath(url);

	// If type isn't set, determine it from the file extension
	if(!type) {
		type = extension(url);
	}

	return await fs.promises.readFile(filePath, "utf8")
		.then(function(response) {
			if(isXml(type)){
				return response;
			} else if(type == "xhtml"){
				return response;
			} else if(type == "html" || type == "htm"){
				return response;
			} else if(type == "json"){
				return JSON.parse(response);
			} else if(type == "blob"){
				// return response.blob();
				return response;
			} else if(type == "binary"){
				// return response.arrayBuffer();
				return response;
			} else {
				return response;

			}
		})
		.then(function(result) {
			let r;

			if(isXml(type)){
				r = parse(result, "text/xml");
			} else if(type === "xhtml"){
				r = parse(result, "application/xhtml+xml");
			} else if(type === "html" || type === "htm"){
				r = parse(result, "text/html");
			} else if(type === "json"){
				r = result;
			} else if(type === "blob"){
				r = result;
			} else {
				r = result;
			}

			return r;
		});
}

export default filerequest;
