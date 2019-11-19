# Prism Core

## Getting Started

### Running Local Instance
```
# will generate assets for the embed and bundle entrypoints
# and start a server at localhost:8080
npm start
```

or, to build one or more specific entrypoint assets, pass the desired entrypoints to the `ENTRY` var as a comma-delimited list:
```
# this will build bundle.js, css/bundle.css, and css/cleanslate.css
ENTRY=bundle npm start
```

Refer to `webpack/constants.js` for all available entrypoint names in the `facetEntryPoints` and `mainEntryPoints` exports.

#### Specifying local host
The local dev server will typically run from `localhost`, but if you need to specify a different host you can do so by passing a var like so:
```
URL=https://0.0.0.0:8080 npm start
```

### Deploy
```
npm ci
npm run build
```
Jenkins Build - https://jenkins.ebus.swaws/job/TAG%20Ecomm/job/Prism/

## Scripts and Styles Share Vars
`src/shared/themes/ScriptVars.js` contains a JSON object of style variables which can be `import`ed into React components and also `@import`ed into SCSS via `src/scss/StyleVars.scss` which translates ScriptVars values by key name via the `get()` method.

## SVG Room Masking Paths
- SVGs must NOT have a width/height
- SVGs must have an ID of `mask` for now
- SVGs must have viewBox
- SVGs must NOT specify any fill or stroke on any node
- SVGs can be converted from alpha PNG files in a number of ways, but I've been using [SVG Creator](https://svgcreator.com/). It has given the best results in terms of the output SVG file. For input I've used the Scene7 mask PNGs used in the existing CVT with 000000 specified as the value for the color param (needs to be black; only black areas are converted to SVG shapes with this tool).
- Scene mask PNGs must be white over transparent, which differs from the SVG creator tool mentioned above.

## Configurations
When adding a new configuration property, this needs accounted for in several places.

1. Update the `DEFAULT_CONFIGURATION` object within `src/constants/configurations.js`.
2. Update the schema in `src/shared/types/Configuration.js.flow`.
3. If it's a theme variable update/addition, you'll also need to update `src/contexts/ConfigurationContextProvider.js` to map the appropriate CSS var.

## Websites Using PRISM
| Website | Facet |
| --- | ----------- |
| sherwin-williams.ca | ColorListingPage |
