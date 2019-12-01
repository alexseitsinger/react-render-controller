const path = require("path")
const nodeExternals = require("webpack-node-externals")

module.exports = {
  entry: "./src/index.js",
  target: "node",
  mode: "development",
  devtool: "source-map",
  output: {
    path: path.resolve("./dist"),
    sourceMapFilename: "[name].dev.js.map",
    filename: "[name].dev.js",
    libraryTarget: "commonjs2",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [path.resolve("./src")],
        use: "babel-loader",
      },
    ],
  },
  externals: [
    nodeExternals({
      modulesFromFile: {
        include: ["devDependencies", "peerDependencies"],
        exclude: ["dependencies"],
      },
    }),
  ],
  resolve: {
    alias: {
      tests: path.resolve("./tests"),
      src: path.resolve("./src"),
    },
  },
}
