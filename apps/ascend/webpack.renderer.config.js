const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  target: 'web',
  entry: './src/renderer/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.jsx', '.tsx', '.ts', '.js'],
    extensionAlias: {
      '.js': ['.js', '.ts', '.tsx', '.jsx'],
    },
  },
  devtool: 'source-map',
  stats: {
    errorDetails: false
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.render.json',
            transpileOnly: true
          }
        },
        exclude: /node_modules/,
      },
      {
        test: /\.jsx$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico|ttf|woff|woff2|eot)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      filename: 'index.html',
    }),
    new MonacoWebpackPlugin({
      languages: ['typescript', 'javascript', 'json', 'html', 'css', 'python', 'java', 'cpp', 'csharp', 'go', 'rust'],
      features: ['!accessibilityHelp', '!bracketMatching', '!caretOperations', '!clipboard', '!codeAction', '!codelens', '!colorPicker', '!comment', '!contextmenu', '!cursorUndo', '!dnd', '!find', '!folding', '!fontZoom', '!format', '!gotoError', '!gotoLine', '!gotoSymbol', '!hover', '!iPadShowKeyboard', '!inPlaceReplace', '!indentation', '!inlineCompletions', '!inlineProgress', '!inspectTokens', '!linesOperations', '!linkedEditing', '!links', '!multicursor', '!parameterHints', '!quickCommand', '!quickOutline', '!quickHelp', '!referenceSearch', '!rename', '!smartSelect', '!snippets', '!suggest', '!toggleHighContrast', '!toggleTabFocusMode', '!transpose', '!unusualLineTerminators', '!viewportSemanticTokens', '!wordHighContrast', '!wordOperations', '!wordPartOperations']
    }),
  ],
  devServer: {
    port: 3006,
    hot: true,
    historyApiFallback: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
};
