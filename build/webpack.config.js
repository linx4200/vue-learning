const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const SRC_DIR = path.resolve(__dirname, '../src');
const EXAMPLES_DIR = path.resolve(__dirname, '../examples');

module.exports = {
  target: 'node',
  entry: {
    todos: './examples/todos/app.js',
    nested: './examples/nested/app.js',
  },
  devtool: 'inline-source-map',
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['todos'],
      filename: 'index.html',
      template: 'examples/todos/index.html',
    }),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['nested'],
      filename: 'nested.html',
      template: 'examples/nested/index.html',
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'babel-loader',
        ],
        include: [
          SRC_DIR,
          EXAMPLES_DIR
        ],
      }
    ]
  }
};