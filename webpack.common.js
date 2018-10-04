const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const sass = require('node-sass');
const ScriptVars = require(__dirname + '/src/shared/themes/ScriptVars.js').ScriptVars;
const ScriptVarNames = require(__dirname + '/src/shared/themes/ScriptVars.js').ScriptVarNames;
const sassUtils = require('node-sass-utils')(sass);

function getVarGenerator( values ) {
  return function(keys) {
    keys = keys.getValue().split('.');
    var result = values;
    var i;
    for (i = 0; i < keys.length; i++) {
      result = result[keys[i]];
      // Convert to SassDimension if dimenssion
      if (typeof result === 'string') {
        result = convertStringToSassDimension(result);
      } else if (typeof result === 'object') {
        Object.keys(result).forEach(function(key) {
          var value = result[key];
          result[key] = convertStringToSassDimension(value);
        });
      }
    }
    result = sassUtils.castToSass(result);
    return result;
  }
}

const sassRules = [
  MiniCssExtractPlugin.loader,
  // 'style-loader',
  'css-loader',
  'postcss-loader',
  {
    loader: 'sass-loader',
    options: {
      functions: {
        '_getVar($keys)': getVarGenerator( ScriptVars ),
        '_getVarName($keys)': getVarGenerator( ScriptVarNames )
      }
    }
  }
];

module.exports = {
  entry: {
    bundle: path.resolve(__dirname, './src/index.jsx'),
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader'],
        resolve: { extensions: ['.js', '.jsx'] },
      },
      {
        test: /\.(sc|sa|c)ss$/,
        use: sassRules
      }
    ]
  },
  devServer: {
    proxy: {
      'http://localhost:3000': {
        // target: 'http://localhost:3000'
        target: 'https://dev-prism-api.ebus.swaws'
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyWebpackPlugin([
      { 
        from: 'src/images/scenes/*', 
        to: 'images/scenes',
        flatten: true
      },
      { 
        from: 'src/css/*', 
        to: 'css',
        flatten: true
      }
    ])
  ],
  resolve: {
    alias: {
      StyleVars: path.resolve(__dirname, 'src/scss/StyleVars.scss'),
      // not allowing Scripts to resolve like Styles because it breaks intellisense
      // ScriptVars: path.resolve(__dirname, 'src/shared/themes/ScriptVars.js')
    }
  }
};


function convertStringToSassDimension(result) {
  // Only attempt to convert strings
  if (typeof result !== 'string') {
    return result;
  }

  const cssUnits = [
    'rem',
    'em',
    'vh',
    'vw',
    'vmin',
    'vmax',
    'ex',
    '%',
    'px',
    'cm',
    'mm',
    'in',
    'pt',
    'pc',
    'ch'
  ];
  const parts = result.match(/[a-zA-Z]+|[0-9]+/g);
  const value = parts[0];
  const unit = parts[parts.length - 1];
  if (cssUnits.indexOf(unit) !== -1) {
    result = new sassUtils.SassDimension(parseInt(value, 10), unit);
  }

  return result;
};
