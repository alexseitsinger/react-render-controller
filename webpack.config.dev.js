const path = require("path")
const nodeExternals = require("webpack-node-externals")

module.exports = {
  entry: "./src/index.ts",
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
        test: /\.(j|t)sx?$/,
        include: [path.resolve("./src")],
        use: [
          "babel-loader",
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.dev.json",
            },
          },
        ],
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
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      tests: path.resolve("./tests"),
      src: path.resolve("./src"),
    },
  },
}
