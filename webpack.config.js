const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');
const data = require('./events.json');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return ({
    entry: [
      './src/js/index.ts',
      './src/styl/main.styl',
      './src/pug/index.pug',
      './src/pug/events.pug',
      './src/pug/video-monitoring.pug',
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'awesome-typescript-loader',
        },
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.(styl|css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                minimize: isProduction,
                sourceMap: !isProduction,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: !isProduction,
              },
            },
            {
              loader: 'stylus-loader',
              options: {
                compress: isProduction,
                sourceMap: !isProduction,
              },
            },
          ],
        },
        {
          test: /\.pug$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].html',
                context: 'src/pug/',
              },
            },
            {
              loader: 'pug-html-loader',
              options: {
                pretty: true,
                data,
              },
            },
          ],
        },
        {
          test: /\.(jpg|jpeg|png|svg|ico|gif)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]',
                context: 'src/',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new CheckerPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css',
      }),
      new CleanPlugin(['dist/'], {
        verbose: true,
        dry: false,
      }),
      new CopyWebpackPlugin([
        { from: 'src/images/', to: 'images' },
      ]),
    ],
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    devServer: {
      open: true,
    },
  });
};
