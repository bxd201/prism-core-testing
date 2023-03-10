# Prism Facets

## Getting Started

### Running Local Instance
```
# will generate assets for the embed.js and all other Prism app code
# and start 3 webpack-dev-server instances for embed, templates, and app serving
yarn start
```

### Running Bundle Analysis
```
# will run normal @prism/facets startup proces, and launch additional tabs for visual bundle analysis
ANALYZE_BUNDLES=true yarn start
```

#### Specifying local host, port, and protocol for Prism, embed, or template webpck dev servers
Since we have 3 parallel webpack dev server instances running (one for the embed script, one for templates, and a third for the main Prism app), the best way to configure hosts or work around port conflicts is not immediately apparent.

There are 9 vars you can set to configure hosts, ports, and protocols for the three separate server instances. They are (including default values):

|Env var|Default value|
|---|---|
|EMBED_LOCAL_HOST|'localhost'|
|EMBED_LOCAL_PORT|'8085'|
|EMBED_LOCAL_PROTOCOL|'https'|
|PRISM_LOCAL_HOST|'localhost'|
|PRISM_LOCAL_PORT|'8080'|
|PRISM_LOCAL_PROTOCOL|'https'|
|TEMPLATES_LOCAL_HOST|'localhost'|
|TEMPLATES_LOCAL_PORT|'8082'|
|TEMPLATES_LOCAL_PROTOCOL|'https'|

(refer to constants.env-vars.js for var names, and constants-env-var-defaults.js for default values)

To specify changes to these defaults when starting the server, follow this format: `VAR_NAME=value yarn start`

For example, to update the Prism server to run at `prism-local.sherwin-williams.com`, and for the embed server port to `8087`, you would do the following:
```
PRISM_LOCAL_HOST=prism-local.sherwin-williams.com EMBED_LOCAL_PORT=8087 yarn start
```

### Deploy
```
yarn ci
yarn run build
```
Jenkins Build - https://jenkins.ebus.swaws/job/TAG_Ecomm/job/Prism/job/PrismWeb/

### Add templates for local testing
Add new html templates into the `src/templates` directory. Re-run `yarn start` and they'll now be available for viewing at `localhost:8080/<templateName>.html`

## Theme Colors (new as of 10/2020)
There are currently 240 possible variations on theme colors that can be used in this project. These include:
- the base color
- a lighter (and lightest)
- darker (and darkest)
- semitransparent
- contrast (black or white, depending on which is more readable on top of the base color)
- and permutations of the above, such as `base.lightest.contrast.trans` to get a semitransparent version of the color that contrasts with the lightest version of the base color.

This makes it easy to do things like:
```scss
button {
  background: var(getThemeColor('primary'));
  color: var(getThemeColor('primary.contrast'));

  &:focus {
    background: var(getThemeColor('primary.darker'));
    color: var(getThemeColor('primary.darker.contrast'));
  }
}
```
And now we quickly have a button with its background color set to the brand's primary color, and text that we know will be readable. It also makes setting variations of UI elements (like `:focus` and `:hover`) easy since we can quickly access lighter and darker versions of a given color, along with those versions' appropriate contrasting readable color.

You may have noticed the `getThemeColor` method in the example above. That method has been added to `_external-var-extraction.scss` to interface with the `_getThemeColor` JS method we expose via our build. That allows our styles to access all our available theme colors. If a particular theme color variation does not exist, the build will throw an error. For example, to reference the CSS Custom Property for the primary theme color, you'd use `var(getThemeColor('primary'))`. To access the color that contrasts with the darker version of the primary color, you'd use `var(getThemeColor('primary.darker.contrast'))`.

Below are all the availabe theme colors we have at the moment, as well as their defaults. This contract is defined in `src/shared/withBuild/themeColors.js`. If a theme color is not present in this list, it will not be able to be extracted from API data. This ensures we as developers are working with a known set of colors.

