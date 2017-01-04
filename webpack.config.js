module.exports = [
  {
    name: 'browser',
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
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader'
      }]
    },
    devServer: {
    },
    devtool: "eval-source-map",
  },
  {
    name: 'SSR server',
    entry: './ui/server.js',
    target: 'node',
    output: {
      filename: 'server_bundle.js',
      publicPath: '/',
    },
    libraryTarget: 'commonjs32',
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel',
          exclude: /(node_modules)/
        },
        {
          test: /\.json$/,
          loader: 'json'
        },
        {
          test: /\.(graphql|gql)$/,
          exclude: /node_modules/,
          loader: 'graphql-tag/loader'
        }
      ]
    }
  }
]
