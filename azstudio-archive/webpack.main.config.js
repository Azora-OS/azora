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
    extensionAlias: {
      '.js': ['.js', '.ts'],
    },
  },
  externals: {
    'openai': 'commonjs openai',
    'fsevents': 'commonjs fsevents',
    'pg-native': 'commonjs pg-native',
    'bufferutil': 'commonjs bufferutil',
    'utf-8-validate': 'commonjs utf-8-validate',
    'supports-color': 'commonjs supports-color',
    '@playwright/test': 'commonjs @playwright/test',
    'playwright': 'commonjs playwright',
    'playwright-core': 'commonjs playwright-core',
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
