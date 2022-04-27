/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const webpack = require("webpack");
const path = require("path");
const pkg = require("./package.json");

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
        new webpack.DefinePlugin({
            __VERSION__: JSON.stringify(`${pkg.version}-dev`),
            __DEBUG__: "true",
            __TEST__: "false"
        })
    ],
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "public")
    }
};
