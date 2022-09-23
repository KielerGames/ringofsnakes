/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const webpack = require("webpack");
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const pkg = require("./package.json");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const SHADER_HASH = (() => {
    const fileBuffer = fs.readFileSync(path.join("public", "shaders.json"));
    const hashSum = crypto.createHash("sha256");
    hashSum.update(fileBuffer);

    return hashSum.digest("hex").substring(0, 10);
})();

module.exports = (env, argv) => {
    const mode = argv.mode ?? "development";
    const versionString = pkg.version + (mode === "development" ? "-dev" : "");

    return {
        mode: mode ?? "development",
        entry: {
            main: path.join(__dirname, "src", "app", "main.tsx"),
            worker: path.join(__dirname, "src", "app", "worker", "worker.ts")
        },
        target: "web",
        devtool: mode !== "development" ? undefined : "eval-cheap-module-source-map",
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
                        MiniCssExtractPlugin.loader, // extract CSS into a separate file
                        "css-loader", //                translates CSS into a JS module (CommonJS)
                        "less-loader" //                compiles Less to CSS
                    ]
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                chunks: ["main"], // exclude worker script
                title: "Ring of Snakes " + versionString,
                minify: false,
                hash: true // important for caching
            }),
            new webpack.DefinePlugin({
                __VERSION__: JSON.stringify(versionString),
                __SHADER_HASH__: JSON.stringify(SHADER_HASH),
                __DEBUG__: mode === "development" ? "true" : "false",
                __TEST__: "false"
            }),
            new BundleAnalyzerPlugin({
                analyzerMode: mode === "development" ? "disabled" : "static",
                reportFilename: "bundle-report.html",
                openAnalyzer: false,
                generateStatsFile: mode !== "development",
                statsFilename: "bundle-stats.json"
            }),
            new MiniCssExtractPlugin({
                filename: "app.css"
            })
        ],
        output: {
            filename: "[name].bundle.js",
            path: path.resolve(__dirname, "public")
        },
        optimization: {
            minimizer: [
                `...`, // extend existing minimizers
                new CssMinimizerPlugin()
            ]
        }
    };
};
