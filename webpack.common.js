const webpack = require('webpack');
const path = require( 'path' );
const _ = require( 'lodash' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' )
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );
const sass = require( 'node-sass' );
const sassUtils = require( 'node-sass-utils' )( sass );
const varValues = Object.freeze( require( __dirname + '/src/shared/variables.js' ).varValues );
const varNames = Object.freeze( require( __dirname + '/src/shared/variables.js' ).varNames );
const memoizee = require( 'memoizee' );


const sassRules = [
  MiniCssExtractPlugin.loader,
  'css-loader',
  'postcss-loader',
  {
    loader: 'sass-loader',
    options: {
      functions: {
        '_getVar($keys)': getVarGenerator( varValues ),
        '_getVarName($keys)': getVarGenerator( varNames )
      }
    }
  }
];

module.exports = {
  entry: {
    bundle: path.resolve( __dirname, './src/index.jsx' ),
  },
  output: {
    path: path.join( __dirname, '/dist' ),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [ 'babel-loader', 'eslint-loader' ],
        resolve: { extensions: [ '.js', '.jsx' ] },
      },
      {
        test: /\.(sc|sa|c)ss$/,
        use: sassRules
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin( { template: './src/index.html' } ),
    new MiniCssExtractPlugin( {
      filename: '[name].css',
    } ),
    new CopyWebpackPlugin( [
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
    ]),
    new webpack.DefinePlugin({
      '$API_PATH': JSON.stringify(process.env.API_URL)
    })
  ],
  resolve: {
    alias: {
      variables: path.resolve( __dirname, 'src/scss/variables.scss' ),
    }
  }
};


const convertStringToSassDimension = memoizee( function convertStringToSassDimension( result ) {
  // Only attempt to convert strings
  if( typeof result !== 'string' ) {
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
  const parts = result.match( /[a-zA-Z]+|[0-9]+/g );
  const value = parts[ 0 ];
  const unit = parts[ parts.length - 1 ];

  if( cssUnits.indexOf( unit ) !== -1 ) {
    return new sassUtils.SassDimension( parseInt( value, 10 ), unit );
  }

  return result;
}, { primitive: true, length: 1 } );

function processVarData( result ) {
  var returner;

  // Convert to SassDimension if dimenssion
  if( typeof result === 'string' ) {
    returner = convertStringToSassDimension( result );
  } else if( typeof result === 'object' ) {
    // if it's an object, we'll need to recursively iterate through it
    returner = {};
    Object.keys( result ).forEach( function( key ) {
      returner[ key ] = processVarData( result[ key ] );
    } );
  }

  return returner;
}

function getVarGenerator( values ) {
  const getVarInternal_memoized = memoizee( function getVarInternal( keys ) {
    var _keys = keys.split( '.' ), returner, i;

    returner = Object.assign( {}, values );
    
    for( i = 0; i < _keys.length; i++ ) {
      returner = returner[ _keys[ i ] ];
    }

    return sassUtils.castToSass( processVarData( returner ) );
  }, { primitive: true, length: 1 } );
  
  return ( keys ) => getVarInternal_memoized( keys.getValue() );
}
