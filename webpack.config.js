module.exports = {
  entry: './ui/client.js',
  output: {
    filename: "bundle.js",
    publicPath: '/'
  },
  module: {
    loaders: [{
      test: /\.css/,
      loader: 'style!css'
    }, {
      test: /\.js$/,
      loader: 'babel',
      exclude: /(node_modules)/
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  devServer: {
  },
  devtool: "eval-source-map",
}
