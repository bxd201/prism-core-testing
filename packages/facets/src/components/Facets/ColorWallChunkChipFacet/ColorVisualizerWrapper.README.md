# ColorWallFacet

## Available props
| Prop | Type | HTML Attribute Example | React Prop Example | Description |
|--------------------|-------|---------|---|-------------|
| alwaysShowColorFamilies | `boolean` | `data-always-show-color-families` | `alwaysShowColorFamilies` | Always shows Color Families menu if its width doesn't exceed the container width. |
| colorWallBgColor | `string` | `data-color-wall-bg-color="#FFF"` | `colorWallBgColor="#FFF"` | Defines background color for color wall. |
| defaultRoute | `string` | `data-default-route="/active/color-wall/"` | `defaultRoute="/active/color-wall/"` | Sets initial route to be opened as root url. |

## Published events

| Event | Payload | Description |
|---|---|---|
| `prism-new-color` | `Color`<sup><a href="#data-types">1</a></sup> | Publishes a `Color` object when showing details for a color. |


## Subscribed events

| Event | Payload | Description |
|---|---|---|
| `PRISM/in/update-color-ctas` | `ColorDetailsCTAData[]`<sup><a href="#data-types">2</a></sup> | Publish a collection of ColorDetailsCTAData objects to render as button-styled anchor tags on a color details view. |

## Data types
<sup>1</sup> See [Colors.js.flow](/src/shared/types/Colors.js.flow)
```js
type Color = Object & {
  blue: number,
  brandKey: string,
  colorFamilyNames: Array<string>,
  colorNumber: string,
  coordinatingColors: {
    coord1ColorId: number,
    coord2ColorId: number,
    whiteColorId: number
  },
  cssrgb: string,
  storeStripLocator: string,
  description: Array<string>,
  green: number,
  hex: string,
  hue: number,
  id: ColorId,
  isDark: boolean,
  isExterior: boolean,
  isInterior: boolean,
  lightness: number,
  name: string,
  red: number,
  rgb: number,
  saturation: number,
  similarColors: string[],
  storeStripLocator?: string
}
```

<sup>2</sup> See [ColorDetailsCTAs.jsx](/src/components/Facets/ColorDetails/ColorDetailsCTAs.jsx)
```js
type ColorDetailsCTAData = {
  text: string,
  link: string,
  attributes: {
    [key: string]: string
  }
}
```
