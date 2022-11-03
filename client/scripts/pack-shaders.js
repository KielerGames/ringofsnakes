/* eslint-disable */
const fs = require("node:fs");
const path = require("node:path");
/* eslint-enable */

const SHADER_DIR = path.join("src", "shader");
const OUTPUT_FOLDER = "public";
const OUTPUT_FILE = path.join(OUTPUT_FOLDER, "shaders.json");

// eslint-disable-next-line no-undef
const args = new Set(process.argv.slice(2).map((a) => a.replace(/^--/, "")));
const minify = args.has("minify");

if (!fs.existsSync(OUTPUT_FOLDER)) {
    console.info(`Creating folder: ${OUTPUT_FOLDER}`);
    fs.mkdirSync(OUTPUT_FOLDER);
}

console.log(minify ? "Loading and minifying shaders..." : "Loading shaders...");

const shaders = fs
    .readdirSync(SHADER_DIR)
    .filter((filename) => filename.endsWith(".vert") || filename.endsWith(".frag"))
    .reduce((shaders, filename) => {
        console.log(" --> " + filename);

        const rawContent = fs.readFileSync(SHADER_DIR + "/" + filename, "utf8").trim();
        if (!rawContent.startsWith("#version 300 es")) {
            console.warn("     " + "WARNING: GLSL 100 shader code (use GLSL 300 instead)");
        }
        shaders[filename] = args.has("minify") ? minifyShaderCode(rawContent) : rawContent;

        return shaders;
    }, {});

console.log("Done. Writing...");
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(shaders));
console.log(" --> " + OUTPUT_FILE + "\n");

function minifyShaderCode(shaderCode) {
    return shaderCode
        .replace(/\r/g, "") // Remove carriage returns (only newlines)
        .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multiline comments
        .replace(/\/\/[^\n]*/g, "\n") // Remove single line comments
        .replace(/;[\s\n]+/g, ";") // Remove unnecessary whitespaces and line breaks
        .replace(/\{[\s\n]+/g, "{"); // Remove unnecessary whitespaces and line breaks
}