|Color|CSS Custom Prop name|Default|
|---|---|---|
|active|`--prism-theme-color-active`|![#369](https://via.placeholder.com/15/369/000000?text=+) `#369`|
|black|`--prism-theme-color-black`|![#000](https://via.placeholder.com/15/000/000000?text=+) `#000`|
|danger|`--prism-theme-color-danger`|![#E94b35](https://via.placeholder.com/15/E94b35/000000?text=+) `#E94b35`|
|info|`--prism-theme-color-info`|![#209CEE](https://via.placeholder.com/15/209CEE/000000?text=+) `#209CEE`|
|link|`--prism-theme-color-link`|![#3273DC](https://via.placeholder.com/15/3273DC/000000?text=+) `#3273DC`|
|light|`--prism-theme-color-light`|![#DDD](https://via.placeholder.com/15/DDD/000000?text=+) `#DDD`|
|dark|`--prism-theme-color-dark`|![#2E2E2E](https://via.placeholder.com/15/2E2E2E/000000?text=+) `#2E2E2E`|
|menuBg|`--prism-theme-color-menu-bg`|![#FFF](https://via.placeholder.com/15/FFF/000000?text=+) `#FFF`|
|menuContentTitle|`--prism-theme-color-menu-content-title`|![#000](https://via.placeholder.com/15/000/000000?text=+) `#000`|
|menuContentDescription|`--prism-theme-color-menu-content-description`|![#000](https://via.placeholder.com/15/000/000000?text=+) `#000`|
|menuTxt|`--prism-theme-color-menu-txt`|![#000](https://via.placeholder.com/15/000/000000?text=+) `#000`|
|menuTxtHover|`--prism-theme-color-menu-txt-hover`|![#2CABE2](https://via.placeholder.com/15/2CABE2/000000?text=+) `#2CABE2`|
|primary|`--prism-theme-color-primary`|![#0069AF](https://via.placeholder.com/15/0069AF/000000?text=+) `#0069AF`|
|secondary|`--prism-theme-color-secondary`|![#2CABE2](https://via.placeholder.com/15/2CABE2/000000?text=+) `#2CABE2`|
|primaryBg|`--prism-theme-color-primary-bg`|![#FAFAFA](https://via.placeholder.com/15/FAFAFA/000000?text=+) `#FAFAFA`|
|secondaryBg|`--prism-theme-color-secondary-bg`|![#FAFAFA](https://via.placeholder.com/15/E2E2E2/000000?text=+) `#FAFAFA`|
|primaryBorder|`--prism-theme-color-primary-border`|![#FFF](https://via.placeholder.com/15/FFF/000000?text=+) `#FFF`|
|secondaryBorder|`--prism-theme-color-secondary-border`|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`none`|
|success|`--prism-theme-color-success`|![#1FCE6C](https://via.placeholder.com/15/1FCE6C/000000?text=+) `#1FCE6C`|
|warning|`--prism-theme-color-warning`|![#F2C500](https://via.placeholder.com/15/F2C500/000000?text=+) `#F2C500`|
|white|`--prism-theme-color-white`|![#FFF](https://via.placeholder.com/15/FFF/000000?text=+) `#FFF`|



### Example color configurations ###

Each __base__ theme color has a number of available variations. Here are the main variations:
- Light/dark variants
  - `lighter` 15% lighter version of the current color
  - `lightest` 85% lighter version of the current color
  - `darker` 15% darker version of the current color
  - `darkest` 85% darker version of the current color
- `contrast` Either black or white, whichever is more readable on the current color.
- `trans` 90% opaque version of the current color.
- `transer` 60% opaque version of the current color.

In the same vein as the above, each of the "Light/dark variants" has its own following variations:
- `contrast` Either black or white, whichever is more readable on the lighter/darker color.
- `trans` 90% opaque version of the lighter/darker color.
- `transer` 60% opaque version of the lighter/darker color.

Lastly, `contrast` has a single variation:
- `trans` 90% opaque version of the lighter/darker contrast color.
- `transer` 60% opaque version of the lighter/darker contrast color.

To clarify the above, the following table will illustrate all variations of each theme color available using the `primary` theme color as an example.

| CSS Custom Prop | Looks Like | To Use |
|---|---|---|
|`--prism-theme-color-primary`| ![+](https://via.placeholder.com/15/0069AF/000000?text=+) | `var(getThemeColor('primary'))` |
|`--prism-theme-color-primary-trans`|![+](https://via.placeholder.com/15/0069AF/000000?text=+) 90% opaque|`var(getThemeColor('primary.trans'))`|
|`--prism-theme-color-primary-transer`|![+](https://via.placeholder.com/15/0069AF/000000?text=+) 60% opaque|`var(getThemeColor('primary.transer'))`|
|`--prism-theme-color-primary-contrast`|![+](https://via.placeholder.com/15/ffffff/000000?text=+)|`var(getThemeColor('primary.contrast'))`|
|`--prism-theme-color-primary-contrast-trans`|![+](https://via.placeholder.com/15/ffffff/000000?text=+) 90% opaque|`var(getThemeColor('primary.contrast.trans'))`|
|`--prism-theme-color-primary-contrast-transer`|![+](https://via.placeholder.com/15/ffffff/000000?text=+) 60% opaque|`var(getThemeColor('primary.contrast.transer'))`|
|`--prism-theme-color-primary-lighter`|![+](https://via.placeholder.com/15/2680bb/000000?text=+)|`var(getThemeColor('primary.lighter'))`|
|`--prism-theme-color-primary-lighter-trans`|![+](https://via.placeholder.com/15/2680bb/000000?text=+) 90% opaque|`var(getThemeColor('primary.lighter.trans'))`|
|`--prism-theme-color-primary-lighter-transer`|![+](https://via.placeholder.com/15/2680bb/000000?text=+) 60% opaque|`var(getThemeColor('primary.lighter.transer'))`|
|`--prism-theme-color-primary-lighter-contrast`|![+](https://via.placeholder.com/15/000000/000000?text=+)|`var(getThemeColor('primary.lighter.contrast'))`|
|`--prism-theme-color-primary-lighter-contrast-trans`|![+](https://via.placeholder.com/15/000000/000000?text=+) 90% opaque|`var(getThemeColor('primary.lighter.contrast.trans'))`|
|`--prism-theme-color-primary-lighter-contrast-transer`|![+](https://via.placeholder.com/15/000000/000000?text=+) 60% opaque|`var(getThemeColor('primary.lighter.contrast.transer'))`|
|`--prism-theme-color-primary-lightest`|![+](https://via.placeholder.com/15/d9e9f3/000000?text=+)|`var(getThemeColor('primary.lightest'))`|
|`--prism-theme-color-primary-lightest-trans`|![+](https://via.placeholder.com/15/d9e9f3/000000?text=+) 90% trans|`var(getThemeColor('primary.lightest.trans'))`|
|`--prism-theme-color-primary-lightest-transer`|![+](https://via.placeholder.com/15/d9e9f3/000000?text=+) 60% trans|`var(getThemeColor('primary.lightest.transer'))`|
|`--prism-theme-color-primary-lightest-contrast`|![+](https://via.placeholder.com/15/000000/000000?text=+)|`var(getThemeColor('primary.lightest.contrast'))`|
|`--prism-theme-color-primary-lightest-contrast-trans`|![+](https://via.placeholder.com/15/000000/000000?text=+) 90% opaque|`var(getThemeColor('primary.lightest.contrast.trans'))`|
|`--prism-theme-color-primary-lightest-contrast-transer`|![+](https://via.placeholder.com/15/000000/000000?text=+) 60% opaque|`var(getThemeColor('primary.lightest.contrast.transer'))`|
|`--prism-theme-color-primary-darker`|![+](https://via.placeholder.com/15/005995/000000?text=+)|`var(getThemeColor('primary.darker'))`|
|`--prism-theme-color-primary-darker-trans`|![+](https://via.placeholder.com/15/005995/000000?text=+) 90% trans|`var(getThemeColor('primary.darker.trans'))`|
|`--prism-theme-color-primary-darker-transer`|![+](https://via.placeholder.com/15/005995/000000?text=+) 60% trans|`var(getThemeColor('primary.darker.transer'))`|
|`--prism-theme-color-primary-darker-contrast`|![+](https://via.placeholder.com/15/ffffff/000000?text=+)|`var(getThemeColor('primary.darker.contrast'))`|
|`--prism-theme-color-primary-darker-contrast-trans`|![+](https://via.placeholder.com/15/ffffff/000000?text=+) 90% opaque|`var(getThemeColor('primary.darker.contrast.trans'))`|
|`--prism-theme-color-primary-darker-contrast-transer`|![+](https://via.placeholder.com/15/ffffff/000000?text=+) 60% opaque|`var(getThemeColor('primary.darker.contrast.transer'))`|
|`--prism-theme-color-primary-darkest`|![+](https://via.placeholder.com/15/00101a/000000?text=+)|`var(getThemeColor('primary.darkest'))`|
|`--prism-theme-color-primary-darkest-trans`|![+](https://via.placeholder.com/15/00101a/000000?text=+) 90% opaque|`var(getThemeColor('primary.darkest.trans'))`|
|`--prism-theme-color-primary-darkest-transer`|![+](https://via.placeholder.com/15/00101a/000000?text=+) 60% opaque|`var(getThemeColor('primary.darkest.transer'))`|
|`--prism-theme-color-primary-darkest-contrast`|![+](https://via.placeholder.com/15/ffffff/000000?text=+)|`var(getThemeColor('primary.darkest.contrast'))`|
|`--prism-theme-color-primary-darkest-contrast-trans`|![+](https://via.placeholder.com/15/ffffff/000000?text=+) 90% opaque|`var(getThemeColor('primary.darkest.contrast.trans'))`|
|`--prism-theme-color-primary-darkest-contrast-transer`|![+](https://via.placeholder.com/15/ffffff/000000?text=+) 60% opaque|`var(getThemeColor('primary.darkest.contrast.transer'))`|

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
