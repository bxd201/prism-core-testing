const webpack = require('webpack');
const path = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' )
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );
const sass = require( 'node-sass' );
const sassUtils = require( 'node-sass-utils' )( sass );
const varValues = Object.freeze( require( __dirname + '/src/shared/variables.js' ).varValues );
const varNames = Object.freeze( require( __dirname + '/src/shared/variables.js' ).varNames );
const memoizee = require( 'memoizee' );


const getVarGenerator = ( function() {
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

  // look for anything starting with a whole number or decimal and ending in one of the above units
  const unitRegex = new RegExp( `^([0-9.]+)(${cssUnits.join('|')})$` );

  const convertStringToSassDimension = memoizee( function convertStringToSassDimension( str ) {
    // Only attempt to convert strings
    if( typeof str !== 'string' ) {
      return str;
    }

    const result = unitRegex.exec( str );

    if( result ) {
      const value = result[ 1 ];
      const unit = result[ 2 ];

      return new sassUtils.SassDimension( parseFloat( value, 10 ), unit );
    }

    return str;
  }, { primitive: true, length: 1 } );

  function processVarData( data ) {
    var type = typeof data,
      returner;

    // Convert to SassDimension if dimenssion
    if( type === 'string' ) {
      returner = convertStringToSassDimension( data );
    } else if( type === 'object' ) {
      // if it's an object, we'll need to recursively iterate through it
      returner = {};
      Object.keys( data ).forEach( function( key ) {
        returner[ key ] = processVarData( data[ key ] );
      } );
    }

    return returner;
  }

  return function getVarGenerator( values ) {
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
} )();



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
  },
  {
    loader: 'sass-resources-loader',
    options: {
      resources: [
        path.resolve( __dirname, 'src/scss/mixins/mixins.scss' ),
        path.resolve( __dirname, 'src/scss/functions/functions.scss' ),
        path.resolve( __dirname, 'src/scss/variables.scss' )
      ]
    }
  }
];

module.exports = {
  entry: {
    bundle: path.resolve( __dirname, './src/index.jsx' ),
    author: path.resolve( __dirname, './src/author.js' ),
  },
  output: {
    path: path.join( __dirname, '/dist' ),
    filename: '[name].js'
  },
  resolve: {
    alias: {
      constants: path.resolve(__dirname, 'src/constants/'),
      variables: path.resolve(__dirname, 'src/shared/variables.js')
    }
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
        from: 'src/images',
        to: 'prism/images'
      },
      {
        from: 'src/json',
        to: 'prism/json'
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
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
};
