# ColorWallFacet

## Available props
| Prop | Type | HTML Attribute Example | React Prop Example | Description |
|--------------------|-------|---------|---|-------------|
| colorDetailPageRoot | `string` | `color-detail-page-root="https://site.com/color-details/"` | `colorDetailPageRoot="https://site.com/color-details/"` | Defines the URL path used for links to color details pages. This will cause CDPs to navigate to a new URL. |
| colorWallBgColor | `string` | `color-wall-bg-color="#FFF"` | `colorWallBgColor="#FFF"` | Defines background color for color wall. |
| displayAddButton | `boolean` | `display-add-button` | `displayAddButton` | Shows an add button on active color swatches. |
| displayDetailsLink | `boolean` | `display-details-link` | `displayDetailsLink` | Shows a "View Details" link on active color swatches. |
| hiddenSections | `string` or `string[]`| `hidden-sections='Emerald Designer Edition|Historic'` | `hiddenSections={[ 'Emerald Designer Edition', 'Historic' ]}` | Designates sections to be removed from the UI of the color wall facet. These sections can still be searched for. Bar delimited section names. |
| resetOnUnmount | `boolean` | `reset-on-unmount` | `resetOnUnmount` | If true will reset the active color in redux when the Facet is unmounted. |
| swatchShouldEmit | `boolean` | `swatch-should-emit` | `swatchShouldEmit` | Will cause a selected swatch to publish a `PRISM/out/emitColor` event.

## Published events

| Event | Payload | Description |
|---|---|---|
| `PRISM/out/colorsLoaded` | `ColorMap`<sup><a href="#data-types">1</a></sup> | Publishes a `ColorMap` object when colors have loaded. This is useful for decorating color data. |
| `PRISM/out/emitColor` | `Color`<sup><a href="#data-types">1</a></sup> | Publishes currently selected color object if `swatchShouldEmit` is true. |


## Subscribed events

| Event | Payload | Description |
|---|---|---|
| `PRISM/in/decorateColors` | `ColorStatuses`<sup><a href="#data-types">1</a></sup> | Feeds data into redux providing messaging and status<sup><a href="#data-types">1</a></sup> numbers for each color. |
| `PRISM/in/loading` | `boolean` | Toggles loading overlay on/off over Facet. |


## ColorStatus.status values
| Status | Description |
|---|---|
| 0 | Color is disabled. It will display with a visual disabled icon and will not present any buttons to the user once active. |
| 1 | Color is enabled and behaves normally. |

## Data types
<sup>1</sup> See [Colors.js.flow](/src/shared/types/Colors.js.flow)
```js
type ColorStatus = {
  message: string | typeof undefined,
  status: number
}

type ColorStatuses = {
  [key: string]: ColorStatus
}

type ColorMap = {
  [ key: string ]: Color
}
```
