const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const APP_DIR = path.resolve(__dirname, '../src');

module.exports = {
  entry: {
    app: './src/main.js'
  },
  devtool: 'inline-source-map',
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      // inject: true
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
        // path.resolve(__dirname, "app")
        APP_DIR
      ],
    }
  ]}
};