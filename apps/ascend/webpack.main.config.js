const path = require('path');

module.exports = {
  target: 'electron-main',
  entry: {
    main: './src/main/main.ts',
    preload: './src/main/preload.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [
      'node_modules',
      path.resolve(__dirname, '../../node_modules'),
      path.resolve(__dirname, '../../../node_modules') // Just in case
    ],
    extensionAlias: {
      '.js': ['.js', '.ts'],
    },
  },
  externals: {
    'openai': 'commonjs openai',
    '@anthropic-ai/sdk': 'commonjs @anthropic-ai/sdk',
    'pg': 'commonjs pg',
    'pg-mem': 'commonjs pg-mem',
    'fsevents': 'commonjs fsevents',
    'fs-extra': 'commonjs fs-extra',
    'axios': 'commonjs axios',
    'playwright': 'commonjs playwright',
    '@playwright/test': 'commonjs @playwright/test',
    'axe-core': 'commonjs axe-core',
    '@axe-core/playwright': 'commonjs @axe-core/playwright',
    'lighthouse': 'commonjs lighthouse',
    'chrome-launcher': 'commonjs chrome-launcher',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico|ttf|woff|woff2|eot|html|css)$/,
        type: 'asset/resource',
      },
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};
