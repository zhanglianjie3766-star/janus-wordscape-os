const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

class StaticAssetPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('StaticAssetPlugin', (compilation) => {
      const source = path.resolve(__dirname, 'public');

      if (!fs.existsSync(source)) {
        return;
      }

      compilation.hooks.processAssets.tap(
        {
          name: 'StaticAssetPlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        () => {
          const files = [];

          function walk(directory) {
            for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
              const fullPath = path.join(directory, item.name);

              if (item.isDirectory()) {
                walk(fullPath);
              } else {
                files.push(fullPath);
              }
            }
          }

          walk(source);

          for (const file of files) {
            const relativePath = path.relative(source, file).replace(/\\/g, '/');
            compilation.emitAsset(relativePath, new compiler.webpack.sources.RawSource(fs.readFileSync(file)));
          }
        }
      );
    });
  }
}

module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production' || process.env.NODE_ENV === 'production';

  return {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true,
    publicPath: ''
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'globalThis.__TECHLEX_IS_PRODUCTION__': JSON.stringify(isProduction)
    }),
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new StaticAssetPlugin()
  ],
  performance: {
    assetFilter: (assetFilename) => !assetFilename.endsWith('.json')
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    historyApiFallback: false,
    hot: true
  }
  };
};
