const webpack = require('webpack');

const DEV = process.env.NODE_ENV !== 'production';

module.exports = {
  bail: !DEV,
  devtool: DEV ? 'cheap-module-source-map' : 'source-map',
  target: 'node',
  entry: './ui/server.js',
  output: {
    path: 'build/server',
    filename: 'bundle.js',
    publicPath: '/',
  },
  externals: (context, request, callback) => {
    // Externalize all npm modules.
    if (/^[a-z0-9-][a-z0-9-./]+$/.test(request)) {
      return callback(null, `commonjs ${request}`);
    }
    callback();
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(DEV ? 'development' : 'production'),
    }),
  ],
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false,
  },
};
