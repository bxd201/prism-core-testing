---
sidebar_position: 6
---

# Color Wall

## Available props
| Prop | Type | HTML Attribute Example | React Prop Example | Description |
|--------------------|-------|---------|---|-------------|
| addButtonText | `string` | `data-add-button-text="Add to Cart` | `addButtonText="Add to Cart"` | Defines text shown with add button on color swatches. Any instances of the `{name}` keyword in this property will be replaced with the name of the associated color. |
| alwaysShowColorFamilies | `boolean` | `data-always-show-color-families` | `alwaysShowColorFamilies` | Always shows Color Families menu if its width doesn't exceed the container width. |
| autoHeight | `boolean` | `data-auto-height` | `autoHeight` | Sets Color Wall grid height to auto. |
| chunkClickable | `boolean` | `data-chunk-clickable` | `chunkClickable` | Color Wall chuncks are clickable buttons linking to chunk section and color swatch buttons are disabled. |
| chunkMiniMap | `boolean` | `data-chunk-mini-map` | `chunkMiniMap` | Shows Chunk Mini Map on Color Wall labels. |
| colorDetailsAddColor | `boolean` | `data-color-details-add-color` | `colorDetailsAddColor` | Shows Add Color to palette button on Color Details. |
| colorDetailPageRoot | `string` or `(Color) => string` | `data-color-detail-page-root="https://site.com/color-details/"` | `colorDetailPageRoot="https://site.com/color-details/"` | Defines the URL path used for links to color details pages. This will cause CDPs to navigate to a new URL. |
| colorWallBgColor | `string` | `data-color-wall-bg-color="#FFF"` | `colorWallBgColor="#FFF"` | Defines background color for color wall. |
| colorWallPageRoot | `string` or `(string | Color) => string` | `data-color-wall-page-root="https://site.com/color-wall/"` | `colorWallPageRoot="https://site.com/color-wall/"` | Defines the URL path used to link with color wall page. |
| defaultSection | `string` | `data-default-section` | `defaultSection` | Overrides default section to show when Facet mounts. |
| displayAddButton | `boolean` | `data-display-add-button` | `displayAddButton` | Shows an add button on active color swatches. |
| displayAddButtonText | `boolean` | `data-display-add-button-text` | `displayAddButtonText` | Shows an add button on active color swatches. |
| displayDetailsLink | `boolean` | `data-display-details-link` | `displayDetailsLink` | Shows a "View Details" link on active color swatches. |
| leftHandDisplay | `boolean` | `data-left-hand-display` | `leftHandDisplay` | Display Color Wall V2 at left hand direction. |
| hiddenSections | `string` or `string[]`| `data-hidden-sections='Emerald Designer Edition|Historic'` | `hiddenSections={[ 'Emerald Designer Edition', 'Historic' ]}` | Designates sections to be removed from the UI of the color wall facet. These sections can still be searched for. Bar delimited section names. |
| resetOnUnmount | `boolean` | `data-reset-on-unmount` | `resetOnUnmount` | If true will reset the active color in redux when the Facet is unmounted. |
| swatchShouldEmit | `boolean` | `data-swatch-should-emit` | `swatchShouldEmit` | Will cause a selected swatch to publish a `PRISM/out/emitColor` event. |
| uiStyle | `"minimal" | "default"` | `data-ui-style` | `uiStyle` | controls the style of the UI

## Published events

| Event | Payload | Description |
|---|---|---|
| `PRISM/out/colorsLoaded` | `ColorMap`<sup><a href="#data-types">1</a></sup> | Publishes a `ColorMap` object when colors have loaded. This is useful for decorating color data. |
| `PRISM/out/emitColor` | `Color`<sup><a href="#data-types">1</a></sup> | Publishes currently selected color object if `swatchShouldEmit` is true. |
| `PRISM/out/selectedGroup` | `{ section: string, family: string }` | Publishes currently selected section and, if applicable, family. |


## Subscribed events

| Event | Payload | Description |
|---|---|---|
| `PRISM/in/decorateColors` | `ColorStatuses`<sup><a href="#data-types">1</a></sup> | Feeds data into redux providing messaging and status<sup><a href="#data-types">1</a></sup> numbers for each color. |
| `PRISM/in/loading` | `boolean` | Toggles loading overlay on/off over Facet. |
| `PRISM/in/selectGroup` | `{ section: string, family?: string }` | allows changing section/family after initial load |
| `PRISM/in/clearSection` | `` | deselect any current section and family, and instead select the default section (and family, if applicable) |

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

