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

### Add templates for local testing
Add new html templates into the `src/templates` directory. Re-run `npm start` and they'll now be available for viewing at `localhost:8080/<templateName>.html`

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

## Importing a PRISM component into an existing React application

### Install PRISM
1. Ensure you are on the SW VPN or on the SW network
2. Install the package
```bash
npm install git+ssh://git@github.sherwin.com:SherwinWilliams/prism-core.git#develop
```

### Add the CSS references into your HTML template
```html
<link rel="stylesheet" type="text/css" href="https://replatform-prism-web.ebus.swaws/css/cleanslate.css">
<link rel="stylesheet" type="text/css" href="https://replatform-prism-web.ebus.swaws/css/bundle.css">
```

### Add the following classes to the element surround the imported PRISM component
```html
<div class="prism cleanslate"></div>
```

### Add FontAwesome credentials
We have FontAwesomePro as a dependency, so the following items needs to be added to the `.npmrc` file in your project.
```
@fortawesome:registry=https://npm.fontawesome.com/
//npm.fontawesome.com/:_authToken=20128D8C-BDB5-4DCC-AE9E-01ECB91BD7E6
```

### Using Prism Components
```javascript
import { ColorWall } from 'prism'

<ColorWall />
```
COMING SOON: Documentation on each component that is available from PRISM along with documentation on what props are available.

# End-to-End (E2E) Tests

## Introduction
These tests were created to provided a systematic way to help developers fight regression in PaintScene.
When pesky issue pop up, please create a test to check for them.

These test generally paint to the canvas and compare the canvas' output for likeness or dissimilarity to a pre-generated reference image.

## Caveats
Often caveats are placed at the end of a document. These warnings were included near the top to offer immediate guidance that will save developers hours of frustration and prevent hard to find bugs.

* These tests cannot be run headlessly or with the dev panel closed.
* A bug in headless Chromium makes drawing to the canvas with the *paint brush* tool inconsistent. Avoid using this tool for painting when you can.
The *define area* tool works reasonably well as a substitute.
* the ```loadImage``` function will sometimes fail when entropy in the system is high and the components render anachronistically.
This behavior seems to be exacerbated by adding a wait between navigation button clicks. This issue will cause a cascade of failing tests. If it occurs, exit the test and rerun.
* Splitting the functions and constants into different modules causes an error in the coverage engineer.  This can likely be resolved through some sort of Babel or Istanbul configuration.
* Selectors are used to drive much of the imperative actions.  They must be updated when structural changes occur.
* Sometimes random slow operations will occur and sometimes causes failures.
* Take your time and test your tests; the asynchronous flow make it easy to introduce a change that works only under perfect conditions.
* Pay very close attention to await/async calls; micro-commits are your friend.
* Sometimes, for no appearant reason, the active tab doesn't focus and is hidden behind an empty tab. This may cause the test to appear as if it is failing.

## Running the Test
Open a terminal tab and start the app: ```npm start```
Open a second terminal tab and run the tests: ```npm run test:advanced```

The browser will automatically close after the tests have run.  Often, after the tests have run, it is helpful to leave the browser open to diagnose failures or to play with reference data (more on that later).
To prevent the browser from being closed after a test run, from the  ```setup/puppeteerTeardown``` file comment out the following line ```await global.__BROWSER_GLOBAL__.close()```.

## Creating Tests
Read the docs to learn more about Puppeteer: https://jestjs.io/docs/en/puppeteer

### Reference Images
Reference images are used as a standard to test paint operations against. A new reference image should be created if the draw operations or uploaded test image is changed.
The developer must grab the canvas data url (base64) and save it to their local file system as a binary. It is recommended to not overwrite existing reference images before comprehensive testing is done.
This allows developers to tweak the test and use multiple images to evaluate the most appropriate one.

```
// Save a reference image
const { canvasImageUrl } = await getSecondCanvasData(page)
fs.writeFileSync(`/tmp/foo-ref-${Date.now()}.png`, canvasImageUrl.split(',')[1], 'base64')
```

As a convenience, reference save code has been left in the tests commented out.