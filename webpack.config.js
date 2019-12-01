const path = require("path")
const nodeExternals = require("webpack-node-externals")
const TerserPlugin = require("terser-webpack-plugin")

module.exports = {
  entry: "./src/index.js",
  target: "node",
  mode: "production",
  devtool: false,
  output: {
    path: path.resolve("./dist"),
    filename: "[name].js",
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
        exclude: ["dependencies"],
        include: ["peerDependencies", "devDependencies"],
      },
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        sourceMap: false,
        extractComments: false,
        terserOptions: {
          warnings: false,
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
  resolve: {
    alias: {
      tests: path.resolve("./tests"),
      src: path.resolve("./src"),
    },
  },
}
