var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    './run.js'
  ],
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  watch: true,
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.html/, loader: 'file-loader'
    }, {
      test: /\.js$/,
      include: path.join(__dirname),
      loader: 'babel-loader',
      exclude: /lib/
    }, {
      test: /\.js$/,
      loader: 'eslint-loader',
      exclude: /node_modules|lib/
    }]
  }
};
