# Prism Core

## Getting Started

### Running Local Instance
```
npm start
```

### Deploy
```
npm install
npm run build
```

## Scripts and Styles Share Vars
`src/shared/themes/ScriptVars.js` contains a JSON object of style variables which can be `import`ed into React components and also `@import`ed into SCSS via `src/scss/StyleVars.scss` which translates ScriptVars values by key name via the `get()` method.

## SVG Room Masking Paths
- SVGs must not have a width/height
- SVGs must have an ID for now, currently `svg1`
- SVGs must have viewBox
- SVGs must not specify any fill or stroke on any node
- SVGs can be converted from alpha PNG files in a number of ways, but I've been using [SVG Creator](https://svgcreator.com/). It has given the best results in terms of the output SVG file. For input I've used the Scene7 mask PNGs used in the existing CVT with 000000 specified as the value for the color param (needs to be black; only black areas are converted to SVG shapes with this tool).