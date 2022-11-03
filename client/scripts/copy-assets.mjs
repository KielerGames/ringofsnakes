import fs from "node:fs";
import path from "node:path";

const TEXTURE_DIR = "src/textures";
const OUTPUT_FOLDER = "public/assets";

if (!fs.existsSync(OUTPUT_FOLDER)) {
    console.info(`Creating folder: ${OUTPUT_FOLDER}`);
    fs.mkdirSync(OUTPUT_FOLDER);
}

fs.readdirSync(TEXTURE_DIR)
    .filter((file) => file.endsWith(".svg"))
    .forEach((texture) => {
        console.log("copying " + texture);
        fs.copyFileSync(path.join(TEXTURE_DIR, texture), path.join(OUTPUT_FOLDER, texture));
        // TODO: use https://github.com/svg/svgo
    });
