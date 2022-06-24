/* eslint-disable */
const fs = require("node:fs");
const path = require("node:path");
/* eslint-enable */

const SHADER_DIR = path.join("src", "shader");
const OUTPUT_FILE = path.join("public", "shaders.json");

console.log("Loading shaders...");

const shaders = fs
    .readdirSync(SHADER_DIR)
    .filter((filename) => filename.endsWith(".vert") || filename.endsWith(".frag"))
    .reduce((shaders, filename) => {
        console.log(" --> " + filename);

        const rawContent = fs.readFileSync(SHADER_DIR + "/" + filename, "utf8");
        shaders[filename] = rawContent.trim();

        // TODO: consider minifying shaders (remove unnecessary whitespaces, rename variables, ...)

        return shaders;
    }, {});

console.log("Done. Writing...");
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(shaders));
console.log(" --> " + OUTPUT_FILE + "\n");
