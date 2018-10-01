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