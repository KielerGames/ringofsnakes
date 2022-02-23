const webpack = require("webpack");
const path = require("path");
const pkg = require("./package.json");
const fs = require("fs");

const SHADER_DIR = "src/shader";
const shaders = {};

console.log("Loading shaders...");
let shaderFiles = fs.readdirSync(SHADER_DIR);
shaderFiles.forEach((filename) => {
    if (filename.endsWith(".vert") || filename.endsWith(".frag")) {
        console.log(" --> " + filename);
        let content = fs.readFileSync(SHADER_DIR + "/" + filename, "utf8");
        content = JSON.stringify(content.trim());

        let stn = filename.endsWith(".vert")
            ? "VERTEXSHADER"
            : "FRAGMENTSHADER";
        let id = filename.slice(0, filename.length - 5).toUpperCase();

        shaders["__" + stn + "_" + id + "__"] = content;
    }
});
console.log("Done.");

module.exports = {
    mode: "development",
    entry: {
        main: path.join(__dirname, "src", "app", "main.tsx"),
        worker: path.join(__dirname, "src", "app", "worker", "worker.ts")
    },
    target: "web",
    devtool: "eval-cheap-module-source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    onlyCompileBundledFiles: true
                }
            },
            {
                test: /\.less$/i,
                use: [
                    { loader: "style-loader" }, //  creates style nodes from JS strings
                    { loader: "css-loader" }, //    translates CSS into a JS module (CommonJS)
                    { loader: "less-loader" } //   compiles Less to CSS
                ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin(
            Object.assign(
                {
                    __VERSION__: JSON.stringify(`${pkg.version}-dev`),
                    __DEBUG__: "true",
                    __TEST__: "false"
                },
                shaders
            )
        )
    ],
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "public")
    }
};
