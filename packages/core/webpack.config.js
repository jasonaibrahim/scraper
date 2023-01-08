const webpack = require("webpack");
const path = require("path");

module.exports = (env) => {
  const envVars = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});

  return {
    entry: "./src/index.ts",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      fallback: {
        // this is here because of `open-graph-scraper-lite`
        buffer: require.resolve("buffer"),
        // this is here because of `open-graph-scraper-lite`
        string_decoder: false,
      },
    },
    output: {
      filename: "scraper.js",
      library: "scraper",
      libraryTarget: "umd",
      path: path.resolve(__dirname, "dist"),
    },
    plugins: [
      new webpack.DefinePlugin(envVars),
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
    ],
  };
};
