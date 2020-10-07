const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

class P {
  apply (compiler) {
    compiler.hooks.emit.tap('emit', function () {
      console.log('emit...')
    })
  }
}

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: './dist',
    port: 3000,
    progress: true
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          path.resolve(__dirname, 'loader', 'style-loader'),
          path.resolve(__dirname, 'loader', 'less-loader')
        ]
      }
    ]
  },
  plugins: [
    new P()
  ]
}
