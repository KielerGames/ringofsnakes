import fs from "node:fs";
import path from "node:path";
import svgo from "svgo";

const TEXTURE_DIR = "src/textures";
const OUTPUT_FOLDER = "public/assets";

if (!fs.existsSync(OUTPUT_FOLDER)) {
    console.info(`Creating folder: ${OUTPUT_FOLDER}`);
    fs.mkdirSync(OUTPUT_FOLDER);
}

fs.readdirSync(TEXTURE_DIR)
    .filter((file) => file.endsWith(".svg"))
    .forEach((texture) => {
        const filePath = path.join(TEXTURE_DIR, texture);

        if (texture.endsWith(".svg")) {
            console.log("optimizing " + texture);
            const originalSVG = fs.readFileSync(filePath, "utf-8");
            const optimizedSVG = svgo.optimize(originalSVG, {
                plugins: [
                    "removeDoctype",
                    "removeComments",
                    "removeMetadata",
                    "cleanupAttrs",
                    "cleanupIds",
                    "mergeStyles",
                    "removeViewBox",
                    "removeUselessStrokeAndFill",
                    "minifyStyles",
                    "removeEmptyAttrs",
                    "convertColors",
                    "removeUnknownsAndDefaults",
                    "sortDefsChildren",
                    "removeNonInheritableGroupAttrs",
                    "removeHiddenElems"
                ],
                multipass: true
            }).data;
            fs.writeFileSync(path.join(OUTPUT_FOLDER, texture), optimizedSVG, "utf-8");
        } else {
            console.log("copying " + texture);
            fs.copyFileSync(filePath, path.join(OUTPUT_FOLDER, texture));
        }
    });
