const webpack = require("webpack");
const path = require("path");
const pkg = require("./package.json");

module.exports = {
    mode: "development",
    entry: path.join(__dirname, "src", "ts", "main.tsx"),
    target: "web",
    devtool: "eval-cheap-module-source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: "/node_modules/",
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            __VERSION__: JSON.stringify(`${pkg.version}-dev`),
            __DEBUG__: "true",
        }),
    ],
    output: {
        filename: "game.js",
        path: path.resolve(__dirname, "public"),
    },
};
