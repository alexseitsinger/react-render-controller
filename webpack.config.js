const path = require("path")
const nodeExternals = require("webpack-node-externals")

module.exports = {
  entry: "./src/index.js",
  target: "node",
  mode: "production",
  output: {
    path: path.resolve("./dist"),
    filename: "[name].js",
    libraryTarget: "commonjs2",
    libraryExport: "default"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: "babel-loader",
      }
    ]
  },
  externals: [
    nodeExternals({
      modulesFromFile: {
        exclude: ["dependencies"],
        include: ["peerDependencies", "devDependencies"]
      }
    })
  ]
}
