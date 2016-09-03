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
      // Exclude apollo client from the webpack config in case
      // we want to use npm link.
      exclude: /(node_modules)|(apollo-client)/
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  devServer: {
  },
}
